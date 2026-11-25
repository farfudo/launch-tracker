import { Suspense } from "react";
import { freshnessCopy } from "../lib/freshness";
import Link from "next/link";
import { InfoDisclosure } from "../components/info-disclosure";
import { RetryButton } from "../components/retry-button";
import { FavoriteLaunchList } from "../components/favorites";
import { getCachedLaunch, getCachedFilterOptions, getCachedLaunches, getCachedStatus } from "../lib/cached-api";
import { CacheNotice } from "../components/cache-notice";
import { formatLaunchDate } from "../lib/date";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import { LaunchChannels } from "../components/launch-channels";
import { LaunchSpotlight } from "../components/launch-spotlight";
import { LaunchFilterPanel } from "../components/launch-filter-panel";
import { launchControlCopy } from "../lib/launch-control-copy";
import {nextSpotlightLaunch} from "../lib/launch-spotlight";
import './launch-control.css';
import { LaunchResultsScroll } from "../components/launch-results-scroll";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { MissionIcon } from "../components/mission-icon";
import { LinkPending, SearchForm, Spinner } from "../components/pending-feedback";
import { launchTimingStatus, statusFilters } from "../lib/launch";

import type { Launch } from "../lib/api";
import { clockPrecision } from "../lib/temporal-precision";
import { safeMissionLink } from "../lib/stream-links";
import { LaunchWatchButton } from "../components/launch-watch-button";
import { LocalLaunchDate } from "../components/local-launch-date";

type Filters = { q?: string; agency?: string; vehicle?: string; favorites?: string; period?: string; status?: string };
type SearchParams = Promise<Filters>;
type Locale = Awaited<ReturnType<typeof getLocale>>;
type Period = "past" | "upcoming";
type LaunchData = Promise<Awaited<ReturnType<typeof getCachedLaunches>> | null>;
type FilterData = Promise<Awaited<ReturnType<typeof getCachedFilterOptions>> | null>;
type StatusData = Promise<Awaited<ReturnType<typeof getCachedStatus>> | null>;

export const maxDuration = 60;

function SectionLoading({ label, spotlight = false }: { label: string; spotlight?: boolean }) {
  return <div className={spotlight ? "launch-section-loading spotlight-loading" : "launch-section-loading"} role="status" aria-busy="true">
    <Spinner /> {label}
  </div>;
}

async function SpotlightCoverage({ launch, locale }: { launch: Launch; locale: Locale }) {
  const result = await getCachedLaunch(launch.id).catch(() => null);
  if (!result) return null;

  const detail = result.value;
  const { window_start: start, window_end: end } = detail;
  const showWindow = clockPrecision(launch.net_precision)
    && ["scheduled", "uncertain"].includes(launchTimingStatus(launch.status))
    && start && end && Date.parse(start) < Date.parse(end)
    && [start, end].every(date => /(?:Z|[+-]\d{2}:\d{2})$/.test(date));
  const hasStream = detail.streams?.some(link => safeMissionLink(link));
  const t = dictionaries[locale];

  return <>
    {showWindow && start && end ? (
      <div className="spotlight-window">
        <strong>{t.launchWindow}</strong>
        <div>{t.windowStart} · <LocalLaunchDate date={start} precision={launch.net_precision} showNotice={false} /></div>
        <div>{t.windowEnd} · <LocalLaunchDate date={end} precision={launch.net_precision} showNotice={false} /></div>
      </div>
    ) : null}
    {hasStream ? <LaunchWatchButton key={launch.id} launch={launch} initialDetail={detail} showLabel /> : null}
  </>;
}

async function SpotlightSection({ data, locale, returnTo }: { data: LaunchData; locale: Locale; returnTo?: string }) {
  const result = await data;
  const launch = nextSpotlightLaunch(result?.value ?? []);
  return <LaunchSpotlight launch={launch} locale={locale} returnTo={returnTo} coverage={launch ? (
    <Suspense fallback={null}><SpotlightCoverage launch={launch} locale={locale} /></Suspense>
  ) : null} />;
}

