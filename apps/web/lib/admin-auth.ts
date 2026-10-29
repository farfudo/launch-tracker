import 'server-only';
import {cookies} from 'next/headers';

export function adminSettings(){
 if(process.env.ADMIN_ENABLED!=='true'||(process.env.ADMIN_BFF_SECRET?.length??0)<32)return null;
 try{
  const origin=new URL(process.env.ADMIN_WEB_ORIGIN??'');
  const local=process.env.ADMIN_ALLOW_INSECURE_LOCAL==='true'&&origin.protocol==='http:'&&['127.0.0.1','localhost'].includes(origin.hostname);
  if((origin.protocol!=='https:'&&!local)||origin.username||origin.password||origin.search||origin.hash||!['','/'].includes(origin.pathname))return null;
  const api=new URL(process.env.FEEDBACK_API_BASE_URL??process.env.API_BASE_URL??'');
  const localAPI=local&&api.protocol==='http:'&&['127.0.0.1','localhost'].includes(api.hostname);
  if((api.protocol!=='https:'&&!localAPI)||api.username||api.password||api.search||api.hash||!['','/'].includes(api.pathname))return null;
  return {origin:origin.origin,api:api.origin,gateway:process.env.ADMIN_BFF_SECRET!,secure:!local,cookie:local?'nrl_admin_local':'__Host-nrl_admin'};
 }catch{return null;}
}
export const privateHeaders={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'};
export function denied(status:number){return Response.json({error:'Administrative request unavailable'},{status,headers:privateHeaders});}
export function sameAdminOrigin(request:Request){const config=adminSettings();return !!config&&request.headers.get('origin')===config.origin&&request.headers.get('host')===new URL(config.origin).host;}
export async function adminToken(){const config=adminSettings();if(!config)return '';const token=(await cookies()).get(config.cookie)?.value??'';return /^[A-Za-z0-9_-]{43}$/.test(token)?token:'';}
export async function adminUpstream(path:string,options:{method?:string;body?:string;csrf?:string;token?:string}={}){
 const config=adminSettings();if(!config)return denied(503);
 try{return await fetch(`${config.api}/admin/${path}`,{method:options.method??'GET',headers:{'Content-Type':'application/json','X-Admin-Gateway':config.gateway,...(options.token?{Authorization:`Bearer ${options.token}`} : {}),...(options.csrf?{'X-CSRF-Token':options.csrf}: {})},body:options.body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(30000)});}catch{return denied(503);}
}
export async function authenticatedRequest(path:string,options:{method?:string;body?:string;csrf?:string}={}){const token=await adminToken();if(!token)return denied(adminSettings()?401:503);return adminUpstream(path,{...options,token});}
export async function readAdminSession(){const r=await authenticatedRequest('auth/session');if(!r.ok)return null;try{const s=await r.json();return typeof s.csrf==='string'&&typeof s.expires_at==='string'?{csrf:s.csrf as string,expires_at:s.expires_at as string}:null;}catch{return null;}}
export async function smallJSON(request:Request,max=4096){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('invalid');const reader=request.body?.getReader();if(!reader)throw new Error('invalid');const decoder=new TextDecoder();let body='',length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new Error('invalid');}body+=decoder.decode(value,{stream:true});}return JSON.parse(body+decoder.decode());}
export function upstreamFailure(status:number){return denied([400,401,403,413,422,429,503].includes(status)?status:503);}
export async function clearAdminCookie(){const config=adminSettings();if(config)(await cookies()).set(config.cookie,'',{httpOnly:true,secure:config.secure,sameSite:'strict',path:'/',maxAge:0});}
