import type { Launch } from "./api";
import { launchTimingStatus } from "./launch";

// Matches the existing six-hour global freshness budget. A past NET alone is
// not a confirmed result: unresolved past launches still need fresh observation.
export const MISSION_FRESHNESS_MS = 6 * 60 * 60 * 1000;
export function missionFreshness(launch: Pick<Launch, "source_updated_at" | "status">, now: number): "unknown" | "recent" | "stale" | "historical" {
  const observed = Date.parse(launch.source_updated_at);
  if (!now || !Number.isFinite(observed) || observed > now) return "unknown";
  if (launchTimingStatus(launch.status) === "terminal") return "historical";
  return now - observed >= MISSION_FRESHNESS_MS ? "stale" : "recent";
}
export const freshnessCopy = {
  "pt-PT": { global: "Última importação global", observed: "Missão observada na importação", provider: "Data de alteração pelo fornecedor não disponível.", unknown: "Frescura não confirmada", recent: "Observação recente; os horários podem mudar.", stale: "Esta missão não é observada há pelo menos 6 horas; o horário e o estado podem estar desatualizados.", historical: "Registo histórico retido; não implica reconciliação recente do resultado." },
  "en-GB": { global: "Latest global import", observed: "Mission observed during import", provider: "Provider modification time unavailable.", unknown: "Freshness unconfirmed", recent: "Recent observation; schedules may change.", stale: "This mission has not been observed for at least 6 hours; its schedule and status may be outdated.", historical: "Retained historical record; this does not imply recent result reconciliation." },
  "es-ES": { global: "Última importación global", observed: "Misión observada durante la importación", provider: "Fecha de modificación del proveedor no disponible.", unknown: "Vigencia no confirmada", recent: "Observación reciente; los horarios pueden cambiar.", stale: "Esta misión no se ha observado durante al menos 6 horas; su horario y estado pueden estar desactualizados.", historical: "Registro histórico conservado; no implica una conciliación reciente del resultado." }
} as const;

/** A stale frontend snapshot cannot certify a current global status. */
export function globalFreshnessConfirmed(cache: { checkedAt: string; revalidateSeconds: number } | null | undefined, now: number): boolean {
  if (!cache) return false;
  const age = now - Date.parse(cache.checkedAt);
  return Number.isFinite(age) && age >= 0 && age < cache.revalidateSeconds * 1000;
}
