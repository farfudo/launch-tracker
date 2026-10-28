// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
const {refresh}=vi.hoisted(()=>({refresh:vi.fn()}));
const router={refresh};
vi.mock('next/navigation',()=>({useRouter:()=>router}));
import {SpotlightRollover} from '../components/spotlight-rollover';
it('refreshes once after the source NET and cleans up the timer',async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();vi.setSystemTime(new Date('2099-01-01T11:59:58Z'));
 const root=createRoot(document.createElement('div'));
 try{
  await act(async()=>root.render(<SpotlightRollover date="2099-01-01T12:00:00Z"/>));
  await act(async()=>vi.advanceTimersByTime(2000));expect(refresh).not.toHaveBeenCalled();
  await act(async()=>vi.advanceTimersByTime(1000));expect(refresh).toHaveBeenCalledTimes(1);
  await act(async()=>vi.advanceTimersByTime(60000));expect(refresh).toHaveBeenCalledTimes(1);
 }finally{await act(async()=>root.unmount());expect(vi.getTimerCount()).toBe(0);vi.useRealTimers();}
});
