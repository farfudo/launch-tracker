import {test,expect} from '@playwright/test';
test('feedback validates, survives failure, prevents duplicates and confirms only server success',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Give Feedback',exact:true}).first().click();
 const dialog=page.getByRole('dialog',{name:'Help improve NextRocketLaunch'});await expect(dialog).toBeVisible();
 await dialog.getByLabel('Feedback type').selectOption('suggestion');await dialog.getByLabel('Your feedback',{exact:true}).fill('A useful suggestion for the website');
 let calls=0;const keys:string[]=[];
 await page.route('**/api/feedback',async route=>{calls++;keys.push(route.request().headers()['idempotency-key']);if(calls===1){await route.abort();return;}await new Promise(r=>setTimeout(r,250));await route.fulfill({status:201,json:{received:true,id:'09e5f3b2-73f4-4b74-a398-24b794fd48ce'}});});
 await dialog.getByRole('button',{name:'Send Feedback',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('could not');
 await expect(dialog.getByLabel('Your feedback',{exact:true})).toHaveValue('A useful suggestion for the website');
 await dialog.getByRole('button',{name:'Send Feedback',exact:true}).click();await expect(dialog.getByRole('button',{name:'Sending…'})).toBeDisabled();
 await expect(dialog.getByRole('status')).toContainText('has been received');expect(calls).toBe(2);expect(keys[0]).toBe(keys[1]);
 await dialog.getByRole('button',{name:'Close feedback'}).click();await expect(dialog).not.toBeVisible();
 await expect(page.getByRole('button',{name:'Give Feedback',exact:true}).first()).toBeFocused();
 const denied=await page.goto('/admin/feedback');expect(denied?.status()).toBe(404);
});
test('feedback is translated, keyboard accessible and fits small viewports',async({page})=>{
 for(const [locale,open,title] of [['pt-PT','Dar feedback','Ajuda a melhorar o NextRocketLaunch'],['en-GB','Give Feedback','Help improve NextRocketLaunch'],['es-ES','Dar feedback','Ayuda a mejorar NextRocketLaunch']]){
  // Use the site's language selector, preserving its existing locale cookie contract.
  await page.goto('/');await page.locator('#site-language').selectOption(locale);await page.waitForLoadState('networkidle');
  await page.setViewportSize({width:320,height:740});await page.getByRole('button',{name:open,exact:true}).first().click();
  const dialog=page.getByRole('dialog',{name:title});await expect(dialog).toBeVisible();
  const box=await dialog.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(321);
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
 }
});
