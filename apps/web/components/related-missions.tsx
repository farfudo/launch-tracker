import Link from "next/link";
import { Spinner, LinkPending } from "./pending-feedback";
import { LocalLaunchDate } from "./local-launch-date";
import { VehicleVisual } from "./vehicle-visual";
import { formatLaunchStatus, launchStatusTone } from "../lib/launch";
import { getCachedLaunches } from "../lib/cached-api";
import type { Launch } from "../lib/api";
import type { Locale } from "../lib/i18n";
import { relatedLaunchCopy as copy } from "../lib/related-missions-copy";
import { relatedLaunches, relatedTopicsForLaunch, type EducationLaunchTopic } from "../lib/related-missions";

const educationHref: Record<EducationLaunchTopic, string> = {
  artemis: "/discoveries/artemis#guide-0",
  starship: "/discoveries?topic=starship#technology-lab",
  reuse: "/discoveries?topic=reuse#discovery-results",
};

export function RelatedLaunchesLoading({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <div className="related-launches-loading" role="status" aria-live="polite"><Spinner /> {t.loading}</div>;
}

function RelatedLaunchCard({ launch, topics, locale }: {
  launch: Launch; topics: EducationLaunchTopic[]; locale: Locale;
}) {
  const t = copy[locale];
  return <article className="launch-card related-launch-card">
    <div className="launch-thumbnail"><VehicleVisual launch={launch} priority={false} /></div>
    <Link className="launch-card-link" href={`/launches/${encodeURIComponent(launch.id)}`} prefetch={false}>
      <p className="launch-agency" title={`${launch.agency ?? ""} · ${launch.vehicle ?? ""}`}>{launch.agency ?? ""}{launch.agency && launch.vehicle ? " · " : ""}{launch.vehicle ?? ""}</p>
      <h3 title={launch.name}>{launch.name}</h3>
      <p className="launch-date"><LocalLaunchDate date={launch.net} status={launch.status} precision={launch.net_precision} /></p>
      <span className="launch-status-tag" data-tone={launchStatusTone(launch.status)}>{formatLaunchStatus(launch.status, locale)}</span>
      <span className="row-detail-link">{t.detail} →<LinkPending /></span>
    </Link>
    <ul className="related-launch-topics" aria-label={t.education}>{topics.map(topic => <li key={topic}>{t.topic[topic]}</li>)}</ul>
  </article>;
}

export function RelatedEducationLinks({ launch, locale }: { launch: Pick<Launch, "name" | "vehicle">; locale: Locale }) {
  const topics = relatedTopicsForLaunch(launch);
  if (!topics.length) return null;
  const t = copy[locale];
  return <nav className="mission-related-education" aria-label={t.education}>
    <h3>{t.education}</h3>
    <ul>{topics.map(topic => <li key={topic}><Link href={educationHref[topic]}>{t.learning[topic]} <span aria-hidden="true">→</span><LinkPending /></Link></li>)}</ul>
  </nav>;
}

export async function RelatedMissions({ locale, topics }: { locale: Locale; topics: readonly EducationLaunchTopic[] }) {
  const t = copy[locale];
  let launches: Launch[];
  try {
    // Reads the app's existing cached API data; it never contacts Launch Library 2.
    launches = (await getCachedLaunches(100, { period: "upcoming" })).value;
  } catch {
    return <p className="related-launches-error launch-meta" role="status">{t.error}</p>;
  }

  const matches = relatedLaunches(launches, topics);
  if (!matches.length) return null;
  return <section className="related-launches" aria-labelledby="related-launches-heading">
    <h2 id="related-launches-heading">{t.heading}</h2>
    <div className="related-launch-list">{matches.map(({ launch, topics: matchedTopics }) =>
      <RelatedLaunchCard key={launch.id} launch={launch} topics={matchedTopics} locale={locale} />
    )}</div>
  </section>;
}
