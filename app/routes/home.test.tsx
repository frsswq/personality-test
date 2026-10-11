import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "~/test/render-route";

import Home from "./home";

describe(Home, () => {
  it("shows the site heading", () => {
    renderRoute(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Free psychological tests",
      })
    ).toBeInTheDocument();
  });

  it("lists the Big Five test with a link to it", () => {
    renderRoute(<Home />);

    expect(
      screen.getByText("Big Five personality test (IPIP-NEO-120)")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View this test" })
    ).toHaveAttribute("href", "/tests/big-five-ipip-neo-120");
  });

  it("lists the categories that have no instrument yet", () => {
    renderRoute(<Home />);

    expect(
      screen.getByRole("heading", { name: "Planned categories" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mental health screening")).toBeInTheDocument();
  });
});
