import Link from "next/link";
import { formatLaunchStatus } from "../lib/launch";
import { getDataStatus, getFilterOptions, getUpcomingLaunches, type FilterOptions, type Launch } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import { LaunchTimes } from "../components/launch-times";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";

type SearchParams = Promise<{ q?: string; agency?: string; vehicle?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const dataStatusPromise = getDataStatus().catch(() => null);
  let launches: Launch[];
  let filterOptions: FilterOptions;
  let hasLaunchData = true;

  try {
    [launches, filterOptions] = await Promise.all([
      getUpcomingLaunches(20, filters),
      getFilterOptions()
    ]);
  } catch {
    launches = [];
    filterOptions = { agencies: [], vehicles: [] };
    hasLaunchData = false;
  }
  const dataStatus = await dataStatusPromise;

  return (
    <main>
      <header>
        <p className="eyebrow">LaunchSkyline · {t.brandSubtitle}</p>
        <h1>{t.heroTitle}</h1>
        <p className="intro">{t.heroIntro}</p>
      </header>
      <section aria-labelledby="next-launch-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.globalCalendar}</p>
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
        <form className="filters" action="/" method="get">
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
        {hasLaunchData ? (
          launches.length ? <div className="launch-list">
            {launches.map((launch) => (
              <Link className="launch-card" href={`/launches/${launch.id}`} key={launch.id}>
                <p className="launch-date">{formatLaunchDate(launch.net, locale)}</p>
                <h3>{launch.name}</h3>
                <p>{launch.agency ?? t.agencyPending}</p>
                <p className="launch-meta">
                  {launch.vehicle ?? t.vehiclePending} · {formatLaunchStatus(launch.status, locale)}
                </p>
                <LaunchTimes isoDate={launch.net} launchTimeZone={launch.launch_timezone} />
              </Link>
            ))}
          </div> : <article className="launch-card">
            <h3>{dataStatus?.cached_launches === 0 ? t.emptyTitle : t.noResults}</h3>
            <p>{dataStatus?.cached_launches === 0 ? t.emptyBody : t.noResultsBody}</p>
          </article>
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
          </article>
        )}
      </section>
    </main>
  );
}
