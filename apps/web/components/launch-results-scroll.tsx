"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function LaunchResultsScroll({ children }: { children: ReactNode }) {
  const region = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = region.current;
    if (!element) return;
    const continueAtBoundary = (event: WheelEvent) => {
      if (!window.matchMedia('(min-width: 801px)').matches || event.ctrlKey || !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const atStart = element.scrollTop <= 1;
      const atEnd = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) {
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        window.scrollBy({ top: event.deltaY * unit, behavior: 'instant' });
      }
    };
    element.addEventListener('wheel', continueAtBoundary, { passive: false });
    return () => element.removeEventListener('wheel', continueAtBoundary);
  }, []);
  return <div className="launch-results-shell">
    <div ref={region} className="launch-results-scroll" role="region" aria-labelledby="next-launch-heading" tabIndex={0}>
      {children}
    </div>
  </div>;
}
