"use client";

import type { NetPrecision } from "../lib/api";
import { precisionId } from "../lib/temporal-precision";
import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchStatus, launchTimingStatus } from "../lib/launch";

export function Countdown({ date, status, precision, compact = false, respectPrecision = false, showReferenceSeconds = false }: { date: string; status?: string; precision?: NetPrecision | null; compact?: boolean; respectPrecision?: boolean; showReferenceSeconds?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(timer);
  }, []);
  const target = Date.parse(date);
  const timing = launchTimingStatus(status);
  if (timing === "terminal") return null;
  if (timing === "in-flight" || timing === "held") return <p className="countdown-note">{formatLaunchStatus(status!, locale)}</p>;
  if (!Number.isFinite(target) || !/(?:Z|[+-]\d{2}:\d{2})$/.test(date)) return <p className="countdown-note">{{"pt-PT":"Data de lançamento por determinar", "en-GB":"Launch date to be determined", "es-ES":"Fecha de lanzamiento por determinar"}[locale]}</p>;
  const precisionLevel = precisionId(precision);
  const estimated = timing !== 'scheduled' || precisionLevel === null || precisionLevel > 0;
  if (now !== null && now >= target) return <p className="countdown-note">{estimated ? d.unconfirmed : d.elapsed}</p>;
  if (respectPrecision && (precisionLevel === null || precisionLevel > 2)) return <p className="countdown-note">{d.unconfirmed}</p>;
  const quantum=respectPrecision && !showReferenceSeconds ? precisionLevel===1?60000:precisionLevel===2?3600000:1000 : 1000;
  const countdownTarget=respectPrecision && !showReferenceSeconds ? Math.floor(target/quantum)*quantum : target;
  const seconds = now === null ? null : Math.max(0, respectPrecision && !showReferenceSeconds ? Math.floor((countdownTarget-now)/quantum)*quantum/1000 : Math.ceil((target-now)/1000));
  const parts = seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  const visibleParts=respectPrecision && !showReferenceSeconds?parts.slice(0,precisionLevel===1?3:precisionLevel===2?2:4):parts;
  return <div className={compact ? "countdown-group countdown-compact" : "countdown-group"}><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {visibleParts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
