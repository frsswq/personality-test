import { useCallback, useEffect, useState } from "react";

import type { Instrument, AnswerValue } from "~/lib/instruments/schema";
import type { Answers } from "~/lib/scoring/score";

import type { StoredSession } from "./session";
import {
  clearSession,
  emptySession,
  readSession,
  writeSession,
} from "./session";

export interface TestSession {
  answers: Answers;
  page: number;
  reset: () => void;
  setAnswer: (itemId: string, value: AnswerValue) => void;
  setPage: (page: number) => void;
}

/**
 * Holds one attempt at a test and keeps it in local storage, so a visitor can
 * close the tab and continue later.
 */
export const useTestSession = (instrument: Instrument): TestSession => {
  const [session, setSession] = useState<StoredSession>(
    () => readSession(instrument.slug) ?? emptySession()
  );

  useEffect(() => {
    writeSession(instrument.slug, session);
  }, [instrument.slug, session]);

  const setAnswer = useCallback((itemId: string, value: AnswerValue) => {
    setSession((current) => ({
      ...current,
      answers: { ...current.answers, [itemId]: value },
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setSession((current) => ({ ...current, page }));
  }, []);

  const reset = useCallback(() => {
    clearSession(instrument.slug);
    setSession(emptySession());
  }, [instrument.slug]);

  return {
    answers: session.answers,
    page: session.page,
    reset,
    setAnswer,
    setPage,
  };
};
