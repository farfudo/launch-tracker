"use client";

import type { LaunchDetail } from "../lib/api";
import { useLocale } from "./locale-provider";
import { safeMissionLink } from "./mission-streams";

const copy = {
  "pt-PT": { heading: "Explorar fontes", notice: "Websites indicados pela Launch Library 2. A classificação não garante que sejam oficiais. Abrem num novo separador.", agency: "Agência", vehicle: "Foguetão", pad: "Local de lançamento", mission: "Missão e carga útil", missing: "Ligação não disponibilizada pela fonte", visit: "Visitar website" },
  "en-GB": { heading: "Explore sources", notice: "Websites supplied by Launch Library 2. Categories do not guarantee official status. Links open in a new tab.", agency: "Agency", vehicle: "Rocket", pad: "Launch site", mission: "Mission and payload", missing: "No link supplied by the source", visit: "Visit website" },
  "es-ES": { heading: "Explorar fuentes", notice: "Sitios indicados por Launch Library 2. La categoría no garantiza que sean oficiales. Se abren en una pestaña nueva.", agency: "Agencia", vehicle: "Cohete", pad: "Lugar de lanzamiento", mission: "Misión y carga útil", missing: "La fuente no proporcionó un enlace", visit: "Visitar sitio" },
};

export function MissionSources({ launch }: { launch: LaunchDetail }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const links = (launch.mission_links || []).map(safeMissionLink).filter(link => link !== null);
  return <section className="mission-sources mission-panel" aria-label={t.heading}>
    <h2>{t.heading}</h2><p className="launch-meta">{t.notice}</p>
    <div className="mission-source-grid">{(["agency", "vehicle", "pad", "mission"] as const).map(kind => {
      const seen = new Set<string>();
      const group = links.filter(link => (link.kind || "mission") === kind && !seen.has(link.url) && seen.add(link.url));
      return <div className="mission-source-card" key={kind}><h3>{t[kind]}</h3>
        {group.length ? <ul>{group.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.title || t.visit} ↗</a><small>{link.host}</small></li>)}</ul> : <p className="launch-meta">{t.missing}</p>}
      </div>;
    })}</div>
  </section>;
}
