"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import { dictionaries, type Locale } from "../lib/i18n";
import { isValidTimeZone } from "../lib/date";

const LocaleContext = createContext<{ locale: Locale; viewerTimeZone: string | null }>({
  locale: "pt-PT", viewerTimeZone: null
});

function subscribeToBrowserSettings(onChange: () => void) {
  window.addEventListener("focus", onChange);
  return () => window.removeEventListener("focus", onChange);
}

function getBrowserTimeZone() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(zone) ? zone : "UTC";
}

function getServerTimeZone(): null {
  return null;
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const viewerTimeZone = useSyncExternalStore<string | null>(
    subscribeToBrowserSettings, getBrowserTimeZone, getServerTimeZone
  );

  return <LocaleContext.Provider value={{ locale, viewerTimeZone }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  return { ...context, messages: dictionaries[context.locale] };
}
