import {expect,test} from '@playwright/test';

test('context backgrounds stay behind readable content across routes and themes',async({page,context})=>{
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  for(const [path,section,source] of [['/','launches','nasa.gov'],['/discoveries','discoveries','nasa.gov'],['/discoveries/artemis','artemis','nasa.gov'],['/explore-space/milestones','milestones','commons.wikimedia.org'],['/launches/e2e-falcon','launches','nasa.gov']]) {
    await page.goto(path);
    const background=page.locator('.site-background');
    await expect(background).toHaveAttribute('data-section',section);
    await expect(background).toHaveAttribute('aria-hidden','true');
    await expect(background).toHaveCSS('pointer-events','none');
    await expect.poll(()=>background.locator('img').evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('.site-footer .background-credit a')).toHaveAttribute('href',new RegExp(source));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));
    for(const theme of ['light','dark']) {
      await page.evaluate(value=>{document.documentElement.dataset.theme=value;},theme);
      const minimum=await page.evaluate(()=>{
        const bg=getComputedStyle(document.querySelector('.site-background')!);
        const base=bg.getPropertyValue('--wash-rgb').trim().split(/\s+/).map(Number);
        const a=Number(bg.getPropertyValue('--wash-min'));
        const color=getComputedStyle(document.querySelector('.site-footer')!).color.match(/[\d.]+/g)!.slice(0,3).map(Number);
        const lum=(c:number[])=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
        return Math.min(...[0,255].map(pixel=>{const x=lum(base.map(v=>v*a+pixel*(1-a)));const y=lum(color);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}));
      });
      expect(minimum).toBeGreaterThanOrEqual(4.5);
    }
  }
  await page.goto('/discoveries');
  await expect(page.locator('.discovery-section-heading')).not.toContainText('No engineering degree required');
});
