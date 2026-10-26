import {test,expect} from '@playwright/test';

test('supplementary notes open by pointer or touch and keep credits separate',async({page,isMobile})=>{
  await page.route('**/youtube.com/iframe_api',route=>route.abort());
  await page.goto('/discoveries');
  const trigger=page.locator('.booster-catch .info-trigger');
  const panel=page.locator('.booster-catch .info-panel');
  await expect(panel).not.toBeVisible();
  if(isMobile) await trigger.tap(); else await trigger.hover();
  await expect(panel).toBeVisible();
  const box=await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await trigger.evaluate(element=>element.blur());
  await trigger.focus();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  const credit=page.locator('.footer-image-credit');
  await expect(credit).toContainText('NASA');
  await expect(credit.locator('a')).not.toHaveAttribute('href',/github/);
  await expect(page.locator('.site-footer p').filter({has:page.locator('a[href="https://github.com/farfudo"]')})).not.toContainText('NASA');
});
