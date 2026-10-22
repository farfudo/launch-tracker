"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";

export function LoadingNotice({ previewSlow = false }: { previewSlow?: boolean }) {
  const { messages: t } = useLocale();
  const [slow, setSlow] = useState(previewSlow);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return <main aria-busy="true">
    <header>
      <p className="eyebrow">LaunchSkyline · {t.brandSubtitle}</p>
      <h1>{t.loadingTitle}</h1>
      <p className="intro">{t.loadingBody}</p>
      <div role="status" aria-live="polite">{slow ? <p className="launch-card">{t.loadingSlow}</p> : null}</div>
    </header>
  </main>;
}
