import { expect, test } from '@playwright/test';

test('curated discovery topics filter without duplicating sources and support themes and languages', async ({page,context}) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/discoveries');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Space discoveries and advances');
  await expect(page.locator('.section-navigation a[aria-current="page"]')).toHaveText('Discoveries');
  await expect(page.locator('.discovery-source-card')).toHaveCount(6);
  await expect(page.locator('.discovery-editorial-note')).toContainText('Not an automated news feed');
  await page.locator('.topic-artemis').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(1);
  await expect(page.locator('.discovery-source-card h3')).toHaveText('Artemis');
  await expect(page.locator('.discovery-source-card > a')).toHaveAttribute('href','https://www.nasa.gov/humans-in-space/artemis/');
  await expect(page.locator('.discovery-source-card > a')).toHaveAttribute('rel','noopener noreferrer');
  await page.locator('.topic-starship').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(2);
  await page.locator('.topic-reuse').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath('discoveries-light.png'),fullPage:true});
  await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.screenshot({path:test.info().outputPath('discoveries-dark.png'),fullPage:true});
  await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('pt-PT');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Descobertas e avanços espaciais');
  await expect(page).toHaveURL(/topic=reuse/);
  await page.getByRole('button',{name:'Mudar para o tema claro',exact:true}).click();
  await page.screenshot({path:test.info().outputPath('discoveries-pt.png'),fullPage:true});
});
