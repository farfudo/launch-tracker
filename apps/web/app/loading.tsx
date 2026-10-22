"use client";

import { useLocale } from "../components/locale-provider";

export default function Loading() {
  const { messages: t } = useLocale();
  return (
    <main aria-busy="true">
      <header>
        <p className="eyebrow">LaunchSkyline · {t.brandSubtitle}</p>
        <h1>{t.loadingTitle}</h1>
        <p className="intro">{t.loadingBody}</p>
      </header>
    </main>
  );
}
