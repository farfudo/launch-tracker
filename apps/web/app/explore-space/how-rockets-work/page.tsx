import Link from 'next/link';
import { getLocale } from '../../../lib/locale-server';
import { rocketFlightCopy } from '../../../lib/rocket-flight';
import { RocketFlightInteractive } from '../../../components/rocket-flight-interactive';

export async function generateMetadata() { const t=rocketFlightCopy[await getLocale()]; return {title:`${t.title} — NextRocketLaunch`,description:t.intro}; }
export default async function RocketFlightPage() {
 const locale=await getLocale(); const t=rocketFlightCopy[locale];
 return <main id="main-content" className="flight-page">
  <Link className="guide-back" href="/explore-space">← {t.back}</Link>
  <header className="flight-hero"><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p><span className="flight-reading">{t.reading}</span></div><div className="flight-hero-art" aria-hidden="true"><span>🚀</span><i>✦</i><i>✧</i></div></header>
  <section className="flight-section flight-intro-section"><h2>{t.thrustTitle}</h2><p>{t.thrustBody}</p><div className="flight-principle" aria-hidden="true"><span>🔥 ↓</span><span>🚀 ↑</span></div></section>
  <RocketFlightInteractive locale={locale}/>
  <div className="flight-pair"><section className="flight-section"><h2>{t.vacuumTitle}</h2><p>{t.vacuumBody}</p></section><section className="flight-section"><h2>{t.orbitTitle}</h2><p>{t.orbitBody}</p></section></div>
  <aside className="flight-why"><h2>{t.why}</h2><p>{t.whyBody}</p></aside>
  <nav className="flight-sources" aria-label={t.sources}><Link href="/discoveries#technology-lab">{t.related} →</Link><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rocket-thrust/" target="_blank" rel="noopener noreferrer">{t.sources}: Rocket thrust ↗</a><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flight-to-orbit/" target="_blank" rel="noopener noreferrer">NASA: Flight to orbit ↗</a><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rocket-aerodynamics/" target="_blank" rel="noopener noreferrer">NASA: Rocket aerodynamics ↗</a></nav>
 </main>;
}
