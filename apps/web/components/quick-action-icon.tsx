import type { ReactNode } from "react";
export function QuickActionIcon({kind}:{kind:"play"|"star"|"calendar-plus"|"share-2"}) {
 const paths:Record<string,ReactNode>={play:<path d="m8 5 11 7-11 7Z"/>,star:<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,"calendar-plus":<><path d="M8 2v4m8-4v4M3 10h18M12 13v6m-3-3h6"/><rect x="3" y="4" width="18" height="18" rx="2"/></>,"share-2":<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></>};
 return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
