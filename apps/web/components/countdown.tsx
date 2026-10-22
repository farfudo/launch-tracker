"use client";

import { useEffect, useState } from "react";

export function Countdown({ date, status }: { date: string; status?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(timer);
  }, []);
  const target = Date.parse(date);
  if (status && /to be determined|\btbd\b/i.test(status)) return <p className="countdown-note">Launch time to be confirmed</p>;
  if (!Number.isFinite(target)) return <p className="countdown-note">Launch time to be confirmed</p>;
  if (now !== null && target <= now) return <p className="countdown-note">Scheduled time reached · check mission status</p>;
  const seconds = now === null ? null : Math.floor((target - now) / 1000);
  const parts = seconds === null ? [null, null, null, null] : [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  return <div className="countdown" role="timer" aria-label="Time until the scheduled launch" aria-live="off">
    {parts.map((value, index) => <div key={index}><strong>{value === null ? "—" : String(value).padStart(2, "0")}</strong><span>{["Days", "Hours", "Mins", "Secs"][index]}</span></div>)}
  </div>;
}
