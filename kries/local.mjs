import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import worker from './dist/server/index.js';

mkdirSync('.practice',{recursive:true});
const db=new DatabaseSync(process.env.KRIES_DB||'.practice/portal.sqlite');
if(!db.prepare("SELECT 1 FROM sqlite_master WHERE name='attempts'").get())db.exec(readFileSync('drizzle/0000_mock.sql','utf8'));
if(!db.prepare("SELECT 1 FROM sqlite_master WHERE name='students'").get()){
 db.exec('BEGIN');
 try{db.exec(readFileSync('drizzle/0001_accounts.sql','utf8'));db.exec('COMMIT')}catch(err){db.exec('ROLLBACK');throw err}
}
const DB={prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {
 first:async()=>stmt.get(...values),all:async()=>({results:stmt.all(...values)}),
 run:async()=>({meta:{changes:stmt.run(...values).changes}})
}}}}};
const server=http.createServer(async(req,res)=>{
 try{
 const origin='http://'+req.headers.host,headers=new Headers();
 for(const k of ['origin','content-type','cookie'])if(req.headers[k])headers.set(k,req.headers[k]);
 const existing=(req.headers.cookie||'').match(/(?:^|; )kries_local=([0-9a-f-]{36})(?:;|$)/);
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const response=await worker.fetch(new Request(origin+req.url,{method:req.method,headers,body:chunks.length?Buffer.concat(chunks):undefined}),{DB,legacyStudent:existing?.[1]});
 const outgoing=Object.fromEntries(response.headers);
 if(existing&&req.url==='/api/auth/signup'&&response.ok)outgoing['set-cookie']=[response.headers.get('set-cookie'),'kries_local=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'];
 res.writeHead(response.status,outgoing);res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Local server error')}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('KRIES practice desk at http://127.0.0.1:'+server.address().port));
