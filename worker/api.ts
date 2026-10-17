import { MAX_BODY_BYTES, createResultSchema } from "./request";
import { findKeyInstrument, validateScores } from "./scoring-key";
/**
 * The Worker API for stored results.
 *
 * `handleApi` is a pure function over the `ResultStore` interface, so a test can
 * cover every rule without a live D1 database. See docs/D1-RESULTS.md section 9.
 */
import type { ResultStore } from "./store";

/** A stored result lives for 90 days. See docs/D1-RESULTS.md section 11. */
export const RESULT_TTL_DAYS = 90;
export const PRUNE_BATCH = 1000;
export const PRUNE_BATCHES = 5;

const SECONDS_PER_DAY = 86_400;
const JSON_HEADERS = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow",
};
const RESULT_PATH = /^\/results\/(?<id>[0-9a-f]{32})$/u;

export interface ApiDeps {
  /** Unix milliseconds. */
  now: () => number;
  store: ResultStore;
}

const json = (body: unknown, status: number): Response =>
  Response.json(body, { headers: JSON_HEADERS, status });

const failure = (message: string, status: number): Response =>
  json({ error: message }, status);

/** `new URL` throws on a malformed address, so the parse is guarded. */
const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

type BodyResult =
  | { message: string; ok: false; status: number }
  | { ok: true; value: unknown };

const readBody = async (request: Request): Promise<BodyResult> => {
  const declared = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { message: "The body is too large.", ok: false, status: 413 };
  }

  try {
    const reader = request.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    if (reader) {
      while (true) {
        // Read sequentially and stop at the byte cap before buffering the body.
        // oxlint-disable-next-line no-await-in-loop
        const chunk = await reader.read();
        if (chunk.done) {
          break;
        }
        size += chunk.value.byteLength;
        if (size > MAX_BODY_BYTES) {
          void reader.cancel();
          return { message: "The body is too large.", ok: false, status: 413 };
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
    }
    text += decoder.decode();
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { message: "The body is not JSON.", ok: false, status: 400 };
  }
};

/**
 * A browser sends an `Origin` header on a cross-site request, so a difference
 * here means the request did not come from this site.
 */
const fromThisSite = (request: Request, origin: string): boolean => {
  const sent = request.headers.get("origin");

  return sent === null || sent === origin;
};

const createResult = async (
  request: Request,
  origin: string,
  deps: ApiDeps
): Promise<Response> => {
  if (!fromThisSite(request, origin)) {
    return failure("This request came from another site.", 403);
  }
  if (
    request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !==
    "application/json"
  ) {
    return failure("The request needs a JSON content type.", 415);
  }

  const body = await readBody(request);

  if (!body.ok) {
    return failure(body.message, body.status);
  }

  const parsed = createResultSchema.safeParse(body.value);

  if (!parsed.success) {
    return failure("The request is not a valid result.", 400);
  }

  const instrument = findKeyInstrument(parsed.data.instrumentId);

  if (!instrument) {
    return failure("This test is not known.", 404);
  }
  if (parsed.data.contentHash !== instrument.contentHash) {
    return failure("This test was updated. Reload before saving.", 409);
  }

  const problem = validateScores(
    instrument,
    parsed.data.scaleKind,
    parsed.data.scores
  );

  if (problem) {
    return failure(problem, 400);
  }

  const expiresAt =
    (Math.floor(deps.now() / (1000 * SECONDS_PER_DAY)) + RESULT_TTL_DAYS) *
    SECONDS_PER_DAY;

  await deps.store.insert({
    contentHash: instrument.contentHash,
    createdDay: new Date(deps.now()).toISOString().slice(0, 10),
    expiresAt,
    id: parsed.data.id,
    instrumentId: parsed.data.instrumentId,
    scaleKind: parsed.data.scaleKind,
    scores: parsed.data.scores,
  });

  const saved = await deps.store.find(parsed.data.id);
  if (
    !saved ||
    saved.instrumentId !== parsed.data.instrumentId ||
    saved.contentHash !== instrument.contentHash ||
    Object.keys(saved.scores).length !==
      Object.keys(parsed.data.scores).length ||
    Object.entries(saved.scores).some(
      ([key, value]) => parsed.data.scores[key] !== value
    )
  ) {
    return failure("This result code is already in use.", 409);
  }
  return json(
    {
      expiresAt: new Date(saved.expiresAt * 1000).toISOString(),
      id: parsed.data.id,
    },
    201
  );
};

const readResult = async (id: string, deps: ApiDeps): Promise<Response> => {
  const result = await deps.store.find(id);

  if (!result || result.expiresAt <= Math.floor(deps.now() / 1000)) {
    return failure("This stored result has expired or was deleted.", 404);
  }

  return json(
    {
      contentHash: result.contentHash,
      expiresAt: new Date(result.expiresAt * 1000).toISOString(),
      instrumentId: result.instrumentId,
      scaleKind: result.scaleKind,
      scores: result.scores,
    },
    200
  );
};

const deleteResult = async (id: string, deps: ApiDeps): Promise<Response> => {
  await deps.store.remove(id);

  return new Response(null, {
    headers: JSON_HEADERS,
    status: 204,
  });
};

/**
 * Deletes one batch, then the next while a full batch keeps coming back. The
 * batches must run one after another, and the count stays bounded.
 */
const pruneBatch = async (
  deps: ApiDeps,
  nowSeconds: number,
  remaining: number
): Promise<number> => {
  if (remaining <= 0) {
    return 0;
  }

  const count = await deps.store.prune(nowSeconds, PRUNE_BATCH);

  if (count < PRUNE_BATCH) {
    return count;
  }

  return count + (await pruneBatch(deps, nowSeconds, remaining - 1));
};

export const pruneResults = (deps: ApiDeps): Promise<number> =>
  pruneBatch(deps, Math.floor(deps.now() / 1000), PRUNE_BATCHES);

export const handleApi = async (
  request: Request,
  deps: ApiDeps
): Promise<Response | null> => {
  const url = parseUrl(request.url);

  if (!url) {
    return failure("Bad request.", 400);
  }
  // Any other path belongs to the static assets, so the caller serves them.
  if (!url.pathname.startsWith("/api/")) {
    return null;
  }

  const path = url.pathname.replace(/^\/api/u, "") || "/";

  if (path === "/health" && request.method === "GET") {
    const reachable = await deps.store.ping();

    return json({ ok: reachable }, reachable ? 200 : 503);
  }

  if (path === "/results" && request.method === "POST") {
    return createResult(request, url.origin, deps);
  }

  const id = RESULT_PATH.exec(path)?.groups?.id;

  if (id) {
    if (request.method === "GET") {
      return readResult(id, deps);
    }
    if (request.method === "DELETE") {
      if (
        !fromThisSite(request, url.origin) ||
        request.headers.get("sec-fetch-site") === "cross-site"
      ) {
        return failure("This request came from another site.", 403);
      }
      return deleteResult(id, deps);
    }
  }

  return failure("Not found.", 404);
};
