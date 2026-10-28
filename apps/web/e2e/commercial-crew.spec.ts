import {test,expect} from '@playwright/test';
test('Commercial Crew guide links from the programme card and keeps mission content accessible',async({page,context,isMobile})=>{
 await context.addCookies([{name:'launchskyline_locale',value:'en-GB',domain:'127.0.0.1',path:'/'}]);
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('/explore-space/programs');
 const link=page.getByRole('link',{name:'Commercial Crew ↗',exact:true});
 if(isMobile) await link.tap(); else await link.click();
 await expect(page).toHaveURL(/\/explore-space\/programs\/commercial-crew$/);
 await expect(page.getByRole('heading',{name:'Commercial Crew Program',exact:true})).toBeVisible();
 await expect(page.locator('.crew-comparison article')).toHaveCount(2);
 for(const image of await page.locator('.crew-comparison img').all()) await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('#journey li')).toHaveCount(5);
 await expect(page.locator('svg[aria-labelledby="crew-diagram-title crew-diagram-description"]')).toBeVisible();
 await expect(page.locator('#milestones article')).toHaveCount(4);
 await expect(page.getByText('No associated launches are available in the current data.')).toBeVisible();
 for(const theme of ['light','dark']) {
  const button=page.locator('.theme-toggle');
  if((await button.getAttribute('aria-pressed')==='true')!==(theme==='dark')) await button.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.screenshot({path:test.info().outputPath('commercial-crew.png'),fullPage:true});
 await expect(page.locator('.artemis-continue a[href="/discoveries/artemis"]')).toHaveCount(1);
 await expect(page.locator('.artemis-continue a[href="/explore-space/programs/starship"]')).toHaveCount(1);
});
