import { useCallback, useEffect, useState } from "react";

import type { Instrument } from "./instruments/schema";
import type { StoredReference } from "./remote-result";
import {
  deleteStoredResult,
  fetchStoredResult,
  rememberStoredRecord,
  readStoredRecord,
  reportFromStored,
  resultPayloadFor,
  storedRecordFor,
  uploadResult,
} from "./remote-result";
import type { InstrumentReport } from "./scoring/report";

export type StoredLookupState =
  | { kind: "failed" | "loading" | "missing" | "incompatible" }
  | { kind: "ready"; reference: StoredReference; report: InstrumentReport };
export type StoredUploadState =
  | { kind: "failed" | "idle" | "deleted" | "saving" }
  | { kind: "saved"; reference: StoredReference };

export const useStoredResult = (
  instrument: Instrument,
  id: string | null
): StoredLookupState => {
  const [state, setState] = useState<StoredLookupState>({ kind: "loading" });
  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    const load = async () => {
      const outcome = await fetchStoredResult(id);
      if (!active) {
        return;
      }
      if (outcome.kind !== "found") {
        setState(outcome);
        return;
      }
      const report = reportFromStored(instrument, outcome.result);
      setState(
        report
          ? {
              kind: "ready",
              reference: { expiresAt: outcome.result.expiresAt, id },
              report,
            }
          : { kind: "incompatible" }
      );
    };
    void load();
    return () => {
      active = false;
    };
  }, [id, instrument]);
  return state;
};

const initialUploadState = (code: string | null): StoredUploadState => {
  if (!code) {
    return { kind: "idle" };
  }
  const record = readStoredRecord(code);
  if (record?.deleted) {
    return { kind: "deleted" };
  }
  if (record?.expiresAt && Date.parse(record.expiresAt) > Date.now()) {
    return {
      kind: "saved",
      reference: { expiresAt: record.expiresAt, id: record.id },
    };
  }
  return { kind: "saving" };
};

export const useStoredUpload = (
  code: string | null,
  instrument: Instrument,
  report: InstrumentReport | null
) => {
  const [state, setState] = useState<StoredUploadState>(() =>
    initialUploadState(code)
  );
  const save = useCallback((): Promise<void> => {
    if (!code || !report) {
      return Promise.resolve();
    }
    const record = storedRecordFor(code);
    if (record.deleted || record.expiresAt) {
      return Promise.resolve();
    }
    return uploadResult(resultPayloadFor(instrument, report, record.id)).then(
      (reference) => {
        if (reference) {
          rememberStoredRecord(code, { ...reference, deleted: false });
          setState({ kind: "saved", reference });
        } else {
          setState({ kind: "failed" });
        }
      }
    );
  }, [code, instrument, report]);
  useEffect(() => {
    // This effect synchronizes a completed local result with the external store.
    // Shared links never enter this path. The persistent id makes replay safe.
    void save();
  }, [save]);

  const remove = async (): Promise<boolean> => {
    if (!code || state.kind !== "saved") {
      return false;
    }
    const success = await deleteStoredResult(state.reference.id);
    if (success) {
      rememberStoredRecord(code, { ...state.reference, deleted: true });
      setState({ kind: "deleted" });
    }
    return success;
  };
  const retry = async () => {
    setState({ kind: "saving" });
    await save();
  };
  return { remove, retry, state };
};
