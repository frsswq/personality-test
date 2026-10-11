import type { AnswerValue, Instrument, Scale } from "~/lib/instruments/schema";

export type Answers = Record<string, AnswerValue>;
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

/**
 * Mirrors an answer inside its own scale. The five-point accuracy scale turns 5
 * into 1 and the four-point frequency scale turns 3 into 0.
 */
export const keyedValue = (
  value: AnswerValue,
  polarity: Polar,
  scale: Scale
): AnswerValue =>
  polarity === "negative" ? scale.min + scale.max - value : value;

export const isComplete = (instrument: Instrument, answers: Answers) =>
  instrument.items.every((item) => answers[item.id] !== undefined);

export const missingItemIds = (instrument: Instrument, answers: Answers) =>
  instrument.items
    .filter((item) => answers[item.id] === undefined)
    .map((item) => item.id);

export const isWithinScale = (value: AnswerValue, scale: Scale) =>
  Number.isInteger(value) && value >= scale.min && value <= scale.max;

const sumItems = (
  instrument: Instrument,
  answers: Answers,
  predicate: (item: Instrument["items"][number]) => boolean
): TraitScore => {
  const items = instrument.items.filter(predicate);
  const { max, min } = instrument.scale;

  let raw = 0;
  for (const item of items) {
    const answer = answers[item.id];

    if (answer === undefined) {
      throw new Error(`Missing answer for ${item.id}`);
    }
    if (!isWithinScale(answer, instrument.scale)) {
      throw new Error(
        `Answer ${answer} for ${item.id} is outside the scale ${min} to ${max}`
      );
    }

    raw += keyedValue(answer, item.polarity, instrument.scale);
  }

  return { max: items.length * max, min: items.length * min, raw };
};

const addScores = (scores: TraitScore[]): TraitScore => {
  let max = 0;
  let min = 0;
  let raw = 0;

  for (const score of scores) {
    max += score.max;
    min += score.min;
    raw += score.raw;
  }

  return { max, min, raw };
};

/**
 * Scores a complete answer set. The function is pure, so the same answers
 * always give the same scores and no state is shared between callers.
 *
 * A facet score sums its own items. A domain score sums its facets when it has
 * them, and otherwise sums its own items, which is how a short inventory with
 * no facets works.
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
    facets[facet.id] = sumItems(
      instrument,
      answers,
      (item) => item.facetId === facet.id
    );
  }

  const domains: Record<string, TraitScore> = {};
  for (const domain of instrument.domains) {
    if (domain.facetIds.length === 0) {
      domains[domain.id] = sumItems(
        instrument,
        answers,
        (item) => item.domainId === domain.id
      );
      continue;
    }

    const own = domain.facetIds.map((facetId) => {
      const score = facets[facetId];

      if (!score) {
        throw new Error(`${domain.id} points at unscored facet ${facetId}`);
      }

      return score;
    });

    domains[domain.id] = addScores(own);
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
