import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  readTheme,
  saveTheme,
} from "./theme";

// Vitest runs from the project root, and the jsdom environment makes
// `import.meta.url` an http URL, so the stylesheet is read by path.
const css = readFileSync("app/app.css", "utf-8");

const blockBody = (pattern: RegExp): string => {
  const body = pattern.exec(css)?.groups?.body;

  if (!body) {
    throw new Error(`Could not find the CSS block for ${pattern.source}`);
  }

  return body;
};

const declarations = (body: string): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const match of body.matchAll(
    /(?<name>--[a-z0-9-]+):\s*(?<value>[^;]+);/gu
  )) {
    const { name, value } = match.groups ?? {};
    if (name && value) {
      result[name] = value.replaceAll(/\s+/gu, " ").trim();
    }
  }

  return result;
};

const explicitDark = declarations(
  blockBody(/^\.dark \{\n(?<body>[\S\s]*?)^\}/mu)
);

const systemDark = declarations(
  blockBody(/:root:not\(\.light\) \{\n(?<body>[\S\s]*?)^ {2}\}/mu)
);

describe("dark theme stylesheet", () => {
  it("declares the same palette for the stored choice and the system choice", () => {
    expect(explicitDark).toStrictEqual(systemDark);
  });

  it("declares a palette at all", () => {
    expect(Object.keys(explicitDark).length).toBeGreaterThan(20);
  });

  it("lets the system preference drive the dark utilities", () => {
    const variant = blockBody(/@custom-variant dark \{(?<body>[\S\s]*?)^\}/mu);

    expect(variant).toContain("prefers-color-scheme: dark");
    expect(variant).toContain(":root:not(.light)");
  });
});

describe(readStoredTheme, () => {
  it("returns the stored choice", () => {
    saveTheme("dark");

    expect(readStoredTheme()).toBe("dark");
  });

  it("returns null when nothing is stored", () => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);

    expect(readStoredTheme()).toBeNull();
  });

  it("ignores an unusable stored value", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "banana");

    expect(readStoredTheme()).toBeNull();
  });
});

describe(readTheme, () => {
  it("falls back to the system preference", () => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);

    expect(readTheme()).toBe("light");
  });
});

describe(applyTheme, () => {
  it("marks an explicit dark choice", () => {
    applyTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBeTruthy();
    expect(document.documentElement.classList.contains("light")).toBeFalsy();
  });

  it("marks an explicit light choice", () => {
    applyTheme("light");

    expect(document.documentElement.classList.contains("light")).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBeFalsy();
  });

  it("returns to the system preference on null", () => {
    applyTheme("dark");
    applyTheme(null);

    expect(document.documentElement.classList.contains("dark")).toBeFalsy();
    expect(document.documentElement.classList.contains("light")).toBeFalsy();
    expect(document.documentElement.dataset.theme).toBe("system");
  });
});

describe(saveTheme, () => {
  it("writes the choice", () => {
    saveTheme("light");

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
