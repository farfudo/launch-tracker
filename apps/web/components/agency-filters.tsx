"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocale } from "./locale-provider";
import { dashboardCopy } from "../lib/dashboard-i18n";

export function AgencyFilters({ agencies, filters }: { agencies: string[]; filters: { q?: string; agency?: string; vehicle?: string; favorites?: string } }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const { locale } = useLocale();
  const d = dashboardCopy[locale];
  const priority = ["SpaceX", "Rocket Lab", "Blue Origin", "United Launch Alliance", "Arianespace"];
  const options = ["", ...[...agencies].sort((a, b) => (priority.includes(a) ? priority.indexOf(a) : 99) - (priority.includes(b) ? priority.indexOf(b) : 99)).slice(0, 5)];
  return <div className="agency-filter-navigation" aria-busy={pending}>
    <nav className="agency-chips" aria-label={d.filterAgency}>{options.map(agency => {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.vehicle) params.set("vehicle", filters.vehicle);
      if (filters.favorites === "1") params.set("favorites", "1");
      if (agency) params.set("agency", agency);
      const href = `/?${params}#launch-calendar`;
      return <Link key={agency} href={href} prefetch={false} aria-current={(filters.agency || "") === agency ? "page" : undefined} data-pending={pending && target === agency || undefined} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setTarget(agency);
        startTransition(() => router.push(href, { scroll: false }));
      }}>{agency || d.all}<span className="agency-filter-spinner" aria-hidden="true" /></Link>;
    })}</nav>
    <p className="agency-filter-feedback" role="status" aria-live="polite">{pending ? d.loadingLaunches : ""}</p>
  </div>;
}
