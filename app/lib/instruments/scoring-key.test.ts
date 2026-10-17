// @vitest-environment node
import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { buildScoringKey } from "../../../scripts/build-scoring-key";
import generated from "../../../worker/scoring-key.json";
import gad7 from "../../content/instruments/gad-7.json";
import { parseInstrument } from "./schema";
import type { Instrument } from "./schema";
import { scoringDataFor } from "./scoring-key";

const revisionFor = (instrument: Instrument) =>
  createHash("sha256")
    .update(JSON.stringify(scoringDataFor(instrument)))
    .digest("hex");

describe("Worker scoring contract", () => {
  it("changes the revision when screening thresholds change", () => {
    const instrument = parseInstrument(gad7);
    const changed = structuredClone(instrument);
    changed.domains[0].bands[0].max -= 1;
    changed.domains[0].bands[1].min -= 1;

    expect(revisionFor(changed)).not.toBe(revisionFor(instrument));
  });

  it.each(["label", "description"] as const)(
    "changes the revision when a screening band %s changes",
    (field) => {
      const instrument = parseInstrument(gad7);
      const changed = structuredClone(instrument);
      changed.domains[0].bands[0][field] = "Updated clinical interpretation";

      expect(revisionFor(changed)).not.toBe(revisionFor(instrument));
    }
  );

  it("keeps the committed key in step with the shipped instruments", async () => {
    await expect(buildScoringKey()).resolves.toStrictEqual(generated);
  });
});
