import { describe, expect, it } from "vitest";

import { requireInstrument } from "./registry";

const instrument = requireInstrument("big-five-ipip-50");

const itemsOf = (domainId: string) =>
  instrument.items.filter((item) => item.domainId === domainId);

describe("IPIP-50 data", () => {
  it("has 50 items and 5 domains", () => {
    expect(instrument.items).toHaveLength(50);
    expect(instrument.domains).toHaveLength(5);
  });

  it("has no facets, because the items belong to the domains directly", () => {
    expect(instrument.facets).toStrictEqual([]);
    expect(
      instrument.domains.every((domain) => domain.facetIds.length === 0)
    ).toBeTruthy();
  });

  it("gives every domain ten items", () => {
    const counts = instrument.domains.map((domain) => ({
      count: itemsOf(domain.id).length,
      id: domain.id,
    }));

    expect(counts.filter((entry) => entry.count !== 10)).toStrictEqual([]);
  });

  it("gives every item a domain and no facet", () => {
    expect(
      instrument.items.filter((item) => item.domainId.length === 0)
    ).toStrictEqual([]);
    expect(
      instrument.items.filter((item) => item.facetId !== undefined)
    ).toStrictEqual([]);
  });

  it("matches the published alpha values from the scoring key", () => {
    const alphas = instrument.evidence.reliability.map((entry) => entry.alpha);

    expect(alphas).toStrictEqual([0.87, 0.82, 0.79, 0.86, 0.84]);
  });

  it("keeps the published scoring direction of the emotional stability items", () => {
    const stability = itemsOf("emotional-stability");
    const negative = stability.filter((item) => item.polarity === "negative");

    // The scoring key marks eight of the ten items as reverse keyed.
    expect(negative).toHaveLength(8);
  });

  it("keeps the published scoring direction of the extraversion items", () => {
    const extraversion = itemsOf("extraversion");

    expect(
      extraversion.filter((item) => item.polarity === "positive")
    ).toHaveLength(5);
  });

  it("starts with the published first item", () => {
    expect(instrument.items[0]?.text).toBe("Am the life of the party.");
    expect(instrument.items[0]?.polarity).toBe("positive");
  });

  it("publishes no norms and states the reason", () => {
    expect(instrument.norms).toBeNull();
    expect(instrument.reporting.mode).toBe("descriptive");
  });

  it("keeps the public-domain licence and the source link", () => {
    expect(instrument.license).toBe("Public domain");
    expect(instrument.sourceUrl).toBe(
      "https://ipip.ori.org/New_IPIP-50-item-scale.htm"
    );
  });
});
