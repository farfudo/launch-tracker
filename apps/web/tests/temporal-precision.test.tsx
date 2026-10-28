// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { formatTemporalDate, exactPrecision, precisionId, temporalCopy } from "../lib/temporal-precision";
import { LocalLaunchDate } from "../components/local-launch-date";
import { Countdown } from "../components/countdown";
import { LaunchTimes } from "../components/launch-times";
import { LocaleProvider } from "../components/locale-provider";
import { canExportCalendar } from "../lib/calendar";
import type { LaunchDetail } from "../lib/api";
const date="2026-10-25T00:30:59Z";
const mission={status:"Go",net:date,window_start:date,window_end:date} as LaunchDetail;

it("recognises all 17 source IDs, including zero, without inferring missing or new values", () => {
  for(let id=0;id<17;id++) {
    expect(precisionId({id})).toBe(id);
    expect(exactPrecision({id})).toBe(id===0);
    for(const locale of ["pt-PT","en-GB","es-ES"] as const) {
      const text=formatTemporalDate(date,{id},locale,"America/Los_Angeles");
      expect(text).not.toBe(temporalCopy[locale].unknown);
      if(id>=3) {
        expect(text).toBe(formatTemporalDate("2026-12-31T23:59:59Z",{id},locale,"Pacific/Kiritimati"));
        expect(text).not.toMatch(/2026|00:|23:/);
      }
    }
  }
  for(const precision of [null,undefined,{id:99},{id:-1},{id:0.5}]) expect(precisionId(precision)).toBeNull();
});
it("formats supported units only across midnight and DST; broad dates never shift", () => {
  expect(formatTemporalDate(date,{id:0},"en-GB","America/Los_Angeles")).toContain("17:30:59");
  expect(formatTemporalDate(date,{id:1},"en-GB","America/Los_Angeles")).toContain("17:30");
  expect(formatTemporalDate(date,{id:1},"en-GB")).not.toContain(":59");
  expect(formatTemporalDate(date,{id:2},"en-GB")).not.toMatch(/\d{2}:\d{2}/);
  expect(formatTemporalDate("2026-07-20T12:30:59Z",{id:0},"pt-PT","Europe/Lisbon")).toContain("13:30:59");
  expect(formatTemporalDate("2026-12-20T12:30:59Z",{id:0},"pt-PT","Europe/Lisbon")).toContain("12:30:59");
  expect(formatTemporalDate("invalid",{id:0},"en-GB")).toBe(temporalCopy["en-GB"].unknown);
  expect(formatTemporalDate("2026-10-27T00:00:00",{id:0},"en-GB")).toBe(temporalCopy["en-GB"].unknown);
});
it("gates exact calendar and countdown independently of Go and preserves terminal states", () => {
  for(const id of [null,...Array.from({length:17},(_,i)=>i),99]) {
    const precision=id===null?null:{id};
    expect(canExportCalendar({...mission,net_precision:precision})).toBe(true);
    const html=renderToStaticMarkup(<LocaleProvider locale="en-GB"><Countdown date="2099-01-01T00:00:00Z" status="Go" precision={precision}/></LocaleProvider>);
    expect(html).toContain('role="timer"');
    for(const status of ["Success","Failure","Cancelled","TBD","Hold","In Flight"]) {
      const html=renderToStaticMarkup(<LocaleProvider locale="en-GB"><Countdown date="2099-01-01T00:00:00Z" status={status} precision={precision}/></LocaleProvider>);
      expect(html.includes('role="timer"')).toBe(status === "TBD");
      expect(canExportCalendar({...mission,status,net_precision:precision})).toBe(["TBD","Hold"].includes(status));
    }
  }
});
it("keeps source uncertainty accessible and hides false instants for broad and legacy dates", () => {
  for(const locale of ["pt-PT","en-GB","es-ES"] as const) {
    for(const precision of [{id:5},{id:6},{id:7},{id:15},{id:16}]) {
      const html=renderToStaticMarkup(<LocaleProvider locale={locale}><LocalLaunchDate date="2000-01-01T00:00:00Z" status="TBC" precision={precision}/><LaunchTimes isoDate={date} precision={precision}/></LocaleProvider>);
      expect(html).not.toContain("<time");
      expect(html).toContain("date-uncertain");
      expect(html).not.toContain("2000");
      expect(html).not.toContain("2026");
    }
  }
});

it("shows a reference date once for missing precision and labels reference countdowns in all languages", () => {
  for (const locale of ["pt-PT", "en-GB", "es-ES"] as const) {
    const missing = renderToStaticMarkup(<LocaleProvider locale={locale}><LocalLaunchDate date={date} status="TBC" precision={null} /></LocaleProvider>);
    expect(missing).toContain("2026");
    expect(missing).toContain("UTC");
    expect(missing).not.toContain("date-uncertainty-note");
    for (const id of [0, 1, 2]) {
      const html = renderToStaticMarkup(<LocaleProvider locale={locale}><Countdown date="2099-01-01T00:00:00Z" status="Go" precision={{id}} /></LocaleProvider>);
      expect(html).toContain('role="timer"');
      expect((html.match(/<strong>/g) ?? []).length).toBe(4);
    }
    const html = renderToStaticMarkup(<LocaleProvider locale={locale}><Countdown date={date} status="Go" precision={null} /></LocaleProvider>);
    expect(html).toContain('role="timer"');
    expect((html.match(/<strong>/g) ?? []).length).toBe(4);
    expect(html).not.toContain("info-trigger");
    expect(html).not.toContain("countdown-heading");
  }
});

it("shows the supplied reference date without a fabricated clock on clean launch cards", () => {
  for (const locale of ["pt-PT","en-GB","es-ES"] as const) {
    for (const id of [3,4,5,6,7,8,9,10,11,12,13,14,15,16]) {
      const html=renderToStaticMarkup(<LocaleProvider locale={locale}><LocalLaunchDate date="2099-01-08T12:30:59Z" status="TBC" precision={{id}} showNotice={false}/></LocaleProvider>);
      expect(html).toContain("2099");
      expect(html).toContain("08");
      expect(html).not.toMatch(/12:30|date-uncertainty-note|<time/);
    }
  }
});
