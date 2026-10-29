// @vitest-environment jsdom
import {vi} from 'vitest';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {LaunchSpotlight} from '../components/launch-spotlight';
import {LocaleProvider} from '../components/locale-provider';
import type {Launch} from '../lib/api';
it('keeps the next launch link and uncertainty accessible without a favorite control',()=>{
 const launch={id:'actual/id',name:'Mission',vehicle:'Rocket',net:'2099-01-01T12:00:00Z',status:'TBC',net_precision:{id:5}} as Launch;
 for(const locale of ['pt-PT','en-GB','es-ES'] as const){
  const html=renderToStaticMarkup(<LocaleProvider locale={locale}><LaunchSpotlight launch={launch} locale={locale}/></LocaleProvider>);
  expect(html).toContain('/launches/actual%2Fid');expect(html).toContain('info-trigger');expect(html).not.toContain('favorite-button');expect(html).not.toContain('role="timer"');expect(html).not.toContain('12:00');
 }
});
it('shows an honest unavailable state without inventing launch details',()=>{
 const html=renderToStaticMarkup(<LocaleProvider locale="en-GB"><LaunchSpotlight launch={null} locale="en-GB"/></LocaleProvider>);
 expect(html).toContain('Waiting for the next launch');expect(html).not.toContain('/launches/');
});

it('selects the earliest eligible source date without mutating the data',async()=>{
 const {nextSpotlightLaunch}=await import('../lib/launch-spotlight');
 const now=Date.parse('2026-10-28T12:00:00Z');
 const candidate=(id:string,net:string,status='Go')=>({id,net,status} as Launch);
 const launches=[candidate('late','2099-01-02T00:00:00Z'),candidate('held','2099-01-01T00:00:00Z','Hold'),candidate('past','2020-01-01T00:00:00Z'),candidate('invalid','bad'),candidate('ambiguous','2099-01-01T00:00:00'),candidate('finished','2099-01-01T00:00:00Z','Success'),candidate('next','2099-01-01T00:00:00Z','TBC')];
 expect(nextSpotlightLaunch(launches,now)?.id).toBe('next');expect(launches[0].id).toBe('late');expect(nextSpotlightLaunch([],now)).toBeNull();
});
it('shows four countdown units and retains uncertainty for minute and hour references',()=>{
 for(const id of [1,2]){
  const launch={id:'reference',name:'Mission',vehicle:'Rocket',net:'2099-01-01T12:00:00Z',status:'TBC',net_precision:{id}} as Launch;
  const html=renderToStaticMarkup(<LocaleProvider locale="en-GB"><LaunchSpotlight launch={launch} locale="en-GB"/></LocaleProvider>);
  expect(html.match(/<strong>/g)).toHaveLength(4);
  expect(html).toContain('data-warning-sign="true"');expect(html).toContain('Secs');
 }
});
