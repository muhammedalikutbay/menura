import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// E2E runs a production build against a throwaway PGlite database.
const env = {
  DATABASE_URL: ".data/e2e-pglite",
  APP_URL: `http://localhost:${PORT}`,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "e2e-only-secret-that-is-long-enough-1234567890",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: env.APP_URL,
    trace: "retain-on-failure",
    locale: "tr-TR",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node -e "require('fs').rmSync('.data/e2e-pglite',{recursive:true,force:true})" && npm run db:seed && npm run build && npx next start -p ${PORT}`,
    url: `${env.APP_URL}/m/demo`,
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    env,
  },
});
