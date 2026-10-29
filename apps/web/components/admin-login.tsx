'use client';
import {useRef,useState,type FormEvent} from 'react';
import {useLocale} from './locale-provider';
import {adminCopy} from '../lib/admin-i18n';

export function AdminLogin({enabled,expired=false}:{enabled:boolean;expired?:boolean}){
 const {locale}=useLocale(),t=adminCopy[locale],busy=useRef(false);
 const [pending,setPending]=useState(false),[error,setError]=useState<''|'rate'|'invalid'|'unavailable'>('');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy.current||!enabled)return;const form=e.currentTarget,fields=new FormData(form);busy.current=true;setPending(true);setError('');try{
  const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:fields.get('username'),password:fields.get('password')}),signal:AbortSignal.timeout(40000)});
  if(r.ok){form.reset();window.location.replace('/admin/feedback');return;}
  setError(r.status===429?'rate':r.status===401||r.status===400?'invalid':'unavailable');
  const password=form.elements.namedItem('password') as HTMLInputElement;password.value='';password.focus();
 }catch{setError('unavailable');}finally{busy.current=false;setPending(false);}}
 return <main id="main-content" className="admin-page admin-login"><h1>{t.login}</h1>{expired?<p role="status">{t.expired}</p>:null}{!enabled?<p role="status">{t.unavailable}</p>:null}<form onSubmit={submit} aria-busy={pending}><fieldset disabled={pending||!enabled}><label htmlFor="admin-username">{t.username}</label><input id="admin-username" name="username" autoComplete="username" maxLength={100} required/><label htmlFor="admin-password">{t.password}</label><input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={256} required/><button type="submit">{pending?t.busy:t.enter}</button></fieldset><p role="alert">{error?t[error]:''}</p></form></main>;
}
