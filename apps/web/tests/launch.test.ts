import { describe, expect, it } from "vitest";

import { formatLaunchStatus } from "../lib/launch";

describe("formatLaunchStatus", () => {
  it("explains an uncertain launch date in Portuguese", () => {
    expect(formatLaunchStatus("TBD")).toBe("Data por definir");
  });
});
