import type { NetPrecision } from "./api";
import type { Locale } from "./i18n";

// IDs confirmed in the official LL2 2.3.0 catalogue, 27 October 2026.
const labels = {
  "pt-PT": ["Segundo", "Minuto", "Hora", "Manhã (hora local)", "Tarde (hora local)", "Dia previsto", "Semana prevista (início à segunda-feira, ISO 8601)", "Mês previsto", "1.º trimestre", "2.º trimestre", "3.º trimestre", "4.º trimestre", "1.º semestre", "2.º semestre", "Ano previsto", "Ano fiscal do país de lançamento", "Década prevista"],
  "en-GB": ["Second", "Minute", "Hour", "Morning (local time)", "Afternoon (local time)", "Expected day", "Expected week (starts Monday, ISO 8601)", "Expected month", "First quarter", "Second quarter", "Third quarter", "Fourth quarter", "First half of year", "Second half of year", "Expected year", "Fiscal year of launch country", "Expected decade"],
  "es-ES": ["Segundo", "Minuto", "Hora", "Mañana (hora local)", "Tarde (hora local)", "Día previsto", "Semana prevista (inicio el lunes, ISO 8601)", "Mes previsto", "Primer trimestre", "Segundo trimestre", "Tercer trimestre", "Cuarto trimestre", "Primer semestre", "Segundo semestre", "Año previsto", "Año fiscal del país de lanzamiento", "Década prevista"]
} as const;
export const temporalCopy = {
  "pt-PT": { unknown: "Precisão temporal não confirmada", reference: "Referência do período por confirmar", hour: "Precisão à hora; minutos não confirmados", countdown: "Contagem exata indisponível nesta precisão.", calendar: "É necessária precisão ao segundo para exportar um lembrete exato." },
  "en-GB": { unknown: "Time precision unconfirmed", reference: "Period reference unconfirmed", hour: "Hour precision; minutes unconfirmed", countdown: "Exact countdown unavailable at this precision.", calendar: "Second precision is required to export an exact reminder." },
  "es-ES": { unknown: "Precisión temporal no confirmada", reference: "Referencia del período por confirmar", hour: "Precisión de hora; minutos no confirmados", countdown: "Cuenta atrás exacta no disponible con esta precisión.", calendar: "Se requiere precisión de segundo para exportar un recordatorio exacto." }
} as const;
export function precisionId(precision?: NetPrecision | null): number | null {
  const id = precision?.id;
  return typeof id === "number" && Number.isInteger(id) && id >= 0 && id <= 16 ? id : null;
}
export const exactPrecision = (precision?: NetPrecision | null) => precisionId(precision) === 0;
export const clockPrecision = (precision?: NetPrecision | null) => precisionId(precision) === 0 || precisionId(precision) === 1;
export function precisionNotice(precision: NetPrecision | null | undefined, locale: Locale): string | null {
  const id = precisionId(precision);
  if (id === null) return temporalCopy[locale].unknown;
  if (id >= 3) return temporalCopy[locale].reference;
  if (id === 2) return temporalCopy[locale].hour;
  return null;
}
export function precisionLabel(precision:NetPrecision | null | undefined, locale:Locale):string {
  const id=precisionId(precision);
  return id===null ? temporalCopy[locale].unknown : labels[locale][id];
}
export function formatTemporalDate(date: string, precision: NetPrecision | null | undefined, locale: Locale, zone = "UTC"): string {
  const id = precisionId(precision);
  if (!Number.isFinite(Date.parse(date)) || !/(?:Z|[+-]\d{2}:\d{2})$/.test(date)) return temporalCopy[locale].unknown;
  if (id === null) return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));
  // Broad precision labels deliberately do not extract day/month/year from NET:
  // the provider catalogue does not define the reference calendar/time zone.
  if (id >= 3) return labels[locale][id];
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit",
    ...(id <= 1 ? { minute: "2-digit" as const } : {}),
    ...(id === 0 ? { second: "2-digit" as const } : {}),
    timeZone: id === 2 ? "UTC" : zone, timeZoneName: "short"
  }).format(new Date(date));
}
