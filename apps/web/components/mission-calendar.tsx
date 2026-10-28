"use client";
import { precisionId, precisionLabel } from "../lib/temporal-precision";

import { useSyncExternalStore } from "react";
import type { LaunchDetail } from "../lib/api";
import { calendarEvent, canExportCalendar } from "../lib/calendar";
import { launchTimingStatus } from "../lib/launch";
import { useLocale } from "./locale-provider";

const copy = {
  "en-GB": { title: "Add to calendar", download: "Apple Calendar / Outlook (.ics)", notice: "Reminder based on the available schedule. This is a one-time copy: schedule changes will not update this event. Check the mission before launch.", unavailable: "A usable reference date is required to save the event.", tab: "opens in a new tab" },
  "pt-PT": { title: "Adicionar ao calendário", download: "Apple Calendar / Outlook (.ics)", notice: "Lembrete baseado na previsão disponível. Esta é uma cópia única: alterações de horário não atualizam este evento. Confirma os detalhes antes do lançamento.", unavailable: "É necessária uma data de referência utilizável para guardar o evento.", tab: "abre num novo separador" },
  "es-ES": { title: "Añadir al calendario", download: "Apple Calendar / Outlook (.ics)", notice: "Recordatorio basado en la previsión disponible. Es una copia única: los cambios de horario no actualizan este evento. Consulta la misión antes del lanzamiento.", unavailable: "Se necesita una fecha de referencia utilizable para guardar el evento.", tab: "abre en una pestaña nueva" }
};
const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const serverOrigin = () => "";

export function MissionCalendar({ launch }: { launch: LaunchDetail }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const origin = useSyncExternalStore(subscribe, getOrigin, serverOrigin);
  const precision = precisionId(launch.net_precision);
  const referenceNotice = {"pt-PT":"Evento provisório baseado na referência fornecida. Para precisões amplas, guarda um dia inteiro de referência, não uma data de lançamento confirmada.", "en-GB":"Tentative event based on the supplied reference. Broad precision saves an all-day reference, not a confirmed launch date.", "es-ES":"Evento provisional basado en la referencia facilitada. Con precisión amplia se guarda un día de referencia, no una fecha de lanzamiento confirmada."}[locale];
  const notice = `${precision !== 0 ? referenceNotice + " " : ""}${t.notice} ${precisionLabel(launch.net_precision, locale)}.`;
  const event = origin ? calendarEvent(launch, origin, notice) : null;
  if (!canExportCalendar(launch)) {
    const state=launchTimingStatus(launch.status);
    const finished={"en-GB":"Calendar export is unavailable for completed or cancelled missions.","pt-PT":"A exportação para calendário não está disponível para missões concluídas ou canceladas.","es-ES":"La exportación al calendario no está disponible para misiones finalizadas o canceladas."}[locale];
    const flying={"en-GB":"Calendar export is unavailable while the mission is in flight.","pt-PT":"A exportação para calendário não está disponível enquanto a missão está em voo.","es-ES":"La exportación al calendario no está disponible durante el vuelo."}[locale];
    return <div className="mission-calendar"><button type="button" disabled>{t.title}</button><p>{state === "terminal" ? finished : state === "in-flight" ? flying : t.unavailable}</p></div>;
  }
  return <details className="mission-calendar">
    <summary>{t.title}</summary>
    <p>{notice}</p>
    {event ? <div className="mission-calendar-options">
      <a href={event.google} target="_blank" rel="noopener noreferrer">Google Calendar ↗<span className="visually-hidden"> ({t.tab})</span></a>
      <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(event.ics)}`} download={`mission-${launch.id.replace(/[^a-zA-Z0-9-]/g, "")}.ics`}>{t.download} ↓</a>
    </div> : null}
  </details>;
}
