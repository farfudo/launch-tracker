// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { LocalLaunchDate } from "../components/local-launch-date";
import { LocaleProvider } from "../components/locale-provider";
import { uncertainLaunchDate } from "../lib/launch";

it("marks estimated dates explicitly without hiding the source estimate", () => {
  for (const status of ['TBD','To Be Determined','TBC','To Be Confirmed','Hold']) {
    expect(uncertainLaunchDate(status)).toBe(true);
    const html = renderToStaticMarkup(<LocaleProvider locale="en-GB"><LocalLaunchDate date="2099-01-01T12:00:00Z" status={status} /></LocaleProvider>);
    expect(html).toContain('Provisional date');
    expect(html).toContain('date-uncertain');
    expect(html).toContain('2099');
  }
  for (const status of ['Go', 'Launch Successful', 'Failure']) expect(uncertainLaunchDate(status)).toBe(false);
});
