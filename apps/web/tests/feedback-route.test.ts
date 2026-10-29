import {afterEach,describe,it,expect,vi} from 'vitest';
import {POST} from '../app/api/feedback/route';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
function request(origin='http://127.0.0.1:3345',body='{}'){return new Request('http://localhost:3345/api/feedback',{method:'POST',headers:{Host:'127.0.0.1:3345',Origin:origin,'Content-Type':'application/json','Idempotency-Key':'09e5f3b2-73f4-4b74-a398-24b794fd48ce'},body});}
describe('feedback proxy',()=>{
 it('matches the public Host rather than the internal Next server URL and returns only a receipt',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({received:true,id:'receipt',email:'must-not-leak@example.com'})));const r=await POST(request());expect(r.status).toBe(201);expect(await r.json()).toEqual({received:true,id:'receipt'});expect(r.headers.get('cache-control')).toBe('no-store');});
 it('rejects foreign origins and large bodies before contacting the API',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect((await POST(request('https://foreign.example'))).status).toBe(403);expect((await POST(request(undefined,'x'.repeat(16385)))).status).toBe(413);expect(fetch).not.toHaveBeenCalled();});
 it('never reports success for upstream failures',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('private diagnostic',{status:429})));const r=await POST(request());expect(r.status).toBe(429);expect(await r.text()).not.toContain('private diagnostic');});
});
