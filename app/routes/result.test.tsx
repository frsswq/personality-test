import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readHistory } from "~/lib/history";
import { requireInstrument } from "~/lib/instruments/registry";
import type { AnswerValue } from "~/lib/instruments/schema";
import { keyFor } from "~/lib/instruments/scoring-key";
import { emptySession, writeSession } from "~/lib/session";
import {
  answersShare,
  decodeShare,
  encodeShare,
  readShareCode,
  scoresShare,
} from "~/lib/share";
import { renderRoute } from "~/test/render-route";

import ResultRoute from "./result";

const slug = "big-five-ipip-neo-120";
const url = `/tests/${slug}/result`;
const path = "/tests/:slug/result";
const instrument = requireInstrument(slug);

const completeAnswers = () => {
  const answers: Record<string, AnswerValue> = {};

  for (const item of instrument.items) {
    answers[item.id] = item.polarity === "negative" ? 1 : 5;
  }

  return answers;
};

const midFacetScores = () => {
  const raw: Record<string, number> = {};

  for (const facet of instrument.facets) {
    raw[facet.id] = 12;
  }

  return raw;
};

const renderResult = () => {
  renderRoute(<ResultRoute />, { path, url });
};

const renderCode = (code: string) => {
  renderRoute(<ResultRoute />, { path, url: `${url}#r=${code}` });
};

describe("result page", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("asks for a finished test when answers are missing", () => {
    renderResult();

    expect(
      screen.getByRole("heading", { name: "This test is not finished" })
    ).toBeInTheDocument();
  });

  it("reports every domain with a score", () => {
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();

    expect(
      screen.getByRole("heading", { level: 1, name: "Your result" })
    ).toBeInTheDocument();

    for (const domain of instrument.domains) {
      expect(screen.getByText(domain.name)).toBeInTheDocument();
    }
  });

  it("states that no population comparison is made", () => {
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();

    expect(screen.getByText("No population comparison")).toBeInTheDocument();
    expect(screen.getByText(/no population norms/u)).toBeInTheDocument();
  });

  it("scores a maximised answer set at the top of each range", () => {
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();

    // A reverse-keyed item answered 1 mirrors to 5, so every domain is full.
    expect(screen.getAllByText("120 of 120").length).toBeGreaterThan(0);
  });

  it("offers a retake", () => {
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();

    expect(
      screen.getByRole("button", { name: "Take the test again" })
    ).toBeInTheDocument();
  });

  it("records a finished local result in the history", () => {
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();

    expect(readHistory()).toHaveLength(1);
  });

  it("renders a result carried by an answers link", () => {
    renderCode(
      encodeShare(instrument, answersShare(instrument, completeAnswers()))
    );

    expect(screen.getByText("Shared result")).toBeInTheDocument();
    expect(screen.getByText(/carries the answers/u)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Your result" })
    ).toBeInTheDocument();
  });

  it("renders a result carried by a scores-only link", () => {
    renderCode(
      encodeShare(instrument, scoresShare(instrument, midFacetScores()))
    );

    expect(screen.getByText(/carries the scores only/u)).toBeInTheDocument();
  });

  it("offers no answer link when only the scores arrive", () => {
    renderCode(
      encodeShare(instrument, scoresShare(instrument, midFacetScores()))
    );

    expect(
      screen.queryByRole("button", { name: /Copy result link/u })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Copy scores-only link/u })
    ).toBeInTheDocument();
  });

  it("does not record a shared result in the history", () => {
    renderCode(
      encodeShare(instrument, answersShare(instrument, completeAnswers()))
    );

    expect(readHistory()).toHaveLength(0);
  });

  it("ignores a damaged share code", () => {
    renderCode("AQ");

    expect(
      screen.getByRole("heading", { name: "This test is not finished" })
    ).toBeInTheDocument();
  });
});

describe("stored result flow", () => {
  const storedId = "d".repeat(32);
  const expiresAt = "2099-01-09T00:00:00.000Z";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the local result while saving, retries the same id, and does not resave a deleted copy", async () => {
    const user = userEvent.setup();
    const bodies: Record<string, unknown>[] = [];
    let attempts = 0;
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      if (init?.method === "DELETE") {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      const payload: Record<string, unknown> = JSON.parse(String(init?.body));
      bodies.push(payload);
      attempts += 1;
      return Promise.resolve(
        attempts === 1
          ? new Response(null, { status: 503 })
          : Response.json({ expiresAt, id: payload.id }, { status: 201 })
      );
    });
    vi.stubGlobal("fetch", fetcher);
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    const view = renderRoute(<ResultRoute />, { path, url });
    expect(screen.getAllByText("120 of 120")).toHaveLength(5);
    await user.click(
      await screen.findByRole("button", { name: "Try saving again" })
    );
    await screen.findByRole("button", { name: "Copy stored link" });
    expect(bodies[0]).toStrictEqual(bodies[1]);
    expect(Object.keys(bodies[0]).toSorted()).toStrictEqual([
      "contentHash",
      "id",
      "instrumentId",
      "scaleKind",
      "scores",
    ]);
    await user.click(
      screen.getByRole("button", { name: "Delete stored copy" })
    );
    await screen.findByText(/The stored copy was deleted/u);
    view.unmount();
    renderResult();
    await screen.findByText(/The stored copy was deleted/u);
    expect(bodies).toHaveLength(2);
    expect(screen.getAllByText("120 of 120")).toHaveLength(5);
  });

  it("copies the displayed facet sums in the local scores-only link", async () => {
    const user = userEvent.setup();
    const clipboard = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 503 }))
    );
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderResult();
    await user.click(
      screen.getByRole("button", { name: "Copy scores-only link" })
    );
    const hash = `#${clipboard.mock.calls[0][0].split("#")[1]}`;
    const code = readShareCode(hash);
    expect(decodeShare(code ?? "", instrument)?.values).toStrictEqual(
      Array.from({ length: 30 }, () => 20)
    );
  });

  it("opens a stored scores-only link without a local session or a new upload", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        contentHash: keyFor(instrument).contentHash,
        expiresAt,
        instrumentId: instrument.id,
        scaleKind: "facet",
        scores: midFacetScores(),
      })
    );
    vi.stubGlobal("fetch", fetcher);
    renderRoute(<ResultRoute />, { path, url: `${url}#s=${storedId}` });
    await screen.findByRole("heading", { name: "Your result" });
    expect(screen.getAllByText("72 of 120")).toHaveLength(5);
    expect(
      screen.queryByRole("button", { name: "Copy result link" })
    ).not.toBeInTheDocument();
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    expect(fetcher.mock.calls[0][0]).toBe(`/api/results/${storedId}`);
  });

  it("shows an expired message instead of silently showing another local result", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 404 }))
    );
    writeSession(slug, { ...emptySession(), answers: completeAnswers() });
    renderRoute(<ResultRoute />, { path, url: `${url}#s=${storedId}` });
    await screen.findByText(/This stored result has expired or was deleted/u);
    expect(
      screen.queryByRole("heading", { name: "Your result" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See your local result" })
    ).toHaveAttribute("href", url);
  });
});
