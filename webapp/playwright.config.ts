import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4173',
    video: 'on',
  },
  webServer: {
    command: 'npm run preview -- --port=4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
});
