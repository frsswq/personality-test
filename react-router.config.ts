import type { Config } from "@react-router/dev/config";

export default {
  // The app is client-rendered. Content routes get static HTML through
  // `prerender` in a later phase. See docs/PLAN.md section 5.
  ssr: false,
} satisfies Config;
