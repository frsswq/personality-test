import type { Instrument } from "./schema";
import { instrumentSchema } from "./schema";

/**
 * Every instrument file is parsed and validated at module load, so an invalid
 * data file fails the test run and the production build instead of reaching a
 * visitor.
 */
const modules = import.meta.glob<unknown>("../../content/instruments/*.json", {
  eager: true,
  import: "default",
});

const formatIssues = (issues: { message: string; path: PropertyKey[] }[]) =>
  issues
    .map((issue) => `  ${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("\n");

export const parseInstrument = (
  raw: unknown,
  source = "unknown"
): Instrument => {
  const result = instrumentSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `Invalid instrument from ${source}:\n${formatIssues(result.error.issues)}`
    );
  }

  return result.data;
};

export const instruments: Instrument[] = Object.entries(modules)
  .map(([source, raw]) => parseInstrument(raw, source))
  .toSorted((left, right) => left.title.localeCompare(right.title));

export const findInstrument = (slug: string) =>
  instruments.find((instrument) => instrument.slug === slug);

export const requireInstrument = (slug: string): Instrument => {
  const instrument = findInstrument(slug);

  if (!instrument) {
    throw new Error(`Unknown instrument: ${slug}`);
  }

  return instrument;
};
