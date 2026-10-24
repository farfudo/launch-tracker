// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MissionSources } from "../components/mission-sources";
import { LocaleProvider } from "../components/locale-provider";
import type { LaunchDetail } from "../lib/api";

it("groups safe links, keeps legacy mission links, deduplicates and explains missing sources", () => {
  const launch = { mission_links: [
    {kind:"agency",url:"https://example.com/agency",title:"Agency website"},
    {kind:"agency",url:"https://example.com/agency",title:"Duplicate"},
    {kind:"vehicle",url:"javascript:bad"},
    {url:"https://example.com/mission",title:"Legacy mission"},
  ] } as LaunchDetail;
  const html = renderToStaticMarkup(<LocaleProvider locale="en-GB"><MissionSources launch={launch} /></LocaleProvider>);
  const container = document.createElement("div"); container.innerHTML = html;
  expect(container.querySelectorAll("a")).toHaveLength(2);
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("Duplicate");
  expect(html).toContain("Legacy mission");
  expect(html).toContain("No link supplied");
  expect(html).toContain("do not guarantee official status");
  expect(container.querySelector("a")?.rel).toBe("noopener noreferrer");
});

it("renders missing source states in Portuguese without fabricating links", () => {
  const html = renderToStaticMarkup(<LocaleProvider locale="pt-PT"><MissionSources launch={{} as LaunchDetail} /></LocaleProvider>);
  expect(html).toContain("Explorar fontes");
  expect(html).toContain("Ligação não disponibilizada");
  expect(html).not.toContain("href=");
});
