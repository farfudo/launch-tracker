import { test, expect } from '@playwright/test';
import { freshnessCopy } from '../lib/freshness';
for (const locale of ['pt-PT', 'en-GB', 'es-ES'] as const) {
  test(`A05 observation stays old across refresh, ${locale}`, async ({page,context}) => {
    test.skip(process.env.FIXTURE_STATUS_FAILURE === 'true', 'Dedicated failure journey');
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await context.addCookies([{name:'launchskyline_locale',value:locale,url:'http://127.0.0.1:3300'}]);
    const t=freshnessCopy[locale];
    await page.goto('/');
    const main=page.locator('main:visible');
    await expect(main).toHaveCount(1);
    await main.locator('.data-info > summary').click();
    await expect(main.locator('.data-info')).toContainText(t.global);
    await page.screenshot({path:test.info().outputPath(`home-${locale}.png`),fullPage:true});
    await page.goto('/launches/freshness-old');
    const warning=page.locator('main:visible [data-freshness]');
    await expect(warning).toHaveAttribute('data-freshness','stale');
    await expect(warning).toContainText(t.stale);
    await expect(warning).toContainText(t.provider);
    await expect(page.locator('main:visible .mission-fact-grid')).toContainText(t.observed);
    await page.reload();
    await expect(warning).toHaveAttribute('data-freshness','stale');
    await page.screenshot({path:test.info().outputPath(`detail-${locale}.png`),fullPage:true});
    await page.goto('/launches/freshness-history');
    await expect(warning).toHaveAttribute('data-freshness','historical');
    await expect(warning).toContainText(t.historical);
  });
  test(`A05 global failure never certifies freshness, ${locale}`, async ({page,context}) => {
    test.skip(process.env.FIXTURE_STATUS_FAILURE !== 'true', 'Requires isolated failed-status fixture');
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await context.addCookies([{name:'launchskyline_locale',value:locale,url:'http://127.0.0.1:3300'}]);
    await page.goto('/');
    await expect(page.locator('main:visible .calendar-panel .status')).toHaveText(freshnessCopy[locale].unknown);
    await page.screenshot({path:test.info().outputPath(`failure-${locale}.png`),fullPage:true});
  });
}
