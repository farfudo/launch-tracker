"use client";

import Image from "next/image";
import Link from "next/link";
import { channelDirectoryCopy } from "./launch-channels";
import { useState } from "react";
import type { LaunchDetail, MissionLink } from "../lib/api";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchDate } from "../lib/date";
import { safeMissionLink } from "../lib/stream-links";
import { useLocale } from "./locale-provider";

const coverageCopy = {
  "pt-PT": { heading: "Onde ver", official: "Fonte oficial", independent: "Cobertura independente", play: "Ver aqui", stop: "Fechar vídeo", open: "Abrir na fonte" },
  "en-GB": { heading: "Where to watch", official: "Official source", independent: "Independent coverage", play: "Watch here", stop: "Close video", open: "Open at source" },
  "es-ES": { heading: "Dónde ver", official: "Fuente oficial", independent: "Cobertura independiente", play: "Ver aquí", stop: "Cerrar vídeo", open: "Abrir en la fuente" },
};

function youtubeVideoId(link: string) {
  const url = new URL(link);
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.split("/");
  const id = host === "youtu.be" && path.length === 2 ? path[1]
    : host === "youtube.com" && url.pathname === "/watch" ? url.searchParams.get("v")
    : host === "youtube.com" && path.length === 3 && path[1] === "live" ? path[2]
    : null;
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

function coverage(link: MissionLink & { host: string }) {
  if (["nasa.gov", "plus.nasa.gov", "spacex.com"].includes(link.host)) return "official";
  const publisher = link.publisher?.trim().toLowerCase();
  if (link.host === "x.com" && publisher === "spacex") return "official";
  if (youtubeVideoId(link.url) && (publisher === "nasa" || publisher === "spacex")) return "official";
  if (publisher === "everyday astronaut" || publisher === "nasaspaceflight" || link.host === "everydayastronaut.com" || link.host === "nasaspaceflight.com") return "independent";
  return null;
}

export function MissionStreams({ launch, compact = false, inline = false }: { launch: LaunchDetail; compact?: boolean; inline?: boolean }) {
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  const t = coverageCopy[locale];
  const [playing, setPlaying] = useState<string | null>(null);
  const streams = (launch.streams || []).map(safeMissionLink).filter(link => link !== null)
    .sort((a, b) => Number(coverage(b) === "official") - Number(coverage(a) === "official"));
  if (!streams.length) return <div className="stream-unavailable">
    <button className="stream-button stream-button-unavailable" type="button" disabled><span aria-hidden="true">▷</span> {d.watchHere}</button>
    <p>{d.streamMissing}</p>
    <Link className="launch-channels-link" href="/#launch-channels">{channelDirectoryCopy[locale].link}</Link>
  </div>;
  const snapshot = Date.parse(launch.source_updated_at);
  const content = <div className="stream-disclosure-content">
    <h3>{t.heading}</h3>
    <p className="stream-disclaimer">{d.streamsNotice}</p>
    <ul>{streams.map(link => {
      const start = link.start_time ? Date.parse(link.start_time) : NaN;
      const end = link.end_time ? Date.parse(link.end_time) : NaN;
      const reportedLive = link.live === true && !(Number.isFinite(end) && end <= snapshot);
      const label = reportedLive ? d.streamReportedLive : Number.isFinite(start) && start > snapshot ? d.streamScheduled : d.streamAvailable;
      const kind = coverage(link);
      const videoId = youtubeVideoId(link.url);
      const title = link.title || d.watchStream;
      const isPlaying = playing === link.url;
      return <li key={link.url}>
        {videoId && <div className="stream-preview" data-playing={isPlaying || undefined}>
          {isPlaying ? <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          /> : <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            unoptimized
          />}
        </div>}
        <span className="stream-state">{label}</span>
        {kind && <span className="stream-kind">{t[kind]}</span>}
        <strong className="stream-title">{title}</strong>
        <p>{link.publisher || link.source || link.host} · {link.host}</p>
        {Number.isFinite(start) ? <p>{d.streamStarts}: <time dateTime={link.start_time!}>{formatLaunchDate(link.start_time!, locale)}</time></p> : null}
        <div className="stream-actions">
          {videoId && <button type="button" aria-label={`${isPlaying ? t.stop : t.play}: ${title}`} onClick={() => setPlaying(isPlaying ? null : link.url)}>{isPlaying ? t.stop : `▷ ${t.play}`}</button>}
          <a href={link.url} target="_blank" rel="noopener noreferrer">{t.open} ↗<span className="visually-hidden"> · {title} ({d.newTab})</span></a>
        </div>
      </li>;
    })}</ul>
    <p className="stream-updated">{d.streamSnapshot}: {formatLaunchDate(launch.source_updated_at, locale)} · Launch Library 2</p>
    </div>;
  if (inline) return <section className="mission-streams">{content}</section>;
  return <details key={launch.id} onToggle={event => { if (!event.currentTarget.open) setPlaying(null); }} className={`mission-streams stream-disclosure${compact ? " stream-disclosure-compact" : ""}`}>
    <summary className="stream-button"><span aria-hidden="true">▷</span> {d.watchHere}<span className="stream-count">{streams.length}</span><span className="stream-chevron" aria-hidden="true">⌄</span></summary>
    {content}
  </details>;
}
