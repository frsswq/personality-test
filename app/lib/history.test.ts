import { describe, expect, it } from "vitest";

import { HISTORY_KEY, addHistory, clearHistory, readHistory } from "./history";
import type { HistoryEntry } from "./history";

const entry = (
  code: string,
  completedAt = "2026-10-11T10:00:00.000Z"
): HistoryEntry => ({
  code,
  completedAt,
  slug: "a-test",
  title: "A test",
});

describe(readHistory, () => {
  it("returns an empty list when nothing is stored", () => {
    expect(readHistory()).toStrictEqual([]);
  });

  it("returns an empty list for corrupt storage", () => {
    window.localStorage.setItem(HISTORY_KEY, "{");

    expect(readHistory()).toStrictEqual([]);
  });

  it("drops entries that do not fit the shape", () => {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([{ code: "a" }, entry("b")])
    );

    expect(readHistory()).toStrictEqual([]);
  });
});

describe(addHistory, () => {
  it("puts the newest result first", () => {
    addHistory(entry("a"));
    addHistory(entry("b"));

    expect(readHistory().map((item) => item.code)).toStrictEqual(["b", "a"]);
  });

  it("never stores the same code twice", () => {
    addHistory(entry("a"));
    addHistory(entry("a"));

    expect(readHistory()).toHaveLength(1);
  });

  it("keeps at most twenty results", () => {
    for (let index = 0; index < 25; index += 1) {
      addHistory(entry(`code-${index}`));
    }

    expect(readHistory()).toHaveLength(20);
    expect(readHistory()[0]?.code).toBe("code-24");
  });
});

describe(clearHistory, () => {
  it("removes every result", () => {
    addHistory(entry("a"));

    clearHistory();

    expect(readHistory()).toStrictEqual([]);
  });
});
