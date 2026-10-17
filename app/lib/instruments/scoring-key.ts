import generated from "../../../worker/scoring-key.json";
import type { Instrument } from "./schema";

export type ScaleKind = "facet" | "domain";
export interface ScoringKeyInstrument {
  contentHash: string;
  itemCounts: Record<string, number>;
  kind: ScaleKind;
  scale: { max: number; min: number };
}
export interface ScoringKey {
  instruments: Record<string, ScoringKeyInstrument>;
}

export const scaleKindOf = (instrument: Instrument): ScaleKind =>
  instrument.facets.length > 0 ? "facet" : "domain";

/** Canonical scoring data shared by the generator and its freshness check. */
export const scoringDataFor = (instrument: Instrument) => {
  const kind = scaleKindOf(instrument);
  const itemCounts = Object.fromEntries(
    (kind === "facet" ? instrument.facets : instrument.domains)
      .map(({ id }) => [
        id,
        instrument.items.filter(
          (item) => (kind === "facet" ? item.facetId : item.domainId) === id
        ).length,
      ])
      .toSorted(([left], [right]) => String(left).localeCompare(String(right)))
  );
  return {
    domains: instrument.domains.map((domain) => ({
      ...domain,
      facetIds: domain.facetIds.toSorted(),
    })),
    facets: instrument.facets,
    id: instrument.id,
    itemCounts,
    items: instrument.items
      .map((item) => [
        item.id,
        item.domainId,
        item.facetId ?? "",
        item.polarity,
        item.text,
      ])
      .toSorted(([left], [right]) => left.localeCompare(right)),
    kind,
    reporting: instrument.reporting,
    scale: { max: instrument.scale.max, min: instrument.scale.min },
  };
};

/** Read the same committed SHA-256 revision that the Worker accepts. */
export const keyFor = (instrument: Instrument): ScoringKeyInstrument => {
  const entries: Record<
    string,
    {
      contentHash: string;
      itemCounts: Record<string, number>;
      kind: string;
      scale: { max: number; min: number };
    }
  > = generated.instruments;
  const key = entries[instrument.id];
  if (!key) {
    throw new Error(
      `The scoring key is missing ${instrument.id}. Run build:scoring-key.`
    );
  }
  return { ...key, kind: key.kind === "facet" ? "facet" : "domain" };
};
