// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { BoosterCatchPreview } from '../components/booster-catch-preview';

it('loops by seeking without reloading and resumes safely after leaving the viewport', async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  let time = 125;
  let intersect: (entries: { isIntersecting: boolean }[]) => void = () => {};
  let events: Record<string, (event: unknown) => void> = {};
  const p = { mute: vi.fn(), playVideo: vi.fn(), pauseVideo: vi.fn(), destroy: vi.fn(), setPlaybackRate: vi.fn(), getAvailablePlaybackRates: () => [1, 2], getCurrentTime: () => time, seekTo: vi.fn((t: number) => { time = t; }) };
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: typeof intersect) { intersect = cb; }
    observe() {} disconnect() {}
  });
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('YT', { Player: class {
    constructor(_element: HTMLElement, options: { playerVars: Record<string, unknown>; events: typeof events }) {
      expect(options.playerVars.end).toBeUndefined();
      events = options.events;
      return p;
    }
  } });
  const container = document.createElement('div');
  const root = createRoot(container);
  try {
    await act(async () => root.render(<BoosterCatchPreview locale="en-GB" />));
    await act(async () => { intersect([{ isIntersecting: true }]); events.onReady({ target: p }); events.onStateChange({ target: p, data: 1 }); });
    for (let n = 0; n < 3; n++) {
      time = 144.9;
      await act(async () => vi.advanceTimersByTime(100));
      expect(time).toBe(125);
    }
    expect(p.seekTo).toHaveBeenCalledTimes(3);
    intersect([{ isIntersecting: false }]);
    time = 145;
    await act(async () => vi.advanceTimersByTime(500));
    expect(time).toBe(145);
    intersect([{ isIntersecting: true }]);
    expect(time).toBe(125);
    await act(async () => events.onStateChange({ target: p, data: 0 }));
    expect(p.seekTo).toHaveBeenLastCalledWith(125, true);
    await act(async () => events.onAutoplayBlocked({}));
    expect(container.querySelector('button')?.disabled).toBe(false);
    await act(async () => root.unmount());
    expect(p.destroy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers(); vi.unstubAllGlobals();
  }
});
