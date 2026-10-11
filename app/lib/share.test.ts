import { describe, expect, it } from "vitest";

import { requireInstrument } from "~/lib/instruments/registry";
import type { Answers } from "~/lib/scoring/score";

import {
  answersFromShare,
  answersShare,
  decodeShare,
  encodeShare,
  facetScoresFromShare,
  readShareCode,
  scoresShare,
  shareUrlFor,
} from "./share";

const instrument = requireInstrument("big-five-ipip-neo-120");

const answers = (): Answers => {
  const result: Answers = {};

  for (const [index, item] of instrument.items.entries()) {
    result[item.id] = ((index % 5) + 1) as Answers[string];
  }

  return result;
};

const facetRaw = () => {
  const raw: Record<string, number> = {};

  for (const facet of instrument.facets) {
    raw[facet.id] = 8 + (instrument.facets.indexOf(facet) % 9);
  }

  return raw;
};

describe(encodeShare, () => {
  // 120 answers at three bits each is 45 bytes. With the three header bytes
  // and the eleven-byte instrument id, the code lands at 79 characters.
  it("keeps an answer set inside a URL", () => {
    const code = encodeShare(answersShare(instrument, answers()));

    expect(code.length).toBeLessThanOrEqual(80);
  });

  it("keeps a scores-only set short", () => {
    const code = encodeShare(scoresShare(instrument, facetRaw()));

    expect(code.length).toBeLessThanOrEqual(48);
  });

  it("fits a whole share link in a message", () => {
    const url = shareUrlFor(
      instrument.slug,
      encodeShare(answersShare(instrument, answers()))
    );

    expect(url.length).toBeLessThan(140);
  });
});

describe("answer round trip", () => {
  it("returns the same answers", () => {
    const original = answers();
    const payload = decodeShare(
      encodeShare(answersShare(instrument, original))
    );

    expect(payload?.mode).toBe("answers");
    expect(
      payload ? answersFromShare(payload, instrument) : null
    ).toStrictEqual(original);
  });
});

describe("score round trip", () => {
  it("returns the same facet scores", () => {
    const original = facetRaw();
    const payload = decodeShare(encodeShare(scoresShare(instrument, original)));
    const decoded = payload ? facetScoresFromShare(payload, instrument) : null;

    expect(payload?.mode).toBe("scores");
    expect(decoded).toStrictEqual(original);
  });
});

describe(decodeShare, () => {
  it("rejects an empty code", () => {
    expect(decodeShare("")).toBeNull();
  });

  it("rejects a code with characters outside the alphabet", () => {
    expect(decodeShare("not a code!")).toBeNull();
  });

  it("rejects a code that is too short", () => {
    expect(decodeShare("AQ")).toBeNull();
  });

  it("rejects an unknown version", () => {
    const bytes = new Uint8Array([9, 0, 1, 65, 0]);
    const code = btoa(String.fromCodePoint(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "");

    expect(decodeShare(code)).toBeNull();
  });

  it("reports the instrument id from the code", () => {
    const payload = decodeShare(
      encodeShare(answersShare(instrument, answers()))
    );

    expect(payload?.instrumentId).toBe("ipip-neo-120");
  });
});

describe(answersFromShare, () => {
  it("rejects a payload with the wrong number of values", () => {
    const payload = decodeShare(
      encodeShare(scoresShare(instrument, facetRaw()))
    );

    expect(payload ? answersFromShare(payload, instrument) : null).toBeNull();
  });
});

describe(facetScoresFromShare, () => {
  it("rejects a payload built from answers", () => {
    const payload = decodeShare(
      encodeShare(answersShare(instrument, answers()))
    );

    expect(
      payload ? facetScoresFromShare(payload, instrument) : null
    ).toBeNull();
  });
});

describe(readShareCode, () => {
  it("reads a code from the fragment", () => {
    expect(readShareCode("#r=abc123")).toBe("abc123");
  });

  it("reads a code next to another fragment field", () => {
    expect(readShareCode("#x=1&r=abc123")).toBe("abc123");
  });

  it("returns null without a code", () => {
    expect(readShareCode("#other=1")).toBeNull();
    expect(readShareCode("")).toBeNull();
  });
});

describe(shareUrlFor, () => {
  it("builds a link that points at the instrument result and the fragment", () => {
    expect(shareUrlFor("a-test", "abc")).toBe(
      `${globalThis.location.origin}/tests/a-test/result#r=abc`
    );
  });
});
