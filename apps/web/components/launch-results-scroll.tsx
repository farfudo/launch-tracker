import type { ReactNode } from "react";

export function LaunchResultsScroll({ children }: { children: ReactNode }) {
  return <div className="launch-results-shell">
    <div className="launch-results-scroll" role="region" aria-labelledby="next-launch-heading" tabIndex={0}>
      {children}
    </div>
  </div>;
}
