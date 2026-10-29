"use client";

import { useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { QuickActionIcon } from "./quick-action-icon";
import { Spinner } from "./pending-feedback";

const copy = {
  "pt-PT": { share: "Partilhar missão", link: "Copiar ligação", copied: "Ligação copiada", error: "Não foi possível concluir. Podes copiar a ligação ou selecioná-la manualmente.", manual: "Ligação da missão", waiting: "A preparar partilha…" },
  "en-GB": { share: "Share mission", link: "Copy link", copied: "Link copied", error: "Could not complete the action. You can copy the link or select it manually.", manual: "Mission link", waiting: "Preparing to share…" },
  "es-ES": { share: "Compartir misión", link: "Copiar enlace", copied: "Enlace copiado", error: "No se pudo completar la acción. Puedes copiar el enlace o seleccionarlo manualmente.", manual: "Enlace de la misión", waiting: "Preparando para compartir…" }
};

export function missionShareUrl(id: string, origin: string) {
  return new URL(`/launches/${encodeURIComponent(id)}`, origin).href;
}

export function MissionShare({ id, name, iconOnly = false }: { id: string; name: string; iconOnly?: boolean }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const [manualUrl, setManualUrl] = useState("");
  const disclosure = useRef<HTMLDetailsElement>(null);

  async function handleShare(forceCopy: boolean) {
    if (busy.current) return;
    busy.current = true;
    setPending(true); setStatus("idle"); setManualUrl("");
    const url = missionShareUrl(id, window.location.origin);
    try {
      if (!forceCopy && typeof navigator.share === "function") {
        await navigator.share({ title: name, url });
        setStatus("shared");
      } else {
        if (!navigator.clipboard?.writeText) throw new Error("clipboard_unavailable");
        await navigator.clipboard.writeText(url);
        setStatus("copied");
      }
    } catch (error) {
      // Cancelling the native sheet must not copy or send anything implicitly.
      const cancelled = typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
      if (!cancelled) {
        if (iconOnly && navigator.clipboard?.writeText) {
          try { await navigator.clipboard.writeText(url); setStatus("copied"); }
          catch { setStatus("error"); setManualUrl(url); }
        } else { setStatus("error"); setManualUrl(url); }
      }
    } finally {
      busy.current = false; setPending(false);
    }
  }

  if (iconOnly) return <div className="quick-share" onClick={event => event.stopPropagation()}>
    <button type="button" className="quick-action" aria-label={`${t.share}: ${name}`} title={t.share} disabled={pending} onClick={() => void handleShare(false)}><QuickActionIcon kind="share-2"/></button>
    <span className="visually-hidden" role="status">{pending ? t.waiting : status === "copied" ? t.copied : status === "shared" ? {"pt-PT":"Missão partilhada", "en-GB":"Mission shared", "es-ES":"Misión compartida"}[locale] : ""}</span>
    {status === "error" ? <div className="quick-share-error"><p role="alert">{t.error}</p><button type="button" onClick={() => void handleShare(true)}>{t.link}</button><label>{t.manual}<input readOnly value={manualUrl} onFocus={event => event.currentTarget.select()}/></label></div> : null}
  </div>;
  return <details className="mission-share" aria-busy={pending} ref={disclosure} onKeyDown={event => {
    if (event.key === "Escape" && !pending && disclosure.current) {
      disclosure.current.open = false;
      disclosure.current.querySelector("summary")?.focus();
    }
  }}>
    <summary className="mission-share-toggle"><span aria-hidden="true">↗</span> {t.share}</summary>
    <div className="mission-share-content">
    <div className="mission-share-actions">
      <button type="button" disabled={pending} onClick={() => void handleShare(false)}>{pending ? <Spinner /> : <span aria-hidden="true">↗</span>} {t.share}</button>
      <button type="button" disabled={pending} onClick={() => void handleShare(true)}>{t.link}</button>
    </div>
    <p className="mission-share-feedback" role="status">{pending ? t.waiting : status === "copied" ? t.copied : status === "shared" ? {"pt-PT":"Missão partilhada", "en-GB":"Mission shared", "es-ES":"Misión compartida"}[locale] : ""}</p>
    {status === "error" ? <div><p role="alert">{t.error}</p><label>{t.manual}<input type="text" readOnly value={manualUrl} onFocus={event => event.currentTarget.select()} /></label></div> : null}
    </div>
  </details>;
}
