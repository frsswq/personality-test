import type { Domain, Facet, Instrument } from "~/lib/instruments/schema";

import type { Answers, TraitPosition, TraitScore } from "./score";
import { positionOf, scoreInstrument } from "./score";

const SCALE_MAX = 5;
const SCALE_MIN = 1;

export interface FacetReport {
  facet: Facet;
  position: TraitPosition;
  score: TraitScore;
}

export interface DomainReport {
  domain: Domain;
  facets: FacetReport[];
  position: TraitPosition;
  score: TraitScore;
}

export interface InstrumentReport {
  domains: DomainReport[];
  instrument: Instrument;
}

const requireScore = (
  scores: Record<string, TraitScore>,
  id: string
): TraitScore => {
  const score = scores[id];

  if (!score) {
    throw new Error(`No score for ${id}`);
  }

  return score;
};

const assemble = (
  instrument: Instrument,
  facetScores: Record<string, TraitScore>,
  domainScores: Record<string, TraitScore>
): InstrumentReport => ({
  domains: instrument.domains.map((domain) => {
    const facets = instrument.facets
      .filter((facet) => facet.domainId === domain.id)
      .map((facet) => {
        const score = requireScore(facetScores, facet.id);

        return { facet, position: positionOf(score), score };
      });

    const score = requireScore(domainScores, domain.id);

    return { domain, facets, position: positionOf(score), score };
  }),
  instrument,
});

/** Builds the report from a complete answer set. */
export const buildReport = (
  instrument: Instrument,
  answers: Answers
): InstrumentReport => {
  const result = scoreInstrument(instrument, answers);

  return assemble(instrument, result.facets, result.domains);
};

const facetBounds = (instrument: Instrument, facetId: string) => {
  const items = instrument.items.filter((item) => item.facetId === facetId);

  return { max: items.length * SCALE_MAX, min: items.length * SCALE_MIN };
};

/**
 * Builds the report from facet sums, which is what a scores-only share link
 * carries. A value outside the facet range is rejected instead of guessed.
 */
export const buildReportFromFacetScores = (
  instrument: Instrument,
  facetRaw: Record<string, number>
): InstrumentReport => {
  const facetScores: Record<string, TraitScore> = {};

  for (const facet of instrument.facets) {
    const bounds = facetBounds(instrument, facet.id);
    const raw = facetRaw[facet.id];

    if (
      raw === undefined ||
      !Number.isInteger(raw) ||
      raw < bounds.min ||
      raw > bounds.max
    ) {
      throw new Error(`Facet score for ${facet.id} is out of range.`);
    }

    facetScores[facet.id] = { ...bounds, raw };
  }

  const domainScores: Record<string, TraitScore> = {};

  for (const domain of instrument.domains) {
    let max = 0;
    let min = 0;
    let raw = 0;

    for (const facetId of domain.facetIds) {
      const score = requireScore(facetScores, facetId);
      max += score.max;
      min += score.min;
      raw += score.raw;
    }

    domainScores[domain.id] = { max, min, raw };
  }

  return assemble(instrument, facetScores, domainScores);
};

export const describePosition = (position: TraitPosition) => {
  if (position === "above-midpoint") {
    return "above the midpoint of the scale";
  }
  if (position === "below-midpoint") {
    return "below the midpoint of the scale";
  }
  return "on the midpoint of the scale";
};

/** Picks the text that belongs to the side of the scale a score falls on. */
export const describeDomain = (domain: Domain, position: TraitPosition) => {
  if (position === "above-midpoint") {
    return domain.high;
  }
  if (position === "below-midpoint") {
    return domain.low;
  }
  return domain.description;
};
