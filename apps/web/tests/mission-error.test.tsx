// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
const {refresh}=vi.hoisted(()=>({refresh:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({refresh}),useSearchParams:()=>new URLSearchParams({returnTo:"/?q=USSF#launch-calendar"})}));
import MissionError from '../app/launches/[id]/error';
import {LocaleProvider} from '../components/locale-provider';
it('requests fresh server data and offers a route back when a mission fails',async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const container=document.createElement('div');const root=createRoot(container);const reset=vi.fn();
 try {
  await act(async()=>root.render(<LocaleProvider locale="pt-PT"><MissionError reset={reset}/></LocaleProvider>));
  expect(container.querySelector('h1')?.textContent).toContain('esta missão');
  expect(container.querySelector('a')?.getAttribute('href')).toBe('/?q=USSF#launch-calendar');
  await act(async()=>container.querySelector('button')!.click());
  expect(refresh).toHaveBeenCalledOnce();expect(reset).toHaveBeenCalledOnce();
 } finally {await act(async()=>root.unmount());}
});
