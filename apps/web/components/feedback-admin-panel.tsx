'use client';
import {useState} from 'react';
import {useLocale} from './locale-provider';
import {feedbackCopy} from '../lib/feedback-i18n';
export type AdminFeedback={id:string;type:string;message:string;name:string|null;email:string|null;status:string;created_at:string};
const labels={
 'en-GB':{title:'Feedback',all:'All',status:'Status',pending:'new',error:'Could not update feedback.',new:'New',reviewed:'Reviewed',planned:'Planned',resolved:'Resolved'},
 'pt-PT':{title:'Feedback',all:'Todos',status:'Estado',pending:'novos',error:'Não foi possível atualizar o feedback.',new:'Novo',reviewed:'Revisto',planned:'Planeado',resolved:'Resolvido'},
 'es-ES':{title:'Feedback',all:'Todos',status:'Estado',pending:'nuevos',error:'No se pudo actualizar el feedback.',new:'Nuevo',reviewed:'Revisado',planned:'Planificado',resolved:'Resuelto'}
};
// Rendered only inside the server-authenticated administration page.
export function FeedbackAdminPanel({items,pending,onStatus,onFilters}:{items:AdminFeedback[];pending:number;onStatus:(id:string,status:string)=>Promise<void>;onFilters?:(type:string,status:string)=>void}){
 const {locale}=useLocale(),t=labels[locale],f=feedbackCopy[locale];
 const states=['new','reviewed','planned','resolved'] as const,types=['suggestion','bug','opinion'] as const;
 const [type,setType]=useState(''),[status,setStatus]=useState(''),[saving,setSaving]=useState(''),[error,setError]=useState(false);
 const shown=items.filter(item=>(!type||item.type===type)&&(!status||item.status===status)).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return <section className="feedback-panel"><h1>{t.title} · {pending} {t.pending}</h1><label>{f.type}<select value={type} onChange={e=>{setType(e.target.value);onFilters?.(e.target.value,status);}}><option value="">{t.all}</option>{types.map(x=><option key={x} value={x}>{f[x]}</option>)}</select></label><label>{t.status}<select value={status} onChange={e=>{setStatus(e.target.value);onFilters?.(type,e.target.value);}}><option value="">{t.all}</option>{states.map(x=><option key={x} value={x}>{t[x]}</option>)}</select></label><p role="alert">{error?t.error:''}</p>{shown.map(item=><article key={item.id}><h2>{f[item.type as typeof types[number]]}</h2><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(locale)}</time><p style={{whiteSpace:'pre-wrap'}}>{item.message}</p>{item.name?<p>{item.name}</p>:null}{item.email?<p>{item.email}</p>:null}<label>{t.status}<select value={item.status} disabled={saving===item.id} onChange={async e=>{setSaving(item.id);setError(false);try{await onStatus(item.id,e.target.value);}catch{setError(true);}finally{setSaving('');}}}>{states.map(x=><option key={x} value={x}>{t[x]}</option>)}</select></label></article>)}</section>;
}
