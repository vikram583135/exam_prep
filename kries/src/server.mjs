const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const now=()=>Math.floor(Date.now()/1000);
const joined='SELECT a.*,p.content,p.penalty FROM attempts a JOIN papers p ON p.id=a.paper ';
function grade(qs,answers,penalty){
 return qs.reduce((score,q,i)=>score+(answers[i]===undefined?0:answers[i]===q.key?1:-penalty),0);
}
async function finish(db,a){
 const qs=JSON.parse(a.content),answers=JSON.parse(a.answers);
 const score=grade(qs,answers,a.penalty);
 await db.prepare('UPDATE attempts SET ended=?,score=? WHERE id=? AND ended IS NULL AND revision=?').bind(Math.min(now(),a.deadline),score,a.id,a.revision).run();
}
async function getAttempt(db,student,id){
 let a=await db.prepare(joined+'WHERE a.student=? AND a.id=?').bind(student,id).first();
 if(a && a.ended===null && a.deadline<=now()){
  await finish(db,a);a=await db.prepare(joined+'WHERE a.student=? AND a.id=?').bind(student,id).first();
 }
 return a;
}
function payload(a){
 const questions=JSON.parse(a.content).map(({topic,prompt,options,key,explanation,source,eventDate})=>a.ended===null?{topic,prompt,options}:{topic,prompt,options,key,explanation,source,eventDate});
 return {id:a.id,paper:a.paper,questions,started:a.started,deadline:a.deadline,ended:a.ended,score:a.score,penalty:a.penalty,answers:JSON.parse(a.answers),flags:JSON.parse(a.flags),position:a.position,revision:a.revision,serverTime:now()};
}
async function start(db,student){
 const live=await db.prepare('SELECT id FROM attempts WHERE student=? AND exam=? AND ended IS NULL').bind(student,exam.id).first();
 if(live){const a=await getAttempt(db,student,live.id);if(a.ended===null)return a;}
 let paper=await db.prepare('SELECT p.id FROM papers p WHERE p.exam=? AND p.penalty=? AND p.oldest_event>? AND NOT EXISTS (SELECT 1 FROM attempts a WHERE a.student=? AND a.paper=p.id) ORDER BY p.created,p.id LIMIT 1').bind(exam.id,exam.penalty,eventWindow().after,student).first();
 if(!paper){
  const qs=makePaper(),signature='v2|'+qs.map(q=>q.id).sort().join('|');
  const id=crypto.randomUUID();
  await db.prepare('INSERT OR IGNORE INTO papers(id,exam,fingerprint,content,created,oldest_event,penalty) VALUES(?,?,?,?,?,?,?)').bind(id,exam.id,signature,JSON.stringify(qs),now(),qs.filter(q=>q.topic===0).map(q=>q.eventDate).sort()[0],exam.penalty).run();
  paper=await db.prepare('SELECT id FROM papers WHERE fingerprint=?').bind(signature).first();
 }
 const t=now();
 await db.prepare('INSERT OR IGNORE INTO attempts(id,student,exam,paper,started,deadline) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),student,exam.id,paper.id,t,t+exam.minutes*60).run();
 const row=await db.prepare('SELECT id FROM attempts WHERE student=? AND exam=? AND ended IS NULL').bind(student,exam.id).first();
 if(!row)throw Error('Allocation conflict. Please retry.');
 return getAttempt(db,student,row.id);
}
async function handle(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(path==='/' && req.method==='GET')return new Response(pageHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
 if(!path.startsWith('/api/'))return new Response('Page unavailable',{status:404});
 if(req.method!=='GET' && req.headers.get('origin')!==url.origin)return json({error:'Invalid request origin'},403);
 const db=env.DB;
 if(path.startsWith('/api/auth/'))return auth(req,env,path.slice(10));
 const user=await account(req,db);
 const student=user?.id;
 if(!student)return json({error:'Sign in to access your practice history.'},401);
 if(path==='/api/home' && req.method==='GET'){
  const active=await db.prepare('SELECT id FROM attempts WHERE student=? AND ended IS NULL').bind(student).first();
  if(active)await getAttempt(db,student,active.id);
  const h=await db.prepare('SELECT id,started,ended,score FROM attempts WHERE student=? ORDER BY started DESC,rowid DESC LIMIT 100').bind(student).all();
  return json({exam,email:user.email,attempts:h.results});
 }
 if(path==='/api/start' && req.method==='POST')return json(payload(await start(db,student)));
 const match=path.match(/^\/api\/attempt\/([\w-]+)(\/submit)?$/);
 if(!match)return json({error:'Unknown endpoint'},404);
 let a=await getAttempt(db,student,match[1]);
 if(!a)return json({error:'Attempt unavailable'},404);
 if(req.method==='GET'||a.ended!==null)return json(payload(a));
 if(req.method!=='POST')return json({error:'Unsupported method'},405);
 const body=await req.json().catch(()=>null);
 if(!body || !Number.isInteger(body.revision)||body.revision!==a.revision)return json({error:'The attempt changed in another tab. Reload to continue.'},409);
 const {answers,flags,position}=body;
 const validIndex=i=>Number.isInteger(i)&&i>=0&&i<100;
 if(!answers||Array.isArray(answers)||typeof answers!=='object'||!Array.isArray(flags)||!flags.every(validIndex)||!validIndex(position)||!Object.entries(answers).every(([k,v])=>String(Number(k))===k&&validIndex(Number(k))&&Number.isInteger(v)&&v>=0&&v<4))return json({error:'Invalid attempt data'},400);
 const submitting=!!match[2],ts=now();
 const score=submitting?grade(JSON.parse(a.content),answers,a.penalty):null;
 const res=await db.prepare('UPDATE attempts SET answers=?,flags=?,position=?,revision=revision+1,ended=?,score=? WHERE id=? AND ended IS NULL AND revision=? AND deadline>?').bind(JSON.stringify(answers),JSON.stringify([...new Set(flags)]),position,submitting?ts:null,score,a.id,a.revision,ts).run();
 a=await getAttempt(db,student,a.id);
 if(!res.meta.changes&&a.ended===null)return json({error:'Attempt updated in another tab. Reload to continue.'},409);
 return json(a.ended===null?{revision:a.revision}:payload(a));
}
export default {async fetch(req,env){try{return await handle(req,env)}catch(err){console.error(err.message);return json({error:'Could not reach the practice database. Please retry.'},503)}}};
