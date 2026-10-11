import { z } from "zod";

export const HISTORY_KEY = "personality-test:history";
const HISTORY_LIMIT = 20;
const EMPTY: HistoryEntry[] = [];

const isBrowser = typeof window !== "undefined";
const listeners = new Set<() => void>();

const historyEntrySchema = z
  .object({
    code: z.string().min(1),
    completedAt: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
  })
  .strict();

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

/**
 * Reads the local result history. A corrupt entry is dropped rather than
 * breaking the page.
 */
export const readHistory = (): HistoryEntry[] => {
  if (!isBrowser) {
    return EMPTY;
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);

    if (!raw) {
      return EMPTY;
    }

    const parsed = z.array(historyEntrySchema).safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY;
  }
};

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const writeHistory = (entries: HistoryEntry[]) => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // A blocked storage API costs the history, not the result.
  }

  emit();
};

let cachedRaw: string | null = null;
let cachedEntries: HistoryEntry[] = EMPTY;

/**
 * Store snapshot for `useSyncExternalStore`. The reference only changes when
 * the stored text changes, which is what React compares.
 */
export const getHistorySnapshot = (): HistoryEntry[] => {
  if (!isBrowser) {
    return EMPTY;
  }

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(HISTORY_KEY);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = readHistory();
  }

  return cachedEntries;
};

export const getHistoryServerSnapshot = (): HistoryEntry[] => EMPTY;

export const subscribeToHistory = (listener: () => void) => {
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

/**
 * Adds one result. The same code never appears twice, so revisiting a result
 * does not duplicate it.
 */
export const addHistory = (entry: HistoryEntry): HistoryEntry[] => {
  const entries = readHistory().filter((item) => item.code !== entry.code);
  const next = [entry, ...entries].slice(0, HISTORY_LIMIT);

  writeHistory(next);

  return next;
};

export const clearHistory = () => {
  writeHistory([]);
};
