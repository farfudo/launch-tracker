'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useLocale} from './locale-provider';
import {adminCopy} from '../lib/admin-i18n';
import {FeedbackAdminPanel,type AdminFeedback} from './feedback-admin-panel';
type Session={csrf:string;expires_at:string};
export function FeedbackAdminClient({initialSession}:{initialSession:Session}){
 const {locale}=useLocale(),t=adminCopy[locale],session=useRef(initialSession),expiryTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [items,setItems]=useState<AdminFeedback[]>([]),[pendingCount,setPendingCount]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(false),[logoutPending,setLogoutPending]=useState(false),[refresh,setRefresh]=useState(0);
 const [filters,setFilters]=useState({type:'',status:'',offset:0});
 const expire=useCallback(()=>{setItems([]);void fetch('/api/admin/logout',{method:'POST',headers:{'X-CSRF-Token':session.current.csrf},signal:AbortSignal.timeout(10000)}).catch(()=>null).finally(()=>window.location.replace('/admin/login?expired=1'));},[]);
 const armExpiry=useCallback(()=>{if(expiryTimer.current)clearTimeout(expiryTimer.current);expiryTimer.current=setTimeout(expire,Math.max(0,Math.min(new Date(session.current.expires_at).getTime()-Date.now(),29*60*1000)));},[expire]);
 const reload=useCallback(()=>{setLoading(true);setError('');setRefresh(value=>value+1);},[]);
 useEffect(()=>{
  let active=true;const controller=new AbortController();const query=new URLSearchParams({offset:String(filters.offset)});
  if(filters.type)query.set('type',filters.type);if(filters.status)query.set('status',filters.status);
  fetch(`/api/admin/feedback?${query}`,{cache:'no-store',signal:controller.signal}).then(async response=>{
   if(response.status===401){expire();return null;}if(!response.ok)throw new Error('unavailable');return response.json();
  }).then(data=>{if(active&&data){setItems(data.items);setPendingCount(data.pending);setError('');armExpiry();}})
   .catch(()=>{if(active){setItems([]);setError(t.error);}}).finally(()=>{if(active)setLoading(false);});
  const timeout=setTimeout(()=>controller.abort(),35000);
  return()=>{active=false;controller.abort();clearTimeout(timeout);};
 },[filters,refresh,expire,t.error,armExpiry]);
 useEffect(()=>{
  const hide=()=>setItems([]);
  const show=async(event:PageTransitionEvent)=>{if(!event.persisted)return;const response=await fetch('/api/admin/session',{cache:'no-store'}).catch(()=>null);if(response?.status===401){expire();return;}if(response?.ok){session.current=await response.json();reload();}else setError(t.error);};
  window.addEventListener('pagehide',hide);window.addEventListener('pageshow',show);armExpiry();
  return()=>{window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',show);if(expiryTimer.current)clearTimeout(expiryTimer.current);};
 },[reload,expire,t.error,armExpiry]);
 async function updateStatus(id:string,status:string){
  setNotice(false);const response=await fetch(`/api/admin/feedback/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-Token':session.current.csrf},body:JSON.stringify({status}),signal:AbortSignal.timeout(35000)});
  if(response.status===401){expire();return;}if(!response.ok)throw new Error('unavailable');setNotice(true);reload();
 }
 async function logout(){if(logoutPending)return;setLogoutPending(true);try{const response=await fetch('/api/admin/logout',{method:'POST',headers:{'X-CSRF-Token':session.current.csrf},signal:AbortSignal.timeout(35000)});if(!response.ok&&response.status!==401)throw new Error('unavailable');setItems([]);window.location.replace('/admin/login');}catch{setError(t.unavailable);setLogoutPending(false);}}
 return <main id="main-content" className="admin-page" aria-busy={loading}><div className="admin-toolbar"><p>{t.more}</p><button type="button" onClick={logout} disabled={logoutPending}>{t.logout}</button></div><p role="status">{loading?t.loading:notice?t.saved:''}</p>{error?<div role="alert"><p>{error}</p><button onClick={reload}>{t.retry}</button></div>:null}<FeedbackAdminPanel items={items} pending={pendingCount} onStatus={updateStatus} onFilters={(type,status)=>{setLoading(true);setError('');setFilters({type,status,offset:0});}}/>{!loading&&!error&&!items.length?<p>{t.empty}</p>:null}<nav className="admin-pagination" aria-label={t.more}><button disabled={loading||filters.offset===0} onClick={()=>{setLoading(true);setFilters({...filters,offset:Math.max(0,filters.offset-50)});}}>{t.previous}</button><button disabled={loading||items.length<50} onClick={()=>{setLoading(true);setFilters({...filters,offset:filters.offset+50});}}>{t.next}</button></nav></main>;
}
