import {test,expect} from '@playwright/test';
test('administration remains server-protected without configured authentication',async({page})=>{
 const response=await page.request.get('/api/admin/feedback');expect([401,503]).toContain(response.status());expect(response.headers()['cache-control']).toContain('no-store');expect(await response.text()).not.toContain('items');
 await page.goto('/admin/feedback');await expect(page).toHaveURL(/\/admin\/login$/);await expect(page.getByRole('textbox',{name:'Username'})).toBeDisabled();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','password');
 for(const locale of ['pt-PT','es-ES','en-GB']){await page.locator('#site-language').selectOption(locale);await expect(page.locator('html')).toHaveAttribute('lang',locale);expect(await page.locator('main').getByRole('button').count()).toBe(1);}
});
