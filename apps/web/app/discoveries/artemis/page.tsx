import Link from "next/link";
import { Suspense } from "react";
import { RelatedMissions } from "../../../components/related-missions";
import { getLocale } from "../../../lib/locale-server";
import { artemisSources, explorerCopy } from "../../../lib/discovery-explorers";
import { MissionIcon } from "../../../components/mission-icon";
import { LinkPending } from "../../../components/pending-feedback";

export async function generateMetadata() {
  const t = explorerCopy[await getLocale()];
  return {title:`${t.guideTitle} — NextRocketLaunch`,description:t.guideIntro};
}

export default async function ArtemisGuide() {
  const locale = await getLocale();
  const t = explorerCopy[locale];
  const conclusion = {"pt-PT":"Em resumo: Artemis combina foguetão, nave e módulos lunares para levar pessoas à Lua; cada etapa exige testes e coordenação.","en-GB":"In short: Artemis combines a rocket, spacecraft and lunar landers to bring people to the Moon; each step requires testing and coordination.","es-ES":"En resumen: Artemis combina cohete, nave y módulos lunares para llevar personas a la Luna; cada etapa requiere pruebas y coordinación."}[locale];
  const roleSources = [artemisSources.sls,artemisSources.orion,artemisSources.landers,artemisSources.esa];
  const nextSources = [artemisSources.landers,artemisSources.third,artemisSources.orion];
  return <main id="main-content" className="artemis-guide discoveries-page">
    <Link className="guide-back" href="/discoveries#artemis-feature">← {t.back}<LinkPending/></Link>
    <header className="artemis-guide-intro"><div><p className="eyebrow">{t.guide}</p><h1>{t.guideTitle}</h1><p>{t.guideIntro}</p><small>{t.reviewed}</small></div><div className="guide-moon" aria-hidden="true"><span className="lunar-disc"/></div></header>
    <nav className="guide-contents" aria-label={t.contents}>{[t.parts,t.journey,t.progress,t.next].map((label,index)=><a key={label} href={`#guide-${index}`}><span>0{index+1}</span>{label}</a>)}</nav>
    <section id="guide-0" className="guide-section"><h2>{t.parts}</h2><div className="guide-role-grid">{t.roles.map((role,index)=><article key={role.name}><MissionIcon name={index===0?"rocket":"orbit"}/><h3>{role.name}</h3><p>{role.body}</p><a href={roleSources[index]} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></article>)}</div></section>
    <section id="guide-1" className="guide-section"><h2>{t.journey}</h2><ol className="guide-flow">{t.connections.map((step,index)=><li key={step}><span>0{index+1}</span><strong>{step}</strong></li>)}</ol><p className="guide-note">{t.flowNote}</p></section>
    <section id="guide-2" className="guide-section"><h2>{t.progress}</h2><div className="guide-missions">{t.missions.map((mission,index)=><article key={mission.name}><span className={`guide-mission-state ${index===2?"is-planned":"is-completed"}`}>{mission.status}</span><h3>{mission.name}</h3><p>{mission.body}</p><a href={artemisSources[mission.source as "first"|"second"|"third"]} target="_blank" rel="noopener noreferrer">NASA ↗</a></article>)}</div>
      <aside className="guide-update"><h3>{t.current}</h3><p>{t.currentBody}</p><a href={artemisSources.landers} target="_blank" rel="noopener noreferrer">NASA · 23/10/2026 ↗</a></aside>
    </section>
    <section id="guide-3" className="guide-section"><h2>{t.next}</h2><div className="guide-challenges">{t.questions.map((question,index)=><article key={question.title}><h3>{question.title}</h3><p>{question.body}</p><a href={nextSources[index]} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></article>)}</div></section>
    <p className="guide-note">{conclusion}</p><Suspense fallback={null}><RelatedMissions locale={locale} topics={["artemis"]}/></Suspense>
    <details className="guide-faq"><summary>{t.faqQuestion}</summary><p>{t.faqAnswer}</p><a href={artemisSources.landers} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></details>
    <footer className="discovery-footer"><p>{t.reviewed}</p><Link href="/discoveries#artemis-feature">← {t.back}<LinkPending/></Link></footer>
  </main>;
}
