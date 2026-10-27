import { expect, it } from "vitest";
import type { LaunchDetail } from "../lib/api";
import { calendarEvent, canExportCalendar } from "../lib/calendar";

const launch = { id: "real-id", name: "Mission, one; test", status: "Go", net_precision: {id:0}, net: "2026-11-01T02:30:00+01:00", window_start: "2026-11-01T01:00:00Z", window_end: "2026-11-01T02:00:00Z", pad_name: "Pad", location_name: "Site" } as LaunchDetail;
it("rejects unconfirmed, invalid, missing and inconsistent schedules", () => {
  expect(canExportCalendar(launch)).toBe(true);
  for (const patch of [{status:"TBD"},{status:"TBC"},{status:"Hold"},{status:"Success"},{net:"invalid"},{net:"2026-11-01T01:30:00"},{window_start:null},{window_end:null},{window_end:"2026-10-01T00:00:00Z"}]) {
    expect(calendarEvent({...launch,...patch}, "https://example.com", "Notice")).toBeNull();
  }
});
it("exports UTC, stable UID, mission URL and no invented duration", () => {
  const event = calendarEvent(launch,"https://example.com","No automatic updates",new Date("2026-10-22T00:00:00Z"))!;
  expect(event.ics).toContain("DTSTART:20261101T013000Z\r\n");
  expect(event.ics).toContain("UID:real-id@nextrocketlaunch");
  expect(event.ics).toContain("SUMMARY:Mission\\, one\\; test");
  expect(event.ics).toContain("URL:https://example.com/launches/real-id");
  expect(event.ics).not.toMatch(/DTEND|DURATION|VALARM/);
  const google = new URL(event.google);
  expect(google.origin).toBe("https://calendar.google.com");
  expect(google.searchParams.get("dates")).toBe("20261101T013000Z/20261101T013000Z");
  expect(google.searchParams.get("details")).toContain("No automatic updates");
});
it("escapes injected content lines and folds UTF-8 without breaking characters", () => {
  const event = calendarEvent({...launch,name:"🚀á".repeat(80)+"\r\nBEGIN:VALARM"},"https://example.com","Notice")!;
  expect(event.ics).not.toContain("\r\nBEGIN:VALARM");
  expect(event.ics).toContain("\\nBEGIN:VALARM");
  for (const line of event.ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect(event.ics).not.toContain("�");
});
