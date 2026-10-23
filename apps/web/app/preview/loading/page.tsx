import { notFound } from "next/navigation";
import { LoadingNotice } from "../../../components/loading-notice";
import { Spinner } from "../../../components/pending-feedback";

export default function LoadingPreview() {
  if (process.env.DESIGN_PREVIEW !== "true") notFound();
  return <>
    <aside className="launch-card" style={{ margin: "100px 24px 0" }}>Preview local · simulação de espera prolongada, sem pedidos à API.</aside>
    <section className="launch-card loading-preview-examples" aria-label="Comparação dos indicadores">
      <h2>Indicadores pequenos · exemplos de apresentação</h2>
      <div className="loading-preview-controls">
        <button type="button" disabled><Spinner /> A carregar…</button>
        <span><Spinner /> Imagem</span>
        <span><Spinner /> Favoritos</span>
      </div>
      <p>Em órbita nos controlos pequenos; a subir no carregamento da página.</p>
    </section>
    <LoadingNotice previewSlow />
  </>;
}
