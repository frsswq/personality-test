import type { ScaleKind } from "../app/lib/instruments/scoring-key";

/**
 * Storage for one completed result.
 *
 * A row holds derived scores only. It holds no answer, name, email address,
 * account, cookie value, or IP address. See docs/D1-RESULTS.md section 5.
 */
export interface StoredResult {
  contentHash: string;
  /** A UTC day, `YYYY-MM-DD`. No clock time, so rows cannot be ordered to the second. */
  createdDay: string;
  /** Unix seconds. */
  expiresAt: number;
  id: string;
  instrumentId: string;
  scaleKind: ScaleKind;
  scores: Record<string, number>;
}

export interface ResultStore {
  find: (id: string) => Promise<StoredResult | null>;
  insert: (result: StoredResult) => Promise<void>;
  /** Proves the store answers a query. */
  ping: () => Promise<boolean>;
  /** Deletes up to `limit` expired rows and returns how many it removed. */
  prune: (before: number, limit: number) => Promise<number>;
  remove: (id: string) => Promise<void>;
}

interface ResultRow {
  content_hash: string;
  created_day: string;
  expires_at: number;
  id: string;
  instrument_id: string;
  scale_kind: string;
  scores: string;
}

/** Returns `null` for a row whose score text is not a table of whole numbers. */
const numericScores = (value: unknown): Record<string, number> | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const scores: Record<string, number> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      return null;
    }

    scores[key] = entry;
  }

  return scores;
};

const fromRow = (row: ResultRow): StoredResult | null => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(row.scores);
  } catch {
    return null;
  }

  const scores = numericScores(parsed);

  if (!scores) {
    return null;
  }

  return {
    contentHash: row.content_hash,
    createdDay: row.created_day,
    expiresAt: row.expires_at,
    id: row.id,
    instrumentId: row.instrument_id,
    // The table constrains this column to domain or facet.
    scaleKind: row.scale_kind === "domain" ? "domain" : "facet",
    scores,
  };
};

export const d1Store = (db: D1Database): ResultStore => ({
  find: async (id) => {
    const row = await db
      .prepare("SELECT * FROM results WHERE id = ?1")
      .bind(id)
      .first<ResultRow>();

    return row ? fromRow(row) : null;
  },
  insert: async (result) => {
    // `OR IGNORE` keeps the call idempotent, so a retry never duplicates a row
    // and an existing row is never overwritten.
    await db
      .prepare(
        "INSERT OR IGNORE INTO results (id, instrument_id, content_hash, scale_kind, scores, created_day, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
      )
      .bind(
        result.id,
        result.instrumentId,
        result.contentHash,
        result.scaleKind,
        JSON.stringify(result.scores),
        result.createdDay,
        result.expiresAt
      )
      .run();
  },
  ping: async () => {
    try {
      await db.prepare("SELECT 1").first();

      return true;
    } catch {
      return false;
    }
  },
  prune: async (before, limit) => {
    // A bounded batch keeps one sweep inside the D1 write limit.
    const result = await db
      .prepare(
        "DELETE FROM results WHERE id IN (SELECT id FROM results WHERE expires_at <= ?1 ORDER BY expires_at LIMIT ?2)"
      )
      .bind(before, limit)
      .run();

    return result.meta.changes ?? 0;
  },
  remove: async (id) => {
    await db.prepare("DELETE FROM results WHERE id = ?1").bind(id).run();
  },
});
