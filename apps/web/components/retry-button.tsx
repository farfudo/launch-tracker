"use client";

import { useLocale } from "./locale-provider";

export function RetryButton() {
  const { messages: t } = useLocale();
  return <button type="button" onClick={() => window.location.reload()}>{t.retry}</button>;
}
