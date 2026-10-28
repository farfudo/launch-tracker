// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it } from "vitest";
import { MissionCalendar } from "../components/mission-calendar";
import { LocaleProvider } from "../components/locale-provider";
import type { LaunchDetail } from "../lib/api";

const launch = { id:"mission", name:"Mission", status:"Go", net_precision:{id:0}, net:"2026-11-01T01:00:00Z", window_start:"2026-11-01T01:00:00Z", window_end:"2026-11-01T02:00:00Z" } as LaunchDetail;
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
it("exports an unconfirmed month as a tentative all-day reference with a warning", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><MissionCalendar launch={{...launch,status:"TBC",net_precision:{id:7}}} /></LocaleProvider>));
    expect(container.querySelector("summary")?.textContent).toBe("Adicionar ao calendário");
    expect(container.textContent).toContain("Evento provisório");
    expect(container.textContent).toContain("dia inteiro de referência");
    expect(container.textContent).toContain("alterações de horário não atualizam");
    const google = new URL(container.querySelector('a[target="_blank"]')!.getAttribute("href")!);
    expect(google.searchParams.get("dates")).toBe("20261101/20261102");
    const ics=decodeURIComponent(container.querySelector("a[download]")!.getAttribute("href")!);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261101");
    expect(ics).toContain("STATUS:TENTATIVE");
    expect(ics).not.toContain("DTSTART:20261101T");
  } finally { await act(async () => root.unmount()); }
});
it("disables export for an unusable reference date", async () => {
  const container=document.createElement("div");
  const root=createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><MissionCalendar launch={{...launch,status:"TBC",net:"invalid"}} /></LocaleProvider>));
    expect(container.querySelector("button")?.disabled).toBe(true);
    expect(container.textContent).toContain("data de referência utilizável");
    expect(container.querySelector("a")).toBeNull();
  } finally { await act(async () => root.unmount()); }
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
