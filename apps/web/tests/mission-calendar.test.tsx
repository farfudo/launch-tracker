// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it } from "vitest";
import { MissionCalendar } from "../components/mission-calendar";
import { LocaleProvider } from "../components/locale-provider";
import type { LaunchDetail } from "../lib/api";

const launch = { id:"mission", name:"Mission", status:"Go", net:"2026-11-01T01:00:00Z", window_start:"2026-11-01T01:00:00Z", window_end:"2026-11-01T02:00:00Z" } as LaunchDetail;
beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; });
it("offers accessible links and a local ICS download without navigating externally", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(<LocaleProvider locale="en-GB"><MissionCalendar launch={launch} /></LocaleProvider>));
  expect(container.querySelector("summary")?.textContent).toBe("Add to calendar");
  expect(container.textContent).toContain("schedule changes will not update");
  expect(container.querySelector('a[target="_blank"]')?.getAttribute("rel")).toBe("noopener noreferrer");
  const download = container.querySelector("a[download]");
  expect(download?.getAttribute("download")).toBe("mission-mission.ics");
  expect(decodeURIComponent(download!.getAttribute("href")!)).toContain("BEGIN:VCALENDAR");
  await act(async () => root.unmount());
});
it("disables export with an explanation for an unconfirmed mission", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(<LocaleProvider locale="pt-PT"><MissionCalendar launch={{...launch,status:"TBC"}} /></LocaleProvider>));
  expect(container.querySelector("button")?.disabled).toBe(true);
  expect(container.textContent).toContain("Disponível apenas");
  expect(container.querySelector("a")).toBeNull();
  await act(async () => root.unmount());
});

it("explains why completed or cancelled missions cannot be exported", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  for (const status of ["Launch Successful", "Launch Failure", "Cancelled"]) {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><MissionCalendar launch={{...launch,status}} /></LocaleProvider>));
    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(container.textContent).toContain("completed or cancelled");
    expect(container.textContent).not.toContain("only for Go");
  }
  await act(async () => root.unmount());
});
