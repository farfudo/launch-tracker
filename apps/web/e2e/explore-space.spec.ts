import { expect, test } from '@playwright/test';

test('Explore Space hub links to existing guides and launch data in each locale', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/explore-space');
  const nav = page.locator('.section-navigation');
  await expect(nav.getByRole('link')).toHaveText(['Launches', 'Explore Space']);
  await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', '/explore-space');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Explore Space');
  const cards = page.locator('.explore-space-card');
  await expect(cards).toHaveCount(4);
  await expect(cards).toHaveText([
    /Discoveries & Advances.*Technologies and ideas changing space exploration.*Explore discoveries/,
    /Space Programs.*Explore the Artemis programme.*Explore programs/,
    /How Rockets Work.*See how engines.*Explore the technology/,
    /Space Milestones.*Explore four moments that changed space exploration.*Explore the timeline/
  ]);
  await expect(cards.nth(0)).toHaveAttribute('href', '/discoveries');
  await expect(cards.nth(1)).toHaveAttribute('href', '/explore-space/programs');
  await expect(cards.nth(2)).toHaveAttribute('href', '/explore-space/how-rockets-work');
  await expect(cards.nth(3)).toHaveAttribute('href', '/explore-space/milestones');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('explore-space-desktop.png'), fullPage: true });
  await cards.nth(0).click();
  await expect(page).toHaveURL(/\/discoveries$/);
  await expect(page.locator('.discoveries-intro h1')).toHaveText('Space discoveries and advances');
  await page.goto('/explore-space');
  await cards.nth(1).click();
  await expect(page).toHaveURL(/\/explore-space\/programs$/);
  await expect(page.locator('.program-card')).toHaveCount(6);
  await page.getByRole('link', { name: /Explore the Artemis guide/ }).click();
  await expect(page).toHaveURL(/\/discoveries\/artemis$/);
  await expect(page.locator('.guide-role-grid article')).toHaveCount(4);
  await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', '/explore-space');
  await page.goto('/explore-space');
  await cards.nth(2).click();
  await expect(page).toHaveURL(/\/explore-space\/how-rockets-work$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How does a rocket fly?');
  await page.goto('/explore-space');
  await cards.nth(3).click();
  await expect(page).toHaveURL(/\/explore-space\/milestones$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Space exploration milestones');
  await expect(page.locator('.milestone-item')).toHaveCount(4);
  await expect(page.locator('.milestone-date')).toHaveText(['4 October 1957', '12 April 1961', '20 July 1969', '21 December 2015']);
  await expect(page.locator('.milestone-image-figure')).toHaveCount(4);
  await expect(page.locator('.milestone-image-trigger img')).toHaveCount(4);
  for (const image of await page.locator('.milestone-image-trigger img').all()) {
    await expect(image).toHaveAttribute('alt', /.+/);
    await expect(image).toHaveCSS('object-fit', 'cover');
    await expect(image).toBeVisible();
  }
  for (const frame of await page.locator('.milestone-image-trigger').all()) {
    await expect.poll(() => frame.evaluate((element: HTMLElement) => Math.round(element.getBoundingClientRect().width / element.getBoundingClientRect().height * 100) / 100)).toBe(1.5);
  }
  const firstImageButton = page.locator('.milestone-image-trigger').first();
  await expect(firstImageButton).toHaveAttribute('aria-label', /Sputnik 1/);
  await firstImageButton.focus();
  await page.keyboard.press('Enter');
  const firstImageTitle = (await page.locator('.milestone-card > h2').first().textContent())?.trim() ?? '';
  const firstImageDialog = page.getByRole('dialog', { name: firstImageTitle });
  await expect(firstImageDialog).toBeVisible();
  await expect(firstImageDialog.getByRole('img')).toHaveAttribute('alt', /Sputnik 1 replica/);
  await page.keyboard.press('Escape');
  await expect(firstImageDialog).not.toBeVisible();
  await expect(firstImageButton).toBeFocused();
  await page.locator('.milestone-image-trigger').nth(2).click();
  const apolloTitle = (await page.locator('.milestone-card > h2').nth(2).textContent())?.trim() ?? '';
  const apolloDialog = page.getByRole('dialog', { name: apolloTitle });
  await expect(apolloDialog).toBeVisible();
  await apolloDialog.locator('.milestone-image-close').click();
  await expect(apolloDialog).not.toBeVisible();
  await expect(page.getByRole('link', { name: /Explore the Artemis guide/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /See how rocket reuse works/ })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('space-milestones-desktop.png'), fullPage: true });

});

