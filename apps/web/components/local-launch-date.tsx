"use client";
import { formatLaunchDate } from "../lib/date";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { uncertainLaunchDate } from "../lib/launch";

export function LocalLaunchDate({ date, status }: { date: string; status?: string }) {
  const { locale, viewerTimeZone } = useLocale();
  const d = dashboardCopy[locale];
  if (!Number.isFinite(Date.parse(date))) return <span className="date-uncertain">{{"pt-PT":"Data por determinar", "en-GB":"Date to be determined", "es-ES":"Fecha por determinar"}[locale]}</span>;
  const uncertain = uncertainLaunchDate(status);
  const notice = {"pt-PT":"Data provisória", "en-GB":"Provisional date", "es-ES":"Fecha provisional"}[locale];
  return <span className={uncertain ? "date-uncertain" : undefined}><time dateTime={date}>{formatLaunchDate(date, locale, viewerTimeZone || "UTC")}</time><span className="date-zone-label"> · {viewerTimeZone ? d.yourTime : d.utc}</span>{uncertain ? <span className="date-uncertainty-note"><span aria-hidden="true">⚠ </span>{notice}</span> : null}</span>;
}
