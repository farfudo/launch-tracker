import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';
import {getLocale} from '../../../../lib/locale-server';
import {crewCopy,crewSources} from '../../../../lib/commercial-crew';
import {CommercialCrewRelated} from '../../../../components/commercial-crew-related';
import '../../programs/starship/starship.css';
import './crew.css';

export async function generateMetadata(){const t=crewCopy[await getLocale()];return {title:'Commercial Crew Program — NextRocketLaunch',description:t.intro};}
export default async function CommercialCrew(){
 const locale=await getLocale(),t=crewCopy[locale];
 const sections=[[t.about,'about'],[t.craft,'craft'],[t.journey,'journey'],[t.milestones,'milestones'],[t.why,'why']] as const;
 const eventSources=[crewSources.demo,'https://www.nasa.gov/news-release/nasas-spacex-crew-1-astronauts-headed-to-international-space-station/',crewSources.cft,crewSources.dragon];
 return <main id="main-content" className="artemis-guide discoveries-page starship-guide">
  <Link className="guide-back" href="/explore-space/programs">← {t.back}</Link>
  <header className="programs-hero starship-hero"><div className="programs-hero-copy"><p className="eyebrow">NASA · Commercial Crew</p><h1>Commercial Crew Program</h1><p>{t.intro}</p></div><div className="starship-hero-photo"><Image src="/images/programs/commercial-crew-dragon.webp" alt={t.photo} fill priority sizes="(max-width:700px) 100vw, 50vw"/></div></header>
  <p className="programs-hero-credit"><a href={crewSources.image}>{t.credit} ↗</a> · <a href="https://www.nasa.gov/nasa-brand-center/images-and-media/">NASA ↗</a></p>
  <nav className="guide-contents" aria-label={t.navigation}>{sections.map(([name,id],i)=><a key={id} href={`#${id}`}><span>0{i+1}</span>{name}</a>)}</nav>
  <section id="about" className="guide-section artemis-about"><h2>{t.about}</h2><p>{t.body}</p><a href={crewSources.nasa}>{t.source} · NASA ↗</a></section>
  <section id="craft" className="guide-section"><h2>{t.craft}</h2><div className="guide-role-grid crew-comparison"><article><figure><Image src="/images/programs/commercial-crew-dragon.webp" width={1280} height={853} alt={t.photo}/><figcaption><a href={crewSources.image}>NASA · Demo-2 · 2020 ↗</a></figcaption></figure><span className="guide-mission-state is-completed">{t.dragonStatus}</span><h3>{t.dragon}</h3><p>{t.dragonBody}</p><a href={crewSources.dragon}>{t.source} · SpaceX ↗</a></article><article><figure><Image src="/images/programs/commercial-crew-starliner.webp" width={600} height={600} alt={t.starlinerPhoto}/><figcaption><a href="https://www.nasa.gov/image-article/boeings-starliner-crew-ship-approaches-space-station/">NASA · OFT-2 · 2022 ↗</a></figcaption></figure><span className="guide-mission-state is-planned">{t.starlinerStatus}</span><h3>{t.starliner}</h3><p>{t.starlinerBody}</p><a href={crewSources.starliner}>{t.source} · NASA ↗</a> · <a href={crewSources.boeing}>Boeing ↗</a></article></div></section>
  <section id="journey" className="guide-section"><h2>{t.journey}</h2><figure className="starship-profile crew-diagram"><svg viewBox="0 0 720 230" role="img" aria-labelledby="crew-diagram-title crew-diagram-description"><title id="crew-diagram-title">{t.journey}</title><desc id="crew-diagram-description">{t.diagram}</desc><path d="M35 190H685" stroke="currentColor" strokeWidth="2"/><path className="route" d="M100 180 Q130 15 330 75"/><path className="route ship-route" d="M390 75 Q560 15 625 180"/><path d="M95 177v-38l10-21 10 21v38z M315 64h90v22h-90z M285 55h25v42h-25z M410 55h25v42h-25z M615 178l10-21 10 21z" fill="var(--surface-raised)" stroke="currentColor" strokeWidth="3"/><text x="75" y="220">01</text><text x="345" y="48">ISS · 03–04</text><text x="610" y="220">05</text></svg><figcaption>{t.diagram}</figcaption></figure><ol className="guide-flow">{t.steps.map((step,i)=><li key={step}><span>0{i+1}</span><strong>{step}</strong><p>{t.details[i]}</p></li>)}</ol><p className="guide-note">{t.note}</p><a href="https://new.spacex.com/humanspaceflight/iss">{t.source} · SpaceX ↗</a></section>
  <section id="milestones" className="guide-section"><h2>{t.milestones}</h2><div className="guide-missions">{t.events.map(([name,body],i)=><article key={name}><h3>{name}</h3><p>{body}</p><a href={eventSources[i]}>{t.source} · {i===3?'SpaceX':'NASA'} ↗</a></article>)}</div></section>
  <section className="guide-section" aria-labelledby="crew-related"><h2 id="crew-related">{t.related}</h2><Suspense fallback={<p role="status">{t.loading}</p>}><CommercialCrewRelated locale={locale}/></Suspense></section>
  <section id="why" className="guide-section artemis-why"><h2>{t.why}</h2><p>{t.whyBody}</p></section>
  <nav className="artemis-continue" aria-label={t.more}><h2>{t.more}</h2><Link href="/discoveries/artemis">Artemis →</Link><Link href="/explore-space/programs/starship">Starship →</Link><Link href="/explore-space/how-rockets-work">{t.rockets} →</Link></nav>
  <footer className="discovery-footer"><p>{t.review}</p></footer>
 </main>;
}
