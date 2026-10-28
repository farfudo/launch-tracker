import type {Page} from '@playwright/test';
export async function openLaunchFilters(page:Page){const panel=page.locator('.launch-filter-panel');if(await panel.getAttribute('open')===null)await panel.locator('summary').first().click();}
