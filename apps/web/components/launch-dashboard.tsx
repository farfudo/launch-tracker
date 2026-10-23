import Link from "next/link";
import type { Launch, LaunchDetail } from "../lib/api";
import { LocalLaunchDate } from "./local-launch-date";
import { dashboardCopy } from "../lib/dashboard-i18n";
import type { Locale } from "../lib/i18n";
import { dictionaries } from "../lib/i18n";
import { Countdown } from "./countdown";
import { VehicleVisual } from "./vehicle-visual";
import { MissionIcon } from "./mission-icon";
import { HeroAction } from "./hero-action";

export function LaunchHero({ launch, locale }: { launch: LaunchDetail | null; locale: Locale }) {
  const d = dashboardCopy[locale];
  return <section className={`dashboard-hero ${launch?.image_url ? "hero-with-photo" : ""}`} aria-labelledby="hero-title">
    {launch ? <VehicleVisual launch={launch} /> : null}
    <div className="dashboard-hero-copy">
      <p className="eyebrow">{d.frontier}</p>
      <h1 id="hero-title">{d.gateway}<br />{d.next}<br /><span>{d.rocket}</span></h1>
      <p>{d.intro}</p>
      <HeroAction launch={launch} />
    </div>
    {launch ? <Link href={`/launches/${launch.id}`} className="next-launch-panel">
      <span className="eyebrow">{d.nextLaunch}</span>
      <Countdown date={launch.net} status={launch.status} />
      <h2>{launch.mission_name || launch.name}</h2>
      <p>{launch.agency}</p>
      {launch.location_name ? <p className="icon-line"><MissionIcon name="location" />{launch.location_name}</p> : null}
      <p className="icon-line"><MissionIcon name="clock" /><LocalLaunchDate date={launch.net} /></p>
      <span className="hero-detail-link">{d.explore} <span aria-hidden="true">↗</span></span>
    </Link> : <div className="hero-orbit" aria-hidden="true"><MissionIcon name="rocket" /></div>}
  </section>;
}

export function FeaturedLaunch({ launch, locale }: { launch: Launch; locale: Locale }) {
  const d = dashboardCopy[locale];
  return <><section className="featured-launch" aria-labelledby="featured-heading">
    <VehicleVisual launch={launch} priority={false} />
    <div className="featured-copy"><p className="eyebrow">{d.featured}</p><h2 id="featured-heading">{launch.name}</h2>
      <p>{launch.agency} · {launch.vehicle}</p><p><LocalLaunchDate date={launch.net} /></p>
      <p>{d.featuredNote}</p><Link className="pill-button" href={`/launches/${launch.id}`}>{d.fullDetails} →</Link>
    </div>
    <Countdown date={launch.net} status={launch.status} />
  </section>{launch.image_url ? <p className="dashboard-image-credit">{d.imagery}: {launch.image_credit || "Launch Library 2"} · {launch.image_license || dictionaries[locale].imageLicenseUnknown}. {d.reference} <Link href={`/launches/${launch.id}`}>{d.imageInfo} ↗</Link></p> : null}</>;
}
