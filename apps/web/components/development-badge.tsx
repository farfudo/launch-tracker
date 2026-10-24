"use client";
import { useLocale } from "./locale-provider";

export function DevelopmentBadge() {
  const { locale } = useLocale();
  const text = { "pt-PT": "Em desenvolvimento", "en-GB": "In development", "es-ES": "En desarrollo" }[locale];
  return <span className="development-badge"><span aria-hidden="true">●</span> {text}</span>;
}
