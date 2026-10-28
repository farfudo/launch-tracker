import { describe, expect, it } from "vitest";
import { milestonesCopy, spaceMilestones } from "../lib/space-milestones";

describe("Space Milestones editorial timeline", () => {
  it("contains the four requested events in chronological order with verified civil dates", () => {
    expect(spaceMilestones.map(({ id, date }) => [id, date])).toEqual([
      ["sputnik-1", "1957-10-04"],
      ["vostok-1", "1961-04-12"],
      ["apollo-11", "1969-07-20"],
      ["falcon-9-landing", "2015-12-21"]
    ]);
    expect(spaceMilestones.every(({ date }) => /^\d{4}-\d{2}-\d{2}$/.test(date))).toBe(true);
  });

  it("localizes each milestone and its supporting text in all product languages", () => {
    for (const locale of ["pt-PT", "en-GB", "es-ES"] as const) {
      expect(milestonesCopy[locale].title.length).toBeGreaterThan(10);
      for (const milestone of spaceMilestones) {
        expect(milestone.title[locale].length).toBeGreaterThan(5);
        expect(milestone.description[locale].length).toBeGreaterThan(30);
        expect(milestone.whyItMatters[locale].length).toBeGreaterThan(20);
        expect(milestone.source.label[locale].length).toBeGreaterThan(3);
      }
    }
  });

  it("uses only verified, relevant links to existing learning content", () => {
    expect(spaceMilestones.map(({ id, related }) => [id, related?.href ?? null])).toEqual([
      ["sputnik-1", null],
      ["vostok-1", null],
      ["apollo-11", "/discoveries/artemis"],
      ["falcon-9-landing", "/discoveries#technology-lab"]
    ]);
    expect(spaceMilestones.every(({ source }) => new URL(source.url).protocol === "https:")).toBe(true);
  });
});
