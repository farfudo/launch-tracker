import { afterEach, describe, expect, it, vi } from "vitest";
import { API_TIMEOUT_MS, getCalendarData, LaunchNotFoundError, getDataStatus, getFilterOptions, getLaunch, getUpcomingLaunches } from "../lib/api";

afterEach(() => vi.restoreAllMocks());

describe("bounded API requests", () => {
  it("sends the period with search and agency filters", async () => {
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([]));
    await getUpcomingLaunches(100, { period: "past", q: "mission", agency: "NASA" });
    const url = new URL(String(request.mock.calls[0][0]));
    expect(Object.fromEntries(url.searchParams)).toEqual({ limit: "100", period: "past", q: "mission", agency: "NASA" });
  });
  it("preserves launches when filter options fail", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async url =>
      String(url).includes("filter-options") ? new Response("", { status: 503 }) : Response.json([{ id: "mission" }]));
    const data = await getCalendarData();
    expect(data.launches).toEqual([{ id: "mission" }]);
    expect(data.hasLaunchData).toBe(true);
    expect(data.hasFilterOptions).toBe(false);
  });
  it("preserves filter options when launches fail", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async url =>
      String(url).includes("filter-options") ? Response.json({ agencies: ["SpaceX"], vehicles: [] }) : new Response("", { status: 503 }));
    const data = await getCalendarData();
    expect(data.hasLaunchData).toBe(false);
    expect(data.filterOptions.agencies).toEqual(["SpaceX"]);
  });
  it("distinguishes a missing mission from an unavailable service", async () => {
    const request = vi.spyOn(globalThis, "fetch");
    request.mockResolvedValueOnce(new Response("", { status: 404 }));
    await expect(getLaunch("missing")).rejects.toBeInstanceOf(LaunchNotFoundError);
    request.mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(getLaunch("unavailable")).rejects.not.toBeInstanceOf(LaunchNotFoundError);
  });
  it("applies a timeout and no-store to every endpoint", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    for (const call of [() => getDataStatus(), () => getFilterOptions(), () => getLaunch("example"), () => getUpcomingLaunches()]) {
      fetchMock.mockResolvedValueOnce(new Response("{}"));
      await call();
    }
    expect(timeout.mock.calls).toEqual(Array(4).fill([API_TIMEOUT_MS]));
    for (const [, options] of fetchMock.mock.calls) {
      expect(options?.cache).toBe("no-store");
      expect(options?.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("propagates a timeout without retrying automatically", async () => {
    const error = new DOMException("Timed out", "TimeoutError");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(error);
    await expect(getLaunch("example")).rejects.toBe(error);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
