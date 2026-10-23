// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MissionShare, missionShareUrl } from "../components/mission-share";
import { LocaleProvider } from "../components/locale-provider";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const writeText = vi.fn();
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  writeText.mockReset().mockResolvedValue(undefined);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });
const render = async () => act(async () => root.render(<LocaleProvider locale="pt-PT"><MissionShare id="mission-1" name="Example mission" /></LocaleProvider>));
const click = async (index = 0) => act(async () => container.querySelectorAll("button")[index].click());

it("builds a mission URL without filters or preview parameters", () => {
  expect(missionShareUrl("a/b?c", "https://example.com")).toBe("https://example.com/launches/a%2Fb%3Fc");
});
it("copies the mission URL when native sharing is unavailable", async () => {
  await render(); await click();
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/launches/mission-1`);
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Ligação copiada");
});
it("uses native sharing without silently copying", async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  await render(); await click();
  expect(share).toHaveBeenCalledWith({ title: "Example mission", url: `${window.location.origin}/launches/mission-1` });
  expect(writeText).not.toHaveBeenCalled();
});
it("cancellation is not an error and does not copy anything", async () => {
  Object.defineProperty(navigator, "share", { configurable: true, value: vi.fn().mockRejectedValue(new DOMException("cancel", "AbortError")) });
  await render(); await click();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(writeText).not.toHaveBeenCalled();
});
it("offers manual selection if clipboard access is denied", async () => {
  writeText.mockRejectedValue(new Error("denied"));
  await render(); await click(1);
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  expect(container.querySelector("input")?.value).toBe(`${window.location.origin}/launches/mission-1`);
  expect(container.querySelector("input")?.readOnly).toBe(true);
});
it("explicit copy works even when native sharing is available", async () => {
  const share = vi.fn(); Object.defineProperty(navigator, "share", { configurable: true, value: share });
  await render(); await click(1);
  expect(share).not.toHaveBeenCalled(); expect(writeText).toHaveBeenCalledTimes(1);
});
it("blocks repeated actions and displays the orbital loader while waiting", async () => {
  let finish!: () => void; writeText.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  await render(); await click(1); await click(1);
  expect(writeText).toHaveBeenCalledTimes(1);
  expect([...container.querySelectorAll("button")].every(button => button.disabled)).toBe(true);
  expect(container.querySelector(".rocket-loader-orbit")).not.toBeNull();
  await act(async () => finish());
  expect(container.querySelector(".rocket-loader")).toBeNull();
});
