import { expect, test } from '@playwright/test';

test('development label and informative detail without empty stream actions', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/launches/e2e-electron');
  await expect(page.locator('.development-badge')).toHaveText('● In development');
  await expect(page.locator('h1')).toHaveText('Electron | Test mission');
  await expect(page.locator('.stream-button')).toHaveCount(0);
  await expect(page.locator('.stream-unavailable')).toBeVisible();
  await expect(page.locator('.mission-source-card')).toHaveCount(0);
  await expect(page.locator('.mission-target')).toContainText('Your time');
  await expect(page.locator('.mission-target')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('ui-review-detail.png'),fullPage:true});
  await page.goto('/');
  await expect(page.locator('.development-badge')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('ui-review-home.png'),fullPage:true});
});
