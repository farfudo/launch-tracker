import Link from "next/link";
import type { ReactNode } from "react";
import type { Launch } from "../lib/api";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { type Locale } from "../lib/i18n";
import { formatLaunchStatus, launchTimingStatus } from "../lib/launch";
import { launchControlCopy } from "../lib/launch-control-copy";
import { launchDetailsHref } from "../lib/launch-navigation";
import { precisionId, precisionLabel } from "../lib/temporal-precision";
import { Countdown } from "./countdown";
import { InfoDisclosure } from "./info-disclosure";
import { LocalLaunchDate } from "./local-launch-date";
import { LinkPending } from "./pending-feedback";
import { SpotlightRollover } from "./spotlight-rollover";
import { VehicleVisual } from "./vehicle-visual";

export function LaunchSpotlight({ launch, locale, returnTo, coverage }: {
  launch: Launch | null;
  locale: Locale;
  returnTo?: string;
  coverage?: ReactNode;
}) {
  const t = launchControlCopy[locale];
  const d = dashboardCopy[locale];
  const timing = launchTimingStatus(launch?.status);
  const precision = precisionId(launch?.net_precision);

  return (
    <section className="dashboard-hero launch-spotlight" aria-labelledby="hero-title">
      {launch ? <VehicleVisual key={launch.id} launch={launch} /> : null}
      <div className="spotlight-copy">
        <p className="eyebrow">{d.nextLaunch}</p>
        <h1 id="hero-title">{launch?.vehicle || launch?.name || t.empty}</h1>
        {launch ? <>
          <SpotlightRollover date={launch.net} />
          <h2>{launch.name}</h2>
          <span className="launch-state">
            {formatLaunchStatus(launch.status, locale)}
          </span>
          <Countdown date={launch.net} precision={launch.net_precision} status={launch.status} respectPrecision showReferenceSeconds />
          <div className="spotlight-date">
            {precision !== null && precision <= 2 && ["scheduled", "uncertain"].includes(timing)
              ? <LocalLaunchDate date={launch.net} precision={launch.net_precision} status={launch.status} showNotice={false} precisionSafe />
              : <span>{t.broad} · {precisionLabel(launch.net_precision, locale)}</span>}
            {(precision !== 0 || timing !== "scheduled") ? <InfoDisclosure label={t.uncertainty} symbol={<svg data-warning-sign="true" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3Z" fill="currentColor"/><path d="M12 8v5" stroke="#102b40" strokeWidth="2.3" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.25" fill="#102b40"/></svg>}>{t.notice} {precisionLabel(launch.net_precision,locale)}.</InfoDisclosure> : null}
          </div>
          {coverage}
          <div className="spotlight-actions">
            <Link className="pill-button spotlight-details" href={launchDetailsHref(launch.id, returnTo)}>
              <span className="spotlight-details-label">{t.view} →</span>
              <span className="spotlight-details-short">{d.viewDetails} →</span>
              <LinkPending />
            </Link>
            <a className="mobile-launch-jump" href="#launch-calendar">{t.viewList} ↓</a>
          </div>
        </> : <>
          <p>{t.emptyBody}</p>
          <a className="mobile-launch-jump" href="#launch-calendar">{t.viewList} ↓</a>
        </>}
      </div>
    </section>
  );
}
