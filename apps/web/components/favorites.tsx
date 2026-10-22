"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { parseFavorites, readFavorites, subscribeFavorites, toggleFavorite } from "../lib/favorites";
import type { Launch, LaunchDetail } from "../lib/api";
import { VehicleVisual } from "./vehicle-visual";
import { Countdown } from "./countdown";
import { formatLaunchDate } from "../lib/date";
import { formatLaunchStatus } from "../lib/launch";
import { useLocale } from "./locale-provider";
import { LaunchTimes } from "./launch-times";

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
      <span aria-hidden="true">{selected ? "★" : "☆"}</span> {selected ? t.savedFavorite : t.addFavorite}
    </button>
    {error ? <p role="alert">{t.favoriteError}</p> : null}
  </div>;
}

export function FavoriteLaunchList({ launches, previews = [], favoritesOnly, emptyCache }: {
  launches: Launch[]; previews?: LaunchDetail[]; favoritesOnly: boolean; emptyCache: boolean;
}) {
  const { locale, messages: t } = useLocale();
  const { ids, ready } = useFavorites();
  const visible = favoritesOnly ? launches.filter(launch => ids.includes(launch.id)) : launches;
  if (favoritesOnly && !ready) return <p role="status">{t.loadingFavorites}</p>;
  return <>
    <p className="launch-meta">{t.favoritePrivacy}</p>
    {visible.length ? <div className="launch-list">{visible.map(launch => <article className="launch-card favorite-launch-card" key={launch.id}>
      {previews.find(preview => preview.id === launch.id) ? <div className="launch-thumbnail"><VehicleVisual launch={previews.find(preview => preview.id === launch.id)!} /></div> : <div className="launch-thumbnail launch-thumbnail-placeholder" aria-hidden="true">↗</div>}
      <Link className="launch-card-link" href={`/launches/${launch.id}`}>
        <p className="launch-agency">{launch.agency ?? t.agencyPending} · {launch.vehicle ?? t.vehiclePending}</p>
        <h3>{launch.name}</h3>
        <p className="launch-date">{formatLaunchDate(launch.net, locale)}</p>
        <span className="launch-status-tag">{formatLaunchStatus(launch.status, locale)}</span>
        <span className="row-detail-link">View details →</span>
      </Link>
      <div className="launch-row-actions"><Countdown date={launch.net} status={launch.status} /><FavoriteButton id={launch.id} name={launch.name} /></div>
      <details className="launch-row-times"><summary>Time zones</summary><LaunchTimes isoDate={launch.net} launchTimeZone={launch.launch_timezone} /></details>
    </article>)}</div> : <article className="launch-card">
      <h3>{favoritesOnly ? ids.length ? t.noFavoriteMatches : t.noFavorites : emptyCache ? t.emptyTitle : t.noResults}</h3>
      <p>{favoritesOnly ? t.favoriteEmptyBody : emptyCache ? t.emptyBody : t.noResultsBody}</p>
    </article>}
  </>;
}
