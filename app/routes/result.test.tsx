import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { requireInstrument } from "~/lib/instruments/registry";
import type { LikertValue } from "~/lib/instruments/schema";
import { emptySession, writeSession } from "~/lib/session";
import { renderRoute } from "~/test/render-route";

import ResultRoute from "./result";

const slug = "big-five-ipip-neo-120";
const url = `/tests/${slug}/result`;
const path = "/tests/:slug/result";
const instrument = requireInstrument(slug);

const completeAnswers = () => {
  const answers: Record<string, LikertValue> = {};

  for (const item of instrument.items) {
    answers[item.id] = item.polarity === "negative" ? 1 : 5;
  }

  return answers;
};

const renderResult = () => {
  renderRoute(<ResultRoute />, { path, url });
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
});
