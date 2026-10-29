import {cookies} from 'next/headers';
import {adminSettings,adminUpstream,denied,privateHeaders,sameAdminOrigin,smallJSON,upstreamFailure} from '../../../../lib/admin-auth';
export async function POST(request:Request){
 const config=adminSettings();if(!config)return denied(503);if(!sameAdminOrigin(request))return denied(403);
 let data;try{data=await smallJSON(request);}catch{return denied(400);}
 const r=await adminUpstream('auth/login',{method:'POST',body:JSON.stringify(data)});if(!r.ok)return upstreamFailure(r.status);
 try{const result=await r.json();const expiry=new Date(result.expires_at);if(!/^[A-Za-z0-9_-]{43}$/.test(result.token)||!Number.isFinite(expiry.getTime())||expiry.getTime()<=Date.now())return denied(503);
  (await cookies()).set(config.cookie,result.token,{httpOnly:true,secure:config.secure,sameSite:'strict',path:'/',maxAge:Math.min(7200,Math.floor((expiry.getTime()-Date.now())/1000))});
  return Response.json({authenticated:true},{headers:privateHeaders});
 }catch{return denied(503);}
}
