import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * Boots `npm run dev` on port 3000 and tests against http://localhost:3000.
 * On CI the web server is still started (so the e2e job is self-contained);
 * locally we reuse an existing server so you can `npm run dev` in a split
 * pane and iterate fast.
 *
 * Projects cover desktop + mobile Chromium to catch viewport-specific bugs
 * (the funnel is mobile-first, mostly authored at 375×812).
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.e2e\.(ts|tsx)$/,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
