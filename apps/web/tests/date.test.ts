import { describe, expect, it } from "vitest";

import { formatLaunchDate, isValidTimeZone } from "../lib/date";

describe("formatLaunchDate", () => {
  it("shows launch times in UTC", () => {
    expect(formatLaunchDate("2026-10-20T12:30:00Z")).toContain("UTC");
  });

  it("uses the launch date when applying daylight saving in Lisbon", () => {
    const summer = formatLaunchDate("2026-07-20T12:30:00Z", "pt-PT", "Europe/Lisbon");
    const winter = formatLaunchDate("2026-12-20T12:30:00Z", "pt-PT", "Europe/Lisbon");
    expect(summer).toContain("13:30");
    expect(winter).toContain("12:30");
  });

  it("converts the date as well as the time across midnight", () => {
    const result = formatLaunchDate("2026-10-23T01:45:00Z", "en-GB", "America/Los_Angeles");
    expect(result).toContain("22 Oct 2026");
    expect(result).toContain("18:45");
  });

  it("formats the calendar in the selected language", () => {
    expect(formatLaunchDate("2026-01-20T12:30:00Z", "es-ES")).toContain("ene");
    expect(formatLaunchDate("2026-01-20T12:30:00Z", "en-GB")).toContain("Jan");
  });

  it("rejects missing or invalid launch site zones instead of guessing one", () => {
    expect(isValidTimeZone(undefined)).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
    expect(isValidTimeZone(" ")).toBe(false);
    expect(isValidTimeZone("Unknown/Spaceport")).toBe(false);
    expect(isValidTimeZone("America/Los_Angeles")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });
});
