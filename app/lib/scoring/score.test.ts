import { describe, expect, it } from "vitest";

import { fixtureInstrument } from "~/test/fixture-instrument";

import type { Answers } from "./score";
import {
  allAnswered,
  isComplete,
  keyedValue,
  missingItemIds,
  positionOf,
  scoreInstrument,
} from "./score";

const answers: Answers = {
  "f1-1": 4,
  "f1-2": 2,
  "f2-1": 5,
  "f2-2": 3,
};

describe(keyedValue, () => {
  it("keeps a positive answer unchanged", () => {
    expect(keyedValue(4, "positive")).toBe(4);
  });

  it("mirrors a negative answer around the midpoint", () => {
    expect(keyedValue(4, "negative")).toBe(2);
    expect(keyedValue(1, "negative")).toBe(5);
    expect(keyedValue(5, "negative")).toBe(1);
  });
});

describe(scoreInstrument, () => {
  it("sums each facet with reverse keying applied", () => {
    const result = scoreInstrument(fixtureInstrument, answers);

    // f1: 4 + (6 - 2) = 8, f2: 5 + (6 - 3) = 8
    expect(result.facets.F1?.raw).toBe(8);
    expect(result.facets.F2?.raw).toBe(8);
  });

  it("reports the facet bounds from the item count", () => {
    const result = scoreInstrument(fixtureInstrument, answers);

    expect(result.facets.F1).toStrictEqual({ max: 10, min: 2, raw: 8 });
  });

  it("rolls the facets up into the domain", () => {
    const result = scoreInstrument(fixtureInstrument, answers);

    expect(result.domains.D1).toStrictEqual({ max: 20, min: 4, raw: 16 });
  });

  it("does not mutate the answers it is given", () => {
    const before = { ...answers };

    scoreInstrument(fixtureInstrument, answers);

    expect(answers).toStrictEqual(before);
  });

  it("is deterministic", () => {
    expect(scoreInstrument(fixtureInstrument, answers)).toStrictEqual(
      scoreInstrument(fixtureInstrument, answers)
    );
  });

  it("refuses an incomplete answer set", () => {
    expect(() =>
      scoreInstrument(fixtureInstrument, { "f1-1": 4, "f1-2": 2 })
    ).toThrow(/incomplete answer set/u);
  });
});

describe(isComplete, () => {
  it("accepts a full answer set", () => {
    expect(isComplete(fixtureInstrument, answers)).toBeTruthy();
  });

  it("rejects a partial answer set and names the gaps", () => {
    const partial: Answers = { "f1-1": 4 };

    expect(isComplete(fixtureInstrument, partial)).toBeFalsy();
    expect(missingItemIds(fixtureInstrument, partial)).toStrictEqual([
      "f1-2",
      "f2-1",
      "f2-2",
    ]);
  });
});

describe(positionOf, () => {
  it("places a score above the midpoint", () => {
    expect(positionOf({ max: 20, min: 4, raw: 16 })).toBe("above-midpoint");
  });

  it("places a score below the midpoint", () => {
    expect(positionOf({ max: 20, min: 4, raw: 8 })).toBe("below-midpoint");
  });

  it("places an exact midpoint score at the midpoint", () => {
    expect(positionOf({ max: 20, min: 4, raw: 12 })).toBe("at-midpoint");
  });
});

describe(allAnswered, () => {
  it("compares the answer count with the instrument size", () => {
    expect(allAnswered(answers, 4)).toBeTruthy();
    expect(allAnswered(answers, 5)).toBeFalsy();
  });
});
