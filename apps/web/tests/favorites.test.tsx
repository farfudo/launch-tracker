// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteButton, FavoriteLaunchList } from "../components/favorites";
import { LocaleProvider } from "../components/locale-provider";
import { FAVORITES_KEY, parseFavorites, toggleFavorite } from "../lib/favorites";
import type { Launch } from "../lib/api";

const launch: Launch = { id: "falcon", name: "Falcon | Example", net: "2099-01-01T12:00:00Z", status: "Go for Launch", agency: "SpaceX", vehicle: "Falcon", source_url: null, source_updated_at: "2026-10-22T12:00:00Z", launch_timezone: "UTC" };
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
const button = () => container.querySelector("button")!;
const renderButton = async () => act(async () => root.render(<LocaleProvider locale="pt-PT"><FavoriteButton id="falcon" name="Example" /></LocaleProvider>));

describe("browser favorites", () => {
  it("ignores malformed storage and deduplicates valid identifiers", () => {
    expect(parseFavorites("broken")).toEqual([]);
    expect(parseFavorites('{"id":"falcon"}')).toEqual([]);
    expect(parseFavorites('["falcon","falcon",null,42,""]')).toEqual(["falcon"]);
  });
  it("saves, restores after remount and removes a favorite", async () => {
    await renderButton();
    await act(async () => button().click());
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(parseFavorites(localStorage.getItem(FAVORITES_KEY))).toEqual(["falcon"]);
    await act(async () => root.unmount());
    root = createRoot(container);
    await renderButton();
    expect(button().getAttribute("aria-pressed")).toBe("true");
    await act(async () => button().click());
    expect(parseFavorites(localStorage.getItem(FAVORITES_KEY))).toEqual([]);
  });
  it("reports blocked writes without falsely selecting the launch", async () => {
    await renderButton();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    await act(async () => button().click());
    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Não foi possível");
  });
  it("responds to another tab changing favorites", async () => {
    await renderButton();
    await act(async () => {
      localStorage.setItem(FAVORITES_KEY, '["falcon"]');
      window.dispatchEvent(new StorageEvent("storage", { key: FAVORITES_KEY }));
    });
    expect(button().getAttribute("aria-pressed")).toBe("true");
  });
  it("filters locally and removes a card immediately when unstarred", async () => {
    toggleFavorite("falcon");
    await act(async () => root.render(<LocaleProvider locale="en-GB"><FavoriteLaunchList launches={[launch]} favoritesOnly emptyCache={false} /></LocaleProvider>));
    expect(container.querySelector("h3")?.textContent).toBe(launch.name);
    expect(container.querySelector("a button")).toBeNull();
    await act(async () => button().click());
    expect(container.querySelector("h3")?.textContent).toBe("No favorites yet");
  });
  it("distinguishes saved launches excluded by the current results", async () => {
    toggleFavorite("elsewhere");
    await act(async () => root.render(<LocaleProvider locale="es-ES"><FavoriteLaunchList launches={[launch]} favoritesOnly emptyCache={false} /></LocaleProvider>));
    expect(container.querySelector("h3")?.textContent).toContain("No hay favoritos disponibles");
  });
});
