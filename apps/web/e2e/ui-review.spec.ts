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
  const share = page.locator('.mission-share');
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeHidden();
  await share.locator('summary').click();
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeVisible();
  await share.getByRole('button', {name:'Copy link',exact:true}).press('Escape');
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeHidden();
  await page.screenshot({path:test.info().outputPath('ui-review-detail.png'),fullPage:true});
  await page.goto('/?q=Test');
  await expect(page.locator('.launch-list .countdown-compact')).toHaveCount(1);
  const filters = page.locator('.advanced-filters');
  await filters.locator('summary').click();
  await expect(filters).toHaveAttribute('open', '');
  await expect(filters.locator('select[name="vehicle"]')).toBeVisible();
  await filters.locator('summary').click();
  await expect(page.locator('.development-badge')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('ui-review-home.png'),fullPage:true});
});

test('calendar and sharing use an explicit expanded state', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/launches/e2e-falcon');
  const calendar = page.locator('details.mission-calendar');
  await expect(calendar).not.toHaveAttribute('open');
  await calendar.locator('summary').press('Enter');
  await expect(calendar).toHaveAttribute('open', '');
  await expect(calendar.getByRole('link', {name:/Google Calendar/})).toBeVisible();
  const share = page.locator('.mission-share');
  await share.locator('summary').click();
  await expect(share).toHaveAttribute('open','');
  await expect(share.getByRole('button',{name:'Copy link',exact:true})).toBeVisible();
  await page.screenshot({path:test.info().outputPath('unified-disclosures.png'),fullPage:true});
});
