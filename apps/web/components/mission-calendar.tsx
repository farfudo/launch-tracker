"use client";
import { exactPrecision, temporalCopy } from "../lib/temporal-precision";

import { useSyncExternalStore } from "react";
import type { LaunchDetail } from "../lib/api";
import { calendarEvent, canExportCalendar } from "../lib/calendar";
import { launchTimingStatus } from "../lib/launch";
import { useLocale } from "./locale-provider";

const copy = {
  "en-GB": { title: "Add to calendar", download: "Apple Calendar / Outlook (.ics)", notice: "Estimated launch time only, not the mission duration. This is a one-time copy: schedule changes will not update this event. Check the mission before launch.", unavailable: "Calendar export is available only for Go missions with a valid launch window containing the scheduled time.", tab: "opens in a new tab" },
  "pt-PT": { title: "Adicionar ao calendário", download: "Apple Calendar / Outlook (.ics)", notice: "Apenas a hora prevista, não a duração da missão. Esta é uma cópia única: alterações de horário não atualizam este evento. Confirma os detalhes antes do lançamento.", unavailable: "Disponível apenas para missões Go com uma janela válida que inclua a hora prevista.", tab: "abre num novo separador" },
  "es-ES": { title: "Añadir al calendario", download: "Apple Calendar / Outlook (.ics)", notice: "Solo la hora prevista, no la duración de la misión. Es una copia única: los cambios de horario no actualizan este evento. Consulta la misión antes del lanzamiento.", unavailable: "Disponible solo para misiones Go con una ventana válida que incluya la hora prevista.", tab: "abre en una pestaña nueva" }
};
const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const serverOrigin = () => "";

export function MissionCalendar({ launch }: { launch: LaunchDetail }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const origin = useSyncExternalStore(subscribe, getOrigin, serverOrigin);
  const event = origin ? calendarEvent(launch, origin, t.notice) : null;
  if (!canExportCalendar(launch)) {
    const state=launchTimingStatus(launch.status);
    const finished={"en-GB":"Calendar export is unavailable for completed or cancelled missions.","pt-PT":"A exportação para calendário não está disponível para missões concluídas ou canceladas.","es-ES":"La exportación al calendario no está disponible para misiones finalizadas o canceladas."}[locale];
    const flying={"en-GB":"Calendar export is unavailable while the mission is in flight.","pt-PT":"A exportação para calendário não está disponível enquanto a missão está em voo.","es-ES":"La exportación al calendario no está disponible durante el vuelo."}[locale];
    return <div className="mission-calendar"><button type="button" disabled>{t.title}</button><p>{state === "terminal" ? finished : state === "in-flight" ? flying : !exactPrecision(launch.net_precision) ? temporalCopy[locale].calendar : t.unavailable}</p></div>;
  }
  return <details className="mission-calendar">
    <summary>{t.title}</summary>
    <p>{t.notice}</p>
    {event ? <div className="mission-calendar-options">
      <a href={event.google} target="_blank" rel="noopener noreferrer">Google Calendar ↗<span className="visually-hidden"> ({t.tab})</span></a>
      <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(event.ics)}`} download={`mission-${launch.id.replace(/[^a-zA-Z0-9-]/g, "")}.ics`}>{t.download} ↓</a>
    </div> : null}
  </details>;
}
