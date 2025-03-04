// bloglist-e2e/playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests sequentially (not parallel) to avoid DB conflicts */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests one at a time locally */
  workers: 1,
  /* Reporter to use */
  reporter: 'html',
  /* Shared settings for all projects */
  use: {
    /* Base URL for actions like page.goto('/') */
    baseURL: 'http://localhost:5173',
    /* Reduce timeout for faster development */
    timeout: 60000,
    /* Collect trace when retrying failed tests */
    trace: 'on-first-retry',
  },
  /* Configure projects for browsers (use Chromium and Firefox locally, skip Webkit if unsupported) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Comment out Webkit if your OS lacks dependencies (per lecture warning)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});