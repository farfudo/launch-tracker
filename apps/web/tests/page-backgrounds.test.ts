import {expect,it} from 'vitest';
import {statSync} from 'node:fs';
import {getBackgroundSection,pageBackgrounds} from '../lib/page-backgrounds';

it('maps every page to its context without losing the Artemis child route',()=>{
  expect(getBackgroundSection('/')).toBe('launches');
  expect(getBackgroundSection('/launches/example')).toBe('launches');
  expect(getBackgroundSection('/discoveries')).toBe('discoveries');
  expect(getBackgroundSection('/discoveries/artemis')).toBe('artemis');
  expect(getBackgroundSection('/discoveries/artemis/')).toBe('artemis');
});
it('ships lightweight local photos with traceable NASA sources',()=>{
  for(const image of Object.values(pageBackgrounds)) {
    expect(image.src).toMatch(/^\/images\/backgrounds\/.+\.webp$/);
    expect(statSync(`public${image.src}`).size).toBeLessThan(100000);
    expect(new URL(image.source).hostname).toBe('www.nasa.gov');
    expect(image.credit).toContain('NASA');
  }
});
