// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MissionStreams } from "../components/mission-streams";
import { LocaleProvider } from "../components/locale-provider";
import type { LaunchDetail } from "../lib/api";

const base = {net:"2020-01-01T00:00:00Z",source_updated_at:"2026-10-22T12:00:00Z"} as LaunchDetail;
function render(launch: LaunchDetail, compact = false) { return renderToStaticMarkup(<LocaleProvider locale="en-GB"><MissionStreams launch={launch} compact={compact} /></LocaleProvider>); }
it("does not invent a stream or live status when no video link was supplied", () => {
  expect(render(base, true)).toContain("Watch here");
  expect(render(base, true)).toContain('disabled=""');
  expect(render(base)).toContain("No video link supplied");
  expect(render(base)).not.toContain("<summary");
  expect(render(base)).toContain('href="/#launch-channels"');
});
it("starts collapsed and offers every stream in compact mode rather than opening the first", () => {
  const html = render({...base, id: "example", streams: [{url:"https://example.com/one"}, {url:"https://example.com/two"}]}, true);
  const container = document.createElement("div");
  container.innerHTML = html;
  const disclosure = container.querySelector("details")!;
  expect(disclosure.open).toBe(false);
  expect(disclosure.querySelector("summary")?.textContent).toContain("Watch here");
  expect(disclosure.querySelector("summary a")).toBeNull();
  expect(disclosure.querySelectorAll("li a")).toHaveLength(2);
});
it("rejects unsafe links and opens valid source links with attribution in a new tab", () => {
  const html = render({...base,streams:[{url:"javascript:alert(1)"},{url:"https://example.com/video",publisher:"Channel",live:false}]});
  expect(html).not.toContain("javascript:");
  expect(html).toContain('target="_blank"');
  expect(html).toContain("Channel");
  expect(html).toContain("Video link available");
  expect(html).not.toContain("Reported live");
});
it("labels live reports as cached source information and does not use the launch countdown", () => {
  expect(render({...base,streams:[{url:"https://example.com/live",live:true}]})).toContain("Reported live at last update");
  expect(render({...base,streams:[{url:"https://example.com/video",live:false,start_time:"2099-01-01T00:00:00Z"}]})).toContain("Scheduled at last update");
});

it("prioritizes attributed official coverage and only previews recognized YouTube video URLs", () => {
  const html = render({...base, streams: [
    {url:"https://www.youtube.com/live/abcdefghijk", publisher:"NASASpaceflight"},
    {url:"https://x.com/i/broadcasts/mission", publisher:"SpaceX"},
    {url:"https://youtube.com.example.org/watch?v=abcdefghijk"},
  ]});
  const container = document.createElement("div");
  container.innerHTML = html;
  const cards = container.querySelectorAll("li");
  expect(cards[0].textContent).toContain("Official source");
  expect(cards[1].textContent).toContain("Independent coverage");
  expect(cards[1].querySelector("img")?.getAttribute("src")).toBe("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg");
  expect(cards[2].querySelector("img")).toBeNull();
  expect(container.querySelector("iframe")).toBeNull();
});
