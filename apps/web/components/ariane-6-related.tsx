import Link from 'next/link';
import {getCachedLaunches} from '../lib/cached-api';
import {arianeCopy,isAriane6} from '../lib/ariane-6';
import type {Locale} from '../lib/i18n';
export async function Ariane6Related({locale}:{locale:Locale}){
 const t=arianeCopy[locale];
 const results=await Promise.allSettled(['upcoming','past'].map(period=>getCachedLaunches(100,{period:period as 'upcoming'|'past'})));
 const seen=new Set<string>();
 const matches=results.flatMap(result=>result.status==='fulfilled'?result.value.value:[]).filter(launch=>{if(!isAriane6(launch.vehicle)||seen.has(launch.id))return false;seen.add(launch.id);return true;}).slice(0,4);
 if(!matches.length)return <p role="status">{results.some(r=>r.status==='rejected')?t.error:t.empty}</p>;
 return <><div className="guide-role-grid">{matches.map(launch=><article key={launch.id}><h3><Link href={`/launches/${encodeURIComponent(launch.id)}`}>{launch.name} →</Link></h3><p>{launch.agency} · {launch.vehicle}</p></article>)}</div>{results.some(r=>r.status==='rejected')?<p role="status">{t.error}</p>:null}</>;
}
