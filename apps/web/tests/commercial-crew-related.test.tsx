import {beforeEach,describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
const {read}=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('../lib/cached-api',()=>({getCachedLaunches:read}));
import {CommercialCrewRelated} from '../components/commercial-crew-related';
describe('Commercial Crew related missions',()=>{
 beforeEach(()=>{read.mockReset();});
 it('renders only a verified mission with its actual data ID',async()=>{
  read.mockResolvedValue({value:[{id:'crew-fixture',name:'Crew-10',agency:'SpaceX',vehicle:'Falcon 9'},{id:'unrelated-fixture',name:'Crew-10 cargo',agency:'Other',vehicle:'Falcon 9'}]});
  const html=renderToStaticMarkup(await CommercialCrewRelated({locale:'en-GB'}));
  expect(html).toContain('/launches/crew-fixture');
  expect(html).not.toContain('unrelated-fixture');
  expect(read).toHaveBeenCalledWith(100,{period:'upcoming'});
 });
 it('explains when no exact association exists',async()=>{
  read.mockResolvedValue({value:[{id:'unrelated-fixture',name:'Crew-10 cargo'}]});
  const result=await CommercialCrewRelated({locale:'en-GB'});
  expect(result.props.role).toBe('status');
  expect(result.props.children).toBe('No associated launches are available in the current data.');
 });
 it('reports API unavailability',async()=>{
  read.mockRejectedValue(new Error('fixture unavailable'));
  const result=await CommercialCrewRelated({locale:'pt-PT'});
  expect(result.props.role).toBe('status');
  expect(result.props.children).toBe('Não foi possível confirmar lançamentos relacionados neste momento.');
 });
});
