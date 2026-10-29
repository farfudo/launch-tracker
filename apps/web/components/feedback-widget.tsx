'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useLocale} from './locale-provider';
import {usePathname} from 'next/navigation';
import {feedbackCopy} from '../lib/feedback-i18n';

export function FeedbackWidget({controller,contact}:{controller?:string;contact?:string}){
 const pathname=usePathname();
 const {locale}=useLocale(),t=feedbackCopy[locale];
 const dialog=useRef<HTMLDialogElement>(null), busy=useRef(false), attempt=useRef({body:'',key:''});
 const [message,setMessage]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState('');
 useEffect(()=>{const open=()=>dialog.current?.showModal();window.addEventListener('feedback:open',open);return()=>window.removeEventListener('feedback:open',open);},[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy.current)return;
  const form=event.currentTarget,fields=new FormData(form);
  if(message.trim().length<10||message.length>2000||!form.checkValidity()){setError(t.invalid);return;}
  const body=JSON.stringify({type:fields.get('type'),message:message.trim(),name:fields.get('name')||null,email:fields.get('email')||null,website:fields.get('website')||''});
  if(attempt.current.body!==body)attempt.current={body,key:crypto.randomUUID()};
  busy.current=true;setPending(true);setError('');
  try{
   const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':attempt.current.key},body,signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error(response.status===429?'rate':'network');
   const result=await response.json();if(result.received!==true||typeof result.id!=='string')throw new Error('network');
   setReceipt(result.id);setMessage('');form.reset();attempt.current={body:'',key:''};
  }catch(reason){setError(reason instanceof Error&&reason.message==='rate'?t.limit:t.error);}finally{busy.current=false;setPending(false);}
 }
 if(pathname.startsWith('/admin'))return null;
 return <>
  <dialog ref={dialog} className="feedback-dialog" aria-labelledby="feedback-title" aria-describedby="feedback-intro" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
   <div className="feedback-panel"><button className="feedback-close" type="button" aria-label={t.close} onClick={()=>dialog.current?.close()}>×</button><h2 id="feedback-title">{t.title}</h2><p id="feedback-intro">{t.intro}</p>
   {receipt?<div role="status" className="feedback-success"><p>{t.success}</p><p>{t.receipt}: <code>{receipt}</code></p><button type="button" onClick={()=>setReceipt('')}>{t.more}</button></div>:<form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending}>
    <label>{t.type}<select name="type" required defaultValue=""><option value="" disabled>{t.choose}</option><option value="suggestion">{t.suggestion}</option><option value="bug">{t.bug}</option><option value="opinion">{t.opinion}</option></select></label>
    <label htmlFor="feedback-message">{t.message}</label><textarea id="feedback-message" name="message" value={message} onChange={e=>setMessage(e.target.value)} required minLength={10} maxLength={2000} rows={5} aria-describedby="feedback-count feedback-privacy"/><small id="feedback-count">{message.length} / 2000</small>
    <div className="feedback-contact"><label>{t.name}<input name="name" maxLength={100} autoComplete="name"/></label><label>{t.email}<input name="email" type="email" maxLength={254} autoComplete="email"/></label></div>
    <div className="feedback-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <p id="feedback-privacy" className="feedback-privacy">{t.privacy}{controller&&contact?<><br/>{controller} · {contact}</>:null}</p><p role="alert">{error}</p><button className="feedback-send" type="submit" disabled={pending}>{pending?t.sending:t.send}</button>
   </fieldset></form>}</div>
  </dialog>
 </>;
}

export function FeedbackLink({placement='footer'}:{placement?:'header'|'footer'}){const {locale}=useLocale();const pathname=usePathname();if(pathname.startsWith('/admin'))return null;return <button type="button" className={placement==='header'?'feedback-header-link':'feedback-footer-link'} aria-haspopup="dialog" onClick={()=>window.dispatchEvent(new Event('feedback:open'))}>{placement==='header'?<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M7 8h9M7 12h6"/></svg>:null}{feedbackCopy[locale].open}</button>;}
