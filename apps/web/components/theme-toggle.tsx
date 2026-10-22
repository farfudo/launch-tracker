"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";

const storageKey = "nextrocketlaunch-theme";
type Theme = "light" | "dark";
let visitPreference: Theme | null = null;

function readPreference(): Theme | null {
  if (visitPreference) return visitPreference;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch { return null; }
}

function getTheme(): Theme {
  return readPreference() ?? "light";
}

function subscribe(notify: () => void) {
  const update = () => { document.documentElement.dataset.theme = getTheme(); notify(); };
  const storage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) { visitPreference = null; update(); }
  };
  update();
  window.addEventListener("storage", storage);
  window.addEventListener("nextrocketlaunch-theme-change", update);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener("nextrocketlaunch-theme-change", update);
  };
}

export function ThemeScript() {
  const script = `var saved; try { saved = localStorage.getItem('${storageKey}'); } catch (_) {} document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeToggle() {
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  const [saveError, setSaveError] = useState(false);
  const theme = useSyncExternalStore(
    subscribe,
    getTheme,
    () => "light"
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    visitPreference = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
    try { window.localStorage.setItem(storageKey, nextTheme); setSaveError(false); }
    catch { setSaveError(true); }
    window.dispatchEvent(new Event("nextrocketlaunch-theme-change"));
  }

  const isDark = theme === "dark";
  return <div className="theme-control"><button className="theme-toggle" type="button" aria-label={isDark ? d.switchLight : d.switchDark} aria-pressed={isDark} title={isDark ? d.switchLight : d.switchDark} onClick={toggleTheme}>
    <span aria-hidden="true">{isDark ? "☀" : "◐"}</span><span>{isDark ? d.light : d.dark}</span>
  </button>{saveError ? <span className="theme-save-notice" role="status">{d.themeError}</span> : null}</div>;
}
