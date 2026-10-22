// Local, read-only fixture server. Never reads production credentials or calls LL2.
import { createServer } from 'node:http';

const base = {
  status: 'Go for Launch', net: '2099-01-01T12:00:00Z', agency: 'SpaceX', vehicle: 'Falcon 9',
  source_url: 'https://example.com/mission', source_updated_at: '2098-12-31T12:00:00Z',
  launch_timezone: 'America/Los_Angeles', mission_description: 'Controlled mission for browser tests.',
  pad_name: 'Test pad', location_name: 'Test launch site', window_start: '2099-01-01T12:00:00Z',
  window_end: '2099-01-01T13:00:00Z', image_url: null, image_credit: null,
  image_license: null, image_license_url: null, image_kind: null, image_title: null,
  streams: [{ url: 'https://example.com/stream', title: 'Fixture broadcast', publisher: 'Test channel', live: false }],
  mission_links: []
};
const launches = [
  { ...base, id: 'e2e-falcon', name: 'Falcon 9 | Test Starlink', mission_name: 'Test Starlink' },
  { ...base, id: 'e2e-electron', name: 'Electron | Test mission', mission_name: 'Test mission', agency: 'Rocket Lab', vehicle: 'Electron', status: 'To Be Confirmed' }
];

createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3301');
  let result;
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  if (url.pathname === '/health') result = { status: 'ok' };
  else if (url.pathname === '/api/v1/data-status') result = { source: 'E2E fixtures', cached_launches: 2, last_updated_at: base.source_updated_at, stale: false };
  else if (url.pathname === '/api/v1/launches/filter-options') result = { agencies: ['SpaceX', 'Rocket Lab'], vehicles: ['Falcon 9', 'Electron'] };
  else if (url.pathname === '/api/v1/launches') {
    result = launches.filter(l => (!url.searchParams.get('agency') || l.agency === url.searchParams.get('agency'))
      && (!url.searchParams.get('vehicle') || l.vehicle === url.searchParams.get('vehicle'))
      && (!url.searchParams.get('q') || `${l.name} ${l.agency} ${l.vehicle}`.toLowerCase().includes(url.searchParams.get('q').toLowerCase())))
      .slice(0, Number(url.searchParams.get('limit') || 100));
  } else result = launches.find(l => url.pathname === `/api/v1/launches/${l.id}`);
  res.writeHead(result === undefined ? 404 : 200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result ?? { detail: 'Not found' }));
}).listen(3301, '127.0.0.1');
