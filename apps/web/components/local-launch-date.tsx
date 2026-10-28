"use client";
import type { NetPrecision } from "../lib/api";
import { clockPrecision, formatTemporalDate, precisionId, precisionNotice } from "../lib/temporal-precision";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { uncertainLaunchDate } from "../lib/launch";

export function LocalLaunchDate({ date, status, precision, showNotice = true }: { date: string; status?: string; precision?: NetPrecision | null; showNotice?: boolean }) {
  const { locale, viewerTimeZone } = useLocale();
  const d = dashboardCopy[locale];
  if (!Number.isFinite(Date.parse(date))) return <span >{{"pt-PT":"Data por determinar", "en-GB":"Date to be determined", "es-ES":"Fecha por determinar"}[locale]}</span>;
  const uncertain = uncertainLaunchDate(status);
  const temporalNotice = precisionNotice(precision, locale);
  const id = precisionId(precision);
  const referenceDate = !showNotice && (id === null || id >= 3);
  const text = referenceDate ? new Intl.DateTimeFormat(locale, {day:"2-digit", month:"short", year:"numeric", timeZone:"UTC"}).format(new Date(date)) : formatTemporalDate(date, precision, locale, viewerTimeZone || "UTC");
  const notice = {"pt-PT":"Data provisória", "en-GB":"Provisional date", "es-ES":"Fecha provisional"}[locale];
  return <span className={showNotice && uncertain && precisionId(precision) !== null ? "date-uncertain" : undefined}>{clockPrecision(precision) ? <><time dateTime={date}>{text}</time><span className="date-zone-label"> · {viewerTimeZone ? d.yourTime : d.utc}</span></> : <span>{text}{precisionId(precision) === null && !referenceDate ? " (UTC)" : null}</span>}{showNotice && temporalNotice && precisionId(precision) !== null ? <span className="date-uncertainty-note"><span aria-hidden="true">⚠ </span>{temporalNotice}</span> : null}{showNotice && uncertain && !temporalNotice ? <span className="date-uncertainty-note"><span aria-hidden="true">⚠ </span>{notice}</span> : null}</span>;
}
