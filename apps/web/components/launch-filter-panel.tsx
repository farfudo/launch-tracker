'use client';
import {useEffect,useState,type ReactNode} from 'react';
export function LaunchFilterPanel({title,children,active}:{title:string;children:ReactNode;active:boolean}){
 const [open,setOpen]=useState(active);
 useEffect(()=>{const media=window.matchMedia('(min-width: 1001px)');const change=()=>setOpen(media.matches||active);change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[active]);
 return <details className="launch-filter-panel" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>{title}</summary><div className="filter-content">{children}</div></details>;
}
