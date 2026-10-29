import { expect, test } from '@playwright/test';

test('filter reset does not overlap its trigger and disclosures share smooth motion', async ({ page }) => {
  await page.goto('/?period=upcoming');
  const filters = page.locator('main:visible .launch-filter-panel');
  const summary = filters.locator(':scope > summary');
  if (await filters.getAttribute('open') === null) await summary.click();

  const reset = filters.locator('.clear-filters');
  await expect(reset).toBeVisible();
  const summaryBox = await summary.boundingBox();
  const resetBox = await reset.boundingBox();
  expect(summaryBox).not.toBeNull();
  expect(resetBox).not.toBeNull();
  expect(summaryBox!.y + summaryBox!.height).toBeLessThanOrEqual(resetBox!.y);
  await page.screenshot({ path: test.info().outputPath('filters-expanded.png'), fullPage: true });

  const motion = await filters.evaluate(element => ({
    interpolateSize: getComputedStyle(element).getPropertyValue('interpolate-size'),
    contentTransition: getComputedStyle(element, '::details-content').transition,
  }));
  expect(motion.interpolateSize).toBe('allow-keywords');
  expect(motion.contentTransition).toContain('block-size');

  await summary.click();
  await page.waitForTimeout(40);
  await summary.click();
  await page.waitForTimeout(70);
  const openingHeight = await filters.evaluate(element => ({
    animated: Number.parseFloat(getComputedStyle(element, '::details-content').blockSize),
    full: element.querySelector('.filter-content')!.scrollHeight,
  }));
  expect(openingHeight.animated).toBeGreaterThan(0);
  expect(openingHeight.animated).toBeLessThan(openingHeight.full);

  await page.waitForTimeout(300);
  await summary.click();
  await page.waitForTimeout(70);
  const closingHeight = await filters.evaluate(element => Number.parseFloat(getComputedStyle(element, '::details-content').blockSize));
  expect(closingHeight).toBeGreaterThan(0);
  expect(closingHeight).toBeLessThan(openingHeight.full);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedTransition = await filters.evaluate(element => getComputedStyle(element, '::details-content').transitionDuration);
  expect(reducedTransition.split(',').every(duration => duration.trim() === '0s')).toBe(true);
});
