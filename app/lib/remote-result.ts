import { z } from "zod";

import type { Instrument } from "./instruments/schema";
import type { ScaleKind } from "./instruments/scoring-key";
import { keyFor, scaleKindOf } from "./instruments/scoring-key";
import type { InstrumentReport } from "./scoring/report";
import {
  buildReportFromDomainScores,
  buildReportFromFacetScores,
} from "./scoring/report";

const RESULT_API = "/api/results";
const STORAGE_KEY = "personality-test:stored";
const idSchema = z.string().regex(/^[0-9a-f]{32}$/u);
const referenceSchema = z
  .object({ expiresAt: z.iso.datetime(), id: idSchema })
  .strict();
const recordSchema = z
  .object({
    deleted: z.boolean(),
    expiresAt: z.iso.datetime().nullable(),
    id: idSchema,
  })
  .strict();
const storedResultSchema = z
  .object({
    contentHash: z.string().min(1),
    expiresAt: z.iso.datetime(),
    instrumentId: z.string().min(1),
    scaleKind: z.enum(["facet", "domain"]),
    scores: z.record(z.string().min(1), z.number().int().min(0)),
  })
  .strict();

export type StoredReference = z.infer<typeof referenceSchema>;
export type StoredRecord = z.infer<typeof recordSchema>;
export type StoredResult = z.infer<typeof storedResultSchema>;
export interface ResultPayload {
  contentHash: string;
  id: string;
  instrumentId: string;
  scaleKind: ScaleKind;
  scores: Record<string, number>;
}

export const readStoredId = (hash: string): string | null =>
  /(?:^#|&)s=(?<id>[0-9a-f]{32})(?:&|$)/u.exec(hash)?.groups?.id ?? null;
export const storedUrlFor = (slug: string, id: string): string =>
  `${globalThis.location?.origin ?? ""}/tests/${slug}/result#s=${id}`;

// Also keeps the operation id stable when browser storage is blocked.
const memory = new Map<string, StoredRecord>();
const readRecords = (): Record<string, StoredRecord> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = z
      .record(z.string(), recordSchema)
      .safeParse(JSON.parse(raw ?? "{}"));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
};
export const rememberStoredRecord = (code: string, record: StoredRecord) => {
  memory.set(code, record);
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readRecords(), [code]: record })
    );
  } catch {
    // A blocked storage API must not hide the local result.
  }
};
export const readStoredRecord = (code: string): StoredRecord | null =>
  readRecords()[code] ?? memory.get(code) ?? null;

export const storedRecordFor = (code: string): StoredRecord => {
  const record = readStoredRecord(code);
  if (
    record &&
    (record.deleted ||
      !record.expiresAt ||
      Date.parse(record.expiresAt) > Date.now())
  ) {
    return record;
  }
  const next = {
    deleted: false,
    expiresAt: null,
    id: [...crypto.getRandomValues(new Uint8Array(16))]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(""),
  };
  // Persist before the network call so a retry after a reload reuses the id.
  rememberStoredRecord(code, next);
  return next;
};

export const resultPayloadFor = (
  instrument: Instrument,
  report: InstrumentReport,
  id: string
): ResultPayload => {
  const scores: Record<string, number> = {};
  if (scaleKindOf(instrument) === "facet") {
    for (const domain of report.domains) {
      for (const entry of domain.facets) {
        scores[entry.facet.id] = entry.score.raw;
      }
    }
  } else {
    for (const domain of report.domains) {
      scores[domain.domain.id] = domain.score.raw;
    }
  }
  return {
    contentHash: keyFor(instrument).contentHash,
    id,
    instrumentId: instrument.id,
    scaleKind: scaleKindOf(instrument),
    scores,
  };
};

const sendResult = async (
  payload: ResultPayload
): Promise<StoredReference | null> => {
  try {
    const response = await fetch(RESULT_API, {
      body: JSON.stringify(payload),
      credentials: "omit",
      headers: { "content-type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return null;
    }
    const parsed = referenceSchema.safeParse(await response.json());
    return parsed.success && parsed.data.id === payload.id ? parsed.data : null;
  } catch {
    return null;
  }
};
const inFlight = new Map<string, Promise<StoredReference | null>>();
const sendWithCleanup = async (
  payload: ResultPayload
): Promise<StoredReference | null> => {
  try {
    return await sendResult(payload);
  } finally {
    inFlight.delete(payload.id);
  }
};
export const uploadResult = (
  payload: ResultPayload
): Promise<StoredReference | null> => {
  const existing = inFlight.get(payload.id);
  if (existing) {
    return existing;
  }
  const operation = sendWithCleanup(payload);
  inFlight.set(payload.id, operation);
  return operation;
};

export type StoredLookup =
  | { kind: "failed" }
  | { kind: "found"; result: StoredResult }
  | { kind: "missing" };
export const fetchStoredResult = async (id: string): Promise<StoredLookup> => {
  try {
    const response = await fetch(`${RESULT_API}/${id}`, {
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) {
      return { kind: "missing" };
    }
    if (!response.ok) {
      return { kind: "failed" };
    }
    const parsed = storedResultSchema.safeParse(await response.json());
    return parsed.success
      ? { kind: "found", result: parsed.data }
      : { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
};
export const deleteStoredResult = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${RESULT_API}/${id}`, {
      credentials: "omit",
      method: "DELETE",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) {
      const records = { ...Object.fromEntries(memory), ...readRecords() };
      for (const [code, record] of Object.entries(records)) {
        if (record.id === id) {
          rememberStoredRecord(code, { ...record, deleted: true });
        }
      }
    }
    return response.ok;
  } catch {
    return false;
  }
};

export const reportFromStored = (
  instrument: Instrument,
  stored: StoredResult
): InstrumentReport | null => {
  if (
    stored.instrumentId !== instrument.id ||
    stored.scaleKind !== scaleKindOf(instrument) ||
    stored.contentHash !== keyFor(instrument).contentHash
  ) {
    return null;
  }
  try {
    return stored.scaleKind === "facet"
      ? buildReportFromFacetScores(instrument, stored.scores)
      : buildReportFromDomainScores(instrument, stored.scores);
  } catch {
    return null;
  }
};
