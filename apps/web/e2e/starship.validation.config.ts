import {defineConfig,devices} from '@playwright/test';
import {resolve} from 'node:path';
const cwd=resolve(__dirname,'..');
export default defineConfig({
 testDir:'.',testMatch:'starship-validation.spec.ts',workers:1,retries:0,reporter:'list',
 use:{baseURL:'http://127.0.0.1:3351',screenshot:'only-on-failure',trace:'retain-on-failure'},
 outputDir:'../output/playwright/starship-validation',
 projects:[{name:'desktop',use:{viewport:{width:1440,height:900}}},{name:'mobile-touch',use:{...devices['iPhone 13'],defaultBrowserType:'chromium',viewport:{width:390,height:844}}}],
 webServer:[{cwd,command:'node e2e/starship-fixture.mjs',url:'http://127.0.0.1:3341/health',reuseExistingServer:false},
 ...[0,1,2].map(i=>({cwd,command:`npm run start -- --hostname 127.0.0.1 --port ${3351+i}`,url:`http://127.0.0.1:${3351+i}/explore-space/programs`,reuseExistingServer:false,env:{API_BASE_URL:`http://127.0.0.1:${3341+i}`,NEXT_PUBLIC_API_BASE_URL:`http://127.0.0.1:${3341+i}`,DESIGN_PREVIEW:'false'}}))],
});
