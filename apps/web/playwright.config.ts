import { defineConfig, devices } from '@playwright/test';

const fixturePort=process.env.FIXTURE_SPOTLIGHT_PHOTO==='true'?3303:3302;
const fixtureOrigin=`http://127.0.0.1:${fixturePort}`;
export default defineConfig({
  testDir: './e2e',
  testIgnore: 'starship-validation.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3300', trace: 'retain-on-failure', screenshot: 'only-on-failure', timezoneId: 'Europe/Lisbon' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } }
  ],
  webServer: [
    { command: 'node e2e/mock-api.mjs', url: `${fixtureOrigin}/health`, env: { FIXTURE_PORT: String(fixturePort) }, reuseExistingServer: false },
    { command: 'npm run start -- --hostname 127.0.0.1 --port 3300', url: 'http://127.0.0.1:3300', reuseExistingServer: false,
      env: { API_BASE_URL: fixtureOrigin, NEXT_PUBLIC_API_BASE_URL: fixtureOrigin, DESIGN_PREVIEW: 'false' } }
  ]
});
