"use client";
import Link from "next/link";
import { launchReturnHref } from "../../../lib/launch-navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useLocale } from "../../../components/locale-provider";
import { Spinner } from "../../../components/pending-feedback";

export default function MissionError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const returnTo = useSearchParams().get("returnTo");
  const { locale, messages } = useLocale();
  const [pending, startTransition] = useTransition();
  const title = {"pt-PT":"Não foi possível carregar esta missão.","en-GB":"This mission could not be loaded.","es-ES":"No se pudo cargar esta misión."}[locale];
  return <main id="main-content"><section className="launch-card" aria-labelledby="mission-error-title">
    <h1 id="mission-error-title">{title}</h1><p>{messages.errorBody}</p>
    <button type="button" disabled={pending} aria-busy={pending} onClick={() => startTransition(() => { router.refresh(); reset(); })}>{pending ? <Spinner/> : null}{messages.retry}</button>
    <p><Link href={launchReturnHref(returnTo)}>← {messages.backToCalendar}</Link></p>
  </section></main>;
}
