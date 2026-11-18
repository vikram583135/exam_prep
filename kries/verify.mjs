import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from './dist/server/index.js';
// Exercise the dated example bank at its release date, including after it expires in production.
Date.now=()=>Date.parse('2026-11-18T09:00:00Z');
const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0000_mock.sql','utf8'));
db.exec(readFileSync('drizzle/0001_accounts.sql','utf8'));
const cookies=new Map();
const DB={prepare(sql){return {bind(...args){const s=db.prepare(sql);return {first:async()=>s.get(...args),all:async()=>({results:s.all(...args)}),run:async()=>({meta:s.run(...args)})}}}}};
async function request(name,path,body,expected=200){
 const req=new Request('https://test.invalid/api/'+path,{method:body?'POST':'GET',headers:{origin:'https://test.invalid',cookie:cookies.get(name)||'', 'oai-authenticated-user-id':name},body:body?JSON.stringify(body):undefined});
 const response=await worker.fetch(req,{DB}),data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));const session=response.headers.get('set-cookie');if(session)cookies.set(name,session.split(';')[0]);return data;
}
await request('anonymous','home',undefined,401);
const first={email:'Student@Example.test',password:'sample-test-only-42'};
await request('one','auth/signup',first);
await request('two','auth/signup',{...first,email:'other@example.test'});
const old=cookies.get('one');await request('one','auth/logout',{});
cookies.set('one',old);await request('one','home',undefined,401);
await request('one','auth/login',{...first,password:'incorrect-long-test-password'},401);
await request('one','auth/login',{...first,email:first.email.toLowerCase()});
await request('another','auth/signup',first,409);
const a=await request('one','start',{});assert.equal((await request('one','start',{})).id,a.id);
const b=await request('two','start',{});assert.equal(a.paper,b.paper);assert.notEqual(a.id,b.id);
await request('two','attempt/'+a.id,undefined,404);assert(!('key' in a.questions[0]));assert.equal(a.deadline-a.started,7200);
const {exam}=await request('one','home');const path='attempt/'+a.id;
const ans={answers:{0:1},flags:[2],position:12,revision:0};await request('one',path,ans);await request('one',path,ans,409);
const restored=await request('one',path);assert.deepEqual(restored.flags,[2]);assert.equal(restored.position,12);
const stored=()=>JSON.parse(db.prepare('SELECT content FROM papers WHERE id=?').get(a.paper).content);
const answers=Object.fromEntries(stored().slice(0,75).map((q,i)=>[i,q.key]));
answers[75]=(stored()[75].key+1)%4;
const done=await request('one',path+'/submit',{...ans,answers,revision:1});assert.equal(done.score,74.75);
assert.equal((await request('one',path+'/submit',{})).score,74.75);
let previous=a;const seen=new Set();
for(let round=0;round<30;round++){
 const test=await request('one','start',{});assert.notEqual(test.paper,previous.paper);
 const qs=JSON.parse(db.prepare('SELECT content FROM papers WHERE id=?').get(test.paper).content);
 assert.equal(qs.length,100);assert.equal(new Set(qs.map(q=>q.id)).size,100);
 const signature=qs.map(q=>q.id).sort().join('|');assert(!seen.has(signature));seen.add(signature);
 for(const [i,[,n]] of exam.topics.entries())assert.equal(qs.filter(q=>q.topic===i).length,n);
 assert.equal(qs.filter(q=>q.prompt.startsWith('Match A, B and C')).length,10);
 assert(qs.filter(q=>q.id.startsWith('advanced-')).length>=6);
 for(const q of qs.filter(q=>q.topic===0)){assert(q.eventDate);assert(q.source.startsWith('https://'));}
 for(const q of qs){assert.equal(new Set(q.options).size,4);assert(q.options[q.key]);}
 db.prepare('UPDATE attempts SET deadline=? WHERE id=?').run(Math.floor(Date.now()/1000)-1,test.id);
 const expired=await request('one','attempt/'+test.id+'/submit',{...ans,answers});assert.equal(expired.score,0);assert(expired.ended);
 previous=test;
}
console.log('Passed: fresh papers, shared cache, topic counts, matching formats, distinct choices, access isolation, resume, conflicting updates, scoring and deadline enforcement.');


// A stale cached paper is retained for history but excluded from new assignments.
db.prepare("UPDATE papers SET oldest_event='2000-01-01'").run();
await request('new','auth/signup',{email:'new@example.test',password:'example-password99'});
const fresh=await request('new','start',{});assert(!seen.has(db.prepare('SELECT fingerprint FROM papers WHERE id=?').get(fresh.paper).fingerprint.slice(3)));
const key=JSON.parse(db.prepare('SELECT content FROM papers WHERE id=?').get(fresh.paper).content)[0].key;
await request('new','attempt/'+fresh.id,{answers:{0:(key+1)%4},revision:0,position:0,flags:[]});
db.prepare('UPDATE attempts SET deadline=1 WHERE id=?').run(fresh.id);
assert.equal((await request('new','attempt/'+fresh.id)).score,-0.25);
const {inWindow,eventWindow}=await import('./src/current.mjs');
const range=eventWindow(Date.parse('2026-11-18T01:00:00Z'));
for(const [day,ok] of [['2025-11-18',false],['2025-11-19',true],['2026-11-18',true],['2026-11-19',false],['2026-02-30',false]])assert.equal(inWindow(day,range),ok);
console.log('Passed: signup/login/logout, negative scoring, stale cache eviction and rolling-year boundaries.');
