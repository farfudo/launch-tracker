// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { CacheNotice } from "../components/cache-notice";
import { LocaleProvider } from "../components/locale-provider";
const { refresh, router } = vi.hoisted(() => { const refresh = vi.fn(); return { refresh, router: { refresh } }; });
vi.mock("next/navigation", () => ({ useRouter: () => router }));
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); refresh.mockClear(); });
it("collapses routine metadata but keeps stale warnings and retry outside", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div'); const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><CacheNotice compact autoRefresh={false} entries={[{checkedAt:new Date(Date.now()-360000).toISOString(), revalidateSeconds:300}]}><p>Source details</p></CacheNotice></LocaleProvider>));
    expect(container.querySelector('details')?.open).toBe(false);
    expect(container.querySelector('details')?.textContent).toContain('Source details');
    expect(container.querySelector('[role="status"]')?.closest('details')).toBeNull();
    expect(container.querySelector('[role="status"]')?.textContent).toContain('has not been confirmed');
    expect(container.querySelector('button')?.closest('details')).toBeNull();
  } finally { await act(async () => root.unmount()); }
});
it("bounds refresh attempts and preserves saved-data messaging", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  const container = document.createElement("div"); const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><CacheNotice entries={[{ checkedAt: new Date(Date.now() - 360000).toISOString(), revalidateSeconds: 300 }]} /></LocaleProvider>));
    expect(refresh).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTime(70000));
    expect(refresh).toHaveBeenCalledTimes(6);
    expect(container.textContent).toContain("has not been confirmed");
    expect(container.querySelector("button")?.textContent).toBe("Check again");
    await act(async () => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
  } finally { container.remove(); }
});
