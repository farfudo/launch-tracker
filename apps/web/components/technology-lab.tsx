"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "../lib/i18n";
import { explorerCopy, technologySources } from "../lib/discovery-explorers";
import { TechnologyArt } from "./technology-art";
import { sequenceCopy } from "../lib/technology-sequences";
import { InfoDisclosure } from "./info-disclosure";

function subscribeMotion(onChange:()=>void) {
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change',onChange);
  return ()=>media.removeEventListener('change',onChange);
}
const getReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

const conclusions = {
  "pt-PT": ["Em resumo: as bombas alimentam a combustão e os gases expulsos produzem impulso.", "Em resumo: detetar e reparar danos pode prolongar a vida dos materiais; esta tecnologia ainda está em estudo.", "Em resumo: reabastecer em órbita poderá permitir viagens mais longas, mas a transferência entre naves ainda precisa de demonstração."],
  "en-GB": ["In short: pumps feed combustion and expelled gases produce thrust.", "In short: detecting and repairing damage could extend material life; the technology is still being studied.", "In short: orbital refuelling could enable longer journeys, but transfer between ships still needs demonstration."],
  "es-ES": ["En resumen: las bombas alimentan la combustión y los gases expulsados producen empuje.", "En resumen: detectar y reparar daños podría prolongar la vida de los materiales; esta tecnología sigue en estudio.", "En resumen: repostar en órbita podría permitir viajes más largos, pero la transferencia entre naves aún debe demostrarse."]
};

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
        <ul className="technology-diagram-legend" aria-label={t.labTitle}>{(selected === 0 ? s.parts : item.labels).map(label => <li key={label}>{label}</li>)}</ul>
        {sequenced&&<p className="technology-progress">{stage<0?'00':`0${stage+1}`} / 04 <span>{stage<0?item.title:stages[stage].title}</span></p>}
        <figcaption><InfoDisclosure label={t.concept}>{t.concept}<span className="technology-art-note">{sequenced?(selected===0?s.engineNote:s.dockingNote):illustrationNotes[locale][selected]}</span></InfoDisclosure></figcaption></figure>
      <div className="technology-explainer"><span className="technology-stage">{selected===0?'SpaceX · Raptor 3':item.tag}</span><h3>{selected===0?s.engineTitle:item.title}</h3><p>{item.body}</p><p>{selected===0?s.version3:item.why}</p><p className="technology-conclusion">{conclusions[locale][selected]}</p>
        <p className="technology-state" role="status">{sequenced&&stage>=0?<><strong>{stages[stage].title}</strong>{stages[stage].body}</>:item.states[active?1:0]}</p>
        <details className="technology-limits"><summary>{t.challenge}</summary><p>{item.limit}</p><div>{technologySources[selected].map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{t.source} · {source.name} ↗</a>)}</div></details>
      </div>
    </div>
  </section>;
}