async function ActivitySection({ data, locale }: { data: LaunchData; locale: Locale }) {
  const result = await data;
  const launches = result?.value ?? [];
  const hasLaunchData = result !== null;
  const agencies = new Set(launches.map(launch => launch.agency).filter(Boolean));
  const control = launchControlCopy[locale];
  const d = dashboardCopy[locale];
  return (
        <section className="launch-activity" aria-labelledby="activity-title"><div className="activity-heading"><h2 id="activity-title">{control.activity}</h2><div className="activity-info"><InfoDisclosure label={control.activity}>{control.scope}</InfoDisclosure></div></div><div className="dashboard-benefits" aria-label={d.overview}>
          <div><MissionIcon name="rocket" /><span><strong>{hasLaunchData ? launches.length : "—"}</strong><small>{d.inView}</small></span></div>
          <div><MissionIcon name="orbit" /><span><strong>{hasLaunchData ? agencies.size : "—"}</strong><small>{d.agencies}</small></span></div>
        </div>
        <p className="activity-scope">{control.scope}</p></section>
  );
}

async function FiltersSection({ data, locale, filters, period, favoritesOnly, upcomingHref, historyHref }: {
  data: FilterData; locale: Locale; filters: Filters; period: Period; favoritesOnly: boolean; upcomingHref: string; historyHref: string;
}) {
  const result = await data;
  const filterOptions = result?.value ?? { agencies: [], vehicles: [] };
  const hasFilterOptions = result !== null;
  const t = dictionaries[locale];
  const control = launchControlCopy[locale];
  return (
        <LaunchFilterPanel title={control.filters} active={Boolean(filters.q || filters.agency || filters.vehicle || filters.status || period==='past')}>
        <div className="filter-panel-heading">
        <nav className="period-tabs" aria-label={t.launchPeriod}>
          <Link href={upcomingHref} scroll={false} aria-current={period === "upcoming" ? "page" : undefined}>{t.upcoming}<LinkPending /></Link>
          <Link href={historyHref} scroll={false} aria-current={period === "past" ? "page" : undefined}>{t.history}<LinkPending /></Link>
        </nav>
        <Link className="clear-filters" href={`/?period=${period}#launch-calendar`} scroll={false}>{control.reset}<LinkPending /></Link>
        </div>
        {!hasFilterOptions ? <p role="status" className="launch-meta">{t.filtersUnavailable}</p> : null}
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
          <div className="advanced-filters">
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
          </div></div>
        </SearchForm>
        <p className="filter-site-note"><strong>{control.site}</strong><br/>{control.siteNote}</p>
        </LaunchFilterPanel>
  );
}

async function CalendarHeader({ data, status, locale, period }: { data: LaunchData; status: StatusData; locale: Locale; period: Period }) {
  const [result, statusResult] = await Promise.all([data, status]);
  const hasLaunchData = result !== null;
  const dataStatus = statusResult?.value ?? null;
  const statusConfirmed = statusResult?.freshnessConfirmed ?? false;
  const t = dictionaries[locale];
  const freshnessWarning = hasLaunchData
    ? !statusConfirmed ? freshnessCopy[locale].unknown : dataStatus?.stale ? t.staleNotice : undefined
    : undefined;
  const cacheEntries = [...(result ? [result.cache] : []), ...(statusResult ? [statusResult.cache] : [])];
  return (
        <div className="section-heading">
          <div className="launch-heading-with-info">
            <h2 id="next-launch-heading">{period === "past" ? t.history : t.upcoming}</h2>
        <CacheNotice entries={cacheEntries} compact warning={freshnessWarning} lastUpdated={hasLaunchData ? dataStatus?.last_updated_at ?? undefined : undefined}>
        {hasLaunchData && dataStatus?.last_updated_at ? (
          <p className="launch-meta">
            {t.source}: {dataStatus.source} · {freshnessCopy[locale].global}: {formatLaunchDate(dataStatus.last_updated_at, locale)}.
            {" "}{t.datesNotice}
          </p>
        ) : null}
        <p className="launch-meta">{period === "past" ? t.historyNotice : t.upcomingNotice}</p>
        </CacheNotice>
          </div>
          {!freshnessWarning ? <span className="status">
            {!hasLaunchData ? t.dataUnavailable : dataStatus?.cached_launches === 0 ? t.awaitingData : t.launchCalendar}
          </span> : null}
        </div>
  );
}

