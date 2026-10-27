import { test, expect } from '@playwright/test';

test('main navigation exposes Launches and Explore Space while old content routes stay available', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-toolbar .section-navigation')).toHaveCount(1);
  const navigation = page.locator('.site-toolbar .section-navigation');
  await expect(navigation.getByRole('link')).toHaveText(['Launches', 'Explore Space']);
  for (const [name, href] of [['Launches', '/'], ['Explore Space', '/explore-space']]) {
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }
  await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute('href', '/');
  await expect(page.locator('.language-short')).toHaveText('EN⌄');
  await expect(page.getByRole('link', { name: 'farfudo ↗', exact: true })).toHaveAttribute('href', 'https://github.com/farfudo');
  await expect(page.getByRole('link', { name: 'Source code ↗', exact: true })).toHaveAttribute('href', 'https://github.com/farfudo/launch-tracker');
  await navigation.getByRole('link', { name: 'Explore Space', exact: true }).click();
  await expect(page).toHaveURL(/\/explore-space$/);
  await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Explore Space');
  await page.goto('/discoveries');
  await expect(page.getByRole('heading', { name: 'Space discoveries and advances' })).toBeVisible();
  await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Explore Space');
  await page.goto('/discoveries/artemis');
  await expect(page.getByRole('heading', { name: 'Artemis: the pieces of a lunar return' })).toBeVisible();
  await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Explore Space');
});

test('upcoming and history are separate and preserve search on switching', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.dashboard-hero').getByRole('button', { name: /Watch here/ })).toHaveCount(0);
  const calendar = page.locator('#launch-calendar');
  await expect(calendar.getByRole('heading', { name: 'Falcon 9 | Test Starlink', exact: true })).toBeVisible();
  await expect(calendar.getByRole('heading', { name: 'Falcon 9 | Archived test mission', exact: true })).toHaveCount(0);
  await calendar.getByRole('link', { name: 'History', exact: true }).click();
  await expect(calendar.getByRole('heading', { name: 'Falcon 9 | Archived test mission', exact: true })).toBeVisible();
  await expect(calendar.getByRole('heading', { name: 'Falcon 9 | Test Starlink', exact: true })).toHaveCount(0);
  await calendar.getByRole('searchbox').fill('Archived');
  await calendar.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/period=past/);
  await expect(calendar.getByRole('heading', { name: 'Falcon 9 | Archived test mission', exact: true })).toBeVisible();
  await calendar.getByRole('link', { name: 'Upcoming launches', exact: true }).click();
  await expect(page).toHaveURL(/period=upcoming/);
  await expect(calendar.getByRole('searchbox')).toHaveValue('Archived');
  await expect(calendar.getByRole('heading', { name: 'No results', exact: true })).toBeVisible();
});
