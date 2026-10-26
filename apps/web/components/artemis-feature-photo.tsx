"use client";

import Image from 'next/image';
import { useState } from 'react';
import type { Locale } from '../lib/i18n';
import { Spinner } from './pending-feedback';

const copy = {
  'pt-PT': {alt:'Orion em primeiro plano, com a Terra e a Lua ao fundo, durante a Artemis I.',caption:'Artemis I · Orion, Terra e Lua · 28/11/2022',source:'Fotografia: NASA / JSC',loading:'A carregar fotografia…',error:'Fotografia indisponível. Ver na NASA'},
  'en-GB': {alt:'Orion in the foreground with Earth and the Moon behind it during Artemis I.',caption:'Artemis I · Orion, Earth and Moon · 28 Nov 2022',source:'Photo: NASA / JSC',loading:'Loading photograph…',error:'Photograph unavailable. View at NASA'},
  'es-ES': {alt:'Orion en primer plano, con la Tierra y la Luna al fondo durante Artemis I.',caption:'Artemis I · Orion, Tierra y Luna · 28/11/2022',source:'Fotografía: NASA / JSC',loading:'Cargando fotografía…',error:'Fotografía no disponible. Ver en NASA'},
};
export function ArtemisFeaturePhoto({locale}:{locale:Locale}) {
  const t=copy[locale];
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  return <figure className="artemis-feature-photo">
    <div className="artemis-feature-photo-frame">
      {!failed && <Image src="https://images-assets.nasa.gov/image/art001e000673/art001e000673~large.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1440&w=1920" alt={t.alt} fill unoptimized sizes="(max-width:800px) 90vw, 480px" loading="lazy" referrerPolicy="no-referrer" onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/>}
      {!loaded && !failed && <span className="artemis-photo-loading" role="status"><Spinner/>{t.loading}</span>}
      {failed && <a className="artemis-photo-loading" href="https://www.nasa.gov/image-detail/amf-art001e000673/" target="_blank" rel="noopener noreferrer">{t.error} ↗</a>}
    </div>
    <figcaption>{t.caption}<a href="https://www.nasa.gov/image-detail/amf-art001e000673/" target="_blank" rel="noopener noreferrer">{t.source} ↗</a></figcaption>
  </figure>;
}
