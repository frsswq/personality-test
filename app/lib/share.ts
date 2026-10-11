import type { Instrument, LikertValue } from "~/lib/instruments/schema";
import type { Answers } from "~/lib/scoring/score";

/**
 * The share code packs a result into URL-safe base64. An answer set needs three
 * bits per item, so the 120-item test fits in about 60 characters. The fragment
 * of a URL is never sent to a server, so the answers stay with the link.
 */
export const SHARE_VERSION = 1;

const ANSWER_BITS = 3;
const SCORE_BITS = 5;
const ID_OFFSET = 3;
const MAX_ID_LENGTH = 64;

export type ShareMode = "answers" | "scores";

export interface SharePayload {
  instrumentId: string;
  mode: ShareMode;
  values: number[];
}

export const SHARE_MODES: Record<ShareMode, number> = {
  answers: 0,
  scores: 1,
};

const packValues = (values: number[], bits: number): Uint8Array => {
  const bytes = new Uint8Array(Math.ceil((values.length * bits) / 8));
  let offset = 0;

  for (const value of values) {
    for (let bit = bits - 1; bit >= 0; bit -= 1) {
      const on = Math.floor(value / 2 ** bit) % 2;
      const index = Math.floor(offset / 8);
      const position = 7 - (offset % 8);

      if (on === 1) {
        bytes[index] = (bytes[index] ?? 0) + 2 ** position;
      }
      offset += 1;
    }
  }

  return bytes;
};

const unpackValues = (
  bytes: Uint8Array,
  count: number,
  bits: number
): number[] => {
  const values: number[] = [];
  let offset = 0;

  for (let index = 0; index < count; index += 1) {
    let value = 0;

    for (let bit = 0; bit < bits; bit += 1) {
      const byteIndex = Math.floor(offset / 8);
      const position = 7 - (offset % 8);
      const on = Math.floor((bytes[byteIndex] ?? 0) / 2 ** position) % 2;
      value = value * 2 + on;
      offset += 1;
    }

    values.push(value);
  }

  return values;
};

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const fromBase64Url = (code: string): Uint8Array | null => {
  if (!/^[\w-]+$/u.test(code)) {
    return null;
  }

  try {
    const padded = code
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(code.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.codePointAt(index) ?? 0;
    }

    return bytes;
  } catch {
    return null;
  }
};

export const encodeShare = (payload: SharePayload): string => {
  const idBytes = new TextEncoder().encode(payload.instrumentId);
  const bits = payload.mode === "answers" ? ANSWER_BITS : SCORE_BITS;
  const body = packValues(payload.values, bits);
  const bytes = new Uint8Array(ID_OFFSET + idBytes.length + body.length);

  bytes[0] = SHARE_VERSION;
  bytes[1] = SHARE_MODES[payload.mode];
  bytes[2] = idBytes.length;
  bytes.set(idBytes, ID_OFFSET);
  bytes.set(body, ID_OFFSET + idBytes.length);

  return toBase64Url(bytes);
};

/**
 * Returns the payload, the literal `"scores"` marker, or `null` when the code
 * is damaged.
 */
/**
 * Reads a share code. The number of packed values follows from the code
 * length, so a caller can validate it against the instrument it looked up.
 * Returns `null` when the code is damaged.
 */
export const decodeShare = (code: string): SharePayload | null => {
  const bytes = fromBase64Url(code);

  if (!bytes || bytes.length < ID_OFFSET) {
    return null;
  }

  const [version, modeByte, idLength] = bytes;

  if (version !== SHARE_VERSION || idLength === undefined) {
    return null;
  }

  if (idLength === 0 || idLength > MAX_ID_LENGTH) {
    return null;
  }

  if (modeByte !== SHARE_MODES.answers && modeByte !== SHARE_MODES.scores) {
    return null;
  }

  const mode: ShareMode =
    modeByte === SHARE_MODES.answers ? "answers" : "scores";
  const bits = mode === "answers" ? ANSWER_BITS : SCORE_BITS;
  const idEnd = ID_OFFSET + idLength;

  if (bytes.length <= idEnd) {
    return null;
  }

  const instrumentId = new TextDecoder().decode(bytes.slice(ID_OFFSET, idEnd));
  const valueCount = Math.floor(((bytes.length - idEnd) * 8) / bits);

  if (valueCount === 0) {
    return null;
  }

  const values = unpackValues(
    bytes.slice(idEnd, idEnd + Math.ceil((valueCount * bits) / 8)),
    valueCount,
    bits
  );

  return { instrumentId, mode, values };
};

export const answersShare = (
  instrument: Instrument,
  answers: Answers
): SharePayload => ({
  instrumentId: instrument.id,
  mode: "answers",
  values: instrument.items.map((item) => (answers[item.id] ?? 1) - 1),
});

export const scoresShare = (
  instrument: Instrument,
  facetRaw: Record<string, number>
): SharePayload => ({
  instrumentId: instrument.id,
  mode: "scores",
  values: instrument.facets.map((facet) => facetRaw[facet.id] ?? 0),
});

export const answersFromShare = (
  payload: SharePayload,
  instrument: Instrument
): Answers | null => {
  if (
    payload.mode !== "answers" ||
    payload.values.length !== instrument.items.length
  ) {
    return null;
  }

  const answers: Answers = {};

  for (const [index, item] of instrument.items.entries()) {
    const value = payload.values[index];

    if (value === undefined || value < 0 || value > 4) {
      return null;
    }

    answers[item.id] = (value + 1) as LikertValue;
  }

  return answers;
};

export const facetScoresFromShare = (
  payload: SharePayload,
  instrument: Instrument
): Record<string, number> | null => {
  if (
    payload.mode !== "scores" ||
    payload.values.length !== instrument.facets.length
  ) {
    return null;
  }

  const scores: Record<string, number> = {};

  for (const [index, facet] of instrument.facets.entries()) {
    const value = payload.values[index];

    if (value === undefined) {
      return null;
    }

    scores[facet.id] = value;
  }

  return scores;
};

export const shareUrlFor = (slug: string, code: string) =>
  `${globalThis.location?.origin ?? ""}/tests/${slug}/result#r=${code}`;

export const readShareCode = (hash: string): string | null => {
  const match = /(?:^#|&)r=(?<code>[\w-]+)/u.exec(hash);

  return match?.groups?.code ?? null;
};
