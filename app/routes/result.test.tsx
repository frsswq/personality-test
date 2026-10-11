import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { readHistory } from "~/lib/history";
import { requireInstrument } from "~/lib/instruments/registry";
import type { AnswerValue } from "~/lib/instruments/schema";
import { emptySession, writeSession } from "~/lib/session";
import { answersShare, encodeShare, scoresShare } from "~/lib/share";
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
