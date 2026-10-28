import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';
import {getLocale} from '../../../../lib/locale-server';
import {arianeCopy,arianeSources as sources} from '../../../../lib/ariane-6';
import {Ariane6Related} from '../../../../components/ariane-6-related';
import '../starship/starship.css';
import './ariane.css';

export async function generateMetadata(){const t=arianeCopy[await getLocale()];return {title:'Ariane 6 — NextRocketLaunch',description:t.intro,openGraph:{title:'Ariane 6 — NextRocketLaunch',description:t.intro}};}
function Rocket({boosters,label}:{boosters:number;label:string}){return <svg viewBox="0 0 200 280" role="img" aria-label={label}><g fill="var(--surface-raised)" stroke="currentColor" strokeWidth="3"><path d="M80 240V60Q100 5 120 60V240Z"/><path d="M80 95h40M80 145h40"/>{(boosters===2?[60,140]:[40,65,135,160]).map(x=><path key={x} d={`M${x-8} 240V145l8-18 8 18v95Z`}/>)}<path d="M90 240l-7 16h34l-7-16"/></g><text x="100" y="85" textAnchor="middle" fill="currentColor" fontSize="14">A{boosters===2?'62':'64'}</text></svg>;}
export default async function Ariane6(){
 const locale=await getLocale(),t=arianeCopy[locale];
 const sections=[[t.about,'about'],[t.tech,'rocket'],[t.journey,'journey'],[t.milestones,'milestones'],[t.why,'why']] as const;
 const eventSources=[sources.technology,sources.review,sources.commercial,sources.four];
 return <main id="main-content" className="artemis-guide discoveries-page starship-guide ariane-guide">
 <Link className="guide-back" href="/explore-space/programs">← {t.back}</Link>
 <header className="programs-hero starship-hero"><div className="programs-hero-copy"><p className="eyebrow">ESA · ArianeGroup · Arianespace</p><h1>Ariane 6</h1><p>{t.intro}</p></div><div className="starship-hero-photo"><Image src="/images/programs/ariane.webp" alt={t.photo} fill priority sizes="(max-width:700px) 100vw, 50vw"/></div></header>
 <p className="programs-hero-credit"><a href={sources.image}>{t.credit} ↗</a> · <a href={sources.license}>CC BY-SA 3.0 IGO ↗</a></p>
 <nav className="guide-contents" aria-label={t.about}>{sections.map(([name,id],i)=><a href={`#${id}`} key={id}><span>0{i+1}</span>{name}</a>)}</nav>
 <section id="about" className="guide-section artemis-about"><h2>{t.about}</h2><p>{t.body}</p><a href={sources.first}>{t.source} · ESA ↗</a></section>
 <section id="rocket" className="guide-section"><h2>{t.tech}</h2><div className="guide-role-grid">{t.parts.map(([name,body])=><article key={name}><h3>{name}</h3><p>{body}</p></article>)}</div><a href={sources.technology}>{t.source} · ArianeGroup ↗</a><h3>{t.variants}</h3><div className="guide-role-grid ariane-variants">{[t.a62,t.a64].map((label,i)=><figure className="starship-profile" key={label}><Rocket boosters={i===0?2:4} label={label}/><figcaption>{label}</figcaption></figure>)}</div><p>{t.variantBody}</p></section>
 <section id="journey" className="guide-section"><h2>{t.journey}</h2><figure className="starship-profile"><svg viewBox="0 0 720 240" role="img" aria-labelledby="ariane-profile-title ariane-profile-desc"><title id="ariane-profile-title">{t.journey}</title><desc id="ariane-profile-desc">{t.diagram}</desc><path d="M35 200H685" stroke="currentColor" strokeWidth="2"/><path className="route" d="M70 190Q140 45 340 65T660 55"/><g fill="var(--surface-raised)" stroke="currentColor" strokeWidth="3"><path d="M60 190v-45l10-25 10 25v45z M165 118l15-22 15-8-3 17-18 24z M300 67l30-8 12 8-12 8z M475 57h35v15h-35z M620 42h20v25h-20z M605 45h10v20h-10z M645 45h10v20h-10z"/></g>{[70,180,320,490,630].map((x,i)=><text key={x} x={x} y={i===0?225:110} textAnchor="middle">0{i+1}</text>)}</svg><figcaption>{t.diagram}</figcaption></figure><ol className="guide-flow">{t.steps.map(([title,body],i)=><li key={title}><span>0{i+1}</span><strong>{title}</strong><p>{body}</p></li>)}</ol><p className="guide-note">{t.note}</p><a href={sources.commercial}>{t.source} · ESA ↗</a></section>
 <section id="milestones" className="guide-section"><h2>{t.milestones}</h2><p>{t.scope}</p><div className="guide-missions">{t.events.map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p><a href={eventSources[i]}>{t.source} · {i===0?'ArianeGroup':i===3?'Arianespace':'ESA'} ↗</a></article>)}</div></section>
 <section className="guide-section" aria-labelledby="ariane-related"><h2 id="ariane-related">{t.related}</h2><Suspense fallback={<p role="status">{t.loading}</p>}><Ariane6Related locale={locale}/></Suspense></section>
 <section id="why" className="guide-section artemis-why"><h2>{t.why}</h2><p>{t.whyBody}</p></section>
 <nav className="artemis-continue" aria-label={t.more}><h2>{t.more}</h2><Link href="/explore-space/how-rockets-work">{t.rockets} →</Link><Link href="/discoveries/artemis">Artemis →</Link><Link href="/explore-space/programs/starship">Starship →</Link><Link href="/explore-space/programs/commercial-crew">Commercial Crew →</Link></nav>
 <footer className="discovery-footer"><p>{t.review}</p></footer>
 </main>;
}
