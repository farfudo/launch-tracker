import { afterEach, expect, it, vi } from "vitest";
import { after } from "next/server";
vi.mock("next/cache", () => ({ unstable_cache: (fn: (...args: unknown[]) => unknown) => fn }));
vi.mock("next/server", () => ({ after: vi.fn() }));
import { CACHE_API_TIMEOUT_MS, CACHE_MAX_AGE_SECONDS, usableResult, getCachedCalendarData, getCachedLaunch, getCachedLaunches, getCachedStatus, InvalidApiDataError, CacheExpiredError } from "../lib/cached-api";
import { LaunchNotFoundError } from "../lib/api";

const item = { id: "mission", name: "Mission", status: "Go", net: "2099-01-01T12:00:00Z", source_updated_at: "2026-10-24T10:00:00Z", agency: null, vehicle: null, source_url: null, launch_timezone: null };
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

it("registers the existing read with the server lifecycle without fetching twice", async () => {
  let resolve!: (response: Response) => void;
  const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(done => { resolve = done; }));
  const timeout = vi.spyOn(AbortSignal, "timeout");
  const pending = getCachedStatus();
  expect(after).toHaveBeenCalledTimes(1);
  expect(timeout).toHaveBeenCalledWith(CACHE_API_TIMEOUT_MS);
  resolve(Response.json({source:"Fixture", cached_launches:1, last_updated_at:new Date().toISOString(), stale:false}));
  await pending;
  const callback = vi.mocked(after).mock.calls[0][0] as () => Promise<void>;
  await callback();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("settles the lifecycle task on failure without caching a success or logging raw data", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("private-body", "TimeoutError"));
  await expect(getCachedStatus()).rejects.toMatchObject({name:"TimeoutError"});
  const callback = vi.mocked(after).mock.calls[0][0] as () => Promise<void>;
  await expect(callback()).resolves.toBeUndefined();
  expect(warn.mock.calls.flat().join(" ")).toContain("category=timeout");
  expect(warn.mock.calls.flat().join(" ")).not.toContain("private-body");
});
it("rejects an expired snapshot at the six-hour boundary", () => {
  const now = Date.now();
  expect(() => usableResult({ value: [], cache: { checkedAt: new Date(now - CACHE_MAX_AGE_SECONDS * 1000).toISOString(), revalidateSeconds: 300 } }, now)).toThrow(CacheExpiredError);
  expect(usableResult({ value: [], cache: { checkedAt: new Date(now - 1000).toISOString(), revalidateSeconds: 300 } }, now).value).toEqual([]);
});
it("never converts malformed data into a successful empty list", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ error: "broken" }));
  await expect(getCachedLaunches()).rejects.toBeInstanceOf(InvalidApiDataError);
});
it("rejects malformed optional presentation fields instead of caching a rendering failure", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([{ ...item, image_credit: { bad: true } }]));
  await expect(getCachedLaunches()).rejects.toBeInstanceOf(InvalidApiDataError);
});
it("accepts a legitimate empty list", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([]));
  expect((await getCachedLaunches()).value).toEqual([]);
});
it("rechecks the clock so expired future launches are not featured as upcoming", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([{ ...item, net: "2020-01-01T00:00:00Z" }, item]));
  expect((await getCachedLaunches()).value.map(row => row.id)).toEqual(["mission"]);
});
it("keeps free-text searches authoritative rather than filtering an incomplete snapshot", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([item]));
  const result = await getCachedLaunches(100, { q: "science", agency: "NASA", period: "past" });
  const url = new URL(String(fetch.mock.calls[0][0]));
  expect(url.searchParams.get("q")).toBe("science");
  expect(url.searchParams.get("agency")).toBe("NASA");
  expect(result.cache.revalidateSeconds).toBe(0);
});
it("retains partial-filter failure handling", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async url => String(url).includes("filter-options") ? new Response("", { status: 503 }) : Response.json([item]));
  const result = await getCachedCalendarData();
  expect(result.hasLaunchData).toBe(true);
  expect(result.hasFilterOptions).toBe(false);
  expect(result.launches).toEqual([item]);
});
it("recomputes source freshness instead of trusting an old stale flag", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ source: "LL2", cached_launches: 1, last_updated_at: "2000-01-01T00:00:00Z", stale: false }));
  expect((await getCachedStatus()).value.stale).toBe(true);
});
it("distinguishes known 404 from temporary errors", async () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  fetch.mockResolvedValueOnce(new Response("", { status: 404 }));
  await expect(getCachedLaunch("missing")).rejects.toBeInstanceOf(LaunchNotFoundError);
  fetch.mockResolvedValueOnce(new Response("", { status: 503 }));
  await expect(getCachedLaunch("unavailable")).rejects.not.toBeInstanceOf(LaunchNotFoundError);
});
it("rejects malformed mission identifiers before any API access", async () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  await expect(getCachedLaunch("../secrets")).rejects.toBeInstanceOf(InvalidApiDataError);
  expect(fetch).not.toHaveBeenCalled();
});
