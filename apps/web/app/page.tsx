import { formatLaunchStatus } from "../lib/launch";
import { getUpcomingLaunches } from "../lib/api";
import { formatLaunchDate } from "../lib/date";

export default async function Home() {
  let launches;
  let hasLaunchData = true;

  try {
    launches = await getUpcomingLaunches();
  } catch {
    launches = [];
    hasLaunchData = false;
  }

  return (
    <main>
      <header>
        <p className="eyebrow">Launch Tracker</p>
        <h1>O espaço, no momento certo.</h1>
        <p className="intro">Descubra lançamentos de agências de todo o mundo, com informação clara e fontes oficiais.</p>
      </header>
      <section aria-labelledby="next-launch-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Calendário global</p>
            <h2 id="next-launch-heading">Próximos lançamentos</h2>
          </div>
          <span className="status">Dados em direto</span>
        </div>
        {hasLaunchData ? (
          <div className="launch-list">
            {launches.map((launch) => (
              <article className="launch-card" key={launch.id}>
                <p className="launch-date">{formatLaunchDate(launch.net)}</p>
                <h3>{launch.name}</h3>
                <p>{launch.agency ?? "Agência a confirmar"}</p>
                <p className="launch-meta">
                  {launch.vehicle ?? "Veículo a confirmar"} · {formatLaunchStatus(launch.status)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <article className="launch-card">
            <h3>Os dados estão temporariamente indisponíveis.</h3>
            <p>Tenta atualizar a página dentro de momentos.</p>
          </article>
        )}
      </section>
    </main>
  );
}
