import { expect,test } from "@playwright/test";

test("header hides down, reveals up and stays accessible without shifting the page",async({page,context})=>{
  await context.route("**/*",route=>new URL(route.request().url()).hostname==="127.0.0.1"?route.continue():route.abort());
  await page.goto("/discoveries/artemis");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-hidden","false");
  const initial = await page.locator("main").evaluate(element=>element.getBoundingClientRect().top+scrollY);
  await page.locator('.theme-toggle').click();
  await expect(page.locator('.theme-toggle')).toBeFocused();
  await page.mouse.move(5,400);
  await page.mouse.wheel(0,650);
  await expect(header).toHaveAttribute("data-hidden","true");
  await expect.poll(()=>header.evaluate(element=>element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
  await page.mouse.wheel(0,-100);
  await expect(header).toHaveAttribute("data-hidden","false");
  await expect.poll(()=>header.evaluate(element=>Math.round(element.getBoundingClientRect().top))).toBe(0);
  expect(await page.locator("main").evaluate(element=>element.getBoundingClientRect().top+scrollY)).toBeCloseTo(initial,0);
  await page.screenshot({path:test.info().outputPath("header-revealed.png")});
  await page.mouse.wheel(0,250);
  await expect(header).toHaveAttribute("data-hidden","true");
  await page.locator('.section-navigation a[href="/discoveries/artemis"]').focus();
  await page.locator('.section-navigation a[href="/discoveries/artemis"]').press("Tab");
  await expect(header).toHaveAttribute("data-hidden","false");
  await expect(page.locator(".theme-toggle")).toBeFocused();
  await page.locator('.section-navigation a[href="/discoveries"]').click();
  await expect(page).toHaveURL(/\/discoveries$/);
  await expect(header).toHaveAttribute("data-hidden","false");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(header).toHaveCSS("transition-duration","0s");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('shared footer appears once across routes and follows the selected language',async({page,context})=>{
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  for (const path of ['/','/discoveries','/discoveries/artemis','/launches/e2e-falcon','/preview/loading']) {
    await page.goto(path);
    await expect(page.locator('.site-footer')).toHaveCount(1);
    await expect(page.getByRole('link',{name:'farfudo ↗',exact:true})).toHaveCount(1);
    await expect(page.locator('.site-footer')).toContainText('Space, right on time.');
    await expect(page.locator('.site-footer a[href="https://github.com/farfudo/launch-tracker"]')).toHaveCount(1);
  }
  await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('pt-PT');
  await expect(page.locator('.site-footer')).toContainText('O espaço, no momento certo.');
  await expect(page.locator('.site-footer')).toContainText('Código-fonte');
});
