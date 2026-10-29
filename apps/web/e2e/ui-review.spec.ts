import {openLaunchFilters} from './launch-filter-helpers';
import { expect, test } from '@playwright/test';

test('status filter keeps provisional dates explicit and composes with favorites', async ({page}) => {
  await page.goto('/?period=upcoming');
  const info = page.locator('.calendar-panel .data-info');
  await expect(info.locator('.info-trigger')).toHaveAttribute('aria-expanded','false');
  await expect(info.locator('time')).toBeHidden();
  await info.locator('.info-trigger').focus();
  await expect(info.locator('time')).toBeVisible();
  await info.locator('.info-trigger').press('Escape');
  await openLaunchFilters(page);
  await page.locator('select[name="status"]').selectOption('tbc');
  await page.getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(page).toHaveURL(/status=tbc/);
  await expect(page.locator('.launch-list .launch-card')).toHaveCount(1);
  await expect(page.locator('.launch-list [role="timer"]')).toBeVisible();
  await expect(page.locator('.launch-list [role="timer"] strong')).toHaveCount(4);
  await expect(page.locator('.launch-list .countdown-warning')).toHaveCount(0);
  await page.locator('.favorite-views a').filter({hasText:'My favorites'}).click();
  await expect(page).toHaveURL(/status=tbc/);
  await expect(page).toHaveURL(/favorites=1/);
  await page.locator('.favorite-views a').filter({hasText:/^All$/}).click();
  await expect(page.locator('.launch-list [role="timer"]')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('provisional-date-filter.png'),fullPage:true});
});

test('calendar view switches preserve document scroll', async ({page, isMobile}) => {
  test.skip(isMobile, 'Desktop regression at a fixed document offset');
  await page.setViewportSize({width:1280, height:1000});
  await page.goto('/?period=upcoming');
  const main=page.locator('main:visible');
  await expect(main).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(() => window.scrollTo({top:120, behavior:'instant'}));
  // Focus may legitimately reveal a control beneath the sticky header before navigation.
  await main.locator('.favorite-views a').filter({hasText:'My favorites'}).focus();
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(0);
  await main.locator('.favorite-views a').filter({hasText:'My favorites'}).click();
  await expect(page).toHaveURL(/favorites=1/);
  await expect(main.locator('.launch-list')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeGreaterThanOrEqual(y);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await main.locator('.favorite-views a').filter({hasText:/^All$/}).click();
  await expect(page).not.toHaveURL(/favorites=1/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await main.locator('.period-tabs a').filter({hasText:'History'}).click();
  await expect(page).toHaveURL(/period=past/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await main.locator('.period-tabs a').filter({hasText:'Upcoming launches'}).click();
  await expect(page).toHaveURL(/period=upcoming/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  await main.locator('select[name="agency"]').selectOption('SpaceX');
  const apply=page.getByRole('button',{name:'Apply filters',exact:true});
  await apply.scrollIntoViewIfNeeded();
  const agencyY=await page.evaluate(()=>window.scrollY);
  await apply.click();
  await expect(page).toHaveURL(/agency=SpaceX/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(agencyY);
  await main.locator('.clear-filters').scrollIntoViewIfNeeded();
  const resetY=await page.evaluate(()=>window.scrollY);
  await main.locator('.clear-filters').click();
  await expect(page).not.toHaveURL(/agency=SpaceX/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(resetY);
  await page.screenshot({path:test.info().outputPath('calendar-scroll-preserved.png')});
});

test('desktop list scroll chains to the page only at its boundaries', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile keeps normal document scrolling');
  await page.setViewportSize({width: 900, height: 900});
  await page.goto('/?q=scroll-fixture');
  const main = page.locator('main:visible');
  await expect(main).toHaveCount(1);
  const calendar = main.locator('.launch-results-scroll:visible');
  await expect(calendar).toHaveCount(1);
  await calendar.scrollIntoViewIfNeeded();
  await calendar.hover();
  const documentY = await page.evaluate(() => window.scrollY);
  const filterY = (await main.locator('.launch-filter-panel .filters').boundingBox())!.y;
  await expect(main.locator('.launch-scroll-rail')).toHaveCount(0);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => calendar.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(documentY);
  expect((await main.locator('.launch-filter-panel .filters').boundingBox())!.y).toBe(filterY);
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
  await expect(page.locator('.launch-list [role="timer"]')).toHaveCount(3);
  for (const timer of await page.locator('.launch-list [role="timer"]').all()) {
    await expect(timer.locator('strong')).toHaveCount(4);
    await expect(timer).not.toContainText('≈');
  }
  await expect(page.locator('.launch-row-actions .countdown-group').first()).toHaveCSS('background-color','rgb(234, 242, 255)');
  if ((page.viewportSize()?.width ?? 1000) <= 600) {
    await expect(page.locator('.launch-date').first()).toHaveCSS('font-size', '14px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const filters = page.locator('.launch-filter-panel');
  await openLaunchFilters(page);
  await expect(filters.locator('select[name="vehicle"]')).toBeVisible();
  await filters.locator('summary').click();
  await expect(filters).not.toHaveAttribute('open');
  await filters.locator('summary').press('Enter');
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
