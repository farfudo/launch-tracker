import type { MissionLink } from "./api";

export function safeMissionLink(link: MissionLink): (MissionLink & { host: string }) | null {
  try {
    const url = new URL(link.url);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return { ...link, url: url.href, host: url.hostname.replace(/^www\./, "") };
  } catch { return null; }
}

export function streamGroup(link: MissionLink, observedAt: string, now: number) {
  const start = Date.parse(link.start_time ?? "");
  const end = Date.parse(link.end_time ?? "");
  const age = now - Date.parse(observedAt);
  if (end <= now) return "available";
  if (start > now) return "scheduled";
  if (link.live === true && age >= 0 && age <= 15 * 60_000) return "live";
  return "available";
}
