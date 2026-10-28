// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Countdown } from "../components/countdown";
import { LocaleProvider } from "../components/locale-provider";

it("shows the full countdown with seconds and cleans up its timer", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers(); vi.setSystemTime(new Date('2098-12-30T12:00:00Z'));
  const container = document.createElement('div');
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><Countdown precision={{id:0}} date="2099-01-01T12:00:00Z" status="Go" compact /></LocaleProvider>));
    expect(container.querySelectorAll('.countdown strong')).toHaveLength(4);
    expect(container.textContent).not.toContain('≈');
    expect(container.querySelectorAll('.countdown strong')[3].textContent).toBe('00');
    await act(async () => vi.advanceTimersByTime(1000));
    expect(container.querySelectorAll('.countdown strong')[3].textContent).toBe('59');
    expect(container.querySelector('[role="timer"]')?.getAttribute('aria-live')).toBe('off');
    await act(async () => vi.advanceTimersByTime(2 * 86400000 - 1000));
    expect(container.querySelector('.countdown-compact')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  }
});
