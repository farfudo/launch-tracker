"use client";

import { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale } from "./locale-provider";

export function Spinner({ variant = "orbit" }: { variant?: "orbit" | "launch" }) {
  if (variant === "orbit") return <span className="action-spinner rocket-loader rocket-loader-orbit" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none" focusable="false">
      <circle className="rocket-orbit-track" cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" />
      <g className="rocket-orbit-traveller">
        <g transform="translate(20 8) rotate(90)">
          <path className="rocket-loader-flame" d="M-2 5Q-3 10 0 12Q3 10 2 5Z" fill="#ff7a2f" />
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="var(--surface)">
            <path d="M-4 1-7 5v4l4-3M4 1l3 4v4L3 6" />
            <path d="M-4 6V-1Q-4-6 0-9Q4-6 4-1v7Z" />
            <circle cx="0" cy="-1" r="1.5" />
          </g>
        </g>
      </g>
    </svg>
  </span>;
  return <span className="action-spinner rocket-loader rocket-loader-launch" aria-hidden="true">
    <svg viewBox="0 0 32 40" fill="none" focusable="false">
      <path className="rocket-loader-flame" d="M12 28Q11 34 16 38Q21 34 20 28Z" fill="#ff7a2f" />
      <g className="rocket-loader-body" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20 5 25v6l7-4M22 20l5 5v6l-7-4" fill="var(--surface)" />
        <path d="M10 27V16Q10 7 16 2Q22 7 22 16v11Z" fill="var(--surface)" />
        <circle cx="16" cy="15" r="3" />
        <path d="M11 27h10" />
      </g>
    </svg>
  </span>;
}

export function LinkPending() {
  const { pending } = useLinkStatus();
  const { messages: t } = useLocale();
  return <span className="link-pending" role="status">{pending ? <><Spinner /><span className="visually-hidden">{t.loadingTitle}</span></> : null}</span>;
}

export function SearchForm({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { messages: t } = useLocale();
  return <form className="filters" action="/#launch-calendar" method="get" aria-busy={pending}
    onSubmit={event => {
      event.preventDefault();
      if (pending) return;
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(event.currentTarget)) {
        if (typeof value === "string") params.set(key, value);
      }
      startTransition(() => router.push(`/?${params}#launch-calendar`, { scroll: false }));
    }}>
    {children}
    <button type="submit" disabled={pending}>{pending ? <Spinner /> : null}{t.applyFilters}</button>
    <span role="status" className="visually-hidden">{pending ? t.loadingTitle : ""}</span>
  </form>;
}
