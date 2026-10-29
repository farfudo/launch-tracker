"use client";

import {useEffect, useId, useRef, useState, type ReactNode} from "react";

/** Supplementary information, available by pointer, keyboard and touch. */
export function InfoDisclosure({label, children, symbol="ⓘ"}: {label:string; children:ReactNode; symbol?:ReactNode}) {
  const id=useId();
  const [open,setOpen]=useState(false);
  const wrapper=useRef<HTMLSpanElement>(null);
  const panel=useRef<HTMLSpanElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openedByPointer=useRef(false);
  const restoringFocus=useRef(false);
  const pointerDown=useRef(false);
  const hoverOnly=useRef(false);
  const position=()=>{
    const element=panel.current, button=trigger.current;
    if(!element || !button) return;
    const rect=button.getBoundingClientRect();
    const width=Math.min(332,window.innerWidth-24);
    const height=element.offsetHeight;
    element.style.left=`${Math.max(12,Math.min(rect.left,window.innerWidth-width-12))}px`;
    element.style.top=`${Math.max(12,Math.min(rect.bottom+8,window.innerHeight-height-12))}px`;
  };
  useEffect(()=>{
    if(!open) return;
    position();
    const closeOutside=(event:PointerEvent)=>{if(!wrapper.current?.contains(event.target as Node)) setOpen(false);};
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false); restoringFocus.current=true; trigger.current?.focus(); restoringFocus.current=false;}};
    document.addEventListener('pointerdown',closeOutside);
    document.addEventListener('keydown',key);
    window.addEventListener('resize',position);
    window.addEventListener('scroll',position,true);
    return ()=>{document.removeEventListener('pointerdown',closeOutside); document.removeEventListener('keydown',key); window.removeEventListener('resize',position); window.removeEventListener('scroll',position,true);};
  },[open]);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  function show(){clearTimeout(timer.current); setOpen(true);}
  function leave(){clearTimeout(timer.current); timer.current=setTimeout(()=>{if(!wrapper.current?.contains(document.activeElement)) setOpen(false);},200);}
  return <span ref={wrapper} className="info-disclosure" onPointerEnter={event=>{if(event.pointerType==='mouse'){openedByPointer.current=true; if(!open) hoverOnly.current=true; show();}}} onPointerLeave={event=>{if(event.pointerType==='mouse'){openedByPointer.current=false; leave();}}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)) leave();}}>
    <button ref={trigger} type="button" className="info-trigger" data-info-icon={symbol === "ⓘ" || undefined} aria-label={label} aria-controls={id} aria-expanded={open} aria-haspopup="dialog" onPointerDown={()=>{pointerDown.current=true;}} onPointerCancel={()=>{pointerDown.current=false;}} onClick={()=>{pointerDown.current=false; clearTimeout(timer.current); if(hoverOnly.current){hoverOnly.current=false; setOpen(true);} else setOpen(value=>!value);}} onFocus={()=>{if(!restoringFocus.current && !pointerDown.current)show();}}><span aria-hidden="true">{symbol}</span></button>
    <span ref={panel} id={id} role="dialog" aria-label={label} className="info-panel" hidden={!open} onPointerEnter={()=>clearTimeout(timer.current)} onPointerLeave={leave}>{children}</span>
  </span>;
}
