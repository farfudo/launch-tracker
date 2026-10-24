import Link from "next/link";
import { FavoriteButton } from "../../../components/favorites";
import { notFound } from "next/navigation";

import { LaunchNotFoundError } from "../../../lib/api";
import { getCachedLaunch } from "../../../lib/cached-api";
import { CacheNotice } from "../../../components/cache-notice";
import { formatLaunchDate } from "../../../lib/date";
import { formatLaunchStatus, launchStatusTone } from "../../../lib/launch";
import { dictionaries } from "../../../lib/i18n";
import { getLocale } from "../../../lib/locale-server";
import { LaunchTimes } from "../../../components/launch-times";
import { MissionIcon, type MissionIconName } from "../../../components/mission-icon";
import { VehicleVisual } from "../../../components/vehicle-visual";
import { DesignReview, resolveDesign } from "../../../components/design-review";
import { BrandMark } from "../../../components/brand";
import { MissionStreams } from "../../../components/mission-streams";
import { MissionSources } from "../../../components/mission-sources";
import { MissionCalendar } from "../../../components/mission-calendar";
import { LinkPending } from "../../../components/pending-feedback";
import { MissionShare } from "../../../components/mission-share";

type RouteParams = Promise<{ id: string }>;

export default async function LaunchDetail({ params, searchParams }: {
  params: RouteParams;
  searchParams: Promise<{ design?: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const preview = process.env.DESIGN_PREVIEW === "true";
  const design = preview ? resolveDesign((await searchParams).design) : "mission-control";

    const result = await getCachedLaunch(id).catch((error: unknown) => {
      if (error instanceof LaunchNotFoundError) notFound();
      throw error;
    });
    const launch = result.value;
    const cards: { label: string; value: string; icon: MissionIconName }[] = [
      { label: t.agency, value: launch.agency || t.pending, icon: "agency" },
      { label: t.vehicle, value: launch.vehicle || t.pending, icon: "rocket" },
      { label: t.status, value: formatLaunchStatus(launch.status, locale), icon: "status" },
      { label: t.launchSite, value: launch.location_name || t.pending, icon: "location" },
      { label: t.launchPad, value: launch.pad_name || t.pending, icon: "pad" },
      { label: t.dataUpdated, value: formatLaunchDate(launch.source_updated_at, locale), icon: "clock" }
    ];

    return (
      <main id="main-content" className={`mission-detail-page design-${design}`}>
        {preview ? <DesignReview launchId={id} selected={design} messages={t} /> : null}
        <div className="mission-navigation">
          <Link className="back-link" href="/">← {t.backToCalendar}<LinkPending /></Link>
          <BrandMark className="mission-wordmark" />
        </div>

        <section className="mission-hero" aria-labelledby="mission-title">
          <div className="mission-hero-copy">
            <p className="eyebrow"><span className="mission-signal" aria-hidden="true" />{t.launchDetail}</p>
            <h1 id="mission-title">{launch.mission_name || launch.name}</h1>
            <span className="mission-status" data-tone={launchStatusTone(launch.status)}><span aria-hidden="true" />{formatLaunchStatus(launch.status, locale)}</span>
            <FavoriteButton id={launch.id} name={launch.name} />
            <MissionCalendar launch={launch} />
            <MissionShare key={launch.id} id={launch.id} name={launch.name} />
            <div className="mission-target">
              <span className="mission-target-icon"><MissionIcon name="clock" /></span>
              <div><p>{t.expectedDate}</p><time dateTime={launch.net}>{formatLaunchDate(launch.net, locale)}</time></div>
            </div>
          </div>
          <VehicleVisual key={launch.image_url || launch.id} launch={launch} />
        </section>

        <section className="mission-facts" aria-labelledby="mission-facts-heading">
          <CacheNotice entries={[result.cache]} />
          <h2 id="mission-facts-heading" className="visually-hidden">{t.availableInfo}</h2>
          <dl className="mission-fact-grid">
            {cards.map((card) => <div className="mission-fact-card" key={card.label}>
              <div className="fact-card-heading"><span className="fact-card-icon"><MissionIcon name={card.icon} /></span><dt>{card.label}</dt></div>
              <dd>{card.value}</dd>
            </div>)}
          </dl>
        </section>

        <MissionSources launch={launch} />
        <div className="mission-content-grid">
          <MissionStreams launch={launch} />
          <section className="mission-panel mission-story" aria-labelledby="mission-heading">
            <div className="mission-panel-heading"><span className="panel-icon"><MissionIcon name="orbit" /></span><h2 id="mission-heading">{t.aboutMission}</h2><span className="panel-index" aria-hidden="true">01</span></div>
            <p className="mission-description">{launch.mission_description || t.descriptionPending}</p>
            {launch.mission_description ? <p className="launch-meta">{t.originalDescription}</p> : null}
          </section>

          <section className="mission-panel mission-clock-panel" aria-labelledby="launch-times-heading">
            <div className="mission-panel-heading"><span className="panel-icon"><MissionIcon name="clock" /></span><h2 id="launch-times-heading">{t.timeReferences}</h2><span className="panel-index" aria-hidden="true">02</span></div>
            <LaunchTimes isoDate={launch.net} launchTimeZone={launch.launch_timezone} />
            <p className="launch-meta">{t.timezoneNotice}</p>
          </section>
        </div>

        <section className="mission-panel mission-window-panel" aria-labelledby="launch-window-heading">
          <div className="mission-panel-heading"><span className="panel-icon"><MissionIcon name="pad" /></span><h2 id="launch-window-heading">{t.launchWindow}</h2><span className="panel-index" aria-hidden="true">03</span></div>
          <ol className="mission-window-track">
            {[
              { label: t.windowStart, date: launch.window_start },
              { label: t.expectedDate, date: launch.net },
              { label: t.windowEnd, date: launch.window_end }
            ].map((point, index) => <li key={point.label} className={index === 1 ? "target-point" : ""}>
              <span className="window-track-dot" aria-hidden="true" />
              <p>{point.label}</p>
              {point.date ? <time dateTime={point.date}>{formatLaunchDate(point.date, locale)}</time> : <span>{t.pending}</span>}
            </li>)}
          </ol>
          <details className="window-time-details">
            <summary>{t.fullWindowTimes}</summary>
            <div className="window-times">
              <div><h3 className="time-heading">{t.windowStart}</h3>{launch.window_start ? <LaunchTimes isoDate={launch.window_start} launchTimeZone={launch.launch_timezone} /> : <p>{t.pending}</p>}</div>
              <div><h3 className="time-heading">{t.windowEnd}</h3>{launch.window_end ? <LaunchTimes isoDate={launch.window_end} launchTimeZone={launch.launch_timezone} /> : <p>{t.pending}</p>}</div>
            </div>
          </details>
          <p className="launch-meta">{t.windowNotice}</p>
        </section>

        <footer className="mission-source-footer"><span><MissionIcon name="orbit" />{t.dataSource}</span>{launch.source_url ? <a href={launch.source_url} rel="noreferrer" target="_blank">{t.viewSource} ↗</a> : null}</footer>
      </main>
    );
}
