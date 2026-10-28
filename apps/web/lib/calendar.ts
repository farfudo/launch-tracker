import { precisionId } from "./temporal-precision";
import { launchTimingStatus } from "./launch";
import type { LaunchDetail } from "./api";

function timestamp(value: string | null) {
  return value && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
}

export function canExportCalendar(launch: LaunchDetail) {
  const start = timestamp(launch.net);
  const timing = launchTimingStatus(launch.status);
  return timing !== "terminal" && timing !== "in-flight" && Number.isFinite(start);

}

const utc = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

// Fold at 75 UTF-8 octets, without splitting Unicode characters (RFC 5545).
function fold(line: string) {
  let result = "", length = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (length + size > 75) { result += "\r\n "; length = 1; }
    result += char; length += size;
  }
  return result;
}

export function calendarEvent(launch: LaunchDetail, origin: string, notice: string, now = new Date()) {
  if (!canExportCalendar(launch)) return null;
  const url = new URL(`/launches/${encodeURIComponent(launch.id)}`, origin).href;
  const description = `${notice}\n${url}`;
  const location = [launch.pad_name, launch.location_name].filter(Boolean).join(" · ");
  const precision = precisionId(launch.net_precision);
  const allDay = precision === null || precision >= 3;
  const quantum = precision === 1 ? 60000 : precision === 2 ? 3600000 : 1000;
  const start = allDay ? utc(launch.net).slice(0,8) : utc(new Date(Math.floor(Date.parse(launch.net)/quantum)*quantum).toISOString());
  const end = allDay ? utc(new Date(Date.parse(launch.net)+86400000).toISOString()).slice(0,8) : start;
  // A point-in-time reminder, not a fabricated launch duration or launch window.
  const params = new URLSearchParams({ action: "TEMPLATE", text: launch.name, dates: `${start}/${end}`, details: description, location });
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NextRocketLaunch//Mission calendar//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${escapeText(launch.id)}@nextrocketlaunch`, `DTSTAMP:${utc(now.toISOString())}`, `DTSTART${allDay ? ";VALUE=DATE" : ""}:${start}`,
    ...(allDay ? [`DTEND;VALUE=DATE:${end}`] : []),
    `SUMMARY:${escapeText(launch.name)}`, `DESCRIPTION:${escapeText(description)}`, `LOCATION:${escapeText(location)}`,
    `URL:${url}`, "STATUS:TENTATIVE", "TRANSP:TRANSPARENT", "END:VEVENT", "END:VCALENDAR"];
  return { google: `https://calendar.google.com/calendar/render?${params}`, ics: lines.map(fold).join("\r\n") + "\r\n" };
}
