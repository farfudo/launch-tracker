"use client";
import type { NetPrecision } from "../lib/api";
import { clockPrecision, formatTemporalDate, precisionId, precisionNotice } from "../lib/temporal-precision";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { uncertainLaunchDate } from "../lib/launch";

export function LocalLaunchDate({ date, status, precision }: { date: string; status?: string; precision?: NetPrecision | null }) {
  const { locale, viewerTimeZone } = useLocale();
  const d = dashboardCopy[locale];
  if (!Number.isFinite(Date.parse(date))) return <span className="date-uncertain">{{"pt-PT":"Data por determinar", "en-GB":"Date to be determined", "es-ES":"Fecha por determinar"}[locale]}</span>;
  const uncertain = uncertainLaunchDate(status);
  const temporalNotice = precisionNotice(precision, locale);
  const text = formatTemporalDate(date, precision, locale, viewerTimeZone || "UTC");
  const notice = {"pt-PT":"Data provisória", "en-GB":"Provisional date", "es-ES":"Fecha provisional"}[locale];
  return <span className={uncertain && precisionId(precision) !== null ? "date-uncertain" : undefined}>{clockPrecision(precision) ? <><time dateTime={date}>{text}</time><span className="date-zone-label"> · {viewerTimeZone ? d.yourTime : d.utc}</span></> : <span>{text}{precisionId(precision) === null ? " (UTC)" : null}</span>}{temporalNotice && precisionId(precision) !== null ? <span className="date-uncertainty-note"><span aria-hidden="true">⚠ </span>{temporalNotice}</span> : null}{uncertain && !temporalNotice ? <span className="date-uncertainty-note"><span aria-hidden="true">⚠ </span>{notice}</span> : null}</span>;
}
