"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicCacheInfo } from "../lib/cached-api";
import { formatLaunchDate } from "../lib/date";
import { useLocale } from "./locale-provider";
import { Spinner } from "./pending-feedback";

const copy = {
  "pt-PT": { saved: "Cópia da interface verificada", updating: "A mostrar dados guardados enquanto procuramos uma resposta recente.", waiting: "Ainda não foi possível confirmar uma resposta mais recente. Os horários podem ter mudado.", retry: "Verificar novamente" },
  "en-GB": { saved: "Interface copy checked", updating: "Showing saved data while checking for a recent response.", waiting: "A more recent response has not been confirmed yet. Schedules may have changed.", retry: "Check again" },
  "es-ES": { saved: "Copia de la interfaz comprobada", updating: "Mostrando datos guardados mientras buscamos una respuesta reciente.", waiting: "Todavía no se ha confirmado una respuesta más reciente. Los horarios pueden haber cambiado.", retry: "Comprobar de nuevo" }
};
export function CacheNotice({ entries, autoRefresh = true, onRetry }: { entries: PublicCacheInfo[]; autoRefresh?: boolean; onRetry?: () => void }) {
  const { locale } = useLocale();
  const router = useRouter();
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    return () => window.clearInterval(timer);
  }, [key, router, autoRefresh]);
  if (!entries.length) return null;
  const checked = entries.map(item => item.checkedAt).sort()[0];
  const t = copy[locale];
  return <aside className="frontend-cache-notice" aria-label={t.saved}>
    <p>{t.saved}: <time dateTime={checked}>{formatLaunchDate(checked, locale)}</time>.</p>
    <p role="status">{refreshing ? <><Spinner /> {t.updating}</> : unconfirmed ? t.waiting : null}</p>
    {unconfirmed ? <button type="button" onClick={() => { tries.current = 0; setUnconfirmed(false); setRefreshing(true); if (onRetry) onRetry(); else router.refresh(); }}>{t.retry}</button> : null}
  </aside>;
}
