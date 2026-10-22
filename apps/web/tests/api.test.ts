import { afterEach, describe, expect, it, vi } from "vitest";
import { API_TIMEOUT_MS, getDataStatus, getFilterOptions, getLaunch, getUpcomingLaunches } from "../lib/api";

afterEach(() => vi.restoreAllMocks());

describe("bounded API requests", () => {
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
