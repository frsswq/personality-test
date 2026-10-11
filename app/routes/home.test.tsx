import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./home";

describe(Home, () => {
  it("shows the site heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Free psychological tests",
      })
    ).toBeInTheDocument();
  });

  it("lists the Big Five test", () => {
    render(<Home />);

    expect(screen.getByText("Big Five (IPIP-NEO-120)")).toBeInTheDocument();
  });
});
