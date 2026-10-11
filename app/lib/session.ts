import { z } from "zod";

import { likertValueSchema } from "~/lib/instruments/schema";

export const SESSION_VERSION = 1;

export const sessionKey = (slug: string) => `personality-test:session:${slug}`;

const storedSessionSchema = z
  .object({
    answers: z.record(z.string().min(1), likertValueSchema),
    page: z.number().int().min(0),
    updatedAt: z.string(),
    version: z.literal(SESSION_VERSION),
  })
  .strict();

export type StoredSession = z.infer<typeof storedSessionSchema>;

export const emptySession = (): StoredSession => ({
  answers: {},
  page: 0,
  updatedAt: "",
  version: SESSION_VERSION,
});

/**
 * Reads a saved session. Anything unexpected in storage is treated as no
 * session at all, so a corrupt value can never break the test.
 */
export const readSession = (slug: string): StoredSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(sessionKey(slug));

    if (!raw) {
      return null;
    }

    const parsed = storedSessionSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const writeSession = (slug: string, session: StoredSession) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      sessionKey(slug),
      JSON.stringify({ ...session, updatedAt: new Date().toISOString() })
    );
  } catch {
    // A blocked storage API costs resume, not the test itself.
  }
};

export const clearSession = (slug: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(sessionKey(slug));
  } catch {
    // Nothing to do.
  }
};
