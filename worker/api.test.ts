// @vitest-environment node
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { handleApi, pruneResults } from "./api";
import { scoringKey } from "./scoring-key";
import { d1Store } from "./store";

let db: DatabaseSync;
let now = Date.parse("2026-10-11T14:42:00Z");
const id = "a".repeat(32);
const key = scoringKey.instruments["gad-7"];
const body = () => ({
  contentHash: key.contentHash,
  id,
  instrumentId: "gad-7",
  scaleKind: "domain",
  scores: { "anxiety-severity": 0 },
});

// Adapt the D1 transport only. The production SQL and migration use real SQLite.
const store = () =>
  d1Store({
    prepare: (sql: string) => {
      const statement = db.prepare(sql);
      const bind = (...values: (string | number)[]) => ({
        first: () => Promise.resolve(statement.get(...values) ?? null),
        run: () => {
          const result = statement.run(...values);
          return Promise.resolve({
            meta: { changes: Number(result.changes) },
            success: true,
          });
        },
      });
      return { ...bind(), bind };
    },
  } as unknown as D1Database);
const request = async (
  method: string,
  path: string,
  value?: unknown,
  headers: Record<string, string> = {}
) => {
  const response = await handleApi(
    new Request(`https://tests.example/api/${path}`, {
      body: value === undefined ? undefined : JSON.stringify(value),
      headers: { "content-type": "application/json", ...headers },
      method,
    }),
    { now: () => now, store: store() }
  );
  if (!response) {
    throw new Error("The API did not handle its route.");
  }
  return response;
};
beforeEach(() => {
  now = Date.parse("2026-10-11T14:42:00Z");
  db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      new URL("../migrations/0001_results.sql", import.meta.url),
      "utf-8"
    )
  );
});
afterEach(() => {
  db.close();
});

describe("stored result API with SQLite", () => {
  it("writes scores, preserves expiry on retry, reads, and deletes", async () => {
    const created = await request("POST", "results", body());
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({
      expiresAt: "2027-01-09T00:00:00.000Z",
      id,
    });
    now += 86_400_000;
    const retry = await request("POST", "results", body());
    expect(await retry.json()).toEqual({
      expiresAt: "2027-01-09T00:00:00.000Z",
      id,
    });
    const read = await request("GET", `results/${id}`);
    expect(read.headers.get("cache-control")).toBe("no-store");
    expect(await read.json()).toEqual({
      contentHash: key.contentHash,
      expiresAt: "2027-01-09T00:00:00.000Z",
      instrumentId: "gad-7",
      scaleKind: "domain",
      scores: { "anxiety-severity": 0 },
    });
    expect(db.prepare("SELECT * FROM results").all()).toEqual([
      {
        content_hash: key.contentHash,
        created_day: "2026-10-11",
        expires_at: Date.parse("2027-01-09") / 1000,
        id,
        instrument_id: "gad-7",
        scale_kind: "domain",
        scores: '{"anxiety-severity":0}',
      },
    ]);
    expect(await request("DELETE", `results/${id}`)).toHaveProperty(
      "status",
      204
    );
    expect(await request("DELETE", `results/${id}`)).toHaveProperty(
      "status",
      204
    );
    expect(await request("GET", `results/${id}`)).toHaveProperty("status", 404);
  });
  it.each([
    { email: "not-accepted@example.com" },
    { answers: [1, 2, 3] },
    { id: "guess" },
    { scaleKind: "facet" },
    { scores: { "anxiety-severity": 22 } },
    { scores: { "anxiety-severity": 1.5 } },
    { scores: { "anxiety-severity": 2, extra: 1 } },
    { scores: {} },
  ])("rejects invalid and personal fields: %j", async (change) => {
    expect(
      await request("POST", "results", { ...body(), ...change })
    ).toHaveProperty("status", 400);
    expect(db.prepare("SELECT count(*) AS count FROM results").get()).toEqual({
      count: 0,
    });
  });
  it("rejects stale keys, unknown tests, cross-site writes, wrong media, and oversized bodies", async () => {
    expect(
      await request("POST", "results", { ...body(), contentHash: "old" })
    ).toHaveProperty("status", 409);
    expect(
      await request("POST", "results", { ...body(), instrumentId: "__proto__" })
    ).toHaveProperty("status", 404);
    expect(
      await request("POST", "results", body(), {
        origin: "https://elsewhere.example",
      })
    ).toHaveProperty("status", 403);
    expect(
      await request("POST", "results", body(), { "content-type": "text/plain" })
    ).toHaveProperty("status", 415);
    expect(
      await request("POST", "results", { ...body(), padding: "x".repeat(4096) })
    ).toHaveProperty("status", 413);
    expect(db.prepare("SELECT count(*) AS count FROM results").get()).toEqual({
      count: 0,
    });
  });
  it("never overwrites a result code or allows cross-site deletion", async () => {
    await request("POST", "results", body());
    expect(
      await request("POST", "results", {
        ...body(),
        scores: { "anxiety-severity": 21 },
      })
    ).toHaveProperty("status", 409);
    const read = await request("GET", `results/${id}`);
    expect(await read.json()).toMatchObject({
      scores: { "anxiety-severity": 0 },
    });
    expect(
      await request("DELETE", `results/${id}`, undefined, {
        origin: "https://elsewhere.example",
      })
    ).toHaveProperty("status", 403);
    expect(await request("GET", `results/${id}`)).toHaveProperty("status", 200);
  });
  it("counts active results and score distributions through the owner SQL", async () => {
    now = Date.now();
    await request("POST", "results", body());
    await request("POST", "results", {
      ...body(),
      id: "b".repeat(32),
      scores: { "anxiety-severity": 21 },
    });
    await request("POST", "results", {
      ...body(),
      id: "c".repeat(32),
      scores: { "anxiety-severity": 21 },
    });
    db.prepare("UPDATE results SET expires_at = 0 WHERE id = ?").run(
      "c".repeat(32)
    );
    const [counts, histogram] = readFileSync(
      new URL("../docs/sql/result-counts.sql", import.meta.url),
      "utf-8"
    ).split(";");
    expect(db.prepare(counts).all()).toEqual([
      { instrument_id: "gad-7", saved_results: 2 },
    ]);
    expect(db.prepare(histogram).all()).toEqual([
      {
        instrument_id: "gad-7",
        raw_score: 0,
        saved_results: 1,
        scale_id: "anxiety-severity",
        scale_kind: "domain",
      },
      {
        instrument_id: "gad-7",
        raw_score: 21,
        saved_results: 1,
        scale_id: "anxiety-severity",
        scale_kind: "domain",
      },
    ]);
  });

  it("hides expired rows before cleanup and deletes only expired rows", async () => {
    await request("POST", "results", body());
    now = Date.parse("2027-01-09T00:00:00Z");
    expect(await request("GET", `results/${id}`)).toHaveProperty("status", 404);
    await request("POST", "results", { ...body(), id: "b".repeat(32) });
    expect(await pruneResults({ now: () => now, store: store() })).toBe(1);
    expect(db.prepare("SELECT id FROM results").all()).toEqual([
      { id: "b".repeat(32) },
    ]);
    expect(await request("GET", `results/${"b".repeat(32)}`)).toHaveProperty(
      "status",
      200
    );
  });
});
