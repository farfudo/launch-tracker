import Link from "next/link";
import { RetryButton } from "../components/retry-button";
import { FavoriteLaunchList } from "../components/favorites";
import { getCachedCalendarData, getCachedLaunches, getCachedStatus } from "../lib/cached-api";
import { CacheNotice } from "../components/cache-notice";
import { formatLaunchDate } from "../lib/date";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import { LaunchHero, FeaturedLaunch } from "../components/launch-dashboard";
import { LaunchResultsScroll } from "../components/launch-results-scroll";
import { MissionSelectionProvider, MissionDetailPanel } from "../components/mission-selection";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { MissionIcon } from "../components/mission-icon";
import { AgencyFilters } from "../components/agency-filters";
import { LinkPending, SearchForm } from "../components/pending-feedback";
import { statusFilters } from "../lib/launch";

type SearchParams = Promise<{ q?: string; agency?: string; vehicle?: string; favorites?: string; period?: string; status?: string }>;
export const maxDuration = 60;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const favoritesOnly = filters.favorites === "1";
  const period = filters.period === "past" ? "past" : "upcoming";
  const periodParams = new URLSearchParams();
  for (const key of ["q", "agency", "vehicle", "favorites", "status"] as const) {
    if (filters[key]) periodParams.set(key, filters[key]);
  }
  periodParams.set("period", "upcoming");
  const upcomingHref = `/?${periodParams}#launch-calendar`;
  periodParams.set("period", "past");
  const historyHref = `/?${periodParams}#launch-calendar`;
  const viewParams = new URLSearchParams();
  viewParams.set("period", period);
  for (const key of ["q", "agency", "vehicle", "status"] as const) {
    if (filters[key]) viewParams.set(key, filters[key]);
  }
  const allHref = `/?${viewParams.toString()}`;
  viewParams.set("favorites", "1");
  const favoritesHref = `/?${viewParams.toString()}`;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const d = dashboardCopy[locale];
  const dataStatusPromise = getCachedStatus().catch(() => null);
  const nextCandidatesPromise = period === "past" || filters.q || filters.agency || filters.vehicle || filters.status ? getCachedLaunches(2, { period: "upcoming" }).catch(() => null) : null;
  const { launches, filterOptions, hasLaunchData, hasFilterOptions, cache } = await getCachedCalendarData(
    { q: filters.q, agency: filters.agency, vehicle: filters.vehicle, status: filters.status, period }
  );
  const nextResult = nextCandidatesPromise ? await nextCandidatesPromise : null;
  const nextCandidates = nextCandidatesPromise ? nextResult?.value ?? [] : launches;
  const statusResult = await dataStatusPromise;
  const dataStatus = statusResult?.value ?? null;
  const nextLaunch = nextCandidates[0] ?? null;
  const cacheEntries = [...cache, ...(nextResult ? [nextResult.cache] : []), ...(statusResult ? [statusResult.cache] : [])];
  const agencies = new Set(launches.map(launch => launch.agency).filter(Boolean));
  const featured = nextCandidates.find(launch => launch.id !== nextCandidates[0]?.id);

  return (
    <MissionSelectionProvider key={JSON.stringify(filters)} initial={null} initialSummary={nextLaunch}>
    <main className="launch-dashboard" id="main-content">
      <div className="dashboard-introduction">
        <LaunchHero launch={nextLaunch} locale={locale} />
        <div className="dashboard-benefits" aria-label={d.overview}>
          <div><MissionIcon name="rocket" /><span><strong>{hasLaunchData ? launches.length : "—"}</strong><small>{d.inView}</small></span></div>
          <div><MissionIcon name="orbit" /><span><strong>{hasLaunchData ? agencies.size : "—"}</strong><small>{d.agencies}</small></span></div>
        </div>
        <MissionDetailPanel />
      </div>
      <section className="calendar-panel" id="launch-calendar" aria-labelledby="next-launch-heading">
        <div className="section-heading">
          <div>
            <h2 id="next-launch-heading">{period === "past" ? t.history : t.upcoming}</h2>
          </div>
          <span className="status">
            {!hasLaunchData ? t.dataUnavailable : dataStatus?.cached_launches === 0 ? t.awaitingData : dataStatus?.stale ? t.staleData : t.launchCalendar}
          </span>
        </div>
        <CacheNotice entries={cacheEntries} compact>
        {hasLaunchData && dataStatus?.last_updated_at ? (
          <p className="launch-meta">
            {t.source}: {dataStatus.source} · {t.lastUpdated}: {formatLaunchDate(dataStatus.last_updated_at, locale)}.
            {" "}{t.datesNotice}
          </p>
        ) : null}
        <p className="launch-meta">{period === "past" ? t.historyNotice : t.upcomingNotice}</p>
        </CacheNotice>
        {dataStatus?.stale ? <p className="launch-meta" role="status">{t.staleNotice}</p> : null}
        <nav className="period-tabs" aria-label={t.launchPeriod}>
          <Link href={upcomingHref} scroll={false} aria-current={period === "upcoming" ? "page" : undefined}>{t.upcoming}<LinkPending /></Link>
          <Link href={historyHref} scroll={false} aria-current={period === "past" ? "page" : undefined}>{t.history}<LinkPending /></Link>
        </nav>
        {!hasFilterOptions ? <p role="status" className="launch-meta">{t.filtersUnavailable}</p> : null}
        <AgencyFilters agencies={filterOptions.agencies} filters={filters} />
        <SearchForm>
          <input type="hidden" name="period" value={period} />
          {favoritesOnly ? <input type="hidden" name="favorites" value="1" /> : null}
          <label>
            <span>{t.search}</span>
            <input defaultValue={filters.q} name="q" placeholder={t.searchPlaceholder} type="search" />
          </label>
          <label className="status-filter"><span>{t.status}</span><select name="status" defaultValue={filters.status || ""}>
            <option value="">{t.allLaunches}</option>
            {Object.entries(statusFilters).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
          </select></label>
          <details className="advanced-filters" open={Boolean(filters.agency || filters.vehicle)}>
          <summary>{d.filters}</summary>
          <div className="advanced-filter-fields"><label>
            <span>{t.agency}</span>
            <select defaultValue={filters.agency ?? ""} name="agency">
              <option value="">{t.allAgencies}</option>
              {filters.agency && !filterOptions.agencies.includes(filters.agency) ? <option value={filters.agency}>{filters.agency}</option> : null}
              {filterOptions.agencies.map((agency) => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </label>
          <label>
            <span>{t.vehicle}</span>
            <select defaultValue={filters.vehicle ?? ""} name="vehicle">
              <option value="">{t.allVehicles}</option>
              {filters.vehicle && !filterOptions.vehicles.includes(filters.vehicle) ? <option value={filters.vehicle}>{filters.vehicle}</option> : null}
              {filterOptions.vehicles.map((vehicle) => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
            </select>
          </label>
          </div></details>
          <Link className="clear-filters" href={`/?period=${period}#launch-calendar`} scroll={false}>{t.clear}<LinkPending /></Link>
        </SearchForm>
        <nav className="favorite-views" aria-label={t.calendarView}>
          <Link href={allHref} scroll={false} aria-current={!favoritesOnly ? "page" : undefined}>{t.allLaunches}<LinkPending /></Link>
          <Link href={favoritesHref} scroll={false} aria-current={favoritesOnly ? "page" : undefined}>☆ {t.myFavorites}<LinkPending /></Link>
        </nav>
        <LaunchResultsScroll>
        {hasLaunchData ? (
          <FavoriteLaunchList key={JSON.stringify(filters)} launches={launches} favoritesOnly={favoritesOnly} emptyCache={dataStatus?.cached_launches === 0} historical={period === "past"} initialLimit={process.env.DESIGN_PREVIEW === "true" && filters.q === "scroll-fixture" ? 30 : 6} />
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
            <RetryButton />
          </article>
        )}
        </LaunchResultsScroll>
      </section>
      {featured ? <FeaturedLaunch launch={featured} locale={locale} /> : null}
      {nextLaunch?.image_url ? <p className="dashboard-image-credit">{d.imagery}: {nextLaunch.image_credit || "Launch Library 2"} · {nextLaunch.image_license || t.imageLicenseUnknown}. {d.reference} <Link href={`/launches/${nextLaunch.id}`}>{d.imageInfo} ↗</Link></p> : null}
      <footer className="dashboard-footer"><div><p>NextRocketLaunch <span>· {d.tagline}</span></p><p>{t.developedBy} <a href="https://github.com/farfudo" target="_blank" rel="noopener noreferrer">farfudo ↗</a> · <a href="https://github.com/farfudo/launch-tracker" target="_blank" rel="noopener noreferrer">{t.sourceCode} ↗</a></p></div><p>{t.dataSource} {t.datesNotice}</p></footer>
    </main>
    </MissionSelectionProvider>
  );
}
