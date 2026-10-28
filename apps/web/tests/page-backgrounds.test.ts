import {expect,it} from 'vitest';
import {statSync} from 'node:fs';
import {getBackgroundSection,pageBackgrounds} from '../lib/page-backgrounds';

it('maps every page to its context without losing the Artemis child route',()=>{
  expect(getBackgroundSection('/')).toBe('launches');
  expect(getBackgroundSection('/launches/example')).toBe('launches');
  expect(getBackgroundSection('/discoveries')).toBe('discoveries');
  expect(getBackgroundSection('/explore-space')).toBe('discoveries');
  expect(getBackgroundSection('/explore-space/milestones')).toBe('milestones');
  expect(getBackgroundSection('/explore-space/milestones/')).toBe('milestones');
  expect(getBackgroundSection('/discoveries/artemis')).toBe('artemis');
  expect(getBackgroundSection('/discoveries/artemis/')).toBe('artemis');
});
it('ships lightweight local photos with traceable sources and image rights',()=>{
  for(const [section,image] of Object.entries(pageBackgrounds)) {
    expect(statSync(`public${image.src}`).size).toBeLessThan(100000);
    expect(new URL(image.source).hostname).toBe(section==='milestones'?'commons.wikimedia.org':'www.nasa.gov');
    expect(image.credit).toMatch(section==='milestones'?/SpaceX Photos · CC0 1\.0/:/NASA/);
  }
});