test('Explore Space cards remain usable on narrow mobile screens', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/explore-space');
  await expect(page.locator('.explore-space-card')).toHaveCount(4);
  const programs = page.getByRole('link', { name: /Explore programs/ });
  await expect(programs).toBeVisible();
  await expect(programs).toHaveAttribute('href', '/explore-space/programs');
  await programs.click();
  await expect(page.getByRole('link', { name: /Explore the Artemis guide/ })).toBeVisible();
  await page.goto('/explore-space');
  await page.getByRole('link', { name: /Explore the timeline/ }).click();
  await expect(page).toHaveURL(/\/explore-space\/milestones$/);
  await expect(page.locator('.milestone-item')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.milestone-image-trigger img')).toHaveCount(4);
  await expect(page.locator('.site-background')).toHaveAttribute('data-section', 'milestones');
  await expect(page.locator('.site-footer .background-credit a')).toHaveAttribute('href', /commons\.wikimedia\.org\/wiki\/File:Falcon_9/);
  const imageButton = page.locator('.milestone-image-trigger').first();
  await expect(imageButton).toHaveAttribute('aria-label', /Sputnik 1/);
  await imageButton.click();
  const imageTitle = (await page.locator('.milestone-card > h2').first().textContent())?.trim() ?? '';
  const imageDialog = page.getByRole('dialog', { name: imageTitle });
  await expect(imageDialog).toBeVisible();
  await expect(imageDialog.getByRole('img')).toBeVisible();
  await imageDialog.locator('.milestone-image-close').click();
  await expect(imageDialog).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('space-milestones-mobile.png'), fullPage: true });
});

test('milestone images load locally and open accessibly on desktop and touch devices', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/explore-space/milestones');
  const images = page.locator('.milestone-image-trigger img');
  await expect(images).toHaveCount(4);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: test.info().outputPath('space-milestones-images-preview.png'), fullPage: true });

  const trigger = page.locator('.milestone-image-trigger').first();
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await trigger.focus();
  const title = (await page.locator('.milestone-card > h2').first().textContent())?.trim() ?? '';
  const dialog = page.getByRole('dialog', { name: title });
  if (test.info().project.name.startsWith('mobile')) await trigger.tap();
  else await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', /Sputnik 1/);
  await page.screenshot({ path: test.info().outputPath('space-milestones-image-dialog.png') });
  if (test.info().project.name.startsWith('mobile')) await dialog.locator('.milestone-image-close').tap();
  else await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  if (!test.info().project.name.startsWith('mobile')) await expect(trigger).toBeFocused();
});

test('Space Milestones title and categories are available in PT, EN and ES', async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  for (const [locale, title, category] of [
    ['pt-PT', 'Marcos da exploração espacial', 'Satélites'],
    ['en-GB', 'Space exploration milestones', 'Satellites'],
    ['es-ES', 'Hitos de la exploración espacial', 'Satélites']
  ] as const) {
    await context.addCookies([{ name: 'launchskyline_locale', value: locale, url: 'http://127.0.0.1:3300' }]);
    await page.goto('/explore-space/milestones');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.milestone-category').first()).toHaveText(category);
    await expect(page.locator('.milestone-item')).toHaveCount(4);
    await expect(page.locator('.milestone-image-figure figcaption a')).toHaveCount(4);
    await expect(page.locator('.milestone-image-figure figcaption a').first()).toHaveAttribute('href', /commons\.wikimedia\.org/);
  }
});
