import type { Metadata } from "next";
import Link from "next/link";
import { MilestoneImage } from "../../../components/milestone-image";
import { LinkPending } from "../../../components/pending-feedback";
import { getLocale } from "../../../lib/locale-server";
import { milestonesCopy, spaceMilestones } from "../../../lib/space-milestones";

export async function generateMetadata(): Promise<Metadata> {
  const t = milestonesCopy[await getLocale()];
  return { title: `${t.title} — NextRocketLaunch`, description: t.intro };
}

export default async function SpaceMilestonesPage() {
  const locale = await getLocale();
  const t = milestonesCopy[locale];
  return <main id="main-content" className="milestones-page">
    <Link className="milestones-back" href="/explore-space">← {t.back}<LinkPending /></Link>
    <header className="milestones-hero">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </header>
    <section aria-labelledby="milestones-timeline-title">
      <h2 id="milestones-timeline-title" className="visually-hidden">{t.timeline}</h2>
      <ol className="milestones-timeline">
        {spaceMilestones.map((milestone, index) => <li className="milestone-item" key={milestone.id}>
          <span className="milestone-marker" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></span>
          <article className="milestone-card" aria-labelledby={`${milestone.id}-title`}>
            <div className="milestone-card-top">
              <time dateTime={milestone.date} className="milestone-date">{new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${milestone.date}T12:00:00Z`))}</time>
              <span className="milestone-category">{t.categories[milestone.category]}</span>
            </div>
            <h2 id={`${milestone.id}-title`}>{milestone.title[locale]}</h2>
            <MilestoneImage
              id={milestone.id}
              title={milestone.title[locale]}
              src={milestone.image.src}
              width={milestone.image.width}
              height={milestone.image.height}
              alt={milestone.image.alt[locale]}
              credit={milestone.image.credit[locale]}
              sourceUrl={milestone.image.url}
              labels={{ open: t.openImage, close: t.closeImage, hint: t.imageHint, newTab: t.newTab }}
            />
            <p className="milestone-description">{milestone.description[locale]}</p>
            <aside className="milestone-why" aria-label={t.why}>
              <strong>{t.why}</strong><p>{milestone.whyItMatters[locale]}</p>
            </aside>
            <footer className="milestone-card-footer">
              {milestone.related && <Link className="milestone-related" href={milestone.related.href}>{t.related}: {milestone.related.label[locale]} <span aria-hidden="true">↗</span><LinkPending /></Link>}
              <a className="milestone-source" href={milestone.source.url} target="_blank" rel="noopener noreferrer">{t.source}: {milestone.source.publisher} · {milestone.source.label[locale]} <span aria-hidden="true">↗</span><span className="visually-hidden"> ({t.newTab})</span></a>
            </footer>
          </article>
        </li>)}
      </ol>
    </section>
  </main>;
}
