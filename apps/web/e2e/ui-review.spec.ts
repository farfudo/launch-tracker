import { expect, test } from '@playwright/test';

test('desktop launch panel scroll does not move the document', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile keeps normal document scrolling');
  await page.setViewportSize({width: 900, height: 900});
  await page.goto('/?q=scroll-fixture');
  const calendar = page.locator('.launch-results-scroll');
  await calendar.scrollIntoViewIfNeeded();
  await calendar.hover();
  const documentY = await page.evaluate(() => window.scrollY);
  const filterY = (await page.locator('.calendar-panel .filters').boundingBox())!.y;
  await expect(page.locator('.launch-scroll-rail')).toHaveCount(0);
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => calendar.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(documentY);
  expect((await page.locator('.calendar-panel .filters').boundingBox())!.y).toBe(filterY);
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(documentY);
  await page.screenshot({path:test.info().outputPath('independent-scroll.png')});
});

test('development label and informative detail without empty stream actions', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/launches/e2e-electron');
  await expect(page.locator('.development-badge')).toHaveText('● In development');
  await expect(page.locator('h1')).toHaveText('Electron | Test mission');
  await expect(page.locator('.stream-button')).toBeDisabled();
  await expect(page.locator('.stream-button')).toContainText('Watch here');
  await expect(page.locator('.stream-unavailable')).toBeVisible();
  await expect(page.locator('.mission-source-card')).toHaveCount(0);
  await expect(page.locator('.mission-target')).toContainText('Your time');
  await expect(page.locator('.mission-target')).toBeVisible();
  if ((page.viewportSize()?.width ?? 1000) <= 600) {
    await expect(page.locator('.mission-panel .launch-meta').first()).toHaveCSS('font-size', '16px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const share = page.locator('.mission-share');
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeHidden();
  await share.locator('summary').click();
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeVisible();
  await share.getByRole('button', {name:'Copy link',exact:true}).press('Escape');
  await expect(share.getByRole('button', {name:'Copy link',exact:true})).toBeHidden();
  await page.screenshot({path:test.info().outputPath('ui-review-detail.png'),fullPage:true});
  await page.goto('/?q=Test');
  await expect(page.locator('.launch-list .countdown-compact')).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 1000) <= 600) {
    await expect(page.locator('.launch-date').first()).toHaveCSS('font-size', '14px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
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
  await expect(page.locator('.mission-hero .stream-button')).toBeInViewport({ratio:1});
  await expect(page.locator('.stream-button')).toHaveCount(1);
  await page.screenshot({path:test.info().outputPath('detail-first-screen.png')});
  await expect(page.locator('.mission-countdown [role="timer"]')).toBeVisible();
  await expect(page.locator('.mission-countdown .countdown > div')).toHaveCount(4);
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
