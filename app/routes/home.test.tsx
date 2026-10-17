import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { addHistory, readHistory } from "~/lib/history";
import { renderRoute } from "~/test/render-route";

import Home from "./home";

describe(Home, () => {
  it("shows saved results and lets the visitor clear them", async () => {
    addHistory({
      code: "saved-code",
      completedAt: "2026-10-11T10:00:00.000Z",
      slug: "big-five-ipip-50",
      title: "My saved Big Five result",
    });
    renderRoute(<Home />);

    expect(
      screen.getByRole("link", { name: /My saved Big Five result/u })
    ).toHaveAttribute("href", "/tests/big-five-ipip-50/result#r=saved-code");
    expect(
      screen.getByText(
        "This history is saved in this browser. Completed scores are also saved in Cloudflare D1 for up to 90 days, without a login. Clearing this history does not delete stored scores."
      )
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(
      screen.queryByRole("heading", { name: "Your results" })
    ).not.toBeInTheDocument();
    expect(readHistory()).toStrictEqual([]);
    expect(
      screen.getByRole("link", { name: "See the tests" })
    ).toBeInTheDocument();
  });
});
