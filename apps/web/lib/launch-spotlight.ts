import type {Launch} from './api';
import {launchTimingStatus} from './launch';
export function nextSpotlightLaunch(launches:Launch[],now=Date.now()):Launch|null{
 return launches.filter(launch=>Number.isFinite(Date.parse(launch.net)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(launch.net) && Date.parse(launch.net)>now && !['terminal','in-flight','held'].includes(launchTimingStatus(launch.status))).sort((a,b)=>Date.parse(a.net)-Date.parse(b.net))[0]??null;
}
