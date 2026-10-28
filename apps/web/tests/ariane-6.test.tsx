import {beforeEach,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {arianeCopy,isAriane6} from '../lib/ariane-6';
const {read}=vi.hoisted(()=>({read:vi.fn()}));
vi.mock('../lib/cached-api',()=>({getCachedLaunches:read}));
import {Ariane6Related} from '../components/ariane-6-related';
beforeEach(()=>read.mockReset());
it('matches only vehicle metadata for this rocket family',()=>{
 for(const vehicle of ['Ariane 6','Ariane 62','Ariane 64','Ariane 6 Block 2'])expect(isAriane6(vehicle)).toBe(true);
 for(const vehicle of [null,undefined,'Ariane 5','Vega C','Falcon 9','Ariane 60','Not Ariane 6'])expect(isAriane6(vehicle)).toBe(false);
});
it('keeps each locale complete with both configurations and five mission steps',()=>{
 for(const t of Object.values(arianeCopy)){
  expect(t.parts).toHaveLength(4);expect(t.steps).toHaveLength(5);expect(t.events).toHaveLength(4);
  expect(t.a62).toContain('62');expect(t.a64).toContain('64');expect(t.review).toContain('2026');
 }
});
it('uses real data IDs and deduplicates upcoming and past results',async()=>{
 read.mockResolvedValue({value:[{id:'real-ariane',vehicle:'Ariane 62',name:'CSO-3',agency:'Arianespace'},{id:'wrong',vehicle:'Ariane 5',name:'Ariane 6 mention'}]});
 const html=renderToStaticMarkup(await Ariane6Related({locale:'en-GB'}));
 expect(html.match(/\/launches\/real-ariane/g)).toHaveLength(1);expect(html).not.toContain('/launches/wrong');
 expect(read).toHaveBeenCalledWith(100,{period:'upcoming'});expect(read).toHaveBeenCalledWith(100,{period:'past'});
});
it('reports empty, failed and partial reads without inventing missions',async()=>{
 read.mockResolvedValue({value:[]});expect(renderToStaticMarkup(await Ariane6Related({locale:'en-GB'}))).toContain(arianeCopy['en-GB'].empty);
 read.mockRejectedValue(new Error('offline'));expect(renderToStaticMarkup(await Ariane6Related({locale:'pt-PT'}))).toContain(arianeCopy['pt-PT'].error);
 read.mockReset().mockResolvedValueOnce({value:[{id:'known',vehicle:'Ariane 64',name:'Known mission'}]}).mockRejectedValueOnce(new Error('offline'));
 const html=renderToStaticMarkup(await Ariane6Related({locale:'en-GB'}));expect(html).toContain('/launches/known');expect(html).toContain(arianeCopy['en-GB'].error);
});
