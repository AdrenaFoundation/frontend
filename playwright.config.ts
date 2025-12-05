import { defineConfig, devices } from '@playwright/test';

// Environment detection for different testing scenarios
const isProduction = process.env.TEST_ENV === 'production';
const isCI = !!process.env.CI;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in parallel (reduce for production to avoid overwhelming servers) */
  fullyParallel: !isProduction,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,

  /* Retry configuration - more retries for production testing */
  retries: isProduction ? 3 : (isCI ? 2 : 0),

  /* Worker configuration - reduce parallelism for production */
  workers: isProduction ? 2 : (isCI ? 1 : undefined),

  /* Reporter configuration */
  reporter: isProduction ? [['json', { outputFile: 'test-results.json' }], ['html']] : 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL - configurable for different environments */
    baseURL: process.env.BASE_URL || (isProduction ? 'https://www.adrena.trade' : 'http://localhost:3000'),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isProduction ? 'retain-on-failure' : 'on-first-retry',

    /* Increase timeouts for production testing */
    actionTimeout: isProduction ? 10000 : 5000,
    navigationTimeout: isProduction ? 30000 : 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Web server configuration - only start for local development testing */
  ...(isProduction ? {} : {
    webServer: {
      command: 'NODE_ENV=production npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !isCI,
      env: {
        NODE_ENV: 'production',
      },
    },
  }),
});