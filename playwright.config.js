import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser-tests', outputDir: './test-results/playwright', workers: 1, retries: 0,
  use: { browserName: 'chromium', viewport: { width: 1280, height: 900 }, acceptDownloads: true },
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  projects: [
    { name: 'as-is', testDir: './browser-tests' },
    { name: 'change', testDir: './change-tests' },
  ],
});
