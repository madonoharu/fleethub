import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.E2E_BASE_URL;
const development = process.env.E2E_MODE === "dev";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : 2,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results/e2e",
  use: {
    baseURL: externalBaseURL ?? "http://localhost:3000",
    locale: "ja-JP",
    viewport: { width: 1440, height: 1080 },
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1080 },
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: development ? "bun run dev" : "bun run start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
