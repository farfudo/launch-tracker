import { describe, expect, it } from 'vitest';
import { spacePrograms } from '../lib/space-programs';
describe('space programmes',()=>{
 it.each(['pt-PT','en-GB','es-ES'] as const)('has six attributed cards in %s',locale=>{
  const t=spacePrograms(locale);
  expect(t.programs.map(p=>p.name)).toEqual(['Artemis','Starship Development','Commercial Crew','Ariane 6','Chang’e Lunar Exploration','Gaganyaan']);
  expect(t.programs.filter(p=>p.href).map(p=>p.href)).toEqual(['/discoveries/artemis','/explore-space/programs/starship','/explore-space/programs/commercial-crew']);
  for(const p of t.programs) { expect(p.alt.length).toBeGreaterThan(10); expect(p.description.length).toBeGreaterThan(20); expect(p.source).toMatch(/^https:/); expect(p.license).toMatch(/^https:/); }
 });
});
