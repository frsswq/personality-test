/**
 * The wire contract for `POST /api/results`.
 *
 * Every schema is strict, so a payload cannot smuggle an unknown field into the
 * store. See docs/D1-RESULTS.md section 9.
 */
import { z } from "zod";

/** The largest accepted body. A stored result is well under this. */
export const MAX_BODY_BYTES = 4096;
export const MAX_SCORE_KEYS = 64;
export const MAX_INSTRUMENT_ID_LENGTH = 64;

/** 32 lowercase hex characters, which is 128 bits. */
export const RESULT_ID_PATTERN = /^[0-9a-f]{32}$/u;

const scoreTableSchema = z
  .record(z.string().min(1).max(64), z.number().int().min(0))
  .refine((scores) => Object.keys(scores).length <= MAX_SCORE_KEYS, {
    message: `A result holds at most ${MAX_SCORE_KEYS} scores.`,
  });

export const createResultSchema = z
  .object({
    contentHash: z.string().min(1).max(64),
    id: z.string().regex(RESULT_ID_PATTERN),
    instrumentId: z.string().min(1).max(MAX_INSTRUMENT_ID_LENGTH),
    scaleKind: z.enum(["facet", "domain"]),
    scores: scoreTableSchema,
  })
  .strict();

export type CreateResultInput = z.infer<typeof createResultSchema>;
