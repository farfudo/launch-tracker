import Link from "next/link";
import { getLocale } from "../../lib/locale-server";
import { discoveriesCopy, discoverySources, discoveryTopics, resolveTopic } from "../../lib/discoveries";
import { MissionIcon } from "../../components/mission-icon";
import { LinkPending } from "../../components/pending-feedback";

export async function generateMetadata() {
  const t = discoveriesCopy[await getLocale()];
  return {title:`NextRocketLaunch — ${t.nav}`, description:t.intro};
}

export default async function Discoveries({searchParams}:{searchParams:Promise<{topic?:string}>}) {
  const locale = await getLocale();
  const t = discoveriesCopy[locale];
  const topic = resolveTopic((await searchParams).topic);
  return <main id="main-content" className="discoveries-page">
    <header className="discoveries-intro"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></header>
    <nav className="discovery-topics" aria-label={t.nav}>
      {discoveryTopics.map((key,index) => <Link key={key} href={`/discoveries?topic=${key}#discovery-results`} className={`discovery-topic topic-${key}`} scroll={false} aria-current={topic === key ? "page" : undefined}>
        <MissionIcon name={index === 0 ? "rocket" : "orbit"}/><span className="topic-number" aria-hidden="true">0{index+1}</span>
        <h2>{t.topics[key][0]}</h2><p>{t.topics[key][1]}</p><span className="topic-arrow" aria-hidden="true">↗</span><LinkPending />
      </Link>)}
    </nav>
    <aside className="discovery-editorial-note"><span aria-hidden="true">ⓘ</span><p>{t.notice}</p></aside>
    <section id="discovery-results" aria-labelledby="discovery-heading">
      <div className="discovery-results-heading"><h2 id="discovery-heading">{topic === "all" ? t.heading : t.topics[topic][0]}</h2><Link href="/discoveries#discovery-results" scroll={false} aria-current={topic === "all" ? "page" : undefined}>{t.all}<LinkPending /></Link></div>
      <div className="discovery-source-grid">{discoverySources.map((item,index) => topic === "all" || item.topics.includes(topic) ? <article className="discovery-source-card" key={item.id}>
        <div className="discovery-source-meta"><span>{item.publisher}</span><span>{t.kinds[item.kind]}</span></div>
        <h3>{item.title}</h3><p>{t.summaries[index]}</p>
        <div className="discovery-source-topics">{item.topics.map(key => <span key={key}>{t.topics[key][0]}</span>)}</div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">{t.source} <span aria-hidden="true">↗</span><span className="visually-hidden"> ({t.official}, {t.language})</span></a>
        <small>{t.official} · {new URL(item.url).hostname.replace(/^www\./,"")}</small>
      </article> : null)}</div>
    </section>
    <aside className="discovery-evidence"><h2>{t.distinctions}</h2><p>{t.distinctionBody}</p></aside>
    <footer className="discovery-footer"><p>{t.checked}: <time dateTime="2026-10-25">{new Intl.DateTimeFormat(locale,{dateStyle:"long",timeZone:"UTC"}).format(new Date("2026-10-25T12:00:00Z"))}</time>. {t.checkedNote}</p></footer>
  </main>;
}
