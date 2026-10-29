"use client";
import {useEffect,useId,useRef,useState} from "react";
import type {Launch,LaunchDetail} from "../lib/api";
import {canExportCalendar} from "../lib/calendar";
import {FavoriteButton} from "./favorites";
import {LaunchWatchButton} from "./launch-watch-button";
import {MissionCalendar} from "./mission-calendar";
import {MissionShare} from "./mission-share";
import {safeMissionLink} from "./mission-streams";
import {QuickActionIcon} from "./quick-action-icon";
import {useLocale} from "./locale-provider";
const copy={"pt-PT":{calendar:"Adicionar ao calendário",close:"Fechar",unavailable:"Calendário indisponível para esta data ou estado"},"en-GB":{calendar:"Add to calendar",close:"Close",unavailable:"Calendar unavailable for this date or status"},"es-ES":{calendar:"Añadir al calendario",close:"Cerrar",unavailable:"Calendario no disponible para esta fecha o estado"}};
export function LaunchQuickActions({launch,showWatch}:{launch:Launch;showWatch:boolean}){
 const {locale}=useLocale(),t=copy[locale],title=useId();
 const root=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const [detail,setDetail]=useState<LaunchDetail|null>(null);
 useEffect(()=>{
  if(!showWatch||!root.current)return;
  const controller=new AbortController();let timeout:ReturnType<typeof setTimeout>;
  const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();timeout=setTimeout(()=>controller.abort(),22000);
   void fetch(`/api/missions/${encodeURIComponent(launch.id)}`,{signal:controller.signal}).then(async response=>{if(!response.ok)return;const value:LaunchDetail=await response.json();if(value.id===launch.id&&!controller.signal.aborted)setDetail(value);}).catch(()=>{}).finally(()=>clearTimeout(timeout));
  });observer.observe(root.current);
  return()=>{observer.disconnect();controller.abort();clearTimeout(timeout);};
 },[launch.id,showWatch]);
 const calendarLaunch:LaunchDetail=detail??{...launch,mission_name:null,mission_description:null,pad_name:null,location_name:null,window_start:null,window_end:null,image_url:launch.image_url??null,image_credit:launch.image_credit??null,image_license:launch.image_license??null,image_license_url:launch.image_license_url??null,image_kind:launch.image_kind??null,image_title:launch.image_title??null};
 const available=canExportCalendar(calendarLaunch);
 return <div ref={root} className="launch-row-buttons launch-quick-actions" onClick={event=>event.stopPropagation()}>
  {showWatch&&detail?.streams?.some(link=>safeMissionLink(link))?<LaunchWatchButton launch={launch} initialDetail={detail}/>:null}
  <FavoriteButton id={launch.id} name={launch.name} iconOnly/>
  <button type="button" className="quick-action" aria-label={`${available?t.calendar:t.unavailable}: ${launch.name}`} title={available?t.calendar:t.unavailable} aria-disabled={!available} aria-haspopup="dialog" onClick={()=>{if(available)dialog.current?.showModal();}}><QuickActionIcon kind="calendar-plus"/></button>
  <MissionShare id={launch.id} name={launch.name} iconOnly/>
  <dialog ref={dialog} className="launch-watch-dialog" aria-labelledby={title}><button type="button" className="launch-watch-close" aria-label={t.close} onClick={()=>dialog.current?.close()}>×</button><h2 id={title}>{t.calendar}</h2><p>{launch.name}</p><MissionCalendar launch={calendarLaunch}/></dialog>
 </div>;
}
