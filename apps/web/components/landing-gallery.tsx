"use client";

import { useRef, useState } from "react";
import type { Locale } from "../lib/i18n";
import { landingCopy, landingEmbedUrl, landingVideos } from "../lib/landing-videos";
import { MissionIcon } from "./mission-icon";
import { Spinner } from "./pending-feedback";

export function LandingGallery({locale}:{locale:Locale}) {
  const [active, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const t = landingCopy[locale];
  return <section className="landing-gallery" aria-labelledby="landing-gallery-title">
    <header><p className="eyebrow">{t.eyebrow}</p><h2 id="landing-gallery-title">{t.title}</h2><p>{t.intro}</p></header>
    <p className="landing-privacy">{t.privacy}</p>
    <div className="landing-grid">{landingVideos.map((video,index) => {
      const expanded = active === video.id;
      return <article className="landing-card" key={video.id}>
        <div id={`player-${video.id}`} className={`landing-screen landing-screen-${video.id}`}>
          {expanded ? <>
            {!ready && <span className="landing-loading" role="status"><Spinner /> {t.loading}</span>}
            <iframe title={`${video.name} — ${t.load}`} src={landingEmbedUrl(video)} onLoad={() => setReady(true)} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </> : <button ref={node => {triggers.current[video.id] = node;}} type="button" className="landing-play" aria-expanded={false} aria-controls={`player-${video.id}`} onClick={() => {setReady(false); setActive(video.id);}}>
            <span className="landing-illustration" aria-hidden="true"><MissionIcon name="rocket"/><span className="landing-pad"/></span>
            <span className="landing-play-label"><span aria-hidden="true">▶</span> {t.load} · {video.end-video.start} s<span className="visually-hidden"> — {video.name}</span></span>
          </button>}
        </div>
        <div className="landing-card-body"><div className="discovery-source-meta"><span>{video.publisher}</span><time dateTime={video.date}>{new Intl.DateTimeFormat(locale,{dateStyle:"medium",timeZone:"UTC"}).format(new Date(`${video.date}T12:00:00Z`))}</time></div>
          <h3>{video.name}</h3><p>{t.context[index]}</p>
          <div className="landing-actions"><a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">{t.full} ↗</a>
            {expanded && <button type="button" aria-expanded={true} aria-controls={`player-${video.id}`} onClick={() => {setActive(null); requestAnimationFrame(() => triggers.current[video.id]?.focus({preventScroll:true}));}}>{t.close}<span className="visually-hidden"> — {video.name}</span></button>}
          </div>
        </div>
      </article>;
    })}</div>
    <p className="landing-privacy">{t.note}</p>
    <aside className="landing-landspace"><h3><a href="https://www.landspace.com/" target="_blank" rel="noopener noreferrer">{t.landspace} ↗</a></h3><p>{t.landspaceBody}</p></aside>
  </section>;
}
