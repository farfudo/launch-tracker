import { notFound } from "next/navigation";
import { LoadingNotice } from "../../../components/loading-notice";

export default function LoadingPreview() {
  if (process.env.DESIGN_PREVIEW !== "true") notFound();
  return <>
    <aside className="launch-card" style={{ margin: "100px 24px 0" }}>Preview local · simulação de espera prolongada, sem pedidos à API.</aside>
    <LoadingNotice previewSlow />
  </>;
}
