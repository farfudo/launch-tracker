// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

let root: Root;
let container: HTMLDivElement;
let dark = false;
let mediaEvents: EventTarget;
beforeEach(() => {
  vi.resetModules();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  dark = false;
  mediaEvents = new EventTarget();
  vi.stubGlobal("matchMedia", () => ({ get matches() { return dark; }, addEventListener: mediaEvents.addEventListener.bind(mediaEvents), removeEventListener: mediaEvents.removeEventListener.bind(mediaEvents) }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function render() {
  const { ThemeToggle } = await import("../components/theme-toggle");
  const { LocaleProvider } = await import("../components/locale-provider");
  await act(async () => root.render(<LocaleProvider locale="en-GB"><ThemeToggle /></LocaleProvider>));
}
it("defaults to light even on a dark system and allows an explicit dark preference", async () => {
  dark = true;
  await render();
  expect(document.documentElement.dataset.theme).toBe("light");
  await act(async () => container.querySelector("button")!.click());
  expect(localStorage.getItem("nextrocketlaunch-theme")).toBe("dark");
  await act(async () => mediaEvents.dispatchEvent(new Event("change")));
  expect(document.documentElement.dataset.theme).toBe("dark");
});
it("preserves a saved dark preference on arrival", async () => {
  localStorage.setItem("nextrocketlaunch-theme", "dark");
  await render();
  expect(document.documentElement.dataset.theme).toBe("dark");
});
it("keeps the toggle usable when browser storage is blocked", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  await render();
  await act(async () => container.querySelector("button")!.click());
  expect(container.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector('[role="status"]')!.textContent).toContain("could not save");
});
it("reflects a preference changed in another tab", async () => {
  await render();
  await act(async () => { localStorage.setItem("nextrocketlaunch-theme", "dark"); window.dispatchEvent(new StorageEvent("storage", {key: "nextrocketlaunch-theme"})); });
  expect(container.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
});
