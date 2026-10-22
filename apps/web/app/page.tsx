import Link from "next/link";
import { formatLaunchStatus } from "../lib/launch";
import { getFilterOptions, getUpcomingLaunches, type FilterOptions, type Launch } from "../lib/api";
import { formatLaunchDate } from "../lib/date";

type SearchParams = Promise<{ q?: string; agency?: string; vehicle?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  let launches: Launch[];
  let filterOptions: FilterOptions;
  let hasLaunchData = true;

  try {
    [launches, filterOptions] = await Promise.all([
      getUpcomingLaunches(20, filters),
      getFilterOptions()
    ]);
  } catch {
    launches = [];
    filterOptions = { agencies: [], vehicles: [] };
    hasLaunchData = false;
  }

  return (
    <main>
      <header>
        <p className="eyebrow">LaunchSkyline · Lançamentos espaciais</p>
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
        <form className="filters" action="/" method="get">
          <label>
            <span>Pesquisar</span>
            <input defaultValue={filters.q} name="q" placeholder="Missão, agência ou veículo" type="search" />
          </label>
          <label>
            <span>Agência</span>
            <select defaultValue={filters.agency ?? ""} name="agency">
              <option value="">Todas</option>
              {filterOptions.agencies.map((agency) => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </label>
          <label>
            <span>Veículo</span>
            <select defaultValue={filters.vehicle ?? ""} name="vehicle">
              <option value="">Todos</option>
              {filterOptions.vehicles.map((vehicle) => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
            </select>
          </label>
          <button type="submit">Aplicar filtros</button>
          <Link className="clear-filters" href="/">Limpar</Link>
        </form>
        {hasLaunchData ? (
          launches.length ? <div className="launch-list">
            {launches.map((launch) => (
              <Link className="launch-card" href={`/launches/${launch.id}`} key={launch.id}>
                <p className="launch-date">{formatLaunchDate(launch.net)}</p>
                <h3>{launch.name}</h3>
                <p>{launch.agency ?? "Agência a confirmar"}</p>
                <p className="launch-meta">
                  {launch.vehicle ?? "Veículo a confirmar"} · {formatLaunchStatus(launch.status)}
                </p>
              </Link>
            ))}
          </div> : <article className="launch-card"><h3>Sem resultados</h3><p>Tenta outros termos ou remove alguns filtros.</p></article>
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
