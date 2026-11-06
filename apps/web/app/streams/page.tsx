import Link from "next/link";
import { LaunchChannels, channelDirectoryCopy } from "../../components/launch-channels";
import { MissionStreams } from "../../components/mission-streams";
import { RetryButton } from "../../components/retry-button";
import { getCachedLaunch, getCachedLaunches } from "../../lib/cached-api";
import { getLocale } from "../../lib/locale-server";
import { safeMissionLink, streamGroup } from "../../lib/stream-links";
import "../launch-control.css";

const copy = {
  "pt-PT": {
    title: "Transmissões de lançamentos", back: "Lançamentos",
    scope: "Seleção dos três próximos lançamentos e dos três mais recentes. O estado reflete os dados da última importação.",
    live: "Diretos reportados", scheduled: "Agendadas", available: "Vídeos e repetições",
    empty: "Ainda não há ligações de vídeo para esta seleção.", partial: "Algumas missões não puderam ser verificadas. Podes tentar novamente.",
  },
  "en-GB": {
    title: "Launch broadcasts", back: "Launches",
    scope: "A selection of the next three launches and the three most recent. Status reflects the latest imported data.",
    live: "Reported live", scheduled: "Scheduled", available: "Videos and replays",
    empty: "There are no video links for this selection yet.", partial: "Some missions could not be checked. You can try again.",
  },
  "es-ES": {
    title: "Retransmisiones de lanzamientos", back: "Lanzamientos",
    scope: "Selección de los tres próximos lanzamientos y los tres más recientes. El estado refleja los datos de la última importación.",
    live: "Directos indicados", scheduled: "Programadas", available: "Vídeos y repeticiones",
    empty: "Todavía no hay enlaces de vídeo para esta selección.", partial: "No se pudieron comprobar algunas misiones. Puedes volver a intentarlo.",
  },
};

export async function generateMetadata() {
  return { title: copy[await getLocale()].title };
}

const groups = ["live", "scheduled", "available"] as const;

export default async function StreamsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const periods = await Promise.allSettled([
    getCachedLaunches(3, { period: "upcoming" }),
    getCachedLaunches(3, { period: "past" }),
  ]);
  const ids = new Set(periods.flatMap(result => result.status === "fulfilled" ? result.value.value.map(launch => launch.id) : []));
  const details = await Promise.allSettled(Array.from(ids, id => getCachedLaunch(id)));
  const partial = [...periods, ...details].some(result => result.status === "rejected");
  const now = Date.now();
  const missions = details.flatMap(result => {
    if (result.status !== "fulfilled") return [];
    const launch = result.value.value;
    const links = (launch.streams ?? []).map(safeMissionLink).filter(link => link !== null);
    return groups.flatMap(group => {
      const streams = links.filter(link => streamGroup(link, launch.source_updated_at, now) === group);
      return streams.length ? [{ group, launch: { ...launch, streams } }] : [];
    });
  });

  return (
    <main className="launch-dashboard streams-page" id="main-content">
      <header>
        <Link href="/">← {t.back}</Link>
        <h1>{t.title}</h1>
        <p>{t.scope}</p>
        <a href="#launch-channels">{channelDirectoryCopy[locale].link} ↓</a>
      </header>
      {partial && <div role="status"><p>{t.partial}</p><RetryButton /></div>}
      {!missions.length && !partial && <p>{t.empty}</p>}
      {groups.map(group => {
        const entries = missions.filter(mission => mission.group === group);
        return entries.length ? (
          <section className="broadcast-group" key={group} aria-labelledby={`streams-${group}`}>
            <h2 id={`streams-${group}`}>{t[group]}</h2>
            {entries.map(({ launch }) => (
              <article key={launch.id}>
                <h3><Link href={`/launches/${encodeURIComponent(launch.id)}`} prefetch={false}>{launch.name}</Link></h3>
                <MissionStreams launch={launch} compact />
              </article>
            ))}
          </section>
        ) : null;
      })}
      <LaunchChannels locale={locale} />
    </main>
  );
}
