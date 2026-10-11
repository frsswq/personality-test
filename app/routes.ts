import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("tests/:slug", "routes/instrument.tsx"),
  route("tests/:slug/methodology", "routes/instrument-methodology.tsx"),
  route("tests/:slug/start", "routes/runner.tsx"),
  route("tests/:slug/result", "routes/result.tsx"),
  route("methodology", "routes/methodology.tsx"),
  route("licenses", "routes/licenses.tsx"),
  route("privacy", "routes/privacy.tsx"),
] satisfies RouteConfig;
