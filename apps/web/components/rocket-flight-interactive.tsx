'use client';
import { useState } from 'react';
import type { Locale } from '../lib/i18n';
import { rocketFlightCopy } from '../lib/rocket-flight';

export function RocketFlightInteractive({locale}:{locale:Locale}) {
 const t=rocketFlightCopy[locale]; const [force,setForce]=useState(0); const [answer,setAnswer]=useState<number|null>(null);
 return <>
  <section className="flight-section" aria-labelledby="flight-forces"><h2 id="flight-forces">{t.forcesTitle}</h2><p>{t.forcesIntro}</p>
   <div className="flight-force-layout"><div className="flight-diagram" role="img" aria-label={t.diagram}>
    <span className={`flight-arrow flight-arrow-up ${force===0?'active':''}`} aria-hidden="true">↑</span><span className="flight-rocket" aria-hidden="true">🚀</span><span className={`flight-arrow flight-arrow-down ${force===1?'active':''}`} aria-hidden="true">↓</span><span className={`flight-arrow flight-arrow-drag ${force===2?'active':''}`} aria-hidden="true">↓</span>
   </div><div className="flight-force-controls"><div className="flight-force-buttons" role="group" aria-label={t.forcesTitle}>{t.forces.map((name,index)=><button type="button" key={name} aria-pressed={force===index} onClick={()=>setForce(index)}>{name}</button>)}</div><p aria-live="polite">{t.forceText[force]}</p><p className="flight-diagram-text">{t.diagram}</p></div></div>
  </section>
  <section className="flight-quiz" aria-labelledby="flight-quiz"><h2 id="flight-quiz">{t.quiz}</h2><p>{t.question}</p><div className="flight-quiz-options">{t.answers.map((choice,index)=><button type="button" key={choice} aria-pressed={answer===index} onClick={()=>setAnswer(index)}>{choice}</button>)}</div><p aria-live="polite">{answer===null?'\u00a0':answer===1?t.correct:t.incorrect}</p></section>
 </>;
}
