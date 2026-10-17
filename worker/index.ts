/**
 * The Worker entry.
 *
 * `run_worker_first` sends only `/api/*` here. Every other path falls through to
 * the static assets, so a page request is not billed. See docs/D1-RESULTS.md
 * section 7.
 */
import type { ApiDeps } from "./api";
import { handleApi, pruneResults } from "./api";
import { d1Store } from "./store";

const depsFor = (env: Env): ApiDeps => ({
  now: () => Date.now(),
  store: d1Store(env.DB),
});

/** The API answers `/api/*`. Every other path is a static asset. */
const serve = async (request: Request, env: Env): Promise<Response> => {
  try {
    const response = await handleApi(request, depsFor(env));
    return response ?? env.ASSETS.fetch(request);
  } catch {
    // Do not log the request body, capability code, or database error details.
    return Response.json(
      { error: "Stored results are temporarily unavailable." },
      {
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
        status: 503,
      }
    );
  }
};

export default {
  fetch: serve,
  scheduled: async (
    _controller: ScheduledController,
    env: Env
  ): Promise<void> => {
    await pruneResults(depsFor(env));
  },
} satisfies ExportedHandler<Env>;
