"use client";

import { useLocale } from "../components/locale-provider";
import { BrandMark } from "../components/brand";

export default function Error({ reset }: { reset: () => void }) {
  const { messages: t } = useLocale();
  return (
    <main id="main-content">
      <header>
        <p className="eyebrow"><BrandMark /> <span aria-hidden="true">·</span> {t.brandSubtitle}</p>
        <h1>{t.errorTitle}</h1>
        <p className="intro">{t.errorBody}</p>
        <button onClick={reset} type="button">{t.retry}</button>
      </header>
    </main>
  );
}
