"use client";

import { useLocale } from "../components/locale-provider";

export default function Error({ reset }: { reset: () => void }) {
  const { messages: t } = useLocale();
  return (
    <main>
      <header>
        <p className="eyebrow">LaunchSkyline · {t.brandSubtitle}</p>
        <h1>{t.errorTitle}</h1>
        <p className="intro">{t.errorBody}</p>
        <button onClick={reset} type="button">{t.retry}</button>
      </header>
    </main>
  );
}
