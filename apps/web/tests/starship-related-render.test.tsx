import {beforeEach,describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import type {Launch} from '../lib/api';
const {read}=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('../lib/cached-api',()=>({getCachedLaunches:read}));
vi.mock('../components/vehicle-visual',()=>({VehicleVisual:()=>null}));
vi.mock('../components/local-launch-date',()=>({LocalLaunchDate:()=>null}));
vi.mock('../components/pending-feedback',()=>({LinkPending:()=>null,Spinner:()=>null}));
import {RelatedMissions} from '../components/related-missions';
describe('Starship related launches render from existing data',()=>{
 // Do not return the mock: Vitest treats a returned function as teardown.
 beforeEach(()=>{read.mockReset();});
 it('links a concrete matching ID and excludes unrelated vehicles',async()=>{
  read.mockResolvedValue({value:[{id:'falcon',name:'Starlink',vehicle:'Falcon 9'},{id:'fixture-starship',name:'Fixture flight',vehicle:'Starship / Super Heavy',net:'2099-01-01T00:00:00Z',status:'Go for Launch'}] as Launch[]});
  const html=renderToStaticMarkup(await RelatedMissions({locale:'en-GB',topics:['starship']}));
  expect(html).toContain('/launches/fixture-starship');
  expect(html).not.toContain('/launches/falcon');
  expect(read).toHaveBeenCalledWith(100,{period:'upcoming'});
 });
 it('does not create cards without matching metadata',async()=>{
  read.mockResolvedValue({value:[{id:'other',name:'Starship payload',vehicle:'Falcon 9'}]});
  expect(await RelatedMissions({locale:'en-GB',topics:['starship']})).toBeNull();
 });
 it('retains the accessible error message when data are unavailable',async()=>{
  read.mockRejectedValue(new Error('fixture unavailable'));
  const result=await RelatedMissions({locale:'pt-PT',topics:['starship']});
  expect(result?.type).toBe('p');
  expect(result?.props.role).toBe('status');
  expect(result?.props.children).toBe('Não foi possível confirmar lançamentos relacionados neste momento.');
 });
});
