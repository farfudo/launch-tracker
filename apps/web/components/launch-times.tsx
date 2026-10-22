"use client";

import { formatLaunchDate, isValidTimeZone } from "../lib/date";
import { useLocale } from "./locale-provider";

export function LaunchTimes({ isoDate, launchTimeZone }: {
  isoDate: string;
  launchTimeZone?: string | null;
}) {
  const { locale, viewerTimeZone, messages: t } = useLocale();
  const siteZone = isValidTimeZone(launchTimeZone) ? launchTimeZone : null;

  return (
    <dl className="time-comparison">
      <div>
        <dt>{t.utcTime} <span className="zone-name">UTC</span></dt>
        <dd><time dateTime={isoDate}>{formatLaunchDate(isoDate, locale)}</time></dd>
      </div>
      <div>
        <dt>{t.siteTime} {siteZone ? <span className="zone-name">{siteZone}</span> : null}</dt>
        <dd>{siteZone ? <time dateTime={isoDate}>{formatLaunchDate(isoDate, locale, siteZone)}</time> : t.unknownSiteZone}</dd>
      </div>
      <div>
        <dt>{t.yourTime} {viewerTimeZone ? <span className="zone-name">{viewerTimeZone}</span> : null}</dt>
        <dd>{viewerTimeZone ? <time dateTime={isoDate}>{formatLaunchDate(isoDate, locale, viewerTimeZone)}</time> : t.detectingZone}</dd>
      </div>
    </dl>
  );
}
