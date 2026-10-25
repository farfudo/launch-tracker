import { test, expect } from '@playwright/test';

test('upcoming and history are separate and preserve search on switching', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-toolbar .section-navigation')).toHaveCount(1);
  await expect(page.locator('.site-toolbar .section-navigation a')).toHaveCount(2);
  await expect(page.locator('.language-short')).toHaveText('EN⌄');
  await expect(page.getByRole('link', { name: 'farfudo ↗', exact: true })).toHaveAttribute('href', 'https://github.com/farfudo');
  await expect(page.getByRole('link', { name: 'Source code ↗', exact: true })).toHaveAttribute('href', 'https://github.com/farfudo/launch-tracker');
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
