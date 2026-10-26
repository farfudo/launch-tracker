"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "../lib/i18n";
import { explorerCopy, technologySources } from "../lib/discovery-explorers";
import { TechnologyArt } from "./technology-art";
import { sequenceCopy } from "../lib/technology-sequences";

function subscribeMotion(onChange:()=>void) {
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change',onChange);
  return ()=>media.removeEventListener('change',onChange);
}
const getReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

const illustrationNotes = {
  'pt-PT': ['Inspirado no Raptor. Circuitos internos simplificados.', '', 'Conceito planeado entre Starships; posição e ligação ilustrativas.'],
  'en-GB': ['Raptor-inspired. Simplified internal plumbing.', '', 'Planned Starship concept; illustrative positions and connections.'],
  'es-ES': ['Inspirado en Raptor. Circuitos internos simplificados.', '', 'Concepto previsto entre Starships; posiciones y conexiones ilustrativas.'],
};

export function TechnologyLab({locale}:{locale:Locale}) {
  const [selected,setSelected] = useState(0);
  const [active,setActive] = useState(false);
  const [stage,setStage] = useState(-1);
  const [running,setRunning] = useState(false);
  const reduced=useSyncExternalStore(subscribeMotion,getReduced,()=>false);
  const s=sequenceCopy[locale];
  const stages=selected===0?s.engine:s.docking;
  const sequenced=selected!==1;
  useEffect(()=>{
    if (!running || reduced || selected===1) return;
    const timer=window.setInterval(()=>{
      if(document.hidden) return;
      if(stage>=3) setRunning(false); else setStage(stage+1);
    },5000);
    return ()=>clearInterval(timer);
  },[running,reduced,stage,selected]);
  const advance=()=>{setRunning(false);setStage(stage>=3?0:stage+1);};
  const t = explorerCopy[locale];
  const item = t.technologies[selected];
  return <section id="technology-lab" className="technology-lab" aria-labelledby="lab-title">
    <div className="discovery-section-heading"><div><p className="eyebrow">{t.lab}</p><h2 id="lab-title">{t.labTitle}</h2></div></div>
    <div className="technology-picker" role="group" aria-label={t.labTitle}>{t.tabs.map((label,index)=><button key={label} type="button" aria-pressed={selected===index} aria-controls="technology-panel" onClick={()=>{setSelected(index);setActive(false);setStage(-1);setRunning(false);}}><span aria-hidden="true">0{index+1}</span>{label}</button>)}</div>
    <div id="technology-panel" className="technology-panel">
      <figure><TechnologyArt key={selected} index={selected} active={sequenced?stage>=0:active} stage={stage} paused={sequenced&&!running} parts={s.parts} labels={item.labels}/>
        <div className="technology-playback">
          <button className="technology-action" type="button" aria-pressed={sequenced?running:active} aria-controls="technology-illustration" onClick={()=>{
            if(!sequenced) {setActive(!active);return;}
            if(reduced) {advance();return;}
            if(running) setRunning(false); else {if(stage<0||stage===3)setStage(0);setRunning(true);}
          }}><span aria-hidden="true">{(sequenced?running:active)?'Ⅱ':'▶'} </span>{sequenced?(reduced?s.next:running?s.pause:stage===3?s.replay:s.play):active?t.reset:item.action}</button>
          {sequenced&&<>{!reduced&&<button type="button" className="technology-next" onClick={advance}>{s.next} →</button>}<button type="button" className="technology-reset" onClick={()=>{setStage(-1);setRunning(false);}} aria-label={s.reset}>↺</button></>}
        </div>
        {sequenced&&<p className="technology-progress">{stage<0?'00':`0${stage+1}`} / 04 <span>{stage<0?item.title:stages[stage].title}</span></p>}
        <figcaption>{t.concept}<span className="technology-art-note">{sequenced?(selected===0?s.engineNote:s.dockingNote):illustrationNotes[locale][selected]}</span></figcaption></figure>
      <div className="technology-explainer"><span className="technology-stage">{selected===0?'SpaceX · Raptor 3':item.tag}</span><h3>{selected===0?s.engineTitle:item.title}</h3><p>{item.body}</p><p>{selected===0?s.version3:item.why}</p>
        <p className="technology-state" role="status">{sequenced&&stage>=0?<><strong>{stages[stage].title}</strong>{stages[stage].body}</>:item.states[active?1:0]}</p>
        <details className="technology-limits"><summary>{t.challenge}</summary><p>{item.limit}</p><div>{technologySources[selected].map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{t.source} · {source.name} ↗</a>)}</div></details>
      </div>
    </div>
  </section>;
}
