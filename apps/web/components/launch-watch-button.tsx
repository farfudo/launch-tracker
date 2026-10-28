'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {Launch,LaunchDetail} from '../lib/api';
import {useLocale} from './locale-provider';
import {dashboardCopy} from '../lib/dashboard-i18n';
import {MissionStreams} from './mission-streams';
import {Spinner} from './pending-feedback';
export function LaunchWatchButton({launch}:{launch:Launch}){
 const {locale,messages}=useLocale(),d=dashboardCopy[locale];
 const title=useId(),dialog=useRef<HTMLDialogElement>(null),request=useRef<AbortController|null>(null);
 const [detail,setDetail]=useState<LaunchDetail|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(false);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function load(){
  request.current?.abort();const controller=new AbortController();request.current=controller;
  const timeout=setTimeout(()=>controller.abort(),22000);setLoading(true);setError(false);
  try{const response=await fetch(`/api/missions/${encodeURIComponent(launch.id)}`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Unavailable');const value:LaunchDetail=await response.json();if(value.id!==launch.id)throw new Error('Mismatched mission');if(request.current===controller&&!controller.signal.aborted)setDetail(value);}
  catch{if(request.current===controller&&dialog.current?.open)setError(true);}
  finally{clearTimeout(timeout);if(request.current===controller&&dialog.current?.open)setLoading(false);}
 }
 return <><button className="launch-watch-button" type="button" aria-label={`${d.watchHere}: ${launch.name}`} title={d.watchHere} aria-haspopup="dialog" onClick={()=>{dialog.current?.showModal();if(!detail)void load();}}><span aria-hidden="true">▶</span><span className="visually-hidden">{d.watchHere}</span></button>
 <dialog className="launch-watch-dialog" ref={dialog} aria-labelledby={title} onClose={()=>{request.current?.abort();request.current=null;setLoading(false);}}><button className="launch-watch-close" type="button" aria-label={{'pt-PT':'Fechar','en-GB':'Close','es-ES':'Cerrar'}[locale]} onClick={()=>dialog.current?.close()}>×</button><h2 id={title}>{d.watchHere}</h2><p>{launch.name}</p>{loading?<p role="status"><Spinner/> {d.loadingMission}</p>:null}{error?<div role="alert"><p>{d.missionError}</p><button type="button" onClick={()=>void load()}>{messages.retry}</button></div>:null}{detail&&!loading?<MissionStreams launch={detail} inline/>:null}</dialog></>;
}
