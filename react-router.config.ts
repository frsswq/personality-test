import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import type { Config } from "@react-router/dev/config";

const instrumentsDir = path.join(process.cwd(), "app/content/instruments");

/** Read at build time, so a new data file joins prerendering with no edit here. */
const instrumentSlugs = () =>
  readdirSync(instrumentsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw: unknown = JSON.parse(
        readFileSync(path.join(instrumentsDir, file), "utf-8")
      );

      return typeof raw === "object" && raw !== null && "slug" in raw
        ? String((raw as { slug: unknown }).slug)
        : "";
    })
    .filter((slug) => slug.length > 0)
    .toSorted();

export default {
  /**
   * Serves static HTML for the pages that never read the browser, so search
   * engines and link previews see real content.
   *
   * The home page is deliberately absent. Cloudflare serves `index.html` for
   * every path without a matching file, so `index.html` must stay a content-free
   * shell. The runner and the result also stay client-only, because they read
   * answers from local storage.
   */
  prerender: () => {
    const slugs = instrumentSlugs();

    return [
      "/methodology",
      "/licenses",
      "/privacy",
      ...slugs.map((slug) => `/tests/${slug}`),
      ...slugs.map((slug) => `/tests/${slug}/methodology`),
    ];
  },
  // The app is client-rendered. See docs/PLAN.md section 5.
  ssr: false,
} satisfies Config;
