import { describe, expect, it } from "vitest";

import { formatLaunchDate } from "../lib/date";

describe("formatLaunchDate", () => {
  it("shows launch times in UTC", () => {
    expect(formatLaunchDate("2026-10-20T12:30:00Z")).toContain("UTC");
  });
});
