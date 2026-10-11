import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The site ships one theme. These checks fail if a dark palette, or the
 * operating-system media query, comes back without a deliberate decision.
 * See docs/DESIGN.md.
 */
const readSourceFiles = (files: string[]) =>
  files.map((file) => [file, readFileSync(file, "utf-8")] as const);

const css = readFileSync("app/app.css", "utf-8");

describe("light mode only", () => {
  it("declares no dark palette", () => {
    expect(css).not.toMatch(/^\.dark\s*\{/mu);
  });

  it("does not follow the operating system preference", () => {
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("keeps the dark variant class based, so dark utilities stay inert", () => {
    expect(css).toContain("@custom-variant dark (&:is(.dark *));");
  });
});

describe("application code", () => {
  const sources = readSourceFiles([
    "app/root.tsx",
    "app/components/site-header.tsx",
    "app/routes/home.tsx",
  ]);

  it("carries no theme toggle or stored theme", () => {
    const offenders = sources.filter(([, source]) =>
      /ThemeToggle|theme-toggle|THEME_STORAGE_KEY|applyTheme/u.test(source)
    );

    expect(offenders).toStrictEqual([]);
  });
});
