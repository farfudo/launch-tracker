import Link from "next/link";
import type { Messages } from "../lib/i18n";

export const designOptions = ["mission-control", "cinematic", "compact"] as const;
export type DetailDesign = typeof designOptions[number];

export function resolveDesign(value: unknown): DetailDesign {
  return designOptions.includes(value as DetailDesign) ? value as DetailDesign : "mission-control";
}

export function DesignReview({ launchId, selected, messages: t }: {
  launchId: string; selected: DetailDesign; messages: Messages;
}) {
  const labels = [t.designMissionControl, t.designCinematic, t.designCompact];
  return <aside className="design-review" aria-label={t.previewTitle}>
    <div><strong>{t.previewTitle}</strong><p>{t.previewDescription}</p></div>
    <nav aria-label={t.previewTitle}>
      {designOptions.map((design, index) => <Link
        key={design}
        href={`/launches/${encodeURIComponent(launchId)}?design=${design}`}
        aria-current={selected === design ? "page" : undefined}
      >{labels[index]}</Link>)}
    </nav>
  </aside>;
}
