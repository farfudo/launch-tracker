import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from '../../../lib/locale-server';
import { spacePrograms } from '../../../lib/space-programs';

export async function generateMetadata() { const t=spacePrograms(await getLocale()); return {title:`${t.title} — NextRocketLaunch`,description:t.intro}; }
export default async function SpaceProgramsPage() {
 const locale=await getLocale(); const t=spacePrograms(locale); const artemis=t.programs[0]; const adapted={"pt-PT":"imagem adaptada","en-GB":"image adapted","es-ES":"imagen adaptada"}[locale];
 return <main id="main-content" className="programs-page">
  <Link className="guide-back" href="/explore-space">← {t.back}</Link>
  <header className="programs-hero"><Image src="/images/backgrounds/artemis-orion.webp" alt="" fill priority sizes="100vw" className="programs-hero-image"/><div className="programs-hero-copy"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></div></header>
  <p className="programs-hero-credit"><a href="https://www.nasa.gov/image-detail/amf-art001e000673/" target="_blank" rel="noopener noreferrer">NASA · Orion, Earth and Moon ↗</a></p>
  <section className="programs-feature" aria-labelledby="programs-feature-title"><div className="programs-feature-image"><Image src={artemis.image} alt={artemis.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div><div className="programs-feature-copy"><p className="eyebrow">{t.featured}</p><h2 id="programs-feature-title">{t.featureTitle}</h2><p>{t.featureBody}</p><Link href="/discoveries/artemis" className="programs-feature-link">{t.explore} →</Link><p className="programs-credit"><a href={artemis.source} target="_blank" rel="noopener noreferrer">{artemis.credit} ↗</a></p></div></section>
  <section aria-labelledby="programs-grid-title"><h2 id="programs-grid-title">{t.section}</h2><p>{t.note}</p><div className="programs-grid">{t.programs.map(p=><article className="program-card" key={p.name}><div className="program-card-image"><Image src={p.image} alt={p.alt} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw"/></div><div className="program-card-copy"><span className="program-category">{p.category}</span><h3>{p.href?<Link href={p.href}>{p.name} ↗</Link>:p.name}</h3><p className="program-org">{p.org}</p><p>{p.description}</p><p className="programs-credit"><a href={p.source} target="_blank" rel="noopener noreferrer">{p.credit} ↗</a> · {adapted} · <a href={p.license} target="_blank" rel="noopener noreferrer">{t.credit} ↗</a></p></div></article>)}</div></section>
 </main>;
}
