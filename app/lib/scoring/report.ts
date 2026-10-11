import type { Domain, Facet, Instrument } from "~/lib/instruments/schema";

import type { Answers, TraitPosition, TraitScore } from "./score";
import { positionOf, scoreInstrument } from "./score";

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

/**
 * Turns a complete answer set into the shape the result page renders. It is a
 * pure function of the instrument and the answers.
 */
export const buildReport = (
  instrument: Instrument,
  answers: Answers
): InstrumentReport => {
  const result = scoreInstrument(instrument, answers);

  const domains = instrument.domains.map((domain) => {
    const facets = instrument.facets
      .filter((facet) => facet.domainId === domain.id)
      .map((facet) => {
        const score = requireScore(result.facets, facet.id);

        return { facet, position: positionOf(score), score };
      });

    const score = requireScore(result.domains, domain.id);

    return { domain, facets, position: positionOf(score), score };
  });

  return { domains, instrument };
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
