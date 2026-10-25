"use client";

import { useState } from "react";
import type { Locale } from "../lib/i18n";
import { explorerCopy, technologySources } from "../lib/discovery-explorers";

function TechnologyArt({index,active,labels}:{index:number;active:boolean;labels:string[]}) {
  return <svg viewBox="0 0 440 260" role="img" aria-label={labels.join(" · ")} className={`technology-art art-${index} ${active ? "is-active" : ""}`}>
    <defs><pattern id="composite-weave" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0 16 16M-8 8 8 24M8-8 24 8" stroke="#6e8eaf" strokeWidth="4" opacity=".35"/></pattern></defs>
    {index === 0 ? <>
      <rect x="48" y="28" width="112" height="58" rx="15" fill="#174e61" stroke="#89ddd7"/><rect x="280" y="28" width="112" height="58" rx="15" fill="#263b68" stroke="#aacbff"/>
      <text x="104" y="62" textAnchor="middle">{labels[0]}</text><text x="336" y="62" textAnchor="middle">{labels[1]}</text>
      <path className="tech-flow" d="M104 86v30h89M336 86v30h-89" fill="none" stroke="#9bdfde" strokeWidth="5"/>
      <path d="M193 100h54v42l28 53H165l28-53Z" fill="#9ab0c5" stroke="#e4f2ff" strokeWidth="2"/>
      <path className="engine-flame" d="M183 196Q220 275 258 196Q220 240 183 196" fill="#ffad59" opacity={active?1:0}/>
      <path d="M220 144v-30m-7 10 7-10 7 10" fill="none" stroke="#13313b" strokeWidth="3"/>
      <text x="306" y="165">{labels[2]}</text><text x="306" y="222">{labels[3]}</text>
    </> : index === 1 ? <>
      <rect x="75" y="48" width="290" height="160" rx="12" fill="#1b3049" stroke="#98b6cd"/>
      <rect x="76" y="49" width="288" height="158" rx="12" fill="url(#composite-weave)"/>
      <path d="M95 100h245M95 160h245" stroke="#81e2d8" strokeWidth="2"/>
      {[110,180,260,330].map(x=><circle key={x} cx={x} cy="100" r="5" fill="#81e2d8"/>)}
      <path className="material-crack" d="m225 65-21 25 27 20-29 25 27 21-23 30" fill="none" stroke="#ffbd75" strokeWidth="5" opacity={active?0:1}/>
      <rect className="material-heat" x="90" y="60" width="260" height="135" rx="10" fill="#ff8b47" opacity={active ? .23 : 0}/>
      <text x="28" y="30">{labels[0]}</text><text x="276" y="238">{active?labels[3]:labels[2]}</text><text x="27" y="238">{labels[1]}</text>
    </> : <>
      <path d="M30 45h380M30 221h380" stroke="#6377a2" strokeDasharray="3 8"/>
      <rect x="50" y="72" width="126" height="128" rx="25" fill="#1d3658" stroke="#a8c5e3" strokeWidth="2"/>
      <rect x="264" y="72" width="126" height="128" rx="25" fill="#1d3658" stroke="#a8c5e3" strokeWidth="2"/>
      <rect className="tank-liquid" x="64" y={active?150:102} width="98" height={active?36:84} rx="12" fill="#83d9d6"/>
      <rect className="tank-liquid" x="278" y={active?120:168} width="98" height={active?66:18} rx="12" fill="#83d9d6"/>
      <path className="tech-flow" d="M176 136h88" stroke="#ffbb6b" strokeWidth="7" fill="none"/><path d="m227 129 11 7-11 7" fill="none" stroke="#0b2038" strokeWidth="3"/>
      <text x="113" y="34" textAnchor="middle">{labels[0]}</text><text x="327" y="34" textAnchor="middle">{labels[1]}</text><text x="220" y="245" textAnchor="middle">{labels[2]}</text>
    </>}
  </svg>;
}

export function TechnologyLab({locale}:{locale:Locale}) {
  const [selected,setSelected] = useState(0);
  const [active,setActive] = useState(false);
  const t = explorerCopy[locale];
  const item = t.technologies[selected];
  return <section id="technology-lab" className="technology-lab" aria-labelledby="lab-title">
    <div className="discovery-section-heading"><div><p className="eyebrow">{t.lab}</p><h2 id="lab-title">{t.labTitle}</h2></div><p>{t.labIntro}</p></div>
    <div className="technology-picker" role="group" aria-label={t.labTitle}>{t.tabs.map((label,index)=><button key={label} type="button" aria-pressed={selected===index} aria-controls="technology-panel" onClick={()=>{setSelected(index);setActive(false);}}><span aria-hidden="true">0{index+1}</span>{label}</button>)}</div>
    <div id="technology-panel" className="technology-panel">
      <figure><TechnologyArt index={selected} active={active} labels={item.labels}/><figcaption>{t.concept}</figcaption></figure>
      <div className="technology-explainer"><span className="technology-stage">{item.tag}</span><h3>{item.title}</h3><p>{item.body}</p><p>{item.why}</p>
        <button className="technology-action" type="button" aria-pressed={active} onClick={()=>setActive(!active)}>{active?t.reset:item.action}<span aria-hidden="true"> ↗</span></button>
        <p className="technology-state" role="status">{item.states[active?1:0]}</p>
        <details className="technology-limits"><summary>{t.challenge}</summary><p>{item.limit}</p><div>{technologySources[selected].map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{t.source} · {source.name} ↗</a>)}</div></details>
      </div>
    </div>
  </section>;
}
