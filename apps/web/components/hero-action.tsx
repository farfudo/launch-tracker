"use client";

import Link from "next/link";
import type { LaunchDetail } from "../lib/api";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { useLocale } from "./locale-provider";
import { useMissionSelection } from "./mission-selection";

export function HeroAction({ launch }: { launch: LaunchDetail | null }) {
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  const selection = useMissionSelection();
  return <>
    <Link className={`pill-button ${launch ? "hero-action-mobile" : ""}`} href="/?period=upcoming#launch-calendar">{d.upcoming} <span aria-hidden="true">→</span></Link>
    {launch ? <Link className="pill-button hero-action-desktop" href={`/launches/${launch.id}`} aria-controls="selected-mission" onClick={event => {
      if (!selection || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selection.select(launch);
    }}>{d.exploreNext} <span aria-hidden="true">→</span></Link> : null}
  </>;
}
