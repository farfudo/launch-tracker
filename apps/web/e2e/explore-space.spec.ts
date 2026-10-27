import { expect, test } from '@playwright/test';

test('Explore Space hub links to existing guides and launch data in each locale', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/explore-space');
  const nav = page.locator('.section-navigation');
  await expect(nav.getByRole('link')).toHaveText(['Launches', 'Explore Space']);
  await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', '/explore-space');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Explore Space');
  const cards = page.locator('.explore-space-card');
  await expect(cards).toHaveCount(4);
  await expect(cards).toHaveText([
    /Discoveries & Advances.*Technologies and ideas changing space exploration.*Explore discoveries/,
    /Space Programs.*Explore the Artemis programme.*Explore Artemis/,
    /How Rockets Work.*See how engines.*Explore the technology/,
    /Space Milestones.*Browse scheduled launches.*View the launch calendar/
  ]);
  await expect(cards.nth(0)).toHaveAttribute('href', '/discoveries');
  await expect(cards.nth(1)).toHaveAttribute('href', '/discoveries/artemis');
  await expect(cards.nth(2)).toHaveAttribute('href', '/discoveries#technology-lab');
  await expect(cards.nth(3)).toHaveAttribute('href', '/#launch-calendar');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('explore-space-desktop.png'), fullPage: true });
  await cards.nth(0).click();
  await expect(page).toHaveURL(/\/discoveries$/);
  await expect(page.locator('.discoveries-intro h1')).toHaveText('Space discoveries and advances');
  await page.goto('/explore-space');
  await cards.nth(1).click();
  await expect(page).toHaveURL(/\/discoveries\/artemis$/);
  await expect(page.locator('.guide-role-grid article')).toHaveCount(4);
  await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', '/explore-space');
  await page.goto('/explore-space');
  await cards.nth(2).click();
  await expect(page).toHaveURL(/\/discoveries#technology-lab$/);
  await expect(page.locator('#lab-title')).toBeVisible();
  await page.goto('/explore-space');
  await cards.nth(3).click();
  await expect(page).toHaveURL(/\/#launch-calendar$/);
  await expect(page.locator('#launch-calendar')).toBeVisible();

});

test('Explore Space cards remain usable on narrow mobile screens', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/explore-space');
  await expect(page.locator('.explore-space-card')).toHaveCount(4);
  await expect(page.getByRole('link', { name: /Explore Artemis/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('explore-space-mobile.png'), fullPage: true });
});
