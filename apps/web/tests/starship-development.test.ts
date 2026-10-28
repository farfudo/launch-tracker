import {describe,it,expect} from 'vitest';
import {starshipCopy,starshipSources} from '../lib/starship-development';
import {isLaunchRelatedToTopic} from '../lib/related-missions';
describe('Starship educational guide',()=>{
 it('provides complete learning sections in all supported languages',()=>{
  for(const t of Object.values(starshipCopy)) {
   expect(t.roles).toHaveLength(4);
   expect(t.milestones).toHaveLength(4);
   expect(t.steps).toHaveLength(5);
   for(const text of [t.intro,t.body,t.hlsBody,t.plannedBody,t.profileNote,t.whyBody]) expect(text.length).toBeGreaterThan(40);
  }
 });
 it('does not associate unrelated SpaceX or Artemis flights with Starship',()=>{
  expect(isLaunchRelatedToTopic({name:'Artemis III',vehicle:'SLS'},'starship')).toBe(false);
  expect(isLaunchRelatedToTopic({name:'Starlink',vehicle:'Falcon 9'},'starship')).toBe(false);
  expect(isLaunchRelatedToTopic({name:'Flight test',vehicle:'Starship / Super Heavy'},'starship')).toBe(true);
 });
 it('uses official programme and historical sources',()=>{
  for(const key of ['overview','flight5','history','hls'] as const) expect(new URL(starshipSources[key]).hostname).toMatch(/(^|\.)(spacex\.com|nasa\.gov)$/);
 });
});
