import { test, expect } from '@playwright/test';

test('search, filters, mission, persistent favorite, streams, language and theme', async ({ page, context, isMobile }) => {
  // No video provider, analytics or other remote resource is needed for this test.
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('combobox').filter({ has: page.locator('option[value="en-GB"]') }).selectOption('en-GB');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('Test Starlink');
  await page.locator('summary').filter({ hasText: 'More filters' }).click();
  await page.locator('select[name="agency"]').selectOption('SpaceX');
  await page.locator('select[name="vehicle"]').selectOption('Falcon 9');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const rows = page.locator('.launch-list article');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Falcon 9 | Test Starlink');
  await expect(page).toHaveURL(/agency=SpaceX/);
  await rows.getByRole('button', { name: 'Save favorite: Falcon 9 | Test Starlink', exact: true }).click();
  await page.reload();
  await expect(rows.getByRole('button', { name: 'Remove from favorites: Falcon 9 | Test Starlink', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: '☆ My favorites', exact: true }).click();
  await expect(page).toHaveURL(/favorites=1/);
  await expect(rows).toHaveCount(1);
  // Desktop selects an in-page panel; mobile opens the full detail directly.
  await rows.locator('.launch-card-link').click();
  if (!isMobile) {
    await page.locator('#selected-mission').getByRole('link', { name: /View full details/ }).click();
  }
  await expect(page).toHaveURL(/\/launches\/e2e-falcon$/);
  await expect(page.getByRole('heading', { name: 'Test Starlink', exact: true, level: 1 })).toBeVisible();
  const sources = page.getByRole('region', { name: 'Explore sources' });
  await expect(sources.getByRole('link', { name: /Example agency website/ })).toHaveAttribute('href', 'https://example.com/agency');
  await expect(sources.getByRole('link', { name: /Example rocket website/ })).toHaveAttribute('target', '_blank');
  await expect(sources).toContainText('No link supplied by the source');
  const disclosure = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: 'Watch here' }) });
  const stream = disclosure.getByRole('link', { name: /Fixture broadcast/ });
  await expect(stream).toBeHidden();
  await disclosure.locator('summary').click();
  await expect(stream).toBeVisible();
  await expect(stream).toHaveAttribute('href', 'https://example.com/stream');
  await disclosure.locator('summary').press('Enter');
  await expect(stream).toBeHidden();
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('es-ES');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');
  await page.getByRole('button', { name: 'Cambiar al tema oscuro', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Quitar de favoritos: Falcon 9 | Test Starlink', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guardar favorito: Falcon 9 | Test Starlink', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.screenshot({ path: test.info().outputPath('journey-complete.png') });
});
