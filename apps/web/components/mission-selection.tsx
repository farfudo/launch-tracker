"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Launch, LaunchDetail } from "../lib/api";
import { missionTitle } from "../lib/mission-title";
import { formatLaunchStatus, launchStatusTone } from "../lib/launch";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { LocalLaunchDate } from "./local-launch-date";
import { FavoriteButton } from "./favorites";
import { MissionStreams } from "./mission-streams";
import { Spinner, LinkPending } from "./pending-feedback";
import { CacheNotice } from "./cache-notice";

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

export function MissionSelectionProvider({ initial, initialSummary = null, children }: { initial: LaunchDetail | null; initialSummary?: Launch | null; children: React.ReactNode }) {
  const [selected, setSelected] = useState<Launch | null>(initial ?? initialSummary);
  const [detail, setDetail] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const initializedSummary = useRef(false);
  useEffect(() => () => request.current?.abort(), []);

  const select = useCallback(async (launch: Launch, reveal = true) => {
    const current = ++generation.current;
    request.current?.abort();
    setSelected(launch);
    if (reveal) setRevision(value => value + 1);
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
  }, [initial]);
  useEffect(() => {
    if (!initial && initialSummary && !initializedSummary.current) {
      initializedSummary.current = true;
      void select(initialSummary, false);
    }
  }, [initial, initialSummary, select]);
  return <MissionSelection.Provider value={{ selected, detail, loading, error, revision, select }}>{children}</MissionSelection.Provider>;
}

export function MissionDetailPanel() {
  const selection = useMissionSelection();
  const { locale, messages: t } = useLocale();
  const d = dashboardCopy[locale];
  const summaryCopy = {
    "pt-PT": { title: "Resumo da missão", hint: "Descrição, janela de lançamento, fusos horários e fontes estão na página completa." },
    "en-GB": { title: "Mission at a glance", hint: "Description, launch window, time zones and sources are on the full mission page." },
    "es-ES": { title: "Resumen de la misión", hint: "La descripción, ventana de lanzamiento, zonas horarias y fuentes están en la página completa." },
  }[locale];
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
    <p className="eyebrow">{summaryCopy.title}</p>
    <h2 id="selected-mission-heading">{missionTitle(detail || selected)}</h2>
    <p className="selected-mission-agency">{selected.agency || t.agencyPending} · {selected.vehicle || t.vehiclePending}</p>
    <span className="launch-status-tag" data-tone={launchStatusTone(selected.status)}>{formatLaunchStatus(selected.status, locale)}</span>
    <p className="selected-mission-date"><LocalLaunchDate date={selected.net} /></p>
    <p className="visually-hidden" role="status">{loading ? d.loadingMission : `${d.selectedMission}: ${selected.name}`}</p>
    {loading ? <p className="panel-feedback"><Spinner /> {d.loadingMission}</p> : null}
    {error ? <div className="panel-feedback" role="alert"><p>{d.missionError}</p><button type="button" onClick={() => select(selected)}>{t.retry}</button></div> : null}
    {detail ? <div className={revision > 0 ? "mission-detail-enter" : undefined}>
      {detail.frontend_cache ? <CacheNotice entries={[detail.frontend_cache]} autoRefresh={false} onRetry={() => select(selected)} /> : null}
      <dl className="selected-mission-facts"><div><dt>{t.launchSite}</dt><dd>{detail.location_name || t.pending}</dd></div></dl>
      <MissionStreams launch={detail} compact />
    </div> : null}
    <div className="selected-mission-actions"><Link className="pill-button" href={`/launches/${selected.id}`}>{d.fullDetails} →<LinkPending /></Link><FavoriteButton id={selected.id} name={selected.name} /></div>
    <p className="mission-summary-hint">{summaryCopy.hint}</p>
    </div>
  </section>;
}
