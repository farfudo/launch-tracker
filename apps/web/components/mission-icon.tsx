export type MissionIconName = "agency" | "rocket" | "status" | "location" | "pad" | "clock" | "orbit";

export function MissionIcon({ name }: { name: MissionIconName }) {
  const paths: Record<MissionIconName, React.ReactNode> = {
    agency: <><path d="m3 10 9-6 9 6M5 10h14M5 20h14M7 10v10m5-10v10m5-10v10" /></>,
    rocket: <><path d="M13 4c3-2 6-1 7-1 0 1 1 4-1 7l-7 7-5-5 6-8Z" /><circle cx="15" cy="8" r="2" /><path d="m8 11-4 1-1 5 5-1m5 0-1 5 5-1 1-4M4 20l3-3" /></>,
    status: <><circle cx="12" cy="12" r="8" /><path d="m8 12 3 3 5-6" /></>,
    location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    pad: <><path d="M3 21h18M5 21V9h4v12m-4-8h4m-4 4h4m0-8 5-5m-5 9 5-5m0-5v12m-2 0h4m1 6v-6h3v6" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
    orbit: <><circle cx="12" cy="12" r="4" /><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-35 12 12)" /><circle cx="20" cy="6" r="1" /></>
  };
  return <svg className="mission-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
