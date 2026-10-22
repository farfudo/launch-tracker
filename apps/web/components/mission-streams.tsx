"use client";

import type { LaunchDetail, MissionLink } from "../lib/api";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchDate } from "../lib/date";
import { useLocale } from "./locale-provider";

export function safeMissionLink(link: MissionLink): (MissionLink & { host: string }) | null {
  try {
    const url = new URL(link.url);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return { ...link, url: url.href, host: url.hostname.replace(/^www\./, "") };
  } catch { return null; }
}

export function MissionStreams({ launch, compact = false }: { launch: LaunchDetail; compact?: boolean }) {
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  const streams = (launch.streams || []).map(safeMissionLink).filter(link => link !== null);
  const sources = (launch.mission_links || []).map(safeMissionLink).filter(link => link !== null);
  if (compact) return streams[0] ? <a className="stream-button" href={streams[0].url} target="_blank" rel="noopener noreferrer">▷ {d.watchStream} <span>· {streams[0].host} ↗</span><span className="visually-hidden"> ({d.newTab})</span></a> : null;
  const snapshot = Date.parse(launch.source_updated_at);
  return <section className="mission-streams" aria-label={d.streamsHeading}>
    <h3>{d.streamsHeading}</h3>
    <p className="stream-disclaimer">{d.streamsNotice}</p>
    {streams.length ? <ul>{streams.map(link => {
      const start = link.start_time ? Date.parse(link.start_time) : NaN;
      const end = link.end_time ? Date.parse(link.end_time) : NaN;
      const reportedLive = link.live === true && !(Number.isFinite(end) && end <= snapshot);
      const label = reportedLive ? d.streamReportedLive : Number.isFinite(start) && start > snapshot ? d.streamScheduled : d.streamAvailable;
      return <li key={link.url}>
        <span className="stream-state">{label}</span>
        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title || d.watchStream} ↗<span className="visually-hidden"> ({d.newTab})</span></a>
        <p>{link.publisher || link.source || link.host} · {link.host}</p>
        {Number.isFinite(start) ? <p>{d.streamStarts}: <time dateTime={link.start_time!}>{formatLaunchDate(link.start_time!, locale)}</time></p> : null}
      </li>;
    })}</ul> : <p className="stream-empty">{d.streamMissing}</p>}
    <p className="stream-updated">{d.streamSnapshot}: {formatLaunchDate(launch.source_updated_at, locale)} · Launch Library 2</p>
    {sources.length ? <><h3>{d.missionSources}</h3><ul>{sources.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.title || link.host} ↗<span className="visually-hidden"> ({d.newTab})</span></a><p>{link.source || link.host} · {link.host}</p></li>)}</ul></> : null}
  </section>;
}
