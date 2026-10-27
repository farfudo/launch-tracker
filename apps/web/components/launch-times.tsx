"use client";

import { isValidTimeZone } from "../lib/date";
import { useLocale } from "./locale-provider";
import type { NetPrecision } from "../lib/api";
import { clockPrecision, formatTemporalDate } from "../lib/temporal-precision";
import { LocalLaunchDate } from "./local-launch-date";
import { Spinner } from "./pending-feedback";

export function LaunchTimes({ isoDate, launchTimeZone, precision }: {
  isoDate: string;
  precision?: NetPrecision | null;
  launchTimeZone?: string | null;
}) {
  const { locale, viewerTimeZone, messages: t } = useLocale();
  const siteZone = isValidTimeZone(launchTimeZone) ? launchTimeZone : null;

  if (!clockPrecision(precision)) return <p><LocalLaunchDate date={isoDate} precision={precision} /></p>;

  return (
    <dl className="time-comparison">
      <div>
        <dt>{t.utcTime} <span className="zone-name">UTC</span></dt>
        <dd><time dateTime={isoDate}>{formatTemporalDate(isoDate, precision, locale)}</time></dd>
      </div>
      <div>
        <dt>{t.siteTime} {siteZone ? <span className="zone-name">{siteZone}</span> : null}</dt>
        <dd>{siteZone ? <time dateTime={isoDate}>{formatTemporalDate(isoDate, precision, locale, siteZone)}</time> : t.unknownSiteZone}</dd>
      </div>
      <div>
        <dt>{t.yourTime} {viewerTimeZone ? <span className="zone-name">{viewerTimeZone}</span> : null}</dt>
        <dd>{viewerTimeZone ? <time dateTime={isoDate}>{formatTemporalDate(isoDate, precision, locale, viewerTimeZone)}</time> : <span role="status"><Spinner /> {t.detectingZone}</span>}</dd>
      </div>
    </dl>
  );
}
