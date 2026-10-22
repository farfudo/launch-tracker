export const FAVORITES_KEY = "launchskyline_favorites_v1";
export const FAVORITES_EVENT = "launchskyline:favorites";

export function parseFavorites(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 100))];
  } catch { return []; }
}

export function readFavorites(): string {
  try { return window.localStorage.getItem(FAVORITES_KEY) ?? "[]"; }
  catch { return "[]"; }
}

export function toggleFavorite(id: string): boolean {
  try {
    const ids = parseFavorites(window.localStorage.getItem(FAVORITES_KEY));
    const next = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
    return true;
  } catch { return false; }
}

export function subscribeFavorites(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(FAVORITES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FAVORITES_EVENT, onChange);
  };
}
