// Isolated read-only fixtures: no database, LL2 or production credentials.
import {createServer} from 'node:http';
const base={id:'fixture-starship',name:'Fixture Starship flight',status:'Go for Launch',net:'2099-01-01T12:00:00Z',agency:'SpaceX',vehicle:'Starship / Super Heavy',source_url:null,source_updated_at:'2026-10-28T12:00:00Z',launch_timezone:'UTC'};
for(const [port,mode] of [[3341,'match'],[3342,'empty'],[3343,'error']]) {
 createServer((req,res)=>{
  const path=new URL(req.url,`http://127.0.0.1:${port}`).pathname;
  res.setHeader('Content-Type','application/json');
  if(path==='/health') return res.end(JSON.stringify({status:'ok'}));
  if(mode==='error') {res.statusCode=503; return res.end(JSON.stringify({detail:'Simulated local outage'}));}
  const unrelated={...base,id:'fixture-falcon',name:'Starship payload on another vehicle',vehicle:'Falcon 9'};
  res.end(JSON.stringify(mode==='match'?[unrelated,base]:[unrelated]));
 }).listen(port,'127.0.0.1');
}
