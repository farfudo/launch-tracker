"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MissionIcon } from "./mission-icon";

export function LaunchResultsScroll({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const element = viewport.current!;
    const update = () => {
      const range = element.scrollHeight - element.clientHeight;
      setProgress(range > 0 ? Math.max(0, Math.min(1, element.scrollTop / range)) : 0);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (content.current) observer.observe(content.current);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, []);
  return <div className="launch-results-shell">
    <div ref={viewport} className="launch-results-scroll" role="region" aria-labelledby="next-launch-heading" tabIndex={0}>
      <div ref={content}>{children}</div>
    </div>
    <div className="launch-scroll-rail" aria-hidden="true"><span className="launch-scroll-rocket" style={{ top: `${progress * 100}%`, transform: `translateY(-${progress * 100}%)` }}><MissionIcon name="rocket" /></span></div>
  </div>;
}
