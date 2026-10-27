import { describe, expect, it } from "vitest";
import { relatedMission } from "../lib/related-missions";
import type { Launch } from "../lib/api";

const launch = (id: string, name: string, vehicle: string | null) => ({id, name, vehicle} as Launch);
describe("related missions", () => {
  const launches = [launch("1", "Starlink", "Falcon 9 Block 5"), launch("2", "Artemis II", "SLS"), launch("3", "Test flight", "Starship / Super Heavy")];
  it("links only explicitly matching vehicles and missions", () => {
    expect(relatedMission(launches, "reusable")?.id).toBe("1");
    expect(relatedMission(launches, "artemis")?.id).toBe("2");
    expect(relatedMission(launches, "starship")?.id).toBe("3");
  });
  it("does not infer links from unrelated names or absent data", () => {
    const unrelated = [launch("4", "Future Starship payload", "Other")];
    expect(relatedMission(unrelated, "starship")).toBeUndefined();
    expect(relatedMission(unrelated, "artemis")).toBeUndefined();
    expect(relatedMission([], "reusable")).toBeUndefined();
  });
});
