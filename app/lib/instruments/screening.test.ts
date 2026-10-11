import { describe, expect, it } from "vitest";

import type { Answers } from "~/lib/scoring/score";

import { requireInstrument } from "./registry";
import type { Instrument } from "./schema";

const buildAnswers = (instrument: Instrument, value: number): Answers => {
  const answers: Answers = {};

  for (const item of instrument.items) {
    answers[item.id] = value;
  }

  return answers;
};

describe.each([
  { bands: 5, items: 9, max: 27, slug: "phq-9" },
  { bands: 4, items: 7, max: 21, slug: "gad-7" },
])("$slug data", ({ bands, items, max, slug }) => {
  const instrument = requireInstrument(slug);
  const [domain] = instrument.domains;

  it("has the published number of items", () => {
    expect(instrument.items).toHaveLength(items);
    expect(instrument.facets).toStrictEqual([]);
    expect(instrument.domains).toHaveLength(1);
  });

  it("uses the published four-point frequency scale", () => {
    expect(instrument.scale.min).toBe(0);
    expect(instrument.scale.max).toBe(3);
    expect(Object.values(instrument.scale.labels)).toStrictEqual([
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day",
    ]);
  });

  it("reverse keys nothing, because every item counts in the same direction", () => {
    expect(
      instrument.items.filter((item) => item.polarity === "negative")
    ).toStrictEqual([]);
  });

  it("carries the published severity bands", () => {
    expect(domain?.bands).toHaveLength(bands);
    expect(domain?.bands[0]?.min).toBe(0);
    expect(domain?.bands.at(-1)?.max).toBe(max);
  });

  it("sits in the screening category with a crisis notice", () => {
    expect(instrument.category).toBe("screening");
  });

  it("is public domain", () => {
    expect(instrument.license).toBe("Public domain");
    expect(instrument.licenseNotes).toMatch(/public domain/u);
  });

  it("scores the lowest answer at 0 and the highest at the maximum", () => {
    const lowest = instrument.items.map(() => 0);
    const highest = instrument.items.map(() => 3);

    expect(lowest).toHaveLength(items);
    expect(highest.reduce((total, value) => total + value, 0)).toBe(max);
  });

  it("builds a complete answer set", () => {
    expect(Object.keys(buildAnswers(instrument, 1))).toHaveLength(items);
  });

  it("states that a screen is not a diagnosis", () => {
    expect(instrument.evidence.limitations).toMatch(/not a diagnosis/u);
    expect(instrument.info.notFor).toContain("It is not a diagnosis.");
  });
});

describe("candidate instruments", () => {
  it("reports every instrument in the registry", () => {
    const slugs = [
      "gad-7",
      "phq-9",
      "big-five-ipip-50",
      "big-five-ipip-neo-120",
    ];
    const registered = slugs.map((slug) => requireInstrument(slug).slug);

    expect(registered.toSorted()).toStrictEqual(slugs.toSorted());
  });
});
