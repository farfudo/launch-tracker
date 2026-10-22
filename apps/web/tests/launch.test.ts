import { describe, expect, it } from "vitest";

import { formatLaunchStatus, launchStatusTone } from "../lib/launch";

it("assigns consistent tones to provider statuses without depending on translations", () => {
  expect(launchStatusTone("Go for Launch")).toBe("positive");
  expect(launchStatusTone("Go")).toBe("positive");
  expect(launchStatusTone("To Be Confirmed")).toBe("pending");
  expect(launchStatusTone("TBC")).toBe("pending");
  expect(launchStatusTone("Launch Failure")).toBe("negative");
  expect(launchStatusTone("In Flight")).toBe("active");
  expect(launchStatusTone("New status")).toBe("neutral");
});

describe("formatLaunchStatus", () => {
  it("explains an uncertain launch date in Portuguese", () => {
    expect(formatLaunchStatus("TBD")).toBe("Data por definir");
  });

  it("localizes actual provider status names", () => {
    expect(formatLaunchStatus("Go for Launch", "es-ES")).toBe("Listo para el lanzamiento");
    expect(formatLaunchStatus("Go for Launch", "en-GB")).toBe("Go for launch");
    expect(formatLaunchStatus("To Be Determined", "en-GB")).toBe("Date to be determined");
  });

  it("preserves unknown provider statuses", () => {
    expect(formatLaunchStatus("Custom status", "es-ES")).toBe("Custom status");
  });
});
