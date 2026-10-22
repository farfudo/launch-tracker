"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Launch, LaunchDetail } from "../lib/api";
import { formatLaunchStatus } from "../lib/launch";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { LocalLaunchDate } from "./local-launch-date";
import { LaunchTimes } from "./launch-times";
import { FavoriteButton } from "./favorites";
import { MissionStreams } from "./mission-streams";

type Selection = {
  selected: Launch | null;
  detail: LaunchDetail | null;
  loading: boolean;
  error: boolean;
  revision: number;
  select: (launch: Launch) => void;
};
const MissionSelection = createContext<Selection | null>(null);
export const useMissionSelection = () => useContext(MissionSelection);

export function MissionSelectionProvider({ initial, children }: { initial: LaunchDetail | null; children: React.ReactNode }) {
  const [selected, setSelected] = useState<Launch | null>(initial);
  const [detail, setDetail] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(() => () => request.current?.abort(), []);

  async function select(launch: Launch) {
    const current = ++generation.current;
    request.current?.abort();
    setSelected(launch);
    setRevision(value => value + 1);
    setError(false);
    if (launch.id === initial?.id) { setDetail(initial); setLoading(false); return; }
    setDetail(null);
    setLoading(true);
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(`/api/missions/${encodeURIComponent(launch.id)}`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Mission unavailable");
      const result: LaunchDetail = await response.json();
      if (current === generation.current) setDetail(result);
    } catch {
      if (current === generation.current) setError(true);
    } finally {
      window.clearTimeout(timeout);
      if (current === generation.current) setLoading(false);
    }
  }
  return <MissionSelection.Provider value={{ selected, detail, loading, error, revision, select }}>{children}</MissionSelection.Provider>;
}

export function MissionDetailPanel() {
  const selection = useMissionSelection();
  const { locale, messages: t } = useLocale();
  const d = dashboardCopy[locale];
  const panel = useRef<HTMLElement>(null);
  const revision = selection?.revision ?? 0;
  useEffect(() => {
    if (!revision || !panel.current || !window.matchMedia("(min-width: 801px)").matches) return;
    const heading = panel.current.querySelector("h2");
    const box = heading?.getBoundingClientRect();
    // Reveal the heading, not the whole (potentially long) mission panel.
    if (box && (box.top < 24 || box.bottom > window.innerHeight - 24)) {
      panel.current.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }, [revision]);
  if (!selection?.selected) return null;
  const { selected, detail, loading, error, select } = selection;
  return <section ref={panel} className="selected-mission-panel" id="selected-mission" aria-labelledby="selected-mission-heading" aria-busy={loading}>
    {revision > 0 ? <span key={`highlight-${revision}`} className="mission-panel-highlight" aria-hidden="true" /> : null}
    <div key={revision} className={revision > 0 ? "mission-selection-enter" : undefined}>
    <p className="eyebrow">{d.selectedMission}</p>
    <h2 id="selected-mission-heading">{detail?.mission_name || selected.name}</h2>
    <p className="selected-mission-agency">{selected.agency || t.agencyPending} · {selected.vehicle || t.vehiclePending}</p>
    <span className="launch-status-tag">{formatLaunchStatus(selected.status, locale)}</span>
    <p className="selected-mission-date"><LocalLaunchDate date={selected.net} /></p>
    <p className="visually-hidden" role="status">{loading ? d.loadingMission : `${d.selectedMission}: ${selected.name}`}</p>
    {loading ? <p className="panel-feedback">{d.loadingMission}</p> : null}
    {error ? <div className="panel-feedback" role="alert"><p>{d.missionError}</p><button type="button" onClick={() => select(selected)}>{t.retry}</button></div> : null}
    {detail ? <div className={revision > 0 ? "mission-detail-enter" : undefined}>
      <MissionStreams launch={detail} />
      <h3>{t.aboutMission}</h3>
      <p className="selected-mission-description">{detail.mission_description || t.descriptionPending}</p>
      {detail.mission_description ? <p className="launch-meta">{t.originalDescription}</p> : null}
      <dl className="selected-mission-facts"><div><dt>{t.launchSite}</dt><dd>{detail.location_name || t.pending}</dd></div><div><dt>{t.launchPad}</dt><dd>{detail.pad_name || t.pending}</dd></div></dl>
      <h3>{t.launchWindow}</h3>
      <dl className="selected-mission-facts">{[{label:t.windowStart,date:detail.window_start},{label:t.windowEnd,date:detail.window_end}].map(point => <div key={point.label}><dt>{point.label}</dt><dd>{point.date ? <LocalLaunchDate date={point.date} /> : t.pending}</dd></div>)}</dl>
      <p className="launch-meta">{t.windowNotice}</p>
      <details className="panel-time-zones"><summary>{d.zones}</summary><LaunchTimes isoDate={detail.net} launchTimeZone={detail.launch_timezone} /></details>
    </div> : null}
    <div className="selected-mission-actions"><Link className="pill-button" href={`/launches/${selected.id}`}>{d.fullDetails} →</Link><FavoriteButton id={selected.id} name={selected.name} /></div>
    </div>
  </section>;
}
