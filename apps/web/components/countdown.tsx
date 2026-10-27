"use client";

import type { NetPrecision } from "../lib/api";
import { precisionId } from "../lib/temporal-precision";
import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchStatus, launchTimingStatus } from "../lib/launch";

export function Countdown({ date, status, precision, compact = false }: { date: string; status?: string; precision?: NetPrecision | null; compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, compact ? 60000 : 1000);
    tick();
    return () => window.clearInterval(timer);
  }, [compact]);
  const target = Date.parse(date);
  const timing = launchTimingStatus(status);
  if (timing === "terminal") return null;
  if (timing === "in-flight" || timing === "held") return <p className="countdown-note">{formatLaunchStatus(status!, locale)}</p>;
  if (timing === "unknown-date" || (!Number.isFinite(target) || !/(?:Z|[+-]\d{2}:\d{2})$/.test(date))) return <p className="countdown-note">{{"pt-PT":"Data de lançamento por determinar", "en-GB":"Launch date to be determined", "es-ES":"Fecha de lanzamiento por determinar"}[locale]}</p>;

  if (timing === "unknown") return <p className="countdown-note">{{"pt-PT":"Estado do lançamento por confirmar", "en-GB":"Launch status to be confirmed", "es-ES":"Estado del lanzamiento por confirmar"}[locale]}</p>;
  const precisionLevel = precisionId(precision);
  if (precisionLevel !== null && precisionLevel > 2) return null;
  const estimated = precisionLevel === null || timing === "uncertain";
  const estimateLabel = estimated ? {"pt-PT":"Estimativa · hora não confirmada", "en-GB":"Estimate · time unconfirmed", "es-ES":"Estimación · hora sin confirmar"}[locale] : d.estimate;
  const quantum = precisionLevel === null || precisionLevel === 0 ? 1000 : precisionLevel === 1 ? 60000 : 3600000;
  const start = Math.floor(target / quantum) * quantum;
  if (now !== null && now >= start + (precisionLevel === 0 || precisionLevel === null ? 0 : quantum)) return <p className="countdown-note">{estimated ? d.unconfirmed : d.elapsed}</p>;
  if (now !== null && now >= start && precisionLevel !== 0) return <p className="countdown-note">{d.unconfirmed}</p>;
  const seconds = now === null ? null : Math.floor((start - now) / quantum) * quantum / 1000;
  if (compact) {
    const unit = seconds !== null && seconds >= 86400 ? "day" : precisionLevel === 2 || (seconds !== null && seconds >= 3600) ? "hour" : "minute";
    const divisor = unit === "day" ? 86400 : unit === "hour" ? 3600 : 60;
    return <p className="countdown-compact" role="timer" aria-label={d.timer} aria-live="off"><span>{estimateLabel}</span><strong>{seconds === null ? "—" : `≈ ${new Intl.RelativeTimeFormat(locale, {numeric:"always"}).format(Math.floor(seconds / divisor), unit)}`}</strong></p>;
  }
  const units = precisionLevel === null || precisionLevel === 0 ? 4 : precisionLevel === 1 ? 3 : 2;
  const parts = (seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]).slice(0, units);
  return <div className="countdown-group"><span className="countdown-estimate">{estimateLabel}</span><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
