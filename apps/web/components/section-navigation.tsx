"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./locale-provider";
import { discoveriesCopy } from "../lib/discoveries";
import { LinkPending } from "./pending-feedback";

export function SectionNavigation() {
  const pathname = usePathname();
  const {locale} = useLocale();
  const t = discoveriesCopy[locale];
  const artemis = pathname === "/discoveries/artemis";
  return <nav className="section-navigation" aria-label={t.nav}>
    <Link href="/" aria-current={pathname === "/" || pathname.startsWith("/launches/") ? "page" : undefined}>{t.launches}<LinkPending /></Link>
    <div className="section-navigation-branch">
      <Link href="/discoveries" aria-current={artemis ? "location" : pathname === "/discoveries" ? "page" : undefined}>{t.nav}<LinkPending /></Link>
      {artemis && <span className="section-navigation-child" aria-current="page"><span aria-hidden="true">↳</span> Artemis</span>}
    </div>
  </nav>;
}
