import { notFound } from "next/navigation";
import Home from "../../page";

export default function CachePreview() {
  if (process.env.DESIGN_PREVIEW !== "true") notFound();
  return <>
    <aside className="launch-card" style={{ margin: "100px 24px 0" }}>
      Preview local da cache · missões fictícias. O ensaio usa uma API local com atraso configurável; não consulta a API pública.
    </aside>
    <Home searchParams={Promise.resolve({})} />
  </>;
}
