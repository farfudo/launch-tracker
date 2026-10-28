import Link from 'next/link';
import {getCachedLaunches} from '../lib/cached-api';
import {crewCopy,isCommercialCrewMission} from '../lib/commercial-crew';
import type {Locale} from '../lib/i18n';
import type {Launch} from '../lib/api';

export async function CommercialCrewRelated({locale}:{locale:Locale}){
 const t=crewCopy[locale];
 let value:Launch[];
 try { value=(await getCachedLaunches(100,{period:'upcoming'})).value; }
 catch {return <p role="status">{t.error}</p>;}
 const matches=value.filter(launch=>isCommercialCrewMission(launch.name)).slice(0,3);
 if(!matches.length) return <p role="status">{t.empty}</p>;
 return <div className="guide-role-grid">{matches.map(launch=><article key={launch.id}><h3><Link href={`/launches/${encodeURIComponent(launch.id)}`}>{launch.name} →</Link></h3><p>{launch.agency} · {launch.vehicle}</p></article>)}</div>;
}
