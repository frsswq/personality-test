// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildScoringKey } from "../../../scripts/build-scoring-key";
import generated from "../../../worker/scoring-key.json";

describe("Worker scoring contract", () => {
  it("keeps the committed key in step with the shipped instruments", async () => {
    await expect(buildScoringKey()).resolves.toStrictEqual(generated);
  });
});
