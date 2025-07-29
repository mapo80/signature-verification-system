import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts$/,
  use: {
    baseURL: 'http://localhost:4173',
    video: 'on',
    screenshot: 'on',
    headless: true,
  },
  webServer: {
    command: 'npm run preview -- --port=4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
});
