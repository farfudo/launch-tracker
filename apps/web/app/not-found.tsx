"use client";

import Link from "next/link";
import { useLocale } from "../components/locale-provider";
import { BrandMark } from "../components/brand";

export default function NotFound() {
  const { messages: t } = useLocale();
  return <main>
    <header>
      <p className="eyebrow"><BrandMark /> <span aria-hidden="true">·</span> {t.brandSubtitle}</p>
      <h1>{t.notFoundTitle}</h1>
      <p className="intro">{t.notFoundBody}</p>
      <Link className="back-link" href="/">← {t.backToCalendar}</Link>
    </header>
  </main>;
}
