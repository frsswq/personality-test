import type { Instrument, LikertValue } from "~/lib/instruments/schema";

/** The accuracy scale runs from 1 to 5, so a mirrored value is 6 minus it. */
const REVERSE_BASE = 6;
const SCALE_MAX = 5;
const SCALE_MIN = 1;

export type Answers = Record<string, LikertValue>;
export type Polar = "negative" | "positive";
export type TraitPosition = "above-midpoint" | "at-midpoint" | "below-midpoint";

export interface TraitScore {
  max: number;
  min: number;
  raw: number;
}

export interface ScoreResult {
  domains: Record<string, TraitScore>;
  facets: Record<string, TraitScore>;
  instrumentId: string;
  itemCount: number;
}

export const keyedValue = (value: LikertValue, polarity: Polar): LikertValue =>
  polarity === "negative" ? ((REVERSE_BASE - value) as LikertValue) : value;

export const isComplete = (instrument: Instrument, answers: Answers) =>
  instrument.items.every((item) => answers[item.id] !== undefined);

export const missingItemIds = (instrument: Instrument, answers: Answers) =>
  instrument.items
    .filter((item) => answers[item.id] === undefined)
    .map((item) => item.id);

const sumItems = (
  instrument: Instrument,
  answers: Answers,
  facetId: string
): TraitScore => {
  const items = instrument.items.filter((item) => item.facetId === facetId);

  let raw = 0;
  for (const item of items) {
    const answer = answers[item.id];

    if (answer === undefined) {
      throw new Error(`Missing answer for ${item.id}`);
    }

    raw += keyedValue(answer, item.polarity);
  }

  return {
    max: items.length * SCALE_MAX,
    min: items.length * SCALE_MIN,
    raw,
  };
};

/**
 * Scores a complete answer set. The function is pure, so the same answers
 * always give the same scores and no state is shared between callers.
 */
export const scoreInstrument = (
  instrument: Instrument,
  answers: Answers
): ScoreResult => {
  const missing = missingItemIds(instrument, answers);

  if (missing.length > 0) {
    throw new Error(
      `Cannot score an incomplete answer set. Missing ${missing.length} of ${instrument.items.length}: ${missing.slice(0, 5).join(", ")}`
    );
  }

  const facets: Record<string, TraitScore> = {};
  for (const facet of instrument.facets) {
    facets[facet.id] = sumItems(instrument, answers, facet.id);
  }

  const domains: Record<string, TraitScore> = {};
  for (const domain of instrument.domains) {
    const own = domain.facetIds.map((facetId) => {
      const score = facets[facetId];

      if (!score) {
        throw new Error(`${domain.id} points at unscored facet ${facetId}`);
      }

      return score;
    });

    domains[domain.id] = {
      max: own.reduce((total, score) => total + score.max, 0),
      min: own.reduce((total, score) => total + score.min, 0),
      raw: own.reduce((total, score) => total + score.raw, 0),
    };
  }

  return {
    domains,
    facets,
    instrumentId: instrument.id,
    itemCount: instrument.items.length,
  };
};

/**
 * Describes a raw score in relation to its own scale. This is not a comparison
 * against other people, because the IPIP publishes no population norms.
 */
export const positionOf = (score: TraitScore): TraitPosition => {
  const midpoint = (score.min + score.max) / 2;

  if (score.raw > midpoint) {
    return "above-midpoint";
  }
  if (score.raw < midpoint) {
    return "below-midpoint";
  }
  return "at-midpoint";
};

export const allAnswered = (answers: Answers, answeredCount: number): boolean =>
  Object.keys(answers).length === answeredCount;
