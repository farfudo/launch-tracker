import {test,expect} from '@playwright/test';
import {openLaunchFilters} from './launch-filter-helpers';
import {resolve} from 'node:path';
test('Mission Control preserves list actions, honest activity and one filter search across sizes, themes and locales',async({page,context})=>{
 await context.route('**/*',route=>route.request().url().includes('52507883571-396b3c1c6c-o.jpg')?route.fulfill({path:resolve('public/images/backgrounds/launch-artemis-i.webp'),contentType:'image/webp'}):new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 for(const locale of ['en-GB','pt-PT','es-ES']){
  await context.addCookies([{name:'launchskyline_locale',value:locale,domain:'127.0.0.1',path:'/'}]);
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});await page.goto('/');
   const spotlight=page.locator('.launch-spotlight'),filters=page.locator('.launch-filter-panel');
   await expect(spotlight.locator('h1')).toBeVisible();await expect(spotlight.locator('figcaption')).toBeVisible();await expect(spotlight.locator('[role="timer"] strong')).toHaveCount(4);
   await expect(spotlight.locator('[aria-pressed]')).toHaveCount(0);
   await expect(page.locator('.launch-list .favorite-button')).toHaveCount(3);
   await expect(page.locator('.launch-activity strong')).toHaveText(['3','2']);
   if(await spotlight.locator('figcaption button').count()){await spotlight.locator('figcaption button').click();await expect(spotlight.locator('figcaption [role="dialog"]')).toBeVisible();await spotlight.locator('figcaption button').press('Escape');}
   await expect(page.getByRole('searchbox',{includeHidden:true})).toHaveCount(1);
   await openLaunchFilters(page);await expect(filters.locator('select[name="vehicle"]')).toBeVisible();
   if(width===1440){const left=await spotlight.boundingBox(),right=await page.locator('.calendar-panel').boundingBox();expect(left!.x+left!.width).toBeLessThan(right!.x);expect(left!.width/right!.width).toBeGreaterThan(.4);expect(left!.width/right!.width).toBeLessThan(.55);}
   if(width===390){const spot=await spotlight.boundingBox(),activity=await page.locator('.launch-activity').boundingBox(),list=await page.locator('.calendar-panel').boundingBox();expect(spot!.y+spot!.height).toBeLessThan(activity!.y);expect(activity!.y).toBeLessThan(list!.y);await filters.locator('summary').first().press('Enter');await expect(filters).not.toHaveAttribute('open');}
   for(const theme of ['light','dark']){
    const toggle=page.locator('.theme-toggle');if((await toggle.getAttribute('aria-pressed')==='true')!==(theme==='dark'))await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    await expect(page.locator('body')).toHaveCSS('color',theme==='light'?'rgb(16, 45, 58)':'rgb(237, 248, 247)');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:test.info().outputPath(`mission-control-${locale}-${width}-${theme}.png`),fullPage:false});
   }
  }
 }
});
