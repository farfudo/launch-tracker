export async function POST(request: Request) {
 const headers={'Cache-Control':'no-store'};
 const fail=(status:number)=>Response.json({error:'Feedback unavailable'},{status,headers});
 try { const origin=new URL(request.headers.get('origin')??''); if(!['https:','http:'].includes(origin.protocol)||origin.host!==request.headers.get('host'))return fail(403); } catch {return fail(403);}
 if(!request.headers.get('content-type')?.startsWith('application/json'))return fail(415);
 const reader=request.body?.getReader();if(!reader)return fail(400);
 let size=0;const chunks:Uint8Array[]=[];
 try{
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return fail(413);}chunks.push(value);}
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
  const api=process.env.FEEDBACK_API_BASE_URL??process.env.API_BASE_URL??'http://127.0.0.1:8000';
  const response=await fetch(`${api.replace(/\/$/,'')}/feedback`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':request.headers.get('idempotency-key')??''},body,cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)return fail([409,413,422,429,503].includes(response.status)?response.status:502);
  const result=await response.json();if(result.received!==true||typeof result.id!=='string')return fail(502);
  return Response.json({received:true,id:result.id},{status:201,headers});
 }catch{return fail(503);}
}
