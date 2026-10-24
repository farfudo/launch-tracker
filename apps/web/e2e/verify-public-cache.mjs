// Runs only against a loopback fixture and compiled Next.js; no credentials or external API calls.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

let mode = 'ok';
let version = 'Original';
let requests = 0;
const timers = new Set();
const fixture = createServer((req, res) => {
  requests++;
  const action = () => {
    if (res.destroyed) return;
    if (mode === 'fail') { res.writeHead(503).end('Unavailable'); return; }
    if (mode === 'invalid') { res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"broken":true}'); return; }
    const item = { id: 'cache-proof', name: `${version} cache mission`, mission_name: `${version} cache mission`, status: 'Go', net: '2099-01-01T12:00:00Z', agency: 'Fixture agency', vehicle: 'Fixture rocket', source_url: null, source_updated_at: new Date().toISOString(), launch_timezone: 'UTC', mission_description: 'Read-only cache proof', pad_name: null, location_name: null, window_start: null, window_end: null, image_url: null, image_credit: null, image_license: null, image_license_url: null, image_kind: null, image_title: null, streams: [], mission_links: [] };
    const path = new URL(req.url, 'http://127.0.0.1:3311').pathname;
    const value = path.endsWith('data-status') ? { source: 'Local cache proof', cached_launches: 1, last_updated_at: item.source_updated_at, stale: false }
      : path.endsWith('filter-options') ? { agencies: ['Fixture agency'], vehicles: ['Fixture rocket'] }
      : path.endsWith('launches') ? [item] : item;
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(value));
  };
  if (mode === 'slow') {
    const timer = setTimeout(() => { timers.delete(timer); action(); }, 35000);
    timers.add(timer);
  } else action();
});
await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
const fixtureOrigin = `http://127.0.0.1:${fixture.address().port}`;
const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3310'], {
  env: { ...process.env, API_BASE_URL: fixtureOrigin, NEXT_PUBLIC_API_BASE_URL: fixtureOrigin, DESIGN_PREVIEW: 'true', PREVIEW_CACHE_SECONDS: '1', PREVIEW_CACHE_MAX_AGE_SECONDS: '60' },
  stdio: ['ignore', 'pipe', 'pipe']
});
let log = '';
next.stdout.on('data', chunk => { log += chunk; }); next.stderr.on('data', chunk => { log += chunk; });
const results = [];
async function page(label, path, expected, maximum = 5000) {
  const start = performance.now();
  const response = await fetch(`http://127.0.0.1:3310${path}`, { signal: AbortSignal.timeout(maximum) });
  const body = await response.text();
  const ms = Math.round(performance.now() - start);
  assert.equal(response.status, 200, `${label} status`);
  assert.ok(body.includes(expected), `${label} preserved expected mission`);
  results.push({ label, milliseconds: ms, status: response.status });
  console.log(JSON.stringify(results.at(-1)));
  return body;
}
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch('http://127.0.0.1:3310/preview/loading')).ok) break; } catch {}
    await delay(100);
    assert.ok(i < 99, 'Next.js ready');
  }
  await page('warm calendar', '/', 'Original cache mission');
  await page('warm detail', '/launches/cache-proof', 'Original cache mission');
  await delay(1200);
  mode = 'slow';
  await page('calendar with 35-second API delay', '/', 'Original cache mission');
  await page('detail with 35-second API delay', '/launches/cache-proof', 'Original cache mission');
  await delay(21000); // Actual API timeout is 20 seconds. Let rejected revalidations finish.
  mode = 'fail';
  await page('calendar during 503', '/', 'Original cache mission');
  await delay(500);
  await page('detail during 503', '/launches/cache-proof', 'Original cache mission');
  await delay(1200);
  mode = 'invalid';
  await page('calendar with malformed JSON payload', '/', 'Original cache mission');
  await delay(500);
  mode = 'ok'; version = 'Recovered';
  await page('start recovery', '/', 'Original cache mission');
  await delay(1500);
  await page('recovered calendar', '/', 'Recovered cache mission');
  await page('start detail recovery', '/launches/cache-proof', 'Original cache mission');
  await delay(1500);
  await page('recovered detail', '/launches/cache-proof', 'Recovered cache mission');
  await mkdir('test-results/public-cache', { recursive: true });
  await writeFile('test-results/public-cache/results.json', JSON.stringify({ results, requests, previewTTL: 1, previewMaxAge: 60, apiDelay: 35000 }, null, 2));
  console.log('PASS: compiled Next.js cache preserved data through delay, 503 and malformed payload, then recovered.');
} catch (error) {
  console.error(log);
  throw error;
} finally {
  next.kill('SIGTERM');
  for (const timer of timers) clearTimeout(timer);
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
}
