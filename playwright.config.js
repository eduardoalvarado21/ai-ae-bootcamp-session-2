const { defineConfig, devices } = require('@playwright/test');

const BACKEND_PORT = process.env.BACKEND_PORT || 3030;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  // Tests share one in-memory backend, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start --workspace=backend',
      url: `http://localhost:${BACKEND_PORT}`,
      env: { PORT: String(BACKEND_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start --workspace=frontend',
      url: `http://localhost:${FRONTEND_PORT}`,
      env: { PORT: String(FRONTEND_PORT), BROWSER: 'none' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
