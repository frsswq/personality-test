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

const itemsOfDomain = (instrument: Instrument, domainId: string) =>
  instrument.items.filter((item) => item.domainId === domainId);

const itemsOfFacet = (instrument: Instrument, facetId: string) =>
  instrument.items.filter((item) => item.facetId === facetId);

const boundsFor = (itemCount: number): { max: number; min: number } => ({
  max: itemCount * SCALE_MAX,
  min: itemCount * SCALE_MIN,
});

const inRange = (raw: number, bounds: { max: number; min: number }) =>
  Number.isInteger(raw) && raw >= bounds.min && raw <= bounds.max;

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

const requireFacetScores = (
  instrument: Instrument,
  facetRaw: Record<string, number>
): Record<string, TraitScore> => {
  const scores: Record<string, TraitScore> = {};

  for (const facet of instrument.facets) {
    const bounds = boundsFor(itemsOfFacet(instrument, facet.id).length);
    const raw = facetRaw[facet.id];

    if (raw === undefined || !inRange(raw, bounds)) {
      throw new Error(`Facet score for ${facet.id} is out of range.`);
    }

    scores[facet.id] = { ...bounds, raw };
  }

  return scores;
};

const requireDomainScores = (
  instrument: Instrument,
  domainRaw: Record<string, number>
): Record<string, TraitScore> => {
  const scores: Record<string, TraitScore> = {};

  for (const domain of instrument.domains) {
    const bounds = boundsFor(itemsOfDomain(instrument, domain.id).length);
    const raw = domainRaw[domain.id];

    if (raw === undefined || !inRange(raw, bounds)) {
      throw new Error(`Domain score for ${domain.id} is out of range.`);
    }

    scores[domain.id] = { ...bounds, raw };
  }

  return scores;
};

const sumFacets = (
  domain: Domain,
  facetScores: Record<string, TraitScore>
): TraitScore => {
  let max = 0;
  let min = 0;
  let raw = 0;

  for (const facetId of domain.facetIds) {
    const score = requireScore(facetScores, facetId);
    max += score.max;
    min += score.min;
    raw += score.raw;
  }

  return { max, min, raw };
};

/**
 * Builds the report from facet sums, which is what a scores-only share link
 * carries for an instrument that has facets.
 */
export const buildReportFromFacetScores = (
  instrument: Instrument,
  facetRaw: Record<string, number>
): InstrumentReport => {
  const facetScores = requireFacetScores(instrument, facetRaw);
  const domainScores: Record<string, TraitScore> = {};

  for (const domain of instrument.domains) {
    if (domain.facetIds.length === 0) {
      throw new Error(`${domain.id} has no facets, so it needs domain scores.`);
    }

    domainScores[domain.id] = sumFacets(domain, facetScores);
  }

  return assemble(instrument, facetScores, domainScores);
};

/**
 * Builds the report from domain sums, which is what a scores-only share link
 * carries for an instrument without facets.
 */
export const buildReportFromDomainScores = (
  instrument: Instrument,
  domainRaw: Record<string, number>
): InstrumentReport =>
  assemble(instrument, {}, requireDomainScores(instrument, domainRaw));

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
