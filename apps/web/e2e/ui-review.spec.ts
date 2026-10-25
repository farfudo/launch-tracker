import { expect, test } from '@playwright/test';

test('status filter keeps provisional dates explicit and composes with favorites', async ({page}) => {
  await page.goto('/?period=upcoming');
  const info = page.locator('.calendar-panel .data-info');
  await expect(info).not.toHaveAttribute('open');
  await expect(info.locator('time')).toBeHidden();
  await info.locator('summary').press('Enter');
  await expect(info.locator('time')).toBeVisible();
  await info.locator('summary').press('Enter');
  await page.locator('select[name="status"]').selectOption('tbc');
  await page.getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(page).toHaveURL(/status=tbc/);
  await expect(page.locator('.launch-list .launch-card')).toHaveCount(1);
  await expect(page.locator('.launch-list .date-uncertain')).toContainText('Provisional date');
  await expect(page.locator('.launch-list [role="timer"]')).toHaveCount(0);
  await page.locator('.favorite-views a').filter({hasText:'My favorites'}).click();
  await expect(page).toHaveURL(/status=tbc/);
  await expect(page).toHaveURL(/favorites=1/);
  await page.locator('.favorite-views a').filter({hasText:/^All$/}).click();
  await expect(page.locator('.launch-list .date-uncertain')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('provisional-date-filter.png'),fullPage:true});
});

test('calendar view switches preserve document scroll', async ({page, isMobile}) => {
  test.skip(isMobile, 'Desktop regression at a fixed document offset');
  await page.setViewportSize({width:1280, height:1000});
  await page.goto('/?period=upcoming');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(() => window.scrollTo({top:120, behavior:'instant'}));
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(0);
  await page.locator('.favorite-views a').filter({hasText:'My favorites'}).click();
  await expect(page).toHaveURL(/favorites=1/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.locator('.favorite-views a').filter({hasText:/^All$/}).click();
  await expect(page).not.toHaveURL(/favorites=1/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.locator('.period-tabs a').filter({hasText:'History'}).click();
  await expect(page).toHaveURL(/period=past/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.locator('.period-tabs a').filter({hasText:'Upcoming launches'}).click();
  await expect(page).toHaveURL(/period=upcoming/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.locator('.agency-chips a').filter({hasText:'SpaceX'}).click();
  await expect(page).toHaveURL(/agency=SpaceX/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.locator('.clear-filters').click();
  await expect(page).not.toHaveURL(/agency=SpaceX/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await page.screenshot({path:test.info().outputPath('calendar-scroll-preserved.png')});
});

test('desktop list scroll chains to the page only at its boundaries', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile keeps normal document scrolling');
  await page.setViewportSize({width: 900, height: 900});
  await page.goto('/?q=scroll-fixture');
  const calendar = page.locator('.launch-results-scroll');
  await calendar.scrollIntoViewIfNeeded();
  await calendar.hover();
  const documentY = await page.evaluate(() => window.scrollY);
  const filterY = (await page.locator('.calendar-panel .filters').boundingBox())!.y;
  await expect(page.locator('.launch-scroll-rail')).toHaveCount(0);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => calendar.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(documentY);
  expect((await page.locator('.calendar-panel .filters').boundingBox())!.y).toBe(filterY);
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => calendar.evaluate(el => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop))).toBeLessThan(2);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(documentY);
  await calendar.evaluate(el => { el.scrollTop = 0; });
  await calendar.scrollIntoViewIfNeeded();
  await calendar.hover();
  const lowerY = await page.evaluate(() => window.scrollY);
  expect(lowerY).toBeGreaterThan(0);
  await page.mouse.wheel(0, -300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(lowerY);
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
  await expect(page.locator('.launch-row-actions .countdown-group').first()).toHaveCSS('background-color','rgb(234, 242, 255)');
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
  await expect(page.locator('.mission-countdown')).toHaveCSS('background-color','rgb(16, 46, 85)');
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
