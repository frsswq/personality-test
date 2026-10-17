import { afterEach, describe, expect, it, vi } from "vitest";

import { requireInstrument } from "./instruments/registry";
import {
  reportFromStored,
  resultPayloadFor,
  uploadResult,
} from "./remote-result";
import { buildReport } from "./scoring/report";

const id = "a".repeat(32);
describe("stored result round trip", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["gad-7", "phq-9", "big-five-ipip-50", "big-five-ipip-neo-120"])(
    "preserves every score and bound for %s",
    (slug) => {
      const instrument = requireInstrument(slug);
      const answers = Object.fromEntries(
        instrument.items.map((item) => [item.id, instrument.scale.min])
      );
      const report = buildReport(instrument, answers);
      const payload = resultPayloadFor(instrument, report, id);
      const { id: _id, ...wire } = payload;
      const restored = reportFromStored(instrument, {
        ...wire,
        expiresAt: "2027-01-09T00:00:00.000Z",
      });
      expect(restored).toStrictEqual(report);
      expect(
        reportFromStored(instrument, {
          ...wire,
          contentHash: "older",
          expiresAt: "2027-01-09T00:00:00.000Z",
        })
      ).toBeNull();
    }
  );

  it("accepts the actual API receipt without sending answers or profile fields", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json(
          { expiresAt: "2027-01-09T00:00:00.000Z", id },
          { status: 201 }
        )
      );
    vi.stubGlobal("fetch", fetcher);
    const instrument = requireInstrument("gad-7");
    const report = buildReport(
      instrument,
      Object.fromEntries(instrument.items.map((item) => [item.id, 0]))
    );
    await expect(
      uploadResult(resultPayloadFor(instrument, report, id))
    ).resolves.toStrictEqual({ expiresAt: "2027-01-09T00:00:00.000Z", id });
    const sent: unknown = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(sent).toStrictEqual({
      contentHash: expect.any(String),
      id,
      instrumentId: "gad-7",
      scaleKind: "domain",
      scores: { "anxiety-severity": 0 },
    });
  });
});
