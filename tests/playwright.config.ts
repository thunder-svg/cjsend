// tests/playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  webServer: { command: "pnpm -r dev", port: 5173, timeout: 120000, reuseExistingServer: !process.env.CI },
  use: { headless: true },
});
