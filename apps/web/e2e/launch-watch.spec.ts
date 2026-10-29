import {test,expect} from '@playwright/test';
test('verified play, favorites, calendar and sharing stay within each card',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');
 const row=page.locator('.launch-card').filter({hasText:'Falcon 9 | Test Starlink'}).first();
 await row.locator('.launch-quick-actions').scrollIntoViewIfNeeded();
 const play=row.getByRole('button',{name:'Watch here: Falcon 9 | Test Starlink',exact:true});
 await play.click();
 const watch=page.getByRole('dialog',{name:'Watch here',exact:true});
 await expect(watch.getByRole('link',{name:/Fixture broadcast/})).toHaveAttribute('href','https://example.com/stream');
 await watch.getByRole('button',{name:'Close',exact:true}).press('Escape');await expect(play).toBeFocused();
 const star=row.locator('.favorite-button');
 await star.click();await expect(star).toHaveAttribute('aria-pressed','true');
 await star.click();await expect(star).toHaveAttribute('aria-pressed','false');
 await row.getByRole('button',{name:/Add to calendar:/}).click();
 const calendar=page.getByRole('dialog',{name:'Add to calendar',exact:true});
 await calendar.locator('summary').click();
 await expect(calendar.getByRole('link',{name:/Google Calendar/})).toHaveAttribute('href',/calendar.google.com/);
 await expect(calendar.getByRole('link',{name:/Apple Calendar/})).toHaveAttribute('download',/e2e-falcon/);
 await calendar.getByRole('button',{name:'Close',exact:true}).click();
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));
 await row.getByRole('button',{name:/Share mission:/}).click();
 await expect(row.locator('.quick-share [role="status"]')).toContainText('Link copied');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('http://127.0.0.1:3300/launches/e2e-falcon');
 await expect(page).toHaveURL('http://127.0.0.1:3300/');
 await expect(page.getByRole('button',{name:'Watch here: Electron | Test mission',exact:true})).toHaveCount(0);
 await row.locator('.launch-card-link').click();await expect(page).toHaveURL(/\/launches\/e2e-falcon$/);
});
test('missing, unsafe or failed broadcast data never shows play',async({page})=>{
 await page.route('**/api/missions/e2e-falcon',route=>route.fulfill({status:200,json:{id:'e2e-falcon',streams:[{url:'javascript:alert(1)'}]}}));
 const response=page.waitForResponse('**/api/missions/e2e-falcon');
 await page.goto('/');
 const row=page.locator('.launch-card').filter({hasText:'Falcon 9 | Test Starlink'}).first();
 await row.locator('.launch-quick-actions').scrollIntoViewIfNeeded();
 await response;
 await expect(row.locator('.launch-quick-actions')).toBeVisible();
 await expect(row.locator('.launch-watch-button')).toHaveCount(0);
});
test('icon actions fit 1440, 390 and 320 in every locale and theme',async({page,context})=>{
 for(const locale of ['pt-PT','en-GB','es-ES']){
  await context.addCookies([{name:'launchskyline_locale',value:locale,domain:'127.0.0.1',path:'/'}]);
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});await page.goto('/');
   const actions=page.locator('.launch-card').filter({hasText:'Falcon 9 | Test Starlink'}).first().locator('.launch-quick-actions');
   await actions.scrollIntoViewIfNeeded();
   await expect(actions.locator('button.quick-action')).toHaveCount(4);
   for(const theme of ['light','dark']){
    if((await page.locator('.theme-toggle').getAttribute('aria-pressed')==='true')!==(theme==='dark'))await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    await actions.scrollIntoViewIfNeeded();
    const boxes=await actions.locator('button.quick-action').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,label:node.getAttribute('aria-label'),text:node.textContent};}));
    expect(boxes.every(b=>b.w>=44&&b.h>=44&&b.label)).toBe(true);
    expect(new Set(boxes.map(b=>b.y)).size).toBe(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:test.info().outputPath(`quick-${locale}-${width}-${theme}.png`)});
   }
  }
 }
});
test('broadcast discovery does not resize the card or shift the scroll area',async({page})=>{
 await page.setViewportSize({width:900,height:900});
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/missions/e2e-falcon',async route=>{await gate;await route.continue();});
 await page.goto('/');
 const row=page.locator('.launch-card').filter({hasText:'Falcon 9 | Test Starlink'}).first();
 await row.locator('.launch-quick-actions').scrollIntoViewIfNeeded();
 const before=await row.boundingBox();
 release();await expect(row.locator('.launch-watch-button')).toBeVisible();
 expect((await row.boundingBox())!.height).toBe(before!.height);
});
