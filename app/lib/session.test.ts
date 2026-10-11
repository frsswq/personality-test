import { describe, expect, it } from "vitest";

import {
  SESSION_VERSION,
  clearSession,
  emptySession,
  readSession,
  sessionKey,
  writeSession,
} from "./session";

const slug = "fixture";

describe(readSession, () => {
  it("returns null when nothing is stored", () => {
    expect(readSession(slug)).toBeNull();
  });

  it("reads a written session", () => {
    writeSession(slug, { ...emptySession(), answers: { "f1-1": 3 }, page: 2 });

    const session = readSession(slug);

    expect(session?.answers).toStrictEqual({ "f1-1": 3 });
    expect(session?.page).toBe(2);
    expect(session?.updatedAt).not.toBe("");
  });

  it("rejects a value that is not JSON", () => {
    window.localStorage.setItem(sessionKey(slug), "not json");

    expect(readSession(slug)).toBeNull();
  });

  // The instrument scale is the real bound, and scoring enforces it. Storage
  // only rejects a value outside the transport ceiling.
  it("rejects an answer above the transport ceiling", () => {
    window.localStorage.setItem(
      sessionKey(slug),
      JSON.stringify({
        answers: { "f1-1": 11 },
        page: 0,
        updatedAt: "",
        version: SESSION_VERSION,
      })
    );

    expect(readSession(slug)).toBeNull();
  });

  it("rejects an old version", () => {
    window.localStorage.setItem(
      sessionKey(slug),
      JSON.stringify({ answers: {}, page: 0, updatedAt: "", version: 0 })
    );

    expect(readSession(slug)).toBeNull();
  });

  it("rejects an unknown extra key", () => {
    window.localStorage.setItem(
      sessionKey(slug),
      JSON.stringify({
        answers: {},
        page: 0,
        surprise: true,
        updatedAt: "",
        version: SESSION_VERSION,
      })
    );

    expect(readSession(slug)).toBeNull();
  });
});

describe(clearSession, () => {
  it("removes the stored session", () => {
    writeSession(slug, emptySession());

    clearSession(slug);

    expect(readSession(slug)).toBeNull();
    expect(window.localStorage.getItem(sessionKey(slug))).toBeNull();
  });
});
