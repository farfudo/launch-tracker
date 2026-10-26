// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { TechnologyLab } from '../components/technology-lab';

async function setup(reduced=false) {
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia',()=>({matches:reduced,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  Object.defineProperty(document,'hidden',{configurable:true,value:false});
  const container=document.createElement('div');
  const root=createRoot(container);
  await act(async()=>root.render(<TechnologyLab locale="en-GB"/>));
  const click=async(selector:string)=>act(async()=>{(container.querySelector(selector) as HTMLButtonElement).click();});
  const stage=()=>container.querySelector('.technology-art')?.getAttribute('data-stage');
  return {container,root,click,stage};
}

it('explains the engine in stages and never transfers propellant before docking',async()=>{
  const {container,root,click,stage}=await setup();
  try {
    await click('.technology-action');
    expect(stage()).toBe('0');
    await act(async()=>vi.advanceTimersByTime(5000));
    expect(stage()).toBe('1');
    expect(container.querySelector('.technology-state')?.textContent).toContain('Preburners');
    await click('.technology-action');
    await act(async()=>vi.advanceTimersByTime(20000));
    expect(stage()).toBe('1');
    await click('.technology-next');
    expect(stage()).toBe('2');
    await click('.technology-next');
    expect(stage()).toBe('3');
    expect(container.querySelector('.technology-state')?.textContent).toContain('opposite direction');
    await click('.technology-picker button:nth-child(3)');
    expect(stage()).toBe('-1');
    expect(container.querySelectorAll('.docking-port')).toHaveLength(8);
    for(let n=0;n<3;n++) {
      await click('.technology-next');
      expect(container.querySelector('.docking-transfer')?.getAttribute('opacity')).toBe('0');
    }
    expect(stage()).toBe('2');
    await click('.technology-next');
    expect(container.querySelector('.docking-transfer')?.getAttribute('opacity')).toBe('1');
    expect(container.querySelector('.technology-state')?.textContent).toContain('Only after connection');
    await click('.technology-reset');
    expect(stage()).toBe('-1');
    await click('.technology-picker button:nth-child(2)');
    expect(container.querySelector('.technology-next')).toBeNull();
    await click('.technology-action');
    expect(container.querySelector('.technology-art')?.classList.contains('is-active')).toBe(true);
  } finally {await act(async()=>root.unmount());expect(vi.getTimerCount()).toBe(0);vi.useRealTimers();vi.unstubAllGlobals();}
});

it('uses manual stages with reduced motion and stops its timer when unmounted',async()=>{
  const {root,click,stage}=await setup(true);
  try {
    await click('.technology-action');
    expect(stage()).toBe('0');
    await act(async()=>vi.advanceTimersByTime(30000));
    expect(stage()).toBe('0');
    expect(vi.getTimerCount()).toBe(0);
    await click('.technology-action');
    expect(stage()).toBe('1');
  } finally {await act(async()=>root.unmount());expect(vi.getTimerCount()).toBe(0);vi.useRealTimers();vi.unstubAllGlobals();}
});
