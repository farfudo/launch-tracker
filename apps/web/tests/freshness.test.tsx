// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { missionFreshness, globalFreshnessConfirmed, freshnessCopy } from "../lib/freshness";
import { MissionFreshness } from "../components/mission-freshness";
import { LocaleProvider } from "../components/locale-provider";
import type { Launch } from "../lib/api";
const now = Date.parse("2026-10-27T14:00:00Z");
const old = { status: "Go", source_updated_at: "2026-10-26T10:00:00Z", net: "2026-10-28T10:00:00Z" } as Launch;
afterEach(() => vi.useRealTimers());
it("uses the mission observation, never a fresh global import or UI refresh", () => {
  expect(missionFreshness(old, now)).toBe("stale");
  expect(globalFreshnessConfirmed({ checkedAt: new Date(now).toISOString(), revalidateSeconds: 300 }, now)).toBe(true);
  expect(missionFreshness({ ...old, frontend_cache: { checkedAt: new Date(now).toISOString(), revalidateSeconds: 300 } } as Launch, now)).toBe("stale");
  expect(missionFreshness(old, now + 60000)).toBe("stale");
  expect(missionFreshness({ ...old, source_updated_at: new Date(now - 3600000).toISOString() }, now)).toBe("recent");
  expect(missionFreshness({ ...old, source_updated_at: new Date(now - 21600000).toISOString() }, now)).toBe("stale");
});
it("distinguishes terminal history from unresolved past missions and missing times", () => {
  expect(missionFreshness({ ...old, status: "Launch Successful" }, now)).toBe("historical");
  expect(missionFreshness({ ...old, net: "2020-01-01T00:00:00Z" } as Launch, now)).toBe("stale");
  for (const date of ["invalid", new Date(now + 60000).toISOString()]) expect(missionFreshness({ ...old, source_updated_at: date }, now)).toBe("unknown");
});
it("does not certify missing, failed or overdue global snapshots", () => {
  for (const cache of [null, undefined, { checkedAt: "invalid", revalidateSeconds: 300 }, { checkedAt: new Date(now - 300000).toISOString(), revalidateSeconds: 300 }]) expect(globalFreshnessConfirmed(cache, now)).toBe(false);
});
it("renders observation and explicit supplier limitation in all languages; rerender cannot renew it", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers(); vi.setSystemTime(now);
  const container = document.createElement("div"); const root = createRoot(container);
  try {
    for (const locale of ["pt-PT", "en-GB", "es-ES"] as const) {
      await act(async () => root.render(<LocaleProvider locale={locale}><MissionFreshness launch={old} /></LocaleProvider>));
      expect(container.querySelector("time")?.dateTime).toBe(old.source_updated_at);
      expect(container.querySelector('[role="status"]')?.textContent).toBe(freshnessCopy[locale].stale);
      expect(container.textContent).toContain(freshnessCopy[locale].provider);
    }
    await act(async () => { vi.advanceTimersByTime(60000); });
    expect(container.querySelector('aside')?.dataset.freshness).toBe("stale");
    await act(async () => root.render(<LocaleProvider locale="en-GB"><MissionFreshness launch={{...old,status:"Launch Successful"}} /></LocaleProvider>));
    expect(container.textContent).toContain(freshnessCopy["en-GB"].historical);
  } finally { await act(async () => root.unmount()); }
});
