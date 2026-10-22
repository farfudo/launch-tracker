import Link from "next/link";
import { RetryButton } from "../components/retry-button";
import { FavoriteLaunchList } from "../components/favorites";
import { getDataStatus, getFilterOptions, getUpcomingLaunches, getLaunch, type FilterOptions, type Launch, type LaunchDetail } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import { LaunchHero, FeaturedLaunch } from "../components/launch-dashboard";
import { MissionIcon } from "../components/mission-icon";

type SearchParams = Promise<{ q?: string; agency?: string; vehicle?: string; favorites?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const favoritesOnly = filters.favorites === "1";
  const viewParams = new URLSearchParams();
  for (const key of ["q", "agency", "vehicle"] as const) {
    if (filters[key]) viewParams.set(key, filters[key]);
  }
  const allHref = `/?${viewParams.toString()}`;
  viewParams.set("favorites", "1");
  const favoritesHref = `/?${viewParams.toString()}`;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const dataStatusPromise = getDataStatus().catch(() => null);
  let launches: Launch[];
  let filterOptions: FilterOptions;
  let hasLaunchData = true;

  try {
    [launches, filterOptions] = await Promise.all([
      getUpcomingLaunches(100, { q: filters.q, agency: filters.agency, vehicle: filters.vehicle }),
      getFilterOptions()
    ]);
  } catch {
    launches = [];
    filterOptions = { agencies: [], vehicles: [] };
    hasLaunchData = false;
  }
  const dataStatus = await dataStatusPromise;
  const nextCandidates = filters.q || filters.agency || filters.vehicle ? await getUpcomingLaunches(1).catch(() => []) : launches;
  const detailIds = [...new Set([...nextCandidates.slice(0, 1), ...launches.slice(0, 6)].map(launch => launch.id))];
  const previews = await Promise.all(detailIds.map(id => getLaunch(id).catch(() => null)));
  const launchPreviews = previews.filter((launch): launch is LaunchDetail => launch !== null);
  const nextLaunch = launchPreviews.find(launch => launch.id === nextCandidates[0]?.id) ?? null;
  const agencies = new Set(launches.map(launch => launch.agency).filter(Boolean));

  return (
    <main className="launch-dashboard" id="main-content">
      <div className="dashboard-introduction">
        <LaunchHero launch={nextLaunch} locale={locale} />
        <div className="dashboard-benefits" aria-label="Calendar overview">
          <div><MissionIcon name="rocket" /><span><strong>{hasLaunchData ? launches.length : "—"}</strong><small>Launches in this view</small></span></div>
          <div><MissionIcon name="orbit" /><span><strong>{hasLaunchData ? agencies.size : "—"}</strong><small>Agencies in this view</small></span></div>
          <div><MissionIcon name="clock" /><span><strong>Local time</strong><small>Your launch schedule</small></span></div>
          <div><MissionIcon name="location" /><span><strong>Worldwide</strong><small>Launch coverage</small></span></div>
        </div>
      </div>
      <section className="calendar-panel" id="launch-calendar" aria-labelledby="next-launch-heading">
        <div className="section-heading">
          <div>
            <h2 id="next-launch-heading">{t.upcoming}</h2>
          </div>
          <span className="status">
            {!hasLaunchData ? t.dataUnavailable : dataStatus?.cached_launches === 0 ? t.awaitingData : dataStatus?.stale ? t.staleData : t.launchCalendar}
          </span>
        </div>
        {hasLaunchData && dataStatus?.last_updated_at ? (
          <p className="launch-meta">
            {t.source}: {dataStatus.source} · {t.lastUpdated}: {formatLaunchDate(dataStatus.last_updated_at, locale)}.
            {" "}{dataStatus.stale ? t.staleNotice : t.datesNotice}
          </p>
        ) : null}
        <nav className="agency-chips" aria-label="Filter by agency">
          {["", ...[...filterOptions.agencies].sort((a, b) => {
            const priority = ["SpaceX", "Rocket Lab", "Blue Origin", "United Launch Alliance", "Arianespace"];
            return (priority.includes(a) ? priority.indexOf(a) : 99) - (priority.includes(b) ? priority.indexOf(b) : 99);
          }).slice(0, 5)].map(agency => {
            const params = new URLSearchParams();
            if (filters.q) params.set("q", filters.q);
            if (filters.vehicle) params.set("vehicle", filters.vehicle);
            if (favoritesOnly) params.set("favorites", "1");
            if (agency) params.set("agency", agency);
            return <Link key={agency} href={`/?${params}#launch-calendar`} aria-current={(filters.agency || "") === agency ? "page" : undefined}>{agency || "All"}</Link>;
          })}
        </nav>
        <form className="filters" action="/#launch-calendar" method="get">
          {favoritesOnly ? <input type="hidden" name="favorites" value="1" /> : null}
          <label>
            <span>{t.search}</span>
            <input defaultValue={filters.q} name="q" placeholder={t.searchPlaceholder} type="search" />
          </label>
          <label>
            <span>{t.agency}</span>
            <select defaultValue={filters.agency ?? ""} name="agency">
              <option value="">{t.allAgencies}</option>
              {filterOptions.agencies.map((agency) => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </label>
          <label>
            <span>{t.vehicle}</span>
            <select defaultValue={filters.vehicle ?? ""} name="vehicle">
              <option value="">{t.allVehicles}</option>
              {filterOptions.vehicles.map((vehicle) => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
            </select>
          </label>
          <button type="submit">{t.applyFilters}</button>
          <Link className="clear-filters" href="/">{t.clear}</Link>
        </form>
        <nav className="favorite-views" aria-label={t.calendarView}>
          <Link href={allHref} aria-current={!favoritesOnly ? "page" : undefined}>{t.allLaunches}</Link>
          <Link href={favoritesHref} aria-current={favoritesOnly ? "page" : undefined}>☆ {t.myFavorites}</Link>
        </nav>
        {hasLaunchData ? (
          <FavoriteLaunchList launches={launches} previews={launchPreviews} favoritesOnly={favoritesOnly} emptyCache={dataStatus?.cached_launches === 0} />
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
            <RetryButton />
          </article>
        )}
      </section>
      <div className="dashboard-explore">
        <Link href="#launch-calendar" className="explore-card"><MissionIcon name="clock" /><h2>Launch calendar</h2><p>Find your next mission. Search agencies and vehicles.</p><span aria-hidden="true">↗</span></Link>
        <Link href="/?favorites=1#launch-calendar" className="explore-card"><MissionIcon name="status" /><h2>Your favorites</h2><p>Keep the missions you want to follow close at hand.</p><span aria-hidden="true">↗</span></Link>
        {nextLaunch ? <Link href={`/launches/${nextLaunch.id}`} className="explore-card"><MissionIcon name="rocket" /><h2>Mission details</h2><p>Explore rockets, launch windows and mission information.</p><span aria-hidden="true">↗</span></Link> : null}
      </div>
      {nextLaunch ? <FeaturedLaunch launch={nextLaunch} locale={locale} /> : null}
      {nextLaunch?.image_url ? <p className="dashboard-image-credit">Featured imagery: {nextLaunch.image_credit || "Launch Library 2"} · {nextLaunch.image_license || "Licence not specified by source"}. Reference imagery may show a different mission. <Link href={`/launches/${nextLaunch.id}`}>Image information ↗</Link></p> : null}
      <footer className="dashboard-footer"><p>NextRocketLaunch <span>· Space, right on time.</span></p><p>{t.dataSource} {t.datesNotice}</p></footer>
    </main>
  );
}
