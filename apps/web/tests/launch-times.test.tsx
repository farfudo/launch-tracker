// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "../components/locale-provider";
import { LaunchTimes } from "../components/launch-times";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let container: HTMLDivElement;
let root: Root | undefined;
let browserZone: string;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  browserZone = "Europe/Lisbon";
  const original = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (this: Intl.DateTimeFormat) {
    return { ...original.call(this), timeZone: browserZone };
  });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
});

describe("launch time references", () => {
  it("hydrates UTC and site times before detecting the visitor's zone", async () => {
    const content = <LocaleProvider locale="en-GB">
      <LaunchTimes precision={{id:0}} isoDate="2026-10-23T01:45:00Z" launchTimeZone="America/Los_Angeles" />
    </LocaleProvider>;
    const html = renderToString(content);
    expect(html).toContain("Detecting your time zone");
    expect(html).not.toContain("Europe/Lisbon");
    container.innerHTML = html;
    const hydrationError = vi.fn();
    await act(async () => {
      root = hydrateRoot(container, content, { onRecoverableError: hydrationError });
    });
    expect(hydrationError).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Europe/Lisbon");
    const times = [...container.querySelectorAll("time")].map((time) => time.textContent);
    expect(times).toHaveLength(3);
    expect(times[0]).toContain("23 Oct 2026");
    expect(times[0]).toContain("01:45");
    expect(times[1]).toContain("22 Oct 2026");
    expect(times[1]).toContain("18:45");
    expect(times[2]).toContain("02:45");

    browserZone = "Asia/Tokyo";
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    expect(container.textContent).toContain("Asia/Tokyo");
    expect(container.querySelectorAll("time")[2].textContent).toContain("10:45");
  });

  it("shows an explicit unknown site zone while still converting the visitor's time", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<LocaleProvider locale="es-ES">
        <LaunchTimes precision={{id:0}} isoDate="2026-10-23T01:45:00Z" launchTimeZone="Invalid/Location" />
      </LocaleProvider>);
    });
    expect(container.textContent).toContain("Zona horaria del lugar no disponible");
    expect(container.textContent).toContain("En tu zona horaria");
    expect(container.textContent).toContain("Europe/Lisbon");
    expect(container.querySelectorAll("time")).toHaveLength(2);
  });
});
