"use client";

import { useSyncExternalStore } from "react";

const storageKey = "nextrocketlaunch-theme";
type Theme = "light" | "dark";

function getTheme(): Theme {
  const saved = window.localStorage.getItem(storageKey);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeScript() {
  const script = `try { var saved = localStorage.getItem('${storageKey}'); var theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch (_) {}`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (notify) => {
      window.addEventListener("nextrocketlaunch-theme-change", notify);
      return () => window.removeEventListener("nextrocketlaunch-theme-change", notify);
    },
    getTheme,
    () => "light"
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event("nextrocketlaunch-theme-change"));
  }

  const isDark = theme === "dark";
  return <button className="theme-toggle" type="button" aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={isDark} title={isDark ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>
    <span aria-hidden="true">{isDark ? "☀" : "◐"}</span><span>{isDark ? "Light" : "Dark"}</span>
  </button>;
}
