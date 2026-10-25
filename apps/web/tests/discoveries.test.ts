import { expect, it } from "vitest";
import { discoveriesCopy, discoverySources, resolveTopic } from "../lib/discoveries";

it("keeps curated sources unique, official and available in all presentation languages", () => {
  expect(new Set(discoverySources.map(item => item.id)).size).toBe(discoverySources.length);
  for (const item of discoverySources) {
    const url = new URL(item.url);
    expect(url.protocol).toBe('https:');
    expect(['www.nasa.gov','www.spacex.com','www.blueorigin.com','www.esa.int']).toContain(url.hostname);
  }
  for (const locale of ['pt-PT','en-GB','es-ES'] as const) expect(discoveriesCopy[locale].summaries).toHaveLength(discoverySources.length);
  expect(resolveTopic('artemis')).toBe('artemis');
  expect(resolveTopic('unknown')).toBe('all');
});
