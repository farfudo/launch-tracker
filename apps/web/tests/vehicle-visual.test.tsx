// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VehicleVisual } from "../components/vehicle-visual";
import { LocaleProvider } from "../components/locale-provider";
import type { LaunchDetail } from "../lib/api";

const launch: LaunchDetail = {
  id: "visual-example", name: "Falcon 9 | Example", status: "Go", net: "2099-01-01T12:00:00Z",
  agency: "SpaceX", vehicle: "Falcon 9", source_url: null, source_updated_at: "2026-10-22T12:00:00Z",
  launch_timezone: "America/Los_Angeles", mission_name: null, mission_description: null,
  location_name: null, pad_name: null, window_start: null, window_end: null,
  image_url: "https://images.example.com/falcon.jpg", image_credit: "SpaceX",
  image_license: "CC BY-NC 2.0", image_license_url: "https://creativecommons.org/licenses/by-nc/2.0/",
  image_title: "Falcon 9 liftoff", image_kind: "vehicle"
};

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("vehicle visual", () => {
  it("shows the correct image, credit, licence and reference caption", async () => {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><VehicleVisual launch={launch} /></LocaleProvider>));
    expect(container.querySelector("img")?.getAttribute("src")).toBe(launch.image_url);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("Falcon 9 liftoff");
    expect(container.querySelector("figcaption")?.textContent).toContain("SpaceX");
    expect(container.querySelector("figcaption a")?.getAttribute("href")).toBe(launch.image_license_url);
    expect(container.textContent).toContain("another mission using the same vehicle");
  });

  it("shows an illustration if the remote photo fails to load", async () => {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><VehicleVisual launch={launch} /></LocaleProvider>));
    await act(async () => container.querySelector("img")!.dispatchEvent(new Event("error")));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".rocket-art")).not.toBeNull();
    expect(container.textContent).toContain("ilustração temática");
  });

  it("never renders unsafe image or attribution URLs", async () => {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><VehicleVisual launch={{
      ...launch, image_url: "javascript:alert(1)", image_license_url: "javascript:alert(1)"
    }} /></LocaleProvider>));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
  });
});
