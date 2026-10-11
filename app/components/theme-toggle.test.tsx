import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY, subscribeToTheme } from "~/lib/theme";

import { ThemeToggle } from "./theme-toggle";

describe(ThemeToggle, () => {
  it("offers the dark theme when nothing is stored", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Use the dark theme" })
    ).toBeInTheDocument();
  });

  it("stores the choice when it is pressed", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Use the light theme" })
    ).toBeInTheDocument();
  });

  it("offers the light theme when dark is stored", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Use the light theme" })
    ).toBeInTheDocument();
  });

  it("tells the store subscribers when the choice changes", () => {
    let calls = 0;
    const unsubscribe = subscribeToTheme(() => {
      calls += 1;
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));

    expect(calls).toBe(1);

    unsubscribe();
  });
});
