// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { LoadingNotice } from "../components/loading-notice";
import { LocaleProvider } from "../components/locale-provider";

it("announces a prolonged wait after eight seconds and clears the timer on unmount", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><LoadingNotice /></LocaleProvider>));
    expect(container.querySelector('[role="status"]')?.textContent).toBe("");
    await act(async () => vi.advanceTimersByTime(8000));
    expect(container.textContent).toContain("pode estar a iniciar");
  } finally {
    await act(async () => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  }
});
