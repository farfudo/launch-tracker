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
  const estimated = timing !== 'scheduled' || precisionLevel === null || precisionLevel > 0;
  const estimateLabel = precisionLevel === 0 ? d.estimate : {"pt-PT":"Contagem até referência não confirmada", "en-GB":"Countdown to unconfirmed reference", "es-ES":"Cuenta atrás hasta referencia no confirmada"}[locale];
  const warningLabel={'pt-PT':'Incerteza da data','en-GB':'Date uncertainty','es-ES':'Incertidumbre de la fecha'}[locale];
  const warningBody={'pt-PT':'Contagem até à data de referência fornecida, não a uma hora de lançamento confirmada; os segundos não representam a precisão da fonte. Precisão:', 'en-GB':'Countdown to the supplied reference, not a confirmed launch time; the seconds do not represent source precision. Precision:', 'es-ES':'Cuenta atrás hasta la referencia facilitada, no hasta una hora de lanzamiento confirmada; los segundos no representan la precisión de la fuente. Precisión:'}[locale];
  const warning=estimated ? <span className="countdown-warning"><InfoDisclosure label={warningLabel} symbol="▲">{warningBody} {precisionLabel(precision,locale)}.</InfoDisclosure></span> : null;
  if (now !== null && now >= target) return <p className="countdown-note">{estimated ? d.unconfirmed : d.elapsed}</p>;
  const seconds = now === null ? null : Math.max(0, Math.ceil((target - now) / 1000));
  const parts = seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  return <div className={compact ? "countdown-group countdown-compact" : "countdown-group"}><div className="countdown-heading"><span className="countdown-estimate">{estimateLabel}</span>{warning}</div><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
