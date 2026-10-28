// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Countdown } from "../components/countdown";
import { LocalLaunchDate } from "../components/local-launch-date";
import { LocaleProvider } from "../components/locale-provider";

it("shows timing consistent with source status without inventing a date", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = async (status: string, date = "2099-01-01T12:00:00Z") => {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><Countdown precision={{id:0}} date={date} status={status}/><LocalLaunchDate precision={{id:0}} date={date} status={status}/></LocaleProvider>));
  };
  try {
    await render("Go");
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
    await render("Launch Successful");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    expect(container.textContent).not.toContain("to be confirmed");
    await render("Launch Failure");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    await render("Cancelled");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    await render("Launch in Flight");
    expect(container.textContent).toContain("In flight");
    await render("Hold");
    expect(container.textContent).toContain("On hold");
    await render("TBC");
    expect(container.textContent).toContain("Provisional date");
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
    expect(container.querySelector('.countdown-warning')).toBeNull();
    await render("TBD");
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
    expect(container.textContent).toContain("Provisional date");
    await render("Go", "invalid");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    expect(container.querySelector('time')).toBeNull();
  } finally { await act(async () => root.unmount()); }
});

it("updates seconds for a broad reference and stops when it passes", async () => {
  const { vi } = await import("vitest");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2099-01-01T11:59:58Z"));
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><Countdown precision={{id:7}} date="2099-01-01T12:00:00Z" status="TBC" /></LocaleProvider>));
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector(".countdown-heading")).toBeNull();
    expect(container.querySelectorAll('[role="timer"] strong')[3].textContent).toBe("02");
    await act(async () => vi.advanceTimersByTime(1000));
    expect(container.querySelectorAll('[role="timer"] strong')[3].textContent).toBe("01");
    await act(async () => vi.advanceTimersByTime(1000));
    expect(container.querySelector('[role="timer"]')).toBeNull();
    expect(container.textContent).toContain("to be confirmed");
  } finally { await act(async () => root.unmount()); vi.useRealTimers(); }
});

it("preserves source precision in the spotlight without changing list counters", async () => {
 const container=document.createElement('div');const root=createRoot(container);
 try {
  for(const [id,units] of [[0,4],[1,3],[2,2],[5,0],[7,0],[16,0]] as const){
   await act(async()=>root.render(<LocaleProvider locale="en-GB"><Countdown date="2099-01-01T12:00:00Z" status="TBC" precision={{id}} respectPrecision/></LocaleProvider>));
   expect(container.querySelectorAll('[role="timer"] strong')).toHaveLength(units);
  }
  await act(async()=>root.render(<LocaleProvider locale="en-GB"><Countdown date="2099-01-01T12:00:00Z" status="TBC" precision={{id:7}}/></LocaleProvider>));
  expect(container.querySelectorAll('[role="timer"] strong')).toHaveLength(4);
 } finally {await act(async()=>root.unmount());}
});
