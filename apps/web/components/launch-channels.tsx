import Link from "next/link";
import { dashboardCopy } from "../lib/dashboard-i18n";
import type { Locale } from "../lib/i18n";

const channels = [
  { name: "NASA+", href: "https://plus.nasa.gov/", kind: "official" },
  { name: "SpaceX", href: "https://www.spacex.com/launches", kind: "official" },
  { name: "Everyday Astronaut", href: "https://www.youtube.com/@EverydayAstronaut/streams", kind: "independent" },
  { name: "NASASpaceflight", href: "https://www.youtube.com/@NASASpaceflight/streams", kind: "independent" },
  { name: "Spaceflight Now", href: "https://spaceflightnow.com/live/", kind: "independent" },
  { name: "Rocket Lab", href: "https://rocketlabcorp.com/live-stream/", kind: "official" },
  { name: "ESA", href: "https://www.esa.int/esatv/Missions/Ariane", kind: "official" },
  { name: "Arianespace", href: "https://www.arianespace.com/road-to-space/", kind: "official" },
  { name: "JAXA", href: "https://global.jaxa.jp/index.html", kind: "official" },
  { name: "LabPadre", href: "https://www.labpadre.com/", kind: "cameras" },
] as const;

const groups = ["official", "independent", "cameras"] as const;

export const channelDirectoryCopy = {
  "pt-PT": {
    browse: "Ver transmissões por missão", title: "Canais de lançamento", link: "Consultar canais de lançamento",
    note: "Consulta a programação de cada canal para confirmar se vai cobrir a missão.",
    official: "Fontes oficiais", independent: "Cobertura independente", cameras: "Câmaras ao vivo",
    descriptions: ["Missões e eventos da NASA.", "Transmissões das missões SpaceX.", "Lançamentos comentados e explicações.", "Diretos e câmaras de plataformas de lançamento.", "Cobertura de lançamentos e atualizações durante a missão.", "Transmissões de lançamentos Electron.", "Vídeos e transmissões das missões Ariane.", "Transmissões e repetições dos lançamentos Ariane 6.", "Cobertura de lançamentos japoneses, incluindo o H3.", "Câmaras independentes em Starbase."],
  },
  "en-GB": {
    browse: "Browse broadcasts by mission", title: "Launch channels", link: "Browse launch channels",
    note: "Check each channel’s schedule to confirm whether it will cover the mission.",
    official: "Official sources", independent: "Independent coverage", cameras: "Live cameras",
    descriptions: ["NASA missions and events.", "SpaceX mission webcasts.", "Launch commentary and explainers.", "Live coverage and launch pad cameras.", "Launch coverage and running updates.", "Electron launch webcasts.", "Videos and broadcasts of Ariane missions.", "Ariane 6 launch broadcasts and replays.", "Japanese launch coverage, including H3 missions.", "Independent cameras at Starbase."],
  },
  "es-ES": {
    browse: "Ver retransmisiones por misión", title: "Canales de lanzamientos", link: "Consultar canales de lanzamientos",
    note: "Consulta la programación de cada canal para confirmar si cubrirá la misión.",
    official: "Fuentes oficiales", independent: "Cobertura independiente", cameras: "Cámaras en directo",
    descriptions: ["Misiones y eventos de la NASA.", "Retransmisiones de misiones de SpaceX.", "Lanzamientos comentados y explicaciones.", "Directos y cámaras de plataformas de lanzamiento.", "Cobertura de lanzamientos y actualizaciones durante la misión.", "Retransmisiones de lanzamientos Electron.", "Vídeos y retransmisiones de misiones Ariane.", "Retransmisiones y repeticiones de lanzamientos Ariane 6.", "Cobertura de lanzamientos japoneses, incluidas las misiones H3.", "Cámaras independientes en Starbase."],
  },
};

export function LaunchChannels({ locale, showBrowse = false }: { locale: Locale; showBrowse?: boolean }) {
  const copy = channelDirectoryCopy[locale];
  return (
    <section id="launch-channels" className="launch-channels" aria-labelledby="launch-channels-title">
      <h2 id="launch-channels-title">{copy.title}</h2>
      <p>{copy.note}</p>
      {groups.map(group => (
        <section key={group} className="launch-channel-group" aria-labelledby={`launch-channels-${group}`}>
          <h3 id={`launch-channels-${group}`}>{copy[group]}</h3>
          <ul>
            {channels.map((channel, index) => channel.kind === group && (
              <li key={channel.href}>
                <a href={channel.href} target="_blank" rel="noopener noreferrer">
                  <strong>{channel.name}</strong><span aria-hidden="true"> ↗</span>
                  <span className="visually-hidden"> ({dashboardCopy[locale].newTab})</span>
                </a>
                <small>{copy.descriptions[index]}</small>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {showBrowse && <Link href="/streams" prefetch={false}>{copy.browse} →</Link>}
    </section>
  );
}
