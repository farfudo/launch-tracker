"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollHeader({children}:{children:React.ReactNode}) {
  const header = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    let lastY = Math.max(0,window.scrollY);
    let direction = 0;
    let distance = 0;
    let frame = 0;
    let keyboard = false;
    element.dataset.hidden = "false";
    element.dataset.keyboard = "false";
    const onPointer = () => {keyboard = false; element.dataset.keyboard = "false";};
    const onKey = () => {keyboard = true; element.dataset.keyboard = "true"; if (element.contains(document.activeElement)) element.dataset.hidden = "false";};
    const measure = () => document.documentElement.style.setProperty("--site-header-height",`${element.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const update = () => {
      frame = 0;
      const y = Math.max(0,window.scrollY);
      const delta = y-lastY;
      lastY = y;
      element.dataset.elevated = String(y>12);
      if (y<=12 || (keyboard && element.contains(document.activeElement))) {
        element.dataset.hidden = "false";
        direction = 0; distance = 0;
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance+Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      // Ignore tiny trackpad/touch reversals so the header does not flicker.
      if (distance>=10) element.dataset.hidden = String(direction>0);
    };
    const onScroll = () => {if (!frame) frame = requestAnimationFrame(update);};
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("pointerdown",onPointer,true);
    window.addEventListener("wheel",onPointer,{passive:true});
    window.addEventListener("keydown",onKey,true);
    return () => {window.removeEventListener("scroll",onScroll); window.removeEventListener("pointerdown",onPointer,true); window.removeEventListener("wheel",onPointer); window.removeEventListener("keydown",onKey,true); cancelAnimationFrame(frame); observer.disconnect();};
  },[pathname]);
  return <div ref={header} className="site-toolbar scroll-header" role="banner" data-hidden="false" onFocusCapture={() => {if(header.current) header.current.dataset.hidden="false";}}>{children}</div>;
}
