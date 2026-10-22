"use client";
import { formatLaunchDate } from "../lib/date";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";

export function LocalLaunchDate({ date }: { date: string }) {
  const { locale, viewerTimeZone } = useLocale();
  const d = dashboardCopy[locale];
  return <span><time dateTime={date}>{formatLaunchDate(date, locale, viewerTimeZone || "UTC")}</time><span className="date-zone-label"> · {viewerTimeZone ? d.yourTime : d.utc}</span></span>;
}
