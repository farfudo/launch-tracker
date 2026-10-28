'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
/** One refresh when the current source NET passes; no polling or provider sync. */
export function SpotlightRollover({date}:{date:string}){
 const router=useRouter();
 useEffect(()=>{
  const target=Date.parse(date);if(!Number.isFinite(target))return;
  let timer:ReturnType<typeof setTimeout>;
  const check=()=>{const remaining=target-Date.now()+1000;if(remaining<=0){router.refresh();return;}timer=setTimeout(check,Math.min(remaining,2147483647));};
  check();return()=>clearTimeout(timer);
 },[date,router]);
 return null;
}
