import { describe, expect, it } from "vitest";

import { formatLaunchStatus } from "../lib/launch";

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
