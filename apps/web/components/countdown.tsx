"use client";

import type { NetPrecision } from "../lib/api";
import { precisionId, precisionLabel } from "../lib/temporal-precision";
import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchStatus, launchTimingStatus } from "../lib/launch";
import {InfoDisclosure} from './info-disclosure';

export function Countdown({ date, status, precision, compact = false }: { date: string; status?: string; precision?: NetPrecision | null; compact?: boolean }) {
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
  const broad = precisionLevel === null || precisionLevel > 2;
  const estimated = timing !== 'scheduled' || precisionLevel === null || precisionLevel > 0;
  const estimateLabel = d.estimate;
  const warningLabel={'pt-PT':'Incerteza da data','en-GB':'Date uncertainty','es-ES':'Incertidumbre de la fecha'}[locale];
  const warningBody={'pt-PT':'Data estimada ou não confirmada; o valor é uma referência e pode mudar. Precisão:', 'en-GB':'Estimated or unconfirmed date; this reference may change. Precision:', 'es-ES':'Fecha estimada o sin confirmar; esta referencia puede cambiar. Precisión:'}[locale];
  const warning=estimated ? <span className="countdown-warning"><InfoDisclosure label={warningLabel} symbol="▲">{warningBody} {precisionLabel(precision,locale)}.</InfoDisclosure></span> : null;
  const quantum = broad ? 86400000 : precisionLevel === 0 ? 1000 : precisionLevel === 1 ? 60000 : 3600000;
  const start = Math.floor(target / quantum) * quantum;
  if (now !== null && now >= start + (precisionLevel === 0 ? 0 : quantum)) return <p className="countdown-note">{estimated ? d.unconfirmed : d.elapsed}</p>;
  if (now !== null && now >= start && precisionLevel !== 0) return <p className="countdown-note">{d.unconfirmed}</p>;
  const seconds = now === null ? null : Math.floor((start - now) / quantum) * quantum / 1000;
  if (broad) return <div className="countdown-group"><div className="countdown-heading"><span className="countdown-estimate">{estimateLabel}</span>{warning}</div><div className="countdown" role="timer" aria-label={d.timer} aria-live="off"><div><strong>{seconds===null?'—':String(Math.max(0,Math.floor(seconds/86400)))}</strong><span>{d.days}</span></div></div></div>;
  const units = precisionLevel === null || precisionLevel === 0 ? 4 : precisionLevel === 1 ? 3 : 2;
  const parts = (seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]).slice(0, units);
  return <div className={compact ? "countdown-group countdown-compact" : "countdown-group"}><div className="countdown-heading"><span className="countdown-estimate">{estimateLabel}</span>{warning}</div><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
