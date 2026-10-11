import { describe, expect, it } from "vitest";

import type { Domain } from "~/lib/instruments/schema";
import { fixtureInstrument } from "~/test/fixture-instrument";

import { buildReport, describeDomain, describePosition } from "./report";
import type { Answers } from "./score";

const high: Answers = {
  "f1-1": 5,
  "f1-2": 1,
  "f2-1": 5,
  "f2-2": 1,
};

const low: Answers = {
  "f1-1": 1,
  "f1-2": 5,
  "f2-1": 1,
  "f2-2": 5,
};

describe(buildReport, () => {
  it("reports the domain score with its facets", () => {
    const report = buildReport(fixtureInstrument, high);

    expect(report.domains).toHaveLength(1);
    expect(report.domains[0]?.score).toStrictEqual({
      max: 20,
      min: 4,
      raw: 20,
    });
    expect(report.domains[0]?.facets).toHaveLength(2);
  });

  it("places a high score above the midpoint", () => {
    const report = buildReport(fixtureInstrument, high);

    expect(report.domains[0]?.position).toBe("above-midpoint");
  });

  it("places a low score below the midpoint", () => {
    const report = buildReport(fixtureInstrument, low);

    expect(report.domains[0]?.position).toBe("below-midpoint");
  });

  it("refuses an incomplete answer set", () => {
    expect(() => buildReport(fixtureInstrument, { "f1-1": 3 })).toThrow(
      /incomplete answer set/u
    );
  });
});

describe(describePosition, () => {
  it("names each side of the scale", () => {
    expect(describePosition("above-midpoint")).toBe(
      "above the midpoint of the scale"
    );
    expect(describePosition("below-midpoint")).toBe(
      "below the midpoint of the scale"
    );
    expect(describePosition("at-midpoint")).toBe(
      "on the midpoint of the scale"
    );
  });
});

const domainFixture: Domain = {
  bands: [],
  description: "A description.",
  facetIds: ["F1", "F2"],
  high: "A high score text.",
  id: "D1",
  low: "A low score text.",
  name: "Domain one",
};

describe(describeDomain, () => {
  it("returns the high text above the midpoint", () => {
    expect(describeDomain(domainFixture, "above-midpoint")).toBe(
      domainFixture.high
    );
  });

  it("returns the low text below the midpoint", () => {
    expect(describeDomain(domainFixture, "below-midpoint")).toBe(
      domainFixture.low
    );
  });

  it("returns the description at the midpoint", () => {
    expect(describeDomain(domainFixture, "at-midpoint")).toBe(
      domainFixture.description
    );
  });
});
