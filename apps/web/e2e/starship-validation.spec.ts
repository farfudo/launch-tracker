import {test,expect} from '@playwright/test';
test.beforeEach(async({context})=>{
 await context.addCookies([{name:'launchskyline_locale',value:'en-GB',domain:'127.0.0.1',path:'/'}]);
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test('related launches use matching data and mobile touch opens Artemis',async({page,isMobile})=>{
 await page.goto('/explore-space/programs');
 const guide=page.getByRole('link',{name:'Starship Development ↗',exact:true});
 if(isMobile) await guide.tap(); else await guide.click();
 await expect(page.getByRole('heading',{name:'Starship Development',exact:true})).toBeVisible();
 const related=page.locator('.related-launches');
 await expect(related.getByRole('link',{name:/Fixture Starship flight/})).toHaveAttribute('href','/launches/fixture-starship');
 await expect(related.locator('a[href="/launches/fixture-falcon"]')).toHaveCount(0);
 await expect(related.locator('.launch-card-link')).toHaveCSS('display','block');
 const content=related.locator('.launch-card-link');
 // Read both rectangles in one frame; smooth page scrolling changes viewport coordinates.
 const gap=await content.evaluate(el=>el.querySelector('h3')!.getBoundingClientRect().top-el.querySelector('.launch-agency')!.getBoundingClientRect().bottom);
 expect(gap).toBeGreaterThanOrEqual(0);
 await expect(page.locator('.starship-hero-photo img')).toHaveJSProperty('complete',true);
 await expect(page.locator('.starship-hero-photo img')).not.toHaveJSProperty('naturalWidth',0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath('starship-complete.png'),fullPage:true});
 await related.screenshot({path:test.info().outputPath('related-card.png')});
 const artemis=page.locator('.artemis-continue a[href="/discoveries/artemis"]');
 await artemis.scrollIntoViewIfNeeded();
 // Wait for smooth scrolling and layout to settle through Playwright actionability.
 if(isMobile) await artemis.tap(); else await artemis.click();
 await expect(page).toHaveURL(/\/discoveries\/artemis$/);
 await expect(page.locator('.artemis-guide-intro h1')).toBeVisible();
});
test('no matching metadata leaves no invented launch cards',async({page})=>{
 await page.goto('http://127.0.0.1:3352/explore-space/programs/starship');
 await expect(page.getByRole('heading',{name:'Starship Development',exact:true})).toBeVisible();
 await expect(page.locator('.related-launches-loading')).toHaveCount(0);
 await expect(page.locator('.related-launch-card')).toHaveCount(0);
 await expect(page.locator('.related-launches-error')).toHaveCount(0);
});
test('upstream failure displays an accessible message',async({page})=>{
 await page.goto('http://127.0.0.1:3353/explore-space/programs/starship');
 await expect(page.locator('.related-launches-error')).toBeVisible();
 await expect(page.locator('.related-launches-error')).toHaveAttribute('role','status');
 await expect(page.locator('.related-launch-card')).toHaveCount(0);
});
