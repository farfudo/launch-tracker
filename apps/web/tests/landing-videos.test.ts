import { expect, it } from "vitest";
import { landingCopy, landingEmbedUrl, landingVideos } from "../lib/landing-videos";

it("uses bounded excerpts from four original publishers with no automatic playback", () => {
  expect(new Set(landingVideos.map(video => video.id)).size).toBe(4);
  for (const video of landingVideos) {
    expect(video.videoId).toMatch(/^[\w-]{11}$/);
    expect(video.start).toBeGreaterThanOrEqual(0);
    expect(video.end-video.start).toBeGreaterThan(0);
    expect(video.end-video.start).toBeLessThanOrEqual(65);
    const url = new URL(landingEmbedUrl(video));
    expect(url.hostname).toBe("www.youtube-nocookie.com");
    expect(url.searchParams.get("autoplay")).toBe("0");
    expect(url.searchParams.get("end")).toBe(String(video.end));
  }
  for (const locale of ["pt-PT","en-GB","es-ES"] as const) expect(landingCopy[locale].context).toHaveLength(4);
});
