import { expect, test } from '@playwright/test';

test('curated discovery topics filter without duplicating sources and support themes and languages', async ({page,context}) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/discoveries');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Space discoveries and advances');
  await expect(page.locator('.section-navigation a[aria-current="page"]')).toHaveText('Discoveries');
  await expect(page.locator('.section-navigation-child')).toHaveCount(0);
  await expect(page.locator('.discovery-source-card')).toHaveCount(6);
  if (test.info().project.name === 'desktop-chromium') {
    expect(await page.locator('.discovery-start').evaluate(element=>element.getBoundingClientRect().bottom)).toBeLessThan(720);
    expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(1900);
  }
  await expect(page.locator('.discovery-library')).not.toHaveAttribute('open');
  await page.locator('.discovery-library > summary').click();
  await expect(page.locator('.discovery-topics')).toHaveCount(0);
  const question = page.locator('.discovery-first-question');
  await expect(page.getByRole('heading',{name:'What if a rocket could fly again?',exact:true})).toBeVisible();
  await expect(question).not.toHaveAttribute('open');
  await question.locator('summary').press('Enter');
  await expect(question.locator('p')).toBeVisible();
  await expect(question.locator('p')).toContainText('Recovery means');
  await question.locator('summary').press('Enter');
  await page.locator('.discovery-hook-actions .pill-button').click();
  await expect(page).toHaveURL(/#technology-lab/);
  await expect(page.locator('.technology-panel')).toBeVisible();
  await expect(page.locator('.discovery-footer')).toContainText('not an automatic feed');
  await page.locator('.topic-artemis').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(1);
  await expect(page.locator('.discovery-source-card h3')).toHaveText('Artemis');
  await expect(page.locator('.discovery-source-card > a')).toHaveAttribute('href','https://www.nasa.gov/humans-in-space/artemis/');
  await expect(page.locator('.discovery-source-card > a')).toHaveAttribute('rel','noopener noreferrer');
  await page.locator('.topic-starship').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(2);
  await page.locator('.topic-reuse').click();
  await expect(page.locator('.discovery-source-card')).toHaveCount(5);
  await page.locator('.discovery-library > summary').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath('discoveries-light.png'),fullPage:true});
  await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(16, 27, 33)');
  await page.screenshot({path:test.info().outputPath('discoveries-dark.png'),fullPage:true});
  await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('pt-PT');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Descobertas e avanços espaciais');
  await expect(page).toHaveURL(/topic=reuse/);
  if (await page.locator('.discovery-library').getAttribute('open') !== null) await page.locator('.discovery-library > summary').click();
  await page.getByRole('button',{name:'Mudar para o tema claro',exact:true}).click();
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(234, 233, 228)');
  await page.screenshot({path:test.info().outputPath('discoveries-pt.png'),fullPage:true});
});

