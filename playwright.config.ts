import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: true,
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bunx vite preview --outDir build/client --host 127.0.0.1 --port 4173 --strictPort",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:4173",
  },
});
