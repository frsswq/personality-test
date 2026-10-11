import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { requireInstrument } from "~/lib/instruments/registry";
import { renderRoute } from "~/test/render-route";

import MethodologyRoute from "./instrument-methodology";

const slug = "big-five-ipip-50";
const url = `/tests/${slug}/methodology`;
const path = "/tests/:slug/methodology";
const instrument = requireInstrument(slug);

const renderMethodology = () => {
  renderRoute(<MethodologyRoute />, { path, url });
};

describe("instrument methodology page", () => {
  it("names every scale of a facet-less instrument", () => {
    renderMethodology();

    for (const domain of instrument.domains) {
      expect(
        screen.getByRole("heading", { level: 3, name: domain.name })
      ).toBeInTheDocument();
    }
  });

  it("publishes every item with its scoring direction", () => {
    renderMethodology();

    const rows = screen.getAllByRole("row");

    // One header row per scale, plus one row per item.
    expect(rows).toHaveLength(
      instrument.domains.length + instrument.items.length
    );
    expect(screen.getByText("Am the life of the party.")).toBeInTheDocument();
    expect(screen.getAllByText("reverse")).toHaveLength(
      instrument.items.filter((item) => item.polarity === "negative").length
    );
  });

  it("explains the scoring rule", () => {
    renderMethodology();

    const heading = screen.getByRole("heading", { name: "Scoring rule" });
    const section = heading.parentElement as HTMLElement;

    expect(
      within(section).getByText(/50 items, each answered from 1 to 5/u)
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/sum of its own items/u)
    ).toBeInTheDocument();
  });

  it("lists the sources", () => {
    renderMethodology();

    expect(
      screen.getByText(
        /The development of markers for the Big-Five factor structure/u
      )
    ).toBeInTheDocument();
  });

  it("renders a not-found page for an unknown slug", () => {
    renderRoute(<MethodologyRoute />, {
      path,
      url: "/tests/not-a-real-test/methodology",
    });

    expect(
      screen.getByRole("heading", { name: "Test not found" })
    ).toBeInTheDocument();
  });
});
