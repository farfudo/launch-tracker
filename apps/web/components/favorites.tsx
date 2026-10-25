"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { parseFavorites, readFavorites, subscribeFavorites, toggleFavorite } from "../lib/favorites";
import type { Launch } from "../lib/api";
import { VehicleVisual } from "./vehicle-visual";
import { Countdown } from "./countdown";
import { LocalLaunchDate } from "./local-launch-date";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { formatLaunchStatus, launchStatusTone } from "../lib/launch";
import { useLocale } from "./locale-provider";
import { useMissionSelection } from "./mission-selection";
import { LinkPending, Spinner } from "./pending-feedback";

const serverSnapshot = (): null => null;
export function useFavorites() {
  const raw = useSyncExternalStore<string | null>(subscribeFavorites, readFavorites, serverSnapshot);
  return { ids: useMemo(() => parseFavorites(raw), [raw]), ready: raw !== null };
}

export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const { messages: t } = useLocale();
  const { ids, ready } = useFavorites();
  const [error, setError] = useState(false);
  const selected = ids.includes(id);
  return <div className="favorite-action">
    <button className="favorite-button" type="button" disabled={!ready} aria-pressed={selected}
      aria-label={`${selected ? t.removeFavorite : t.addFavorite}: ${name}`}
      onClick={() => setError(!toggleFavorite(id))}>
      {ready ? <span aria-hidden="true">{selected ? "★" : "☆"}</span> : <Spinner />} {selected ? t.savedFavorite : t.addFavorite}
    </button>
    {error ? <p role="alert">{t.favoriteError}</p> : null}
  </div>;
}

export function FavoriteLaunchList({ launches, favoritesOnly, emptyCache, historical = false, initialLimit = 6 }: {
  launches: Launch[]; favoritesOnly: boolean; emptyCache: boolean; historical?: boolean; initialLimit?: number;
}) {
  const { locale, messages: t } = useLocale();
  const { ids, ready } = useFavorites();
  const [limit, setLimit] = useState(initialLimit);
  const d = dashboardCopy[locale];
  const selection = useMissionSelection();
  const visible = favoritesOnly ? launches.filter(launch => ids.includes(launch.id)) : launches;
  if (favoritesOnly && !ready) return <p role="status"><Spinner /> {t.loadingFavorites}</p>;
  return <>
    {visible.length ? <div className="launch-list">{visible.slice(0, limit).map((launch, index) => <article className="launch-card favorite-launch-card" data-selected={selection?.selected?.id === launch.id || undefined} key={launch.id}>
      <div className="launch-thumbnail"><VehicleVisual launch={launch} priority={false} /></div>
      <Link className="launch-card-link" href={`/launches/${launch.id}`} prefetch={false}
        aria-controls={selection ? "selected-mission" : undefined}
        onClick={event => {
          if (!selection || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !window.matchMedia("(min-width: 801px)").matches) return;
          event.preventDefault();
          selection.select(launch);
        }}>
        <p className="launch-agency" title={`${launch.agency ?? t.agencyPending} · ${launch.vehicle ?? t.vehiclePending}`}>{launch.agency ?? t.agencyPending} · {launch.vehicle ?? t.vehiclePending}</p>
        <h3 title={launch.name}>{launch.name}</h3>
        <p className="launch-date"><LocalLaunchDate date={launch.net} status={launch.status} /></p>
        <span className="launch-status-tag" data-tone={launchStatusTone(launch.status)}>{formatLaunchStatus(launch.status, locale)}</span>
        <span className="row-detail-link">{d.viewDetails} →<LinkPending /></span>
        {selection?.selected?.id === launch.id ? <span className="mission-selected-label">{d.selectedMission}</span> : null}
      </Link>
      <div className="launch-row-actions">{historical ? null : <Countdown date={launch.net} status={launch.status} compact={index !== 0 && selection?.selected?.id !== launch.id} />}<FavoriteButton id={launch.id} name={launch.name} /></div>
    </article>)}</div> : <article className="launch-card">
      <h3>{favoritesOnly ? ids.length ? t.noFavoriteMatches : t.noFavorites : emptyCache ? t.emptyTitle : t.noResults}</h3>
      <p>{favoritesOnly ? t.favoriteEmptyBody : emptyCache ? t.emptyBody : t.noResultsBody}</p>
    </article>}
    {visible.length > limit ? <button className="load-more" type="button" onClick={() => setLimit(value => value + 6)}>{d.loadMore} ({visible.length - limit})</button> : null}
    <details className="favorites-privacy"><summary>{d.privacy}</summary><p className="launch-meta">{t.favoritePrivacy}</p></details>
  </>;
}
