"use client";

import {useEffect, useId, useRef, useState, type ReactNode} from "react";

/** Supplementary information, available by pointer, keyboard and touch. */
export function InfoDisclosure({label, children}: {label:string; children:ReactNode}) {
  const id=useId();
  const [open,setOpen]=useState(false);
  const panel=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  function show() {
    clearTimeout(timer.current);
    const element=panel.current, button=trigger.current;
    if (!element || !button) return;
    const rect=button.getBoundingClientRect();
    element.style.left=`${Math.max(12,Math.min(rect.left,window.innerWidth-344))}px`;
    element.style.top=`${Math.max(12,Math.min(rect.bottom+8,window.innerHeight-220))}px`;
    element.showPopover();
  }
  function leave() { timer.current=setTimeout(()=>panel.current?.hidePopover(),200); }
  return <span className="info-disclosure" onPointerEnter={event=>{if(event.pointerType==='mouse')show();}} onPointerLeave={event=>{if(event.pointerType==='mouse')leave();}}>
    <button ref={trigger} type="button" className="info-trigger" aria-label={label} aria-controls={id} aria-expanded={open} aria-haspopup="dialog" onClick={show} onFocus={show}>ⓘ</button>
    <div ref={panel} id={id} popover="auto" role="dialog" aria-label={label} onToggle={event=>setOpen(event.newState==='open')} className="info-panel" onMouseEnter={()=>clearTimeout(timer.current)} onMouseLeave={leave}>{children}</div>
  </span>;
}
