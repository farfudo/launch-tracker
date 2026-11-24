import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const cwd = resolve(__dirname, '..');
export default defineConfig({
  testDir: '.', testMatch: 'startup-validation.spec.ts', workers: 1, retries: 0,
  reporter: 'list', outputDir: '../output/playwright/startup',
  use: { baseURL: 'http://127.0.0.1:3345', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'responsive', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    { cwd, command: 'node e2e/mock-api.mjs', url: 'http://127.0.0.1:3346/health',
      env: { FIXTURE_PORT: '3346', FIXTURE_LIST_DELAY_MS: '2000', FIXTURE_FILTER_DELAY_MS: '12000', FIXTURE_STATUS_DELAY_MS: '12000' },
      reuseExistingServer: false },
    { cwd, command: 'npm run start -- --hostname 127.0.0.1 --port 3345',
      url: 'http://127.0.0.1:3345/explore-space', reuseExistingServer: false,
      // A one-second preview cache ensures repeated local runs exercise cold reads too.
      env: { API_BASE_URL: 'http://127.0.0.1:3346', DESIGN_PREVIEW: 'true',
        PREVIEW_CACHE_SECONDS: '1', PREVIEW_CACHE_MAX_AGE_SECONDS: '1' } },
  ],
});
