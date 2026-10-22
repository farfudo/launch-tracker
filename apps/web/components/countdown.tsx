"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";

export function Countdown({ date, status }: { date: string; status?: string }) {
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
  if (!status || !/^(go|go for launch)$/i.test(status) || !Number.isFinite(target)) return <p className="countdown-note">{d.unconfirmed}</p>;
  if (now !== null && target <= now) return <p className="countdown-note">{d.elapsed}</p>;
  const seconds = now === null ? null : Math.floor((target - now) / 1000);
  const parts = seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  return <div className="countdown-group"><span className="countdown-estimate">{d.estimate}</span><div className="countdown" role="timer" aria-label={d.timer} aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{[d.days, d.hours, d.mins, d.secs][index]}</span></div>)}
  </div></div>;
}
