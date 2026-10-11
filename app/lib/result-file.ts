import { z } from "zod";

export const RESULT_FILE_FORMAT = "personality-test-result";
export const RESULT_FILE_VERSION = 1;

const resultFileSchema = z
  .object({
    code: z.string().min(1),
    exportedAt: z.string().min(1),
    format: z.literal(RESULT_FILE_FORMAT),
    instrumentId: z.string().min(1),
    slug: z.string().min(1),
    version: z.literal(RESULT_FILE_VERSION),
  })
  .strict();

export type ResultFile = z.infer<typeof resultFileSchema>;

export const buildResultFile = (input: {
  code: string;
  instrumentId: string;
  slug: string;
}): ResultFile => ({
  code: input.code,
  exportedAt: new Date().toISOString(),
  format: RESULT_FILE_FORMAT,
  instrumentId: input.instrumentId,
  slug: input.slug,
  version: RESULT_FILE_VERSION,
});

/** Returns `null` for anything that is not one of our result files. */
export const parseResultFile = (text: string): ResultFile | null => {
  try {
    const parsed = resultFileSchema.safeParse(JSON.parse(text));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const resultFileName = (slug: string, at = new Date()) => {
  const stamp = at.toISOString().slice(0, 10);

  return `${slug}-${stamp}.json`;
};
