// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DevelopmentBadge } from "../components/development-badge";
import { LocaleProvider } from "../components/locale-provider";
import { missionTitle } from "../lib/mission-title";

it.each([['pt-PT','Em desenvolvimento'],['en-GB','In development'],['es-ES','En desarrollo']] as const)("labels development in %s", (locale,label) => {
  expect(renderToStaticMarkup(<LocaleProvider locale={locale}><DevelopmentBadge /></LocaleProvider>)).toContain(label);
});
it.each([null, '', 'Unknown Payload', ' unknown ', 'TBD', 'To Be Determined'])("keeps identifying title for generic mission %s", mission_name => {
  expect(missionTitle({name:'Long March 8A | Unknown Payload',mission_name})).toBe('Long March 8A | Unknown Payload');
});
it("preserves genuine source mission names", () => {
  expect(missionTitle({name:'Falcon 9 | Starlink',mission_name:'Starlink'})).toBe('Starlink');
});
