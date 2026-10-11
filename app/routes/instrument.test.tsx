import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "~/test/render-route";

import InstrumentRoute from "./instrument";

const url = "/tests/big-five-ipip-neo-120";
const path = "/tests/:slug";

const renderInstrument = () => {
  renderRoute(<InstrumentRoute />, { path, url });
};

describe("instrument page", () => {
  it("names the test and its size", () => {
    renderInstrument();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Big Five personality test (IPIP-NEO-120)",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("120 items")).toBeInTheDocument();
  });

  it("shows the general information before the start button", () => {
    renderInstrument();

    expect(
      screen.getByRole("heading", { name: "What this test measures" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How to answer" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What you get" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What this test is not" })
    ).toBeInTheDocument();
  });

  it("states that the test is not a diagnosis", () => {
    renderInstrument();

    expect(screen.getByText("It is not a diagnosis.")).toBeInTheDocument();
  });

  it("shows the evidence sections", () => {
    renderInstrument();

    expect(
      screen.getByRole("button", { name: /Reliability/u })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Validity" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Norms and comparison" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "References" })
    ).toBeInTheDocument();
  });

  it("summarises the alpha range from the data", () => {
    renderInstrument();

    expect(
      screen.getByRole("button", { name: /alpha 0\.63 to 0\.88/u })
    ).toBeInTheDocument();
  });

  it("links to the runner", () => {
    renderInstrument();

    expect(
      screen.getByRole("link", { name: "Start the test" })
    ).toHaveAttribute("href", `${url}/start`);
  });

  it("says that answers stay in the browser", () => {
    renderInstrument();

    const privacy = screen.getByRole("heading", { name: "Privacy" })
      .parentElement as HTMLElement;

    expect(
      within(privacy).getByText(/stay in this browser/u)
    ).toBeInTheDocument();
  });

  it("renders a not-found page for an unknown slug", () => {
    renderRoute(<InstrumentRoute />, {
      path,
      url: "/tests/not-a-real-test",
    });

    expect(
      screen.getByRole("heading", { name: "Test not found" })
    ).toBeInTheDocument();
  });
});
