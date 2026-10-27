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
    await act(async () => root.render(<LocaleProvider locale="en-GB"><Countdown date={date} status={status}/><LocalLaunchDate date={date} status={status}/></LocaleProvider>));
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
    await render("TBD");
    expect(container.textContent).toContain("Launch date to be determined");
    expect(container.textContent).toContain("Provisional date");
    await render("Go", "invalid");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    expect(container.querySelector('time')).toBeNull();
  } finally { await act(async () => root.unmount()); }
});
