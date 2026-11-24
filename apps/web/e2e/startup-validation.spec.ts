import { test, expect } from '@playwright/test';

test('page and launches appear while secondary requests are still pending', async ({ page }) => {
  // Entity searches stay uncached, so this also exercises a slow read after initial navigation.
  await page.goto('/?q=Test%20Starlink', { waitUntil: 'commit' });
  const main = page.locator('main#main-content:visible');
  await expect(main.locator('#launch-channels')).toBeVisible({ timeout: 5000 });
  const rows = main.locator('.launch-list:visible');
  await expect(rows).toContainText('Falcon 9 | Test Starlink', { timeout: 7000 });
  await expect(main.locator('.launch-section-loading')).not.toHaveCount(0);
  await expect(main.locator('select[name="agency"]')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`launches-before-secondary-${width}.png`), fullPage: true });
  }
  await expect(main.locator('select[name="agency"]')).toHaveCount(1, { timeout: 15000 });
  await expect(main.locator('.launch-section-loading')).toHaveCount(0);
  await expect(rows).toContainText('Falcon 9 | Test Starlink');
});
