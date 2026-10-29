import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const jar=vi.hoisted(()=>({get:vi.fn(),set:vi.fn()}));
vi.mock('next/headers',()=>({cookies:async()=>jar}));
import {adminSettings,authenticatedRequest} from '../lib/admin-auth';
import {POST as login} from '../app/api/admin/login/route';
import {PATCH} from '../app/api/admin/feedback/[id]/route';
import {POST as logout} from '../app/api/admin/logout/route';
const gateway='unit-test-gateway-'.repeat(3),token='a'.repeat(43),csrf='b'.repeat(64);
function req(path:string,origin='https://admin.example',body?:object){return new Request(`http://localhost:3000${path}`,{method:'POST',headers:{Host:'admin.example',Origin:origin,'Content-Type':'application/json','X-CSRF-Token':csrf},body:body?JSON.stringify(body):undefined});}
beforeEach(()=>{vi.stubEnv('ADMIN_ENABLED','true');vi.stubEnv('ADMIN_WEB_ORIGIN','https://admin.example');vi.stubEnv('ADMIN_BFF_SECRET',gateway);vi.stubEnv('API_BASE_URL','https://api.example');jar.get.mockReset();jar.set.mockReset();});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('server-only administrative boundary',()=>{
 it('sets a secure HttpOnly host cookie without returning credentials or session tokens',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({token,csrf,expires_at:new Date(Date.now()+7200000).toISOString()})));const r=await login(req('/api/admin/login',undefined,{username:'admin',password:'test-password'}));expect(r.status).toBe(200);expect(await r.json()).toEqual({authenticated:true});expect(jar.set).toHaveBeenCalledWith('__Host-nrl_admin',token,expect.objectContaining({httpOnly:true,secure:true,sameSite:'strict',path:'/'}));});
 it('rejects foreign origins before relaying passwords and refuses token-free API access',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect((await login(req('/api/admin/login','https://foreign.example',{}))).status).toBe(403);expect((await authenticatedRequest('feedback')).status).toBe(401);expect(fetch).not.toHaveBeenCalled();});
 it('uses the server gateway and cookie bearer, without accepting incoming authorization',async()=>{jar.get.mockReturnValue({value:token});const fetch=vi.fn().mockResolvedValue(new Response(null,{status:401}));vi.stubGlobal('fetch',fetch);expect((await authenticatedRequest('feedback')).status).toBe(401);expect(fetch).toHaveBeenCalledWith('https://api.example/admin/feedback',expect.objectContaining({headers:expect.objectContaining({'X-Admin-Gateway':gateway,Authorization:`Bearer ${token}`}),cache:'no-store',redirect:'error'}));});
 it('protects mutations with origin and clears only the admin cookie on logout',async()=>{jar.get.mockReturnValue({value:token});const fetch=vi.fn().mockResolvedValue(new Response(null,{status:204}));vi.stubGlobal('fetch',fetch);expect((await PATCH(req('/api/admin/feedback/id','https://foreign.example',{}),{params:Promise.resolve({id:'a'.repeat(36)})})).status).toBe(403);expect(fetch).not.toHaveBeenCalled();expect((await logout(req('/api/admin/logout'))).status).toBe(204);expect(jar.set).toHaveBeenCalledWith('__Host-nrl_admin','',expect.objectContaining({maxAge:0,httpOnly:true,secure:true,path:'/'}));});
 it('fails closed on insecure public origins and allows only explicit loopback previews',()=>{vi.stubEnv('ADMIN_WEB_ORIGIN','http://admin.example');expect(adminSettings()).toBeNull();vi.stubEnv('ADMIN_ALLOW_INSECURE_LOCAL','true');expect(adminSettings()).toBeNull();vi.stubEnv('ADMIN_WEB_ORIGIN','http://127.0.0.1:3345');vi.stubEnv('API_BASE_URL','http://127.0.0.1:3307');expect(adminSettings()).toMatchObject({secure:false,cookie:'nrl_admin_local'});});
});
