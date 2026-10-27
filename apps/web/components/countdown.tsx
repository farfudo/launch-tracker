"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchStatus, launchTimingStatus } from "../lib/launch";

export function Countdown({ date, status, compact = false }: { date: string; status?: string; compact?: boolean }) {
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
  if (timing === "unknown-date" || !Number.isFinite(target)) return <p className="countdown-note">{{"pt-PT":"Data de lançamento por determinar", "en-GB":"Launch date to be determined", "es-ES":"Fecha de lanzamiento por determinar"}[locale]}</p>;
  if (timing === "uncertain") return <p className="countdown-note">{d.unconfirmed}</p>;
  if (timing === "unknown") return <p className="countdown-note">{{"pt-PT":"Estado do lançamento por confirmar", "en-GB":"Launch status to be confirmed", "es-ES":"Estado del lanzamiento por confirmar"}[locale]}</p>;
  if (now !== null && target <= now) return <p className="countdown-note">{d.elapsed}</p>;
  const seconds = now === null ? null : Math.floor((target - now) / 1000);
  if (compact) {
    const unit = seconds !== null && seconds >= 86400 ? "day" : seconds !== null && seconds >= 3600 ? "hour" : "minute";
    const divisor = unit === "day" ? 86400 : unit === "hour" ? 3600 : 60;
    return <p className="countdown-compact" role="timer" aria-label={d.timer} aria-live="off"><span>{d.estimate}</span><strong>{seconds === null ? "—" : `≈ ${new Intl.RelativeTimeFormat(locale, {numeric:"always"}).format(Math.max(1, Math.round(seconds / divisor)), unit)}`}</strong></p>;
  }
  const parts = seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  return <div className="countdown-group"><span className="countdown-estimate">{d.estimate}</span><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
