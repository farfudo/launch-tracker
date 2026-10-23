"use client";

import { useLocale } from "../components/locale-provider";
import { BrandMark } from "../components/brand";
import { useTransition } from "react";
import { Spinner } from "../components/pending-feedback";

export default function Error({ reset }: { reset: () => void }) {
  const { messages: t } = useLocale();
  const [pending, startTransition] = useTransition();
  return (
    <main id="main-content">
      <header>
        <p className="eyebrow"><BrandMark /> <span aria-hidden="true">·</span> {t.brandSubtitle}</p>
        <h1>{t.errorTitle}</h1>
        <p className="intro">{t.errorBody}</p>
        <button disabled={pending} aria-busy={pending} onClick={() => startTransition(reset)} type="button">{pending ? <Spinner /> : null}{t.retry}</button>
      </header>
    </main>
  );
}
