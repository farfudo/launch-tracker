import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { getCachedLaunches } from "../lib/cached-api";
import { relatedMission } from "../lib/related-missions";

const copy = {
  "pt-PT": { artemis: "Ver lançamento Artemis", starship: "Ver lançamento Starship", reusable: "Ver lançamento de um foguetão reutilizável" },
  "en-GB": { artemis: "View Artemis launch", starship: "View Starship launch", reusable: "View reusable rocket launch" },
  "es-ES": { artemis: "Ver lanzamiento Artemis", starship: "Ver lanzamiento Starship", reusable: "Ver lanzamiento de un cohete reutilizable" },
};
export async function RelatedMissions({ locale, topics }: { locale: Locale; topics: (keyof typeof copy["en-GB"])[] }) {
  try {
    const { value } = await getCachedLaunches(100, { period: "upcoming" });
    const matches = topics.map(topic => ({ topic, launch: relatedMission(value, topic) })).filter(item => item.launch);
    if (!matches.length) return null;
    return <nav className="discovery-related" aria-label={locale === "pt-PT" ? "Lançamentos relacionados" : locale === "es-ES" ? "Lanzamientos relacionados" : "Related launches"}>{matches.map(({topic, launch}) => <Link key={topic} href={`/launches/${encodeURIComponent(launch!.id)}`}>{copy[locale][topic]}: {launch!.name} →</Link>)}</nav>;
  } catch { return null; }
}
