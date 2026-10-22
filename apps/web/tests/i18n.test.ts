import { describe, expect, it } from "vitest";
import { dictionaries, isLocale, locales, resolveLocale } from "../lib/i18n";

describe("language preferences", () => {
  it("falls back safely for missing or unsupported cookies", () => {
    for (const value of [undefined, null, "", "fr-FR", "__proto__"]) {
      expect(resolveLocale(value)).toBe("pt-PT");
      expect(isLocale(value)).toBe(false);
    }
    expect(resolveLocale("es-ES")).toBe("es-ES");
  });

  it("provides every interface message in every supported language", () => {
    const keys = Object.keys(dictionaries["pt-PT"]).sort();
    for (const locale of locales) {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(keys);
      expect(Object.values(dictionaries[locale]).every((value) => value.trim())).toBe(true);
    }
  });
});
