import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  // The React Router plugin builds the route graph. Tests import modules
  // directly, so the plugin is skipped in test mode.
  plugins: [tailwindcss(), ...(mode === "test" ? [] : [reactRouter()])],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
  },
}));
