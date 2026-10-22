import Link from "next/link";
import type { LaunchDetail } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import type { Locale } from "../lib/i18n";
import { Countdown } from "./countdown";
import { VehicleVisual } from "./vehicle-visual";
import { MissionIcon } from "./mission-icon";

export function LaunchHero({ launch, locale }: { launch: LaunchDetail | null; locale: Locale }) {
  return <section className={`dashboard-hero ${launch?.image_url ? "hero-with-photo" : ""}`} aria-labelledby="hero-title">
    {launch ? <VehicleVisual launch={launch} /> : null}
    <div className="dashboard-hero-copy">
      <p className="eyebrow">Explore the next frontier</p>
      <h1 id="hero-title">Your gateway<br />to the next<br /><span>rocket launch.</span></h1>
      <p>Follow space launches around the world.<br />Real schedules. Mission details. One place.</p>
      <Link className="pill-button" href="#launch-calendar">View upcoming launches <span aria-hidden="true">→</span></Link>
    </div>
    {launch ? <Link href={`/launches/${launch.id}`} className="next-launch-panel">
      <span className="eyebrow">Next launch</span>
      <Countdown date={launch.net} status={launch.status} />
      <h2>{launch.mission_name || launch.name}</h2>
      <p>{launch.agency}</p>
      {launch.location_name ? <p className="icon-line"><MissionIcon name="location" />{launch.location_name}</p> : null}
      <p className="icon-line"><MissionIcon name="clock" />{formatLaunchDate(launch.net, locale)}</p>
      <span className="hero-detail-link">Explore mission <span aria-hidden="true">↗</span></span>
    </Link> : <div className="hero-orbit" aria-hidden="true"><MissionIcon name="rocket" /></div>}
  </section>;
}

export function FeaturedLaunch({ launch, locale }: { launch: LaunchDetail; locale: Locale }) {
  return <section className="featured-launch" aria-labelledby="featured-heading">
    <VehicleVisual launch={launch} />
    <div className="featured-copy"><p className="eyebrow" id="featured-heading">Featured launch</p><p>{launch.agency}</p><h2>{launch.mission_name || launch.name}</h2>
      <p className="icon-line"><MissionIcon name="location" />{launch.location_name || "Launch site to be confirmed"}</p>
      <p className="icon-line"><MissionIcon name="clock" />{formatLaunchDate(launch.net, locale)}</p>
      <Link href={`/launches/${launch.id}`} className="pill-button">View mission details <span aria-hidden="true">→</span></Link>
    </div>
    <Countdown date={launch.net} status={launch.status} />
  </section>;
}
