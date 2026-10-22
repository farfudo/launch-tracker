import Link from "next/link";
import { RetryButton } from "../components/retry-button";
import { FavoriteLaunchList } from "../components/favorites";
import { getDataStatus, getFilterOptions, getUpcomingLaunches, type FilterOptions, type Launch } from "../lib/api";
import { formatLaunchDate } from "../lib/date";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";

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
          <FavoriteLaunchList launches={launches} favoritesOnly={favoritesOnly} emptyCache={dataStatus?.cached_launches === 0} />
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
            <RetryButton />
          </article>
        )}
      </section>
    </main>
  );
}
