import type { Metadata } from "next";
import Link from "next/link";
import { LinkPending } from "../../components/pending-feedback";
import { getLocale } from "../../lib/locale-server";
import { exploreSpaceCopy } from "../../lib/explore-space";

export async function generateMetadata(): Promise<Metadata> {
  const t = exploreSpaceCopy[await getLocale()];
  return { title: `${t.title} — NextRocketLaunch`, description: t.intro };
}

export default async function ExploreSpacePage() {
  const t = exploreSpaceCopy[await getLocale()];
  return <main id="main-content" className="explore-space-page">
    <header className="explore-space-hero">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </header>
    <section aria-label={t.title} className="explore-space-grid">
      {t.cards.map(([title, description, action, href], index) => <Link className="explore-space-card" href={href} key={href}>
        <span className="explore-space-number" aria-hidden="true">{t.numbers[index]}</span>
        <span className="explore-space-card-copy"><strong>{title}</strong><span>{description}</span></span>
        <span className="explore-space-action">{action}<span aria-hidden="true"> ↗</span><LinkPending /></span>
      </Link>)}
    </section>
    <p className="explore-space-note">{t.note}</p>
  </main>;
}
