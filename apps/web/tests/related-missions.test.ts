import { describe, expect, it } from "vitest";
import { isLaunchRelatedToTopic, relatedLaunches, relatedTopicsForLaunch } from "../lib/related-missions";
import { relatedLaunchCopy } from "../lib/related-missions-copy";
import type { Launch } from "../lib/api";

const launch = (id: string, name: string, vehicle: string | null) => ({ id, name, vehicle } as Launch);

describe("explicit education-to-launch associations", () => {
  it("matches only reviewed vehicle metadata and named Artemis missions", () => {
    expect(isLaunchRelatedToTopic(launch("falcon", "Starlink Group", "Falcon 9 Block 5"), "reuse")).toBe(true);
    expect(isLaunchRelatedToTopic(launch("new-glenn", "NG-1", "New Glenn"), "reuse")).toBe(true);
    expect(isLaunchRelatedToTopic(launch("starship", "Flight test", "Starship / Super Heavy"), "starship")).toBe(true);
    expect(isLaunchRelatedToTopic(launch("artemis", "Artemis II", "SLS"), "artemis")).toBe(true);
  });

  it("does not infer an association from generic words or partial names", () => {
    const unrelated = launch("unrelated", "Future Starship payload", "Other vehicle");
    expect(relatedTopicsForLaunch(unrelated)).toEqual([]);
    expect(isLaunchRelatedToTopic(launch("falcon", "Falcon 9 payload", "Other vehicle"), "reuse")).toBe(false);
    expect(isLaunchRelatedToTopic(launch("artemis", "The Artemis II mission", "SLS"), "artemis")).toBe(false);
    expect(relatedLaunches([unrelated], ["starship", "reuse"])).toEqual([]);
  });

  it("uses stable launch IDs, keeps API order and deduplicates missions across topics", () => {
    const first = launch("launch-1", "Flight test", "Starship / Super Heavy");
    const second = launch("launch-2", "Starlink Group", "Falcon 9 Block 5");
    const extraFalcon = launch("launch-3", "Another Starlink Group", "Falcon 9");
    const matches = relatedLaunches([second, extraFalcon, first], ["reuse", "starship"]);

    expect(matches.map(item => item.launch.id)).toEqual(["launch-2", "launch-1"]);
    expect(matches[1].topics).toEqual(["starship"]);
    expect(relatedLaunches([first, second], ["starship", "reuse"])[0].topics).toEqual(["starship", "reuse"]);
    expect(relatedTopicsForLaunch(second)).toEqual(["reuse"]);
  });

  it("returns contextual education topics for mission details only on verified metadata", () => {
    expect(relatedTopicsForLaunch(launch("1", "Artemis III", "SLS"))).toEqual(["artemis"]);
    expect(relatedTopicsForLaunch(launch("2", "Starlink", "Falcon 9"))).toEqual(["reuse"]);
    expect(relatedTopicsForLaunch(launch("3", "Starship Flight", "Starship"))).toEqual(["starship", "reuse"]);
  });

  it("provides accessible loading, error and navigation labels in PT/EN/ES", () => {
    for (const locale of ["pt-PT", "en-GB", "es-ES"] as const) {
      const copy = relatedLaunchCopy[locale];
      expect(copy.heading.trim()).toBeTruthy();
      expect(copy.loading.trim()).toBeTruthy();
      expect(copy.error.trim()).toBeTruthy();
      expect(copy.detail.trim()).toBeTruthy();
      expect(Object.values(copy.learning).every(value => value.trim())).toBe(true);
    }
  });
});
