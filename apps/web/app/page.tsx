import Link from "next/link";
import { RetryButton } from "../components/retry-button";
import { FavoriteLaunchList } from "../components/favorites";
import { getDataStatus, getFilterOptions, getUpcomingLaunches, getLaunch, type FilterOptions, type Launch, type LaunchDetail } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import { LaunchHero, FeaturedLaunch } from "../components/launch-dashboard";
import { MissionSelectionProvider, MissionDetailPanel } from "../components/mission-selection";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { MissionIcon } from "../components/mission-icon";
import { AgencyFilters } from "../components/agency-filters";

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
  const d = dashboardCopy[locale];
  const dataStatusPromise = getDataStatus().catch(() => null);
  const nextCandidatesPromise = filters.q || filters.agency || filters.vehicle ? getUpcomingLaunches(2).catch(() => []) : null;
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
  const nextCandidates = nextCandidatesPromise ? await nextCandidatesPromise : launches;
  const [dataStatus, nextLaunch]: [Awaited<ReturnType<typeof getDataStatus>> | null, LaunchDetail | null] = await Promise.all([
    dataStatusPromise,
    nextCandidates[0] ? getLaunch(nextCandidates[0].id).catch(() => null) : Promise.resolve(null)
  ]);
  const agencies = new Set(launches.map(launch => launch.agency).filter(Boolean));
  const featured = nextCandidates.find(launch => launch.id !== nextCandidates[0]?.id);

  return (
    <MissionSelectionProvider key={JSON.stringify(filters)} initial={nextLaunch}>
    <main className="launch-dashboard" id="main-content">
      <div className="dashboard-introduction">
        <LaunchHero launch={nextLaunch} locale={locale} />
        <div className="dashboard-benefits" aria-label={d.overview}>
          <div><MissionIcon name="rocket" /><span><strong>{hasLaunchData ? launches.length : "—"}</strong><small>{d.inView}</small></span></div>
          <div><MissionIcon name="orbit" /><span><strong>{hasLaunchData ? agencies.size : "—"}</strong><small>{d.agencies}</small></span></div>
          <div><MissionIcon name="clock" /><span><strong>{d.local}</strong><small>{d.schedule}</small></span></div>
          <div><MissionIcon name="location" /><span><strong>{d.worldwide}</strong><small>{d.coverage}</small></span></div>
        </div>
        <MissionDetailPanel />
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
        <AgencyFilters agencies={filterOptions.agencies} filters={filters} />
        <form className="filters" action="/#launch-calendar" method="get">
          {favoritesOnly ? <input type="hidden" name="favorites" value="1" /> : null}
          <label>
            <span>{t.search}</span>
            <input defaultValue={filters.q} name="q" placeholder={t.searchPlaceholder} type="search" />
          </label>
          <details className="advanced-filters" open={Boolean(filters.agency || filters.vehicle)}>
          <summary>{d.filters}</summary>
          <div className="advanced-filter-fields"><label>
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
          </div></details>
          <button type="submit">{t.applyFilters}</button>
          <Link className="clear-filters" href="/">{t.clear}</Link>
        </form>
        <nav className="favorite-views" aria-label={t.calendarView}>
          <Link href={allHref} aria-current={!favoritesOnly ? "page" : undefined}>{t.allLaunches}</Link>
          <Link href={favoritesHref} aria-current={favoritesOnly ? "page" : undefined}>☆ {t.myFavorites}</Link>
        </nav>
        {hasLaunchData ? (
          <FavoriteLaunchList key={JSON.stringify(filters)} launches={launches} favoritesOnly={favoritesOnly} emptyCache={dataStatus?.cached_launches === 0} />
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
            <RetryButton />
          </article>
        )}
      </section>
      {featured ? <FeaturedLaunch launch={featured} locale={locale} /> : null}
      <div className="dashboard-explore">
        <Link href="#launch-calendar" className="explore-card"><MissionIcon name="clock" /><h2>{d.calendar}</h2><p>{d.calendarBody}</p><span aria-hidden="true">↗</span></Link>
        <Link href="/?favorites=1#launch-calendar" className="explore-card"><MissionIcon name="status" /><h2>{d.yourFavorites}</h2><p>{d.favoritesBody}</p><span aria-hidden="true">↗</span></Link>
        {nextLaunch ? <Link href={`/launches/${nextLaunch.id}`} className="explore-card"><MissionIcon name="rocket" /><h2>{d.details}</h2><p>{d.detailsBody}</p><span aria-hidden="true">↗</span></Link> : null}
      </div>
      {nextLaunch?.image_url ? <p className="dashboard-image-credit">{d.imagery}: {nextLaunch.image_credit || "Launch Library 2"} · {nextLaunch.image_license || t.imageLicenseUnknown}. {d.reference} <Link href={`/launches/${nextLaunch.id}`}>{d.imageInfo} ↗</Link></p> : null}
      <footer className="dashboard-footer"><p>NextRocketLaunch <span>· {d.tagline}</span></p><p>{t.dataSource} {t.datesNotice}</p></footer>
    </main>
    </MissionSelectionProvider>
  );
}
