import { describe, expect, it } from "vitest";

import { instruments, requireInstrument } from "./registry";

const instrument = requireInstrument("big-five-ipip-neo-120");

const itemsOf = (facetId: string) =>
  instrument.items.filter((item) => item.facetId === facetId);

const alphaOf = (scale: string) =>
  instrument.evidence.reliability.find((entry) => entry.scale === scale)?.alpha;

describe("IPIP-NEO-120 data", () => {
  it("ships the instrument in the registry", () => {
    expect(instruments).toHaveLength(1);
    expect(instrument.title).toContain("IPIP-NEO-120");
  });

  it("has 120 items, 30 facets and 5 domains", () => {
    expect(instrument.items).toHaveLength(120);
    expect(instrument.facets).toHaveLength(30);
    expect(instrument.domains).toHaveLength(5);
  });

  it("gives every facet exactly four items", () => {
    const counts = instrument.facets.map((facet) => ({
      count: itemsOf(facet.id).length,
      id: facet.id,
    }));

    expect(counts.filter((entry) => entry.count !== 4)).toStrictEqual([]);
  });

  it("covers every item exactly once", () => {
    const facetItemCount = instrument.facets.reduce(
      (total, facet) => total + itemsOf(facet.id).length,
      0
    );

    expect(facetItemCount).toBe(instrument.items.length);
  });

  it("reverse-keys 55 items", () => {
    const negative = instrument.items.filter(
      (item) => item.polarity === "negative"
    );

    expect(negative).toHaveLength(55);
  });

  it("has a reliability value for every facet", () => {
    const scales = instrument.evidence.reliability.map((entry) => entry.scale);

    expect(scales).toStrictEqual(instrument.facets.map((facet) => facet.id));
    for (const entry of instrument.evidence.reliability) {
      expect(entry.alpha).toBeGreaterThan(0);
      expect(entry.alpha).toBeLessThanOrEqual(1);
    }
  });

  it("matches the published alpha values", () => {
    expect(alphaOf("N1")).toBe(0.78);
    expect(alphaOf("O6")).toBe(0.63);
    expect(alphaOf("C6")).toBe(0.88);
  });

  it("publishes no norms and states the reason", () => {
    expect(instrument.norms).toBeNull();
    expect(instrument.reporting.mode).toBe("descriptive");
    expect(instrument.reporting.note).toMatch(/no population norms/u);
  });

  it("keeps the public-domain licence and the source link", () => {
    expect(instrument.license).toBe("Public domain");
    expect(instrument.sourceUrl).toBe(
      "https://ipip.ori.org/30FacetNEO-PI-RItems.htm"
    );
  });

  it("has a description for every facet and domain", () => {
    expect(
      instrument.facets.filter((facet) => !facet.description)
    ).toStrictEqual([]);
    expect(
      instrument.domains.filter((domain) => !domain.description)
    ).toStrictEqual([]);
  });

  it("lists the six facets of every domain", () => {
    for (const domain of instrument.domains) {
      expect(domain.facetIds).toHaveLength(6);
    }
  });

  it("comes from the IPIP table with the expected item order", () => {
    expect(itemsOf("N1").map((item) => item.text)).toStrictEqual([
      "Worry about things.",
      "Fear for the worst.",
      "Am afraid of many things.",
      "Get stressed out easily.",
    ]);
  });

  it("keeps the published scoring direction", () => {
    expect(itemsOf("N5").map((item) => item.polarity)).toStrictEqual([
      "positive",
      "negative",
      "negative",
      "negative",
    ]);
    expect(itemsOf("A5").map((item) => item.polarity)).toStrictEqual([
      "negative",
      "negative",
      "negative",
      "negative",
    ]);
    expect(itemsOf("C6").map((item) => item.polarity)).toStrictEqual([
      "negative",
      "negative",
      "negative",
      "negative",
    ]);
    expect(itemsOf("N2").map((item) => item.polarity)).toStrictEqual([
      "positive",
      "positive",
      "positive",
      "negative",
    ]);
  });
});
