import Link from "next/link";
import { notFound } from "next/navigation";

import { getLaunch } from "../../../lib/api";
import { formatLaunchDate } from "../../../lib/date";
import { formatLaunchStatus } from "../../../lib/launch";

type RouteParams = Promise<{ id: string }>;

export default async function LaunchDetail({ params }: { params: RouteParams }) {
  const { id } = await params;

  try {
    const launch = await getLaunch(id);

    return (
      <main>
        <Link className="back-link" href="/">← Voltar ao calendário</Link>
        <header className="detail-header">
          <p className="eyebrow">Detalhe do lançamento</p>
          <h1>{launch.name}</h1>
          <p className="intro">{formatLaunchDate(launch.net)} · {formatLaunchStatus(launch.status)}</p>
        </header>
        <section className="mission-section" aria-labelledby="mission-heading">
          <p className="eyebrow">Sobre a missão</p>
          <h2 id="mission-heading">{launch.mission_name || "Missão por confirmar"}</h2>
          <p className="mission-description">{launch.mission_description || "A descrição desta missão ainda não foi disponibilizada."}</p>
          {launch.mission_description ? <p className="launch-meta">Descrição da Launch Library 2, no idioma original.</p> : null}
        </section>
        <section aria-labelledby="launch-data-heading">
          <h2 id="launch-data-heading">Informação disponível</h2>
          <dl className="launch-details">
            <div><dt>Agência</dt><dd>{launch.agency ?? "A confirmar"}</dd></div>
            <div><dt>Veículo</dt><dd>{launch.vehicle ?? "A confirmar"}</dd></div>
            <div><dt>Data prevista</dt><dd>{formatLaunchDate(launch.net)}</dd></div>
            <div><dt>Estado</dt><dd>{formatLaunchStatus(launch.status)}</dd></div>
            <div><dt>Local de lançamento</dt><dd>{launch.location_name || "A confirmar"}</dd></div>
            <div><dt>Plataforma de lançamento</dt><dd>{launch.pad_name || "A confirmar"}</dd></div>
            <div><dt>Início da janela</dt><dd>{launch.window_start ? formatLaunchDate(launch.window_start) : "A confirmar"}</dd></div>
            <div><dt>Fim da janela</dt><dd>{launch.window_end ? formatLaunchDate(launch.window_end) : "A confirmar"}</dd></div>
            <div><dt>Dados atualizados</dt><dd>{formatLaunchDate(launch.source_updated_at)}</dd></div>
          </dl>
          <p className="launch-meta">A janela indica o intervalo previsto para o lançamento. Quando o início e o fim coincidem, a fonte indica um único instante. Todos os horários são apresentados em UTC e podem sofrer alterações.</p>
          <p className="source-note">
            Dados fornecidos pela Launch Library 2.
            {launch.source_url ? <> <a href={launch.source_url} rel="noreferrer" target="_blank">Ver registo na fonte</a></> : null}
          </p>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
