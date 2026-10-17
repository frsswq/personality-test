/**
 * Writes `worker/scoring-key.json` from the committed instrument data.
 *
 * The Worker API cannot read the app registry, because `import.meta.glob` is a
 * Vite feature. The key carries only what the API needs: the scale bounds, the
 * item count per facet or domain, and a content hash.
 *
 * Run `bun run build:scoring-key` after a change to an instrument file.
 * `app/lib/instruments/scoring-key.test.ts` fails when the file is stale.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseInstrument } from "../app/lib/instruments/schema";
import type { ScoringKey } from "../app/lib/instruments/scoring-key";
import { scoringDataFor } from "../app/lib/instruments/scoring-key";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const instrumentsDir = path.join(root, "app/content/instruments");
export const scoringKeyPath = path.join(root, "worker/scoring-key.json");

/** Builds the key from the committed instrument files. Pure, so a test can compare. */
export const buildScoringKey = async (): Promise<ScoringKey> => {
  const listing = await readdir(instrumentsDir);
  const files = listing.filter((file) => file.endsWith(".json")).toSorted();
  const entries = await Promise.all(
    files.map(async (file) => {
      const text = await readFile(path.join(instrumentsDir, file), "utf-8");
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch (error) {
        throw new Error(`Invalid instrument JSON in ${file}.`, {
          cause: error,
        });
      }
      const data = scoringDataFor(parseInstrument(raw, file));
      return [
        data.id,
        {
          contentHash: createHash("sha256")
            .update(JSON.stringify(data))
            .digest("hex"),
          itemCounts: data.itemCounts,
          kind: data.kind,
          scale: data.scale,
        },
      ] as const;
    })
  );

  return {
    instruments: Object.fromEntries(
      entries.toSorted(([left], [right]) => left.localeCompare(right))
    ),
  };
};

export const writeScoringKey = async (): Promise<ScoringKey> => {
  const key = await buildScoringKey();

  await mkdir(path.dirname(scoringKeyPath), { recursive: true });
  await writeFile(scoringKeyPath, `${JSON.stringify(key, null, 2)}\n`);

  return key;
};

if (import.meta.main) {
  await writeScoringKey();
  process.stdout.write(`Wrote ${path.relative(root, scoringKeyPath)}\n`);
}
