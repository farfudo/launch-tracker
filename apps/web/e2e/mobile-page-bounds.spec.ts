import { expect, test } from '@playwright/test';

test('page canvas matches the theme and does not scroll sideways on narrow screens', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', '/discoveries', '/discoveries/artemis', '/launches/e2e-falcon']) {
      await page.goto(path);
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor === getComputedStyle(document.body).backgroundColor)).toBe(true);
        await expect(page.locator('html')).toHaveCSS('overscroll-behavior-x', 'none');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await page.evaluate(() => window.scrollTo({ left: 200, behavior: 'instant' }));
        expect(await page.evaluate(() => window.scrollX)).toBe(0);
      }
    }
  }
});
