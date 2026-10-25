import Link from "next/link";
import { getLocale } from "../../lib/locale-server";
import { discoveriesCopy, discoverySources, discoveryTopics, resolveTopic } from "../../lib/discoveries";
import { LinkPending } from "../../components/pending-feedback";
import { BoosterCatchPreview } from "../../components/booster-catch-preview";
import { TechnologyLab } from "../../components/technology-lab";
import { explorerCopy } from "../../lib/discovery-explorers";

export async function generateMetadata() {
  const t = discoveriesCopy[await getLocale()];
  return {title:`NextRocketLaunch — ${t.nav}`, description:t.intro};
}

export default async function Discoveries({searchParams}:{searchParams:Promise<{topic?:string}>}) {
  const locale = await getLocale();
  const t = discoveriesCopy[locale];
  const e = explorerCopy[locale];
  const topic = resolveTopic((await searchParams).topic);
  return <main id="main-content" className="discoveries-page">
    <header className="discoveries-intro"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></header>
    <section className="discovery-start" aria-labelledby="discovery-hook-title">
      <div className="discovery-hook-copy"><p className="eyebrow">{t.hookLabel}</p><h2 id="discovery-hook-title">{t.hookTitle}</h2><p>{t.hookBody}</p>
        <div className="discovery-hook-actions"><a href="#technology-lab" className="pill-button">{t.hookAction} →</a><a href="#artemis-feature">Artemis ↓</a></div>
        <details className="discovery-first-question"><summary>{t.hookQuestion}</summary><p>{t.hookAnswer}</p></details>
      </div>
      <BoosterCatchPreview key={locale} locale={locale}/>
    </section>
    <TechnologyLab locale={locale}/>
    <section id="artemis-feature" className="artemis-feature" aria-labelledby="artemis-feature-title">
      <div className="artemis-feature-copy"><p className="eyebrow">{e.featureLabel}</p><h2 id="artemis-feature-title">{e.featureTitle}</h2><p>{e.featureBody}</p><Link href="/discoveries/artemis" className="pill-button">{e.featureAction} →<LinkPending/></Link></div>
      <div className="artemis-feature-visual"><div className="lunar-orbit" aria-hidden="true"><span className="lunar-disc"/><span className="lunar-traveller"/></div><ul>{e.featureTopics.map((item,index)=><li key={item}><span>0{index+1}</span>{item}</li>)}</ul></div>
    </section>
    <details className="discovery-library" open={topic !== "all"}><summary><span>{e.sources}<small>{e.sourcesHint}</small></span></summary>
    <section id="discovery-results" aria-labelledby="discovery-heading">
      <div className="discovery-results-heading"><h2 id="discovery-heading">{topic === "all" ? t.heading : t.topics[topic][0]}</h2><Link href="/discoveries#discovery-results" scroll={false} aria-current={topic === "all" ? "page" : undefined}>{t.all}<LinkPending /></Link></div>
      <nav className="discovery-topic-filters" aria-label={t.nav}>{discoveryTopics.map(key => <Link key={key} className={`topic-${key}`} href={`/discoveries?topic=${key}#discovery-results`} scroll={false} aria-current={topic === key ? "page" : undefined}>{t.topics[key][0]}<LinkPending/></Link>)}</nav>
      <div className="discovery-source-grid">{discoverySources.map((item,index) => topic === "all" || item.topics.includes(topic) ? <article className="discovery-source-card" key={item.id}>
        <div className="discovery-source-meta"><span>{item.publisher}</span><span>{t.kinds[item.kind]}</span></div>
        <h3>{item.title}</h3><p>{t.summaries[index]}</p>
        <div className="discovery-source-topics">{item.topics.map(key => <span key={key}>{t.topics[key][0]}</span>)}</div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">{t.source} <span aria-hidden="true">↗</span><span className="visually-hidden"> ({t.official}, {t.language})</span></a>
        <small>{t.official} · {new URL(item.url).hostname.replace(/^www\./,"")}</small>
      </article> : null)}</div>
    </section>
    </details>
    <footer className="discovery-footer"><p>{e.editorial} · {t.checked}: <time dateTime="2026-10-25">{new Intl.DateTimeFormat(locale,{dateStyle:"long",timeZone:"UTC"}).format(new Date("2026-10-25T12:00:00Z"))}</time>.</p></footer>
  </main>;
}
