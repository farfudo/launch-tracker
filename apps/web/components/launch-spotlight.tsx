import Link from 'next/link';
import type {Launch} from '../lib/api';
import type {Locale} from '../lib/i18n';
import {dashboardCopy} from '../lib/dashboard-i18n';
import {launchControlCopy} from '../lib/launch-control-copy';
import {precisionId,precisionLabel} from '../lib/temporal-precision';
import {launchTimingStatus} from '../lib/launch';
import {VehicleVisual} from './vehicle-visual';
import {LocalLaunchDate} from './local-launch-date';
import {Countdown} from './countdown';
import {InfoDisclosure} from './info-disclosure';
import {SpotlightRollover} from './spotlight-rollover';
import {LinkPending} from './pending-feedback';
export function LaunchSpotlight({launch,locale}:{launch:Launch|null;locale:Locale}){
 const t=launchControlCopy[locale],d=dashboardCopy[locale];
 const uncertain=launch && (precisionId(launch.net_precision)!==0||launchTimingStatus(launch.status)!=='scheduled');
 return <section className="dashboard-hero launch-spotlight" aria-labelledby="hero-title">
 {launch?<VehicleVisual key={launch.id} launch={launch}/>:null}
 <div className="spotlight-copy"><p className="eyebrow">{d.nextLaunch}</p><h1 id="hero-title">{launch?.vehicle || launch?.name || t.empty}</h1>{launch?<><SpotlightRollover date={launch.net}/><h2>{launch.name}</h2><Countdown date={launch.net} precision={launch.net_precision} status={launch.status} respectPrecision/><div className="spotlight-date"><LocalLaunchDate date={launch.net} precision={launch.net_precision} status={launch.status} showNotice={false} precisionSafe/>{uncertain?<InfoDisclosure label={t.uncertainty} symbol="▲">{t.notice} {precisionLabel(launch.net_precision,locale)}.</InfoDisclosure>:null}</div><Link className="pill-button spotlight-details" href={`/launches/${encodeURIComponent(launch.id)}`}>{t.view} →<LinkPending/></Link></>:<p>{t.emptyBody}</p>}</div>
 </section>;
}
