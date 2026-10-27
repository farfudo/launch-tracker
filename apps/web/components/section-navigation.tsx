"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./locale-provider";
import { discoveriesCopy } from "../lib/discoveries";
import { exploreSpaceNavCopy } from "../lib/explore-space";
import { LinkPending } from "./pending-feedback";

export function SectionNavigation() {
  const pathname = usePathname();
  const {locale} = useLocale();
  const t = discoveriesCopy[locale];
  const exploreActive = pathname === "/explore-space" || pathname === "/discoveries" || pathname.startsWith("/discoveries/");
  const label={'pt-PT':'Secções principais','en-GB':'Main sections','es-ES':'Secciones principales'}[locale];
  return <nav className="section-navigation" aria-label={label}>
    <Link href="/" aria-current={pathname === "/" || pathname.startsWith("/launches/") ? "page" : undefined}>{t.launches}<LinkPending /></Link>
    <Link href="/explore-space" aria-current={exploreActive ? "page" : undefined}>{exploreSpaceNavCopy[locale]}<LinkPending /></Link>
  </nav>;
}
