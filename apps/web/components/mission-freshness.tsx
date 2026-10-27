"use client";
import { useSyncExternalStore } from "react";
import type { Launch } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import { freshnessCopy, missionFreshness } from "../lib/freshness";
import { useLocale } from "./locale-provider";
const subscribe = (notify: () => void) => { const timer = window.setInterval(notify, 60000); return () => window.clearInterval(timer); };
const snapshot = () => Math.floor(Date.now() / 60000) * 60000;
const serverSnapshot = () => 0;
export function MissionFreshness({ launch, showTimestamp = true }: { launch: Launch; showTimestamp?: boolean }) {
  const { locale } = useLocale();
  const now = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const state = missionFreshness(launch, now);
  const t = freshnessCopy[locale];
  const valid = Number.isFinite(Date.parse(launch.source_updated_at));
  return <aside className="launch-meta" aria-label={t.observed} data-freshness={state}>
    {showTimestamp ? <p>{t.observed}: {valid ? <time dateTime={launch.source_updated_at}>{formatLaunchDate(launch.source_updated_at, locale)}</time> : t.unknown}.</p> : null}
    <p role="status">{t[state]}</p>
    <small>{t.provider}</small>
  </aside>;
}
