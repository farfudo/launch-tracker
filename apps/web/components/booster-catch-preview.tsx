"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "../lib/i18n";
import { Spinner } from "./pending-feedback";
import { InfoDisclosure } from "./info-disclosure";

type Player = {
  mute():void; playVideo():void; pauseVideo():void; destroy():void;
  setPlaybackRate(rate:number):void; getAvailablePlaybackRates():number[];
  getCurrentTime():number; seekTo(seconds:number,allowSeekAhead:boolean):void;
};
type PlayerEvent = {target:Player; data:number};
type YouTube = {Player:new(element:HTMLElement,options:Record<string,unknown>) => Player};
let apiPromise:Promise<YouTube> | undefined;
function loadApi():Promise<YouTube> {
  const api = () => (window as Window & {YT?:YouTube}).YT;
  if (api()?.Player) return Promise.resolve(api()!);
  if (!apiPromise) apiPromise = new Promise<YouTube>((resolve,reject) => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    const timer = window.setInterval(() => {
      if (api()?.Player) { clearInterval(timer); clearTimeout(timeout); resolve(api()!); }
    },100);
    const fail = () => {clearInterval(timer); clearTimeout(timeout); apiPromise = undefined; script.remove(); reject(new Error("Video player unavailable"));};
    const timeout = window.setTimeout(fail,12000);
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return apiPromise;
}
const clip = {videoId:"hI9HQfCAw64",startSeconds:125,endSeconds:145};
const copy = {
  "pt-PT":{title:"Super Heavy: captura pela torre",caption:"Voo 5 · 13/10/2024 · SpaceX",detail:"Excerto de 20 s a até 2× (cerca de 10 s), sem som, em repetição. Leitor externo YouTube.",play:"Reproduzir excerto",pause:"Pausar excerto",loading:"A carregar a captura…",source:"Vídeo original",error:"O leitor não está disponível. Abre o vídeo original.",reduced:"Movimento reduzido: reprodução automática desativada."},
  "en-GB":{title:"Super Heavy: caught by the tower",caption:"Flight 5 · 13 Oct 2024 · SpaceX",detail:"20 s excerpt at up to 2× (about 10 s), muted, on repeat. External YouTube player.",play:"Play excerpt",pause:"Pause excerpt",loading:"Loading the catch…",source:"Original video",error:"The player is unavailable. Open the original video.",reduced:"Reduced motion: automatic playback disabled."},
  "es-ES":{title:"Super Heavy: captura por la torre",caption:"Vuelo 5 · 13/10/2024 · SpaceX",detail:"Fragmento de 20 s a hasta 2× (unos 10 s), sin sonido, en bucle. Reproductor externo YouTube.",play:"Reproducir fragmento",pause:"Pausar fragmento",loading:"Cargando la captura…",source:"Vídeo original",error:"El reproductor no está disponible. Abre el vídeo original.",reduced:"Movimiento reducido: reproducción automática desactivada."},
};

export function BoosterCatchPreview({locale}:{locale:Locale}) {
  const t = copy[locale];
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const wantsPlay = useRef(true);
  const visible = useRef(false);
  const [enabled,setEnabled] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [ready,setReady] = useState(false);
  const [playing,setPlaying] = useState(false);
  const [failed,setFailed] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {setReduced(query.matches); setEnabled(!query.matches); setReady(false); setPlaying(false); setFailed(false); wantsPlay.current = !query.matches;};
    update(); query.addEventListener("change",update);
    return () => query.removeEventListener("change",update);
  },[]);
  useEffect(() => {
    const target = host.current;
    if (!enabled || !target) return;
    let cancelled = false;
    let local:Player | undefined;
    let isPlaying = false;
    const canPlay = () => visible.current && !document.hidden && wantsPlay.current;
    const rewind = (p:Player) => {p.seekTo(clip.startSeconds,true); p.playVideo();};
    const sync = () => {
      if (!player.current) return;
      if (canPlay()) {
        const time = player.current.getCurrentTime();
        if (time >= clip.endSeconds || time < clip.startSeconds) rewind(player.current);
        else player.current.playVideo();
      }
      else player.current.pauseVideo();
    };
    // Reuse the same decoded video instead of reloading it at every loop.
    // Mobile Safari may block the fresh playback request after an ended event.
    const loop = window.setInterval(() => {
      const p = player.current;
      if (p && isPlaying && canPlay() && p.getCurrentTime() >= clip.endSeconds - .25) rewind(p);
    },100);
    const observer = new IntersectionObserver(([entry]) => {visible.current = entry.isIntersecting; sync();},{threshold:.15});
    observer.observe(target);
    document.addEventListener("visibilitychange",sync);
    const timeout = window.setTimeout(() => {if (!cancelled) setFailed(true);},15000);
    loadApi().then(api => {
      if (cancelled) return;
      const mount = document.createElement("div");
      target.appendChild(mount);
      local = new api.Player(mount,{
        host:"https://www.youtube-nocookie.com", videoId:clip.videoId,
        playerVars:{start:clip.startSeconds,autoplay:0,mute:1,controls:0,playsinline:1,rel:0,origin:location.origin},
        events:{
          onReady:({target:p}:PlayerEvent) => {
            if (cancelled) return;
            clearTimeout(timeout); player.current = p; p.mute();
            if (p.getAvailablePlaybackRates().includes(2)) p.setPlaybackRate(2);
            const frame = target.querySelector("iframe");
            if (frame) {frame.title = t.title; frame.referrerPolicy = "strict-origin-when-cross-origin";}
            setFailed(false); setReady(true); sync();
          },
          onStateChange:({data,target:p}:PlayerEvent) => {
            if (cancelled) return;
            isPlaying = data === 1;
            setPlaying(data === 1);
            if (data === 1 && p.getAvailablePlaybackRates().includes(2)) p.setPlaybackRate(2);
            if (data === 0 && canPlay()) rewind(p);
          },
          onError:() => {if (!cancelled) {clearTimeout(timeout); setFailed(true);}},
          onAutoplayBlocked:() => {if (!cancelled) setPlaying(false);},
        },
      });
    }).catch(() => {if (!cancelled) {clearTimeout(timeout); setFailed(true);}});
    return () => {cancelled = true; clearTimeout(timeout); clearInterval(loop); observer.disconnect(); document.removeEventListener("visibilitychange",sync); player.current = null; local?.destroy(); target.replaceChildren();};
  },[enabled,t.title]);
  return <figure className="booster-catch">
    <div className="booster-catch-screen"><div ref={host} className="booster-catch-player"/>
      {!ready && <div className="booster-catch-placeholder">{enabled && !failed ? <span role="status"><Spinner/>{t.loading}</span> : <span>{failed ? t.error : reduced ? t.reduced : t.loading}</span>}</div>}
    </div>
    <figcaption><strong>{t.title} <InfoDisclosure label={t.title}>{t.detail}</InfoDisclosure></strong><span>{t.caption}</span></figcaption>
    <div className="booster-catch-actions"><button type="button" disabled={failed || (enabled && !ready)} onClick={() => {
      if (!enabled) {wantsPlay.current = true; setEnabled(true); return;}
      wantsPlay.current = !playing;
      if (playing) player.current?.pauseVideo(); else {
        const p = player.current;
        if (p && (p.getCurrentTime() >= clip.endSeconds || p.getCurrentTime() < clip.startSeconds)) p.seekTo(clip.startSeconds,true);
        p?.playVideo();
      }
    }}>{playing ? `Ⅱ ${t.pause}` : `▶ ${t.play}`}</button><a href="https://www.youtube.com/watch?v=hI9HQfCAw64&t=125s" target="_blank" rel="noopener noreferrer">{t.source} ↗</a></div>
    {failed && ready && <p role="status">{t.error}</p>}
  </figure>;
}