test('hero catch repeats muted at double speed, can pause and respects reduced motion', async ({page,context}) => {
  await context.route('**/*',route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.addInitScript(() => {
    const calls:string[] = [];
    Object.assign(window,{catchCalls:calls,YT:{Player:class {
      options: {events:Record<string,(event:unknown)=>void>};
      frame:HTMLIFrameElement;
      constructor(mount:HTMLElement,options:{events:Record<string,(event:unknown)=>void>;playerVars:{controls:number}}) {
        calls.push(`controls:${options.playerVars.controls}`);
        this.options = options; this.frame = document.createElement('iframe'); mount.replaceWith(this.frame);
        Object.assign(window,{catchEnd:() => options.events.onStateChange({target:this,data:0})});
        queueMicrotask(() => options.events.onReady({target:this}));
      }
      mute() {calls.push('mute');}
      getAvailablePlaybackRates() {return [1,2];}
      setPlaybackRate(rate:number) {calls.push(`rate:${rate}`);}
      playVideo() {calls.push('play'); this.options.events.onStateChange({target:this,data:1});}
      pauseVideo() {calls.push('pause'); this.options.events.onStateChange({target:this,data:2});}
      loadVideoById(clip:{startSeconds:number;endSeconds:number}) {calls.push(`loop:${clip.startSeconds}:${clip.endSeconds}`);}
      destroy() {this.frame.remove();}
    }}});
  });
  await page.goto('/discoveries');
  await page.locator('.booster-catch').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button',{name:'Ⅱ Pause excerpt',exact:true})).toBeVisible();
  if (test.info().project.name === 'desktop-chromium') {
    await page.mouse.move(0,0);
    await expect(page.locator('.booster-catch-actions button')).toHaveCSS('opacity','0');
    await page.locator('.booster-catch').hover();
    await expect(page.locator('.booster-catch-actions button')).toHaveCSS('opacity','1');
  }
  const calls = () => page.evaluate(() => (window as unknown as {catchCalls:string[]}).catchCalls);
  expect(await calls()).toContain('mute'); expect(await calls()).toContain('rate:2');
  expect(await calls()).toContain('controls:0');
  await page.evaluate(() => (window as unknown as {catchEnd:()=>void}).catchEnd());
  expect(await calls()).toContain('loop:125:145');
  await page.getByRole('button',{name:'▶ Play excerpt',exact:true}).click();
  await page.getByRole('button',{name:'Ⅱ Pause excerpt',exact:true}).click();
  await expect(page.getByRole('button',{name:'▶ Play excerpt',exact:true})).toBeVisible();
  expect(await calls()).toContain('pause');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.booster-catch iframe')).toHaveCount(0);
  await expect(page.locator('.booster-catch')).toContainText('Reduced motion');
  await page.reload();
  await expect(page.locator('.booster-catch iframe')).toHaveCount(0);
  await expect(page.locator('.booster-catch')).toContainText('Reduced motion');
  await page.getByRole('button',{name:'▶ Play excerpt',exact:true}).click();
  await expect(page.locator('.booster-catch iframe')).toHaveCount(1);
});

test('visual technology lab explains concepts and links to a dated Artemis deep dive', async ({page,context}) => {
  await context.route('**/*',route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/discoveries');
  await expect(page.locator('.landing-gallery')).toHaveCount(0);
  await page.locator('.technology-action').click();
  await expect(page.locator('.technology-state')).toContainText('Gases exit');
  await page.getByRole('button',{name:'Materials',exact:true}).click();
  await expect(page.locator('.technology-stage')).toContainText('Demonstrator');
  await expect(page.locator('.technology-action')).toHaveAttribute('aria-pressed','false');
  await page.locator('.technology-action').press('Enter');
  if (test.info().project.name === 'desktop-chromium') {
    await page.locator('.technology-action').hover();
    await expect(page.locator('.technology-action')).toHaveCSS('background-color','rgb(223, 248, 245)');
    await expect(page.locator('.technology-action')).toHaveCSS('color','rgb(8, 127, 122)');
  }
  await expect(page.locator('.technology-state')).toContainText('illustrative only');
  await page.locator('.technology-limits summary').click();
  await expect(page.locator('.technology-limits')).toContainText('not a spacecraft already repairing itself');
  await page.getByRole('button',{name:'Refuelling',exact:true}).click();
  await page.locator('.technology-action').click();
  await expect(page.locator('.technology-state')).toContainText('symbolic');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.tech-flow')).toHaveCSS('animation-name','none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Explore the Artemis guide →',exact:true}).click();
  await expect(page).toHaveURL(/\/discoveries\/artemis/);
  await expect(page.locator('.section-navigation a[aria-current]')).toHaveText('Discoveries');
  await expect(page.locator('.section-navigation-branch > a')).toHaveAttribute('aria-current','location');
  await expect(page.locator('.section-navigation-child')).toHaveText('↳ Artemis');
  await expect(page.locator('.section-navigation-child')).toHaveAttribute('aria-current','page');
  await expect(page.locator('.guide-role-grid article')).toHaveCount(4);
  await expect(page.locator('.guide-missions article')).toHaveCount(3);
  await expect(page.locator('.guide-missions article').last()).toContainText('Low Earth orbit');
  await expect(page.locator('.guide-update')).toContainText('23 October 2026');
  await page.locator('.guide-faq summary').press('Enter');
  await expect(page.locator('.guide-faq p')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:test.info().outputPath('artemis-guide.png'),fullPage:true});
  await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('pt-PT');
  await expect(page.locator('h1')).toHaveText('Artemis: as peças de um regresso à Lua');
  await expect(page.locator('.section-navigation-child')).toHaveText('↳ Artemis');
  await page.locator('.section-navigation-branch > a').click();
  await expect(page).toHaveURL(/\/discoveries$/);
  await expect(page.locator('.section-navigation-child')).toHaveCount(0);
});
