import Link from "next/link";
import { notFound } from "next/navigation";

import { getLaunch } from "../../../lib/api";
import { formatLaunchDate } from "../../../lib/date";
import { formatLaunchStatus } from "../../../lib/launch";
import { dictionaries } from "../../../lib/i18n";
import { getLocale } from "../../../lib/locale-server";
import { LaunchTimes } from "../../../components/launch-times";

type RouteParams = Promise<{ id: string }>;

export default async function LaunchDetail({ params }: { params: RouteParams }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = dictionaries[locale];

  try {
    const launch = await getLaunch(id);

    return (
      <main>
        <Link className="back-link" href="/">← {t.backToCalendar}</Link>
        <header className="detail-header">
          <p className="eyebrow">{t.launchDetail}</p>
          <h1>{launch.name}</h1>
          <p className="intro">{formatLaunchDate(launch.net, locale)} · {formatLaunchStatus(launch.status, locale)}</p>
        </header>
        <section className="mission-section" aria-labelledby="mission-heading">
          <p className="eyebrow">{t.aboutMission}</p>
          <h2 id="mission-heading">{launch.mission_name || t.missionPending}</h2>
          <p className="mission-description">{launch.mission_description || t.descriptionPending}</p>
          {launch.mission_description ? <p className="launch-meta">{t.originalDescription}</p> : null}
        </section>
        <section className="mission-section" aria-labelledby="launch-times-heading">
          <h2 id="launch-times-heading">{t.timeReferences}</h2>
          <h3 className="time-heading">{t.expectedDate}</h3>
          <LaunchTimes isoDate={launch.net} launchTimeZone={launch.launch_timezone} />
          <div className="window-times">
            <div>
              <h3 className="time-heading">{t.windowStart}</h3>
              {launch.window_start ? <LaunchTimes isoDate={launch.window_start} launchTimeZone={launch.launch_timezone} /> : <p>{t.pending}</p>}
            </div>
            <div>
              <h3 className="time-heading">{t.windowEnd}</h3>
              {launch.window_end ? <LaunchTimes isoDate={launch.window_end} launchTimeZone={launch.launch_timezone} /> : <p>{t.pending}</p>}
            </div>
          </div>
          <p className="launch-meta">{t.timezoneNotice}</p>
          <p className="launch-meta">{t.windowNotice}</p>
        </section>
        <section aria-labelledby="launch-data-heading">
          <h2 id="launch-data-heading">{t.availableInfo}</h2>
          <dl className="launch-details">
            <div><dt>{t.agency}</dt><dd>{launch.agency ?? t.pending}</dd></div>
            <div><dt>{t.vehicle}</dt><dd>{launch.vehicle ?? t.pending}</dd></div>
            <div><dt>{t.status}</dt><dd>{formatLaunchStatus(launch.status, locale)}</dd></div>
            <div><dt>{t.launchSite}</dt><dd>{launch.location_name || t.pending}</dd></div>
            <div><dt>{t.launchPad}</dt><dd>{launch.pad_name || t.pending}</dd></div>
            <div><dt>{t.dataUpdated}</dt><dd>{formatLaunchDate(launch.source_updated_at, locale)}</dd></div>
          </dl>
          <p className="source-note">
            {t.dataSource}
            {launch.source_url ? <> <a href={launch.source_url} rel="noreferrer" target="_blank">{t.viewSource}</a></> : null}
          </p>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
