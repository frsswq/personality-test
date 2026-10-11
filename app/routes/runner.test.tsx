import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { requireInstrument } from "~/lib/instruments/registry";
import type { LikertValue } from "~/lib/instruments/schema";
import { emptySession, writeSession } from "~/lib/session";
import { renderRoute } from "~/test/render-route";

import RunnerRoute from "./runner";

const slug = "big-five-ipip-neo-120";
const url = `/tests/${slug}/start`;
const path = "/tests/:slug/start";
const instrument = requireInstrument(slug);
const firstPageItems = instrument.items.slice(0, 10);

const answersForFirstPage = () => {
  const answers: Record<string, LikertValue> = {};

  for (const item of firstPageItems) {
    answers[item.id] = 3;
  }

  return answers;
};

const renderRunner = () => {
  renderRoute(<RunnerRoute />, { path, url });
};

describe("runner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the first page of ten items", () => {
    renderRunner();

    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.getByText("Worry about things.")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 12")).toBeInTheDocument();
  });

  it("preselects no answer", () => {
    renderRunner();

    const selected = screen
      .getAllByRole("radio")
      .filter((radio) => Object.hasOwn(radio.dataset, "checked"));

    expect(selected).toHaveLength(0);
  });

  it("keeps Next disabled until the page is answered", () => {
    renderRunner();

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    const radios = screen.getAllByRole("radio");
    for (const [index] of firstPageItems.entries()) {
      const target = radios[index * 5 + 2];
      if (target) {
        fireEvent.click(target);
      }
    }

    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("restores a saved attempt", () => {
    writeSession(slug, {
      ...emptySession(),
      answers: answersForFirstPage(),
      page: 0,
    });

    renderRunner();

    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getAllByText("10 of 120 answered").length).toBeGreaterThan(0);
  });

  it("disables Back on the first page", () => {
    renderRunner();

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });
});
