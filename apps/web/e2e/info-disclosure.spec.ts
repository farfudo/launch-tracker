import {test,expect} from '@playwright/test';

test('supplementary notes open by pointer or touch and keep credits separate',async({page,isMobile})=>{
  await page.route('**/youtube.com/iframe_api',route=>route.abort());
  await page.goto('/discoveries');
  const main=page.locator('main:visible');
  await expect(main).toHaveCount(1);
  const trigger=main.locator('.booster-catch .info-trigger');
  const panel=main.locator('.booster-catch .info-panel');
  await expect(panel).not.toBeVisible();
  if(isMobile) await trigger.tap(); else await trigger.hover();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate(element=>element.matches(':popover-open'))).toBe(true);
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

test('each information button owns one panel after direct navigation and hydration',async({page})=>{
  await page.goto('/discoveries');
  const main=page.locator('main:visible');
  await expect(main).toHaveCount(1);
  const disclosures=main.locator('.info-disclosure');
  await expect(disclosures.first().locator('.info-trigger')).toBeVisible();
  for(const disclosure of await disclosures.all()){
    const button=disclosure.locator('.info-trigger');
    const panel=disclosure.locator('.info-panel');
    await expect(button).toHaveCount(1);
    await expect(panel).toHaveCount(1);
    const id=await button.getAttribute('aria-controls');
    expect(id).toBeTruthy();
    await expect(panel).toHaveAttribute('id',id!);
    await expect(main.locator(`[id="${id}"]`)).toHaveCount(1);
  }
});

test('information toggles on touch or click and closes outside',async({page,isMobile})=>{
  await page.goto('/discoveries');
  const main=page.locator('main:visible');
  await expect(main).toHaveCount(1);
  const trigger=main.locator('.booster-catch .info-trigger');
  const panel=main.locator('.booster-catch .info-panel');
  if(isMobile) await trigger.tap(); else await trigger.click();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await page.locator('h1').click();
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
});
