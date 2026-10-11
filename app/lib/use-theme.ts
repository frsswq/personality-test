import { useSyncExternalStore } from "react";

import type { Theme } from "~/lib/theme";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeToTheme,
} from "~/lib/theme";

export interface ThemeValue {
  setTheme: (theme: Theme) => void;
  /** `null` until the stored choice has been read on the client. */
  theme: Theme | null;
}

/**
 * Reads the stored theme through an external store, so hydration uses the
 * server snapshot and the stored choice arrives without a mismatch.
 */
export const useTheme = (): ThemeValue => ({
  setTheme,
  theme: useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  ),
});
