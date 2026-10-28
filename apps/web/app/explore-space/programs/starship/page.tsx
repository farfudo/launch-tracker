import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getLocale } from '../../../../lib/locale-server';
import { starshipCopy, starshipSources as sources } from '../../../../lib/starship-development';
import { RelatedMissions, RelatedLaunchesLoading } from '../../../../components/related-missions';
import './starship.css';

export async function generateMetadata() {
 const t=starshipCopy[await getLocale()];
 return {title:'Starship Development — NextRocketLaunch',description:t.intro};
}
export default async function StarshipDevelopment() {
 const locale=await getLocale(); const t=starshipCopy[locale];
 const sections=[[t.about,'about'],[t.tech,'technology'],[t.timeline,'timeline'],[t.profile,'profile'],[t.hls,'hls']] as const;
 return <main id="main-content" className="artemis-guide discoveries-page starship-guide">
  <Link className="guide-back" href="/explore-space/programs">← {t.back}</Link>
  <header className="programs-hero starship-hero"><div className="programs-hero-copy"><p className="eyebrow">SpaceX</p><h1>Starship Development</h1><p>{t.intro}</p></div><div className="starship-hero-photo"><Image src="/images/programs/starship-pad.webp" alt={t.photoAlt} fill priority sizes="(max-width:700px) 100vw, 50vw"/></div></header>
  <p className="programs-hero-credit"><a href={sources.image} target="_blank" rel="noopener noreferrer">{t.photoCredit} ↗</a> · <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a></p>
  <nav className="guide-contents" aria-label={t.about}>{sections.map(([label,id],i)=><a key={id} href={`#${id}`}><span>0{i+1}</span>{label}</a>)}</nav>
  <section id="about" className="guide-section artemis-about"><h2>{t.about}</h2><p>{t.body}</p><a href={sources.overview}>{t.source} · SpaceX ↗</a></section>
  <section id="technology" className="guide-section"><h2>{t.tech}</h2><div className="guide-role-grid">{t.roles.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p><a href={sources.overview}>{t.source} · SpaceX ↗</a></article>)}</div></section>
  <section id="timeline" className="guide-section"><h2>{t.timeline}</h2><p>{t.scope}</p><div className="guide-missions">{[...t.milestones,...t.recent].map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p><a href={i<3?sources.history:i===3?sources.flight5:i===4?sources.flight9:sources.flight12}>{t.source} · {i<3?'NASA OIG':'SpaceX'} ↗</a></article>)}</div></section>
  <section id="profile" className="guide-section"><h2>{t.profile}</h2><figure className="starship-profile"><svg viewBox="0 0 720 300" role="img" aria-labelledby="profile-title profile-description"><title id="profile-title">{t.profile}</title><desc id="profile-description">{t.diagramDescription}</desc><path d="M35 265H685" stroke="currentColor" strokeWidth="2"/><path className="route" d="M90 250Q110 110 270 80Q220 180 120 250"/><path className="route ship-route" d="M270 80Q460 0 650 250"/><g fill="var(--surface-raised)" stroke="currentColor" strokeWidth="2"><path d="M83 245v-30l7-15 7 15v30z"/><path d="M257 83l20-16 13 1-4 12-20 16z"/><path d="M642 247v-24l8-15 8 15v24z"/><path d="M108 248v-30h16v30M105 218h23"/></g><text x="35" y="290">01</text><text x="267" y="55">02</text><text x="133" y="220">03 · Super Heavy</text><text x="440" y="54">04 · Starship</text><text x="650" y="290">05</text></svg><figcaption>{t.diagramDescription}</figcaption></figure><ol className="guide-flow">{t.steps.map(([title,body],i)=><li key={title}><span>0{i+1}</span><strong>{title}</strong><p>{body}</p></li>)}</ol><p className="guide-note">{t.profileNote}</p><a href={sources.flight5}>{t.source} · Flight 5 ↗</a><aside className="guide-update"><h3>{t.planned}</h3><p>{t.plannedBody}</p></aside></section>
  <section id="hls" className="guide-section artemis-about"><h2>{t.hls}</h2><p>{t.hlsBody}</p><a href={sources.hls}>{t.source} · NASA ↗</a></section>
  <section className="guide-section" aria-labelledby="starship-related"><h2 id="starship-related">{t.related}</h2><p>{t.relatedNote}</p><Suspense fallback={<RelatedLaunchesLoading locale={locale}/>}><RelatedMissions locale={locale} topics={['starship']}/></Suspense></section>
  <section className="guide-section artemis-why"><h2>{t.why}</h2><p>{t.whyBody}</p></section>
  <nav className="artemis-continue" aria-label={t.more}><h2>{t.more}</h2><Link href="/discoveries/artemis">{t.artemis} →</Link><Link href="/explore-space/how-rockets-work">{t.rockets} →</Link><Link href="/explore-space/programs">{t.back} →</Link></nav>
  <footer className="discovery-footer"><p>{t.reviewed}</p></footer>
 </main>;
}
