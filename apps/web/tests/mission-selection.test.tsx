// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import type { LaunchDetail } from "../lib/api";
import { LocaleProvider } from "../components/locale-provider";
import { MissionSelectionProvider, MissionDetailPanel, useMissionSelection } from "../components/mission-selection";

const initial: LaunchDetail = { id: "first", name: "First mission", status: "Go", net: "2099-01-01T12:00:00Z", agency: "Agency", vehicle: "Rocket", source_url: null, source_updated_at: "2026-10-22T12:00:00Z", launch_timezone: "UTC", mission_name: "First mission", mission_description: "First description", pad_name: null, location_name: null, window_start: null, window_end: null, image_url: null, image_credit: null, image_license: null, image_license_url: null, image_kind: null, image_title: null };
const second = {...initial, id: "second", name: "Second mission", mission_name: "Second mission", mission_description: "Second description"};
const third = {...initial, id: "third", name: "Third mission", mission_name: "Third mission", mission_description: "Third description"};
let root: Root;
let container: HTMLDivElement;
function Controls() { const selection = useMissionSelection()!; return <><button onClick={() => selection.select(second)}>Second</button><button onClick={() => selection.select(third)}>Third</button></>; }
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<LocaleProvider locale="en-GB"><MissionSelectionProvider initial={initial}><Controls /><MissionDetailPanel /></MissionSelectionProvider></LocaleProvider>));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const click = (name: string) => [...container.querySelectorAll("button")].find(button => button.textContent === name)!.click();
it("does not scroll when the panel heading is already visible", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({top:100,bottom:140} as DOMRect);
  const scroll = vi.fn(); container.querySelector<HTMLElement>("section")!.scrollIntoView = scroll;
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(second)));
  await act(async () => click("Second"));
  expect(scroll).not.toHaveBeenCalled();
});
it("reveals an offscreen heading immediately when reduced motion is requested", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const scroll = vi.fn(); container.querySelector<HTMLElement>("section")!.scrollIntoView = scroll;
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(second)));
  await act(async () => click("Second"));
  expect(scroll).toHaveBeenCalledWith({behavior:"auto",block:"start"});
});
it("initially shows the next mission and replaces it with the selected detail", async () => {
  expect(container.textContent).toContain("First description");
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(second)));
  await act(async () => click("Second"));
  expect(fetchMock.mock.calls[0][0]).toBe("/api/missions/second");
  expect(container.textContent).toContain("Second description");
  expect(container.querySelector(".pill-button")!.getAttribute("href")).toBe("/launches/second");
});
it("provides a full-page fallback and retries a failed detail request", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("{}", {status:502}));
  await act(async () => click("Second"));
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  expect(container.querySelector(".pill-button")!.getAttribute("href")).toBe("/launches/second");
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(second)));
  await act(async () => click("Try again"));
  expect(container.textContent).toContain("Second description");
});
it("ignores an older response when selections change quickly", async () => {
  let resolveSecond!: (response: Response) => void;
  let resolveThird!: (response: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementationOnce(() => new Promise(resolve => {resolveSecond = resolve;})).mockImplementationOnce(() => new Promise(resolve => {resolveThird = resolve;}));
  await act(async () => click("Second"));
  await act(async () => click("Third"));
  await act(async () => resolveThird(new Response(JSON.stringify(third))));
  await act(async () => resolveSecond(new Response(JSON.stringify(second))));
  expect(container.textContent).toContain("Third description");
  expect(container.textContent).not.toContain("Second description");
});