async function CalendarRows({ data, locale, filters, period, favoritesOnly, returnTo }: {
  data: LaunchData; locale: Locale; filters: Filters; period: Period; favoritesOnly: boolean; returnTo?: string;
}) {
  const result = await data;
  const launches = result?.value ?? [];
  const hasLaunchData = result !== null;
  const emptyCache = !filters.q && !filters.agency && !filters.vehicle && !filters.status && launches.length === 0;
  const t = dictionaries[locale];
  return (
        <LaunchResultsScroll>
        {hasLaunchData ? (
          <FavoriteLaunchList showWatch returnTo={returnTo} key={JSON.stringify(filters)} launches={launches} favoritesOnly={favoritesOnly} emptyCache={emptyCache} historical={period === "past"} initialLimit={process.env.DESIGN_PREVIEW === "true" && filters.q === "scroll-fixture" ? 30 : 6} />
        ) : (
          <article className="launch-card">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableBody}</p>
            <RetryButton />
          </article>
        )}
        </LaunchResultsScroll>
  );
}

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
  const returnTo = favoritesOnly || period === "past" || filters.period || filters.q || filters.agency || filters.vehicle || filters.status
    ? `${favoritesOnly ? favoritesHref : allHref}#launch-calendar`
    : undefined;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const d = dashboardCopy[locale];
  const control = launchControlCopy[locale];
  // Start each public read once. Sibling boundaries consume the same promises.
  const data = getCachedLaunches(100, { q: filters.q, agency: filters.agency, vehicle: filters.vehicle, status: filters.status, period }).catch(() => null);
  const options = getCachedFilterOptions().catch(() => null);
  const status = getCachedStatus().catch(() => null);
  const spotlight = period === "past" || filters.q || filters.agency || filters.vehicle || filters.status
    ? getCachedLaunches(100, { period: "upcoming" }).catch(() => null)
    : data;

  return (
    <main className="launch-dashboard mission-control" id="main-content">
      <div className="dashboard-introduction">
        <Suspense fallback={<SectionLoading label={t.loadingTitle} spotlight />}>
          <SpotlightSection data={spotlight} locale={locale} returnTo={returnTo} />
        </Suspense>
        <Suspense fallback={<SectionLoading label={control.activity} />}>
          <ActivitySection data={data} locale={locale} />
        </Suspense>
        <Suspense fallback={<SectionLoading label={control.filters} />}>
          <FiltersSection data={options} locale={locale} filters={filters} period={period} favoritesOnly={favoritesOnly} upcomingHref={upcomingHref} historyHref={historyHref} />
        </Suspense>
      </div>
      <section className="calendar-panel" id="launch-calendar" aria-labelledby="next-launch-heading">
        <Suspense fallback={<div className="section-heading"><h2 id="next-launch-heading">{period === "past" ? t.history : t.upcoming}</h2></div>}>
          <CalendarHeader data={data} status={status} locale={locale} period={period} />
        </Suspense>
        <nav className="favorite-views" aria-label={t.calendarView}>
          <Link href={allHref} scroll={false} aria-current={!favoritesOnly ? "page" : undefined}>{t.allLaunches}<LinkPending /></Link>
          <div className="favorites-view-with-info"><Link href={favoritesHref} scroll={false} aria-current={favoritesOnly ? "page" : undefined}>☆ {t.myFavorites}<LinkPending /></Link><InfoDisclosure label={d.privacy}>{t.favoritePrivacy}</InfoDisclosure></div>
        </nav>
        <Suspense key={JSON.stringify(filters)} fallback={<SectionLoading label={t.loadingBody} />}>
          <CalendarRows data={data} locale={locale} filters={filters} period={period} favoritesOnly={favoritesOnly} returnTo={returnTo} />
        </Suspense>
      </section>
      <LaunchChannels locale={locale} showBrowse />
      <p className="dashboard-footer"><InfoDisclosure label={t.aboutData}>{t.dataSource} {t.datesNotice}</InfoDisclosure> {t.source}: Launch Library 2</p>
    </main>
  );
}
