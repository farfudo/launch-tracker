"use client";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PublicCacheInfo } from "../lib/cached-api";
import { formatLaunchDate } from "../lib/date";
import { useLocale } from "./locale-provider";
import { InfoDisclosure } from "./info-disclosure";
import { Spinner } from "./pending-feedback";

const copy = {
  "pt-PT": { saved: "Cópia da interface verificada", updating: "A mostrar dados guardados enquanto procuramos uma resposta recente.", waiting: "Ainda não foi possível confirmar uma resposta mais recente. Os horários podem ter mudado.", retry: "Verificar novamente" },
  "en-GB": { saved: "Interface copy checked", updating: "Showing saved data while checking for a recent response.", waiting: "A more recent response has not been confirmed yet. Schedules may have changed.", retry: "Check again" },
  "es-ES": { saved: "Copia de la interfaz comprobada", updating: "Mostrando datos guardados mientras buscamos una respuesta reciente.", waiting: "Todavía no se ha confirmado una respuesta más reciente. Los horarios pueden haber cambiado.", retry: "Comprobar de nuevo" }
};
export function CacheNotice({ entries, autoRefresh = true, onRetry, compact = false, warning, lastUpdated, children }: { entries: PublicCacheInfo[]; autoRefresh?: boolean; onRetry?: () => void; compact?: boolean; warning?: string; lastUpdated?: string; children?: ReactNode }) {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, startRetry] = useTransition();
  const tries = useRef(0);
  const key = JSON.stringify(entries);
  useEffect(() => {
    tries.current = 0;
    function check() {
      const items: PublicCacheInfo[] = JSON.parse(key);
      const due = items.some(item => item.revalidateSeconds > 0 && Date.now() - Date.parse(item.checkedAt) >= item.revalidateSeconds * 1000);
      const available = document.visibilityState === "visible" && navigator.onLine !== false;
      setRefreshing(due && autoRefresh && tries.current < 6 && available);
      setUnconfirmed(due && (!autoRefresh || tries.current >= 6 || !available));
      if (due && autoRefresh && tries.current < 6 && available) {
        tries.current += 1;
        router.refresh();
      }
    }
    check();
    const timer = window.setInterval(check, 10000);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, [key, router, autoRefresh]);
  if (!entries.length && !children) return null;
  const checked = entries.map(item => item.checkedAt).sort()[0];
  const t = copy[locale];
  const timestamp = checked ? <p>{t.saved}: <time dateTime={checked}>{formatLaunchDate(checked, locale)}</time>.</p> : null;
  return <aside className={`frontend-cache-notice${compact ? " frontend-cache-notice-compact" : ""}`} aria-label={t.saved}>
    {compact ? <div className="data-info"><InfoDisclosure label={messages.aboutData}>{children}{timestamp}</InfoDisclosure></div> : <>{children}{timestamp}</>}
    <div className="cache-status-row" hidden={!refreshing && !retrying && !unconfirmed && !warning}>
      <p role="status">
        {refreshing || retrying ? <><Spinner /> {t.updating}</> : warning ?? (unconfirmed ? t.waiting : null)}
        {lastUpdated && (refreshing || retrying || unconfirmed || warning) ? <> · {messages.lastUpdated}: <time dateTime={lastUpdated}>{formatLaunchDate(lastUpdated, locale)}</time></> : null}
      </p>
      {(unconfirmed || warning) && !refreshing ? <button type="button" disabled={retrying} onClick={() => {
        if (navigator.onLine === false) return;
        tries.current = 0;
        startRetry(() => { if (onRetry) onRetry(); else router.refresh(); });
      }}>{t.retry}</button> : null}
    </div>
  </aside>;
}
