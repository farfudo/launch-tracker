export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-label="NextRocketLaunch">
      <span>Next</span><span className="brand-mark-accent">Rocket</span><span>Launch</span>
    </span>
  );
}
