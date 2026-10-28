import {test,expect} from '@playwright/test';
test('Ariane 6 reuses the programme journey across locales, themes and screen sizes',async({page,context,isMobile})=>{
 await page.setViewportSize({width:isMobile?390:1440,height:isMobile?844:900});
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 for(const locale of ['en-GB','pt-PT','es-ES']){
  await context.addCookies([{name:'launchskyline_locale',value:locale,domain:'127.0.0.1',path:'/'}]);
  await page.goto('/explore-space/programs');
  const link=page.getByRole('link',{name:'Ariane 6 ↗',exact:true});if(isMobile)await link.tap();else await link.click();
  await expect(page).toHaveURL(/\/programs\/ariane-6$/);
  await expect(page.getByRole('heading',{name:'Ariane 6',exact:true})).toBeVisible();
  await expect(page.locator('#rocket article')).toHaveCount(4);
  await expect(page.locator('.ariane-variants svg')).toHaveCount(2);
  await expect(page.locator('#journey li')).toHaveCount(5);
  await expect(page.locator('#milestones article')).toHaveCount(4);
  await expect.poll(()=>page.locator('.starship-hero-photo img').evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('a[href="https://creativecommons.org/licenses/by-sa/3.0/igo/"]')).toBeVisible();
  await expect(page.locator('.guide-section [role="status"]')).toContainText(locale==='en-GB'?'No associated':locale==='pt-PT'?'Não existem':'No hay');
  for(const theme of ['light','dark']){
   const toggle=page.locator('.theme-toggle');if((await toggle.getAttribute('aria-pressed')==='true')!==(theme==='dark'))await toggle.click();
   await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:test.info().outputPath(`ariane-${locale}-${theme}.png`),fullPage:true});
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:test.info().outputPath(`ariane-hero-${locale}-${theme}.png`)});
  }
  for(const href of ['/discoveries/artemis','/explore-space/programs/starship','/explore-space/how-rockets-work'])await expect(page.locator(`.artemis-continue a[href="${href}"]`)).toHaveCount(1);
 }
});
