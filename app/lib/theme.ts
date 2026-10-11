export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "personality-test:theme";

const isBrowser = typeof window !== "undefined";

const listeners = new Set<() => void>();

const prefersDark = () =>
  isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches;

/** The stored choice, or `null` when the visitor has never chosen. */
export const readStoredTheme = (): Theme | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {
    // A blocked storage API falls back to the system preference.
  }

  return null;
};

/**
 * The theme in use right now. With no stored choice the operating system
 * decides, and `app/app.css` handles that case without any JavaScript.
 */
export const readTheme = (): Theme =>
  readStoredTheme() ?? (prefersDark() ? "dark" : "light");

/**
 * Applies an explicit choice. A `null` theme removes both classes, so the
 * stylesheet falls back to the system preference.
 */
export const applyTheme = (theme: Theme | null) => {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.dataset.theme = theme ?? "system";
};

export const saveTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A blocked storage API only costs the choice on the next visit.
  }
};

/**
 * Theme store for `useSyncExternalStore`. The server snapshot is `null`, which
 * matches the pre-rendered shell, and the client snapshot is the stored choice.
 */
export const subscribeToTheme = (listener: () => void) => {
  listeners.add(listener);

  if (isBrowser) {
    window.addEventListener("storage", listener);
  }

  return () => {
    listeners.delete(listener);

    if (isBrowser) {
      window.removeEventListener("storage", listener);
    }
  };
};

export const getThemeSnapshot = (): Theme | null => readStoredTheme();

export const getServerThemeSnapshot = (): null => null;

/** Stores a choice and tells every subscriber. */
export const setTheme = (theme: Theme) => {
  saveTheme(theme);

  for (const listener of listeners) {
    listener();
  }
};
