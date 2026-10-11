import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const noop = () => null;

/**
 * jsdom implements no `matchMedia`, and the theme module reads it to follow the
 * operating system. The stub reports a light system preference.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    addEventListener: noop,
    addListener: noop,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: noop,
    removeListener: noop,
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark", "light");
});
