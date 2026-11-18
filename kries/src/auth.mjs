const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
const randomHex=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
const hashToken=async token=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(token)));
function cookieToken(req){
 return /(?:^|;\s*)kries_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.get('cookie')||'')?.[1];
}
async function account(req,db){
 const token=cookieToken(req);
 return token?db.prepare('SELECT s.id,s.email FROM sessions a JOIN students s ON s.id=a.student WHERE a.token_hash=? AND a.expires>?').bind(await hashToken(token),now()).first():null;
}
async function passwordDigest(password,salt){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256));
}
async function auth(req,env,action){
 if(req.method!=='POST')return json({error:'Use POST.'},405);
 const db=env.DB,secure=new URL(req.url).protocol==='https:'?'; Secure':'';
 const sessionResponse=(token,age)=>{const r=json({ok:true});r.headers.set('Set-Cookie','kries_session='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+age+secure);return r};
 if(action==='logout'){
  const token=cookieToken(req);
  if(token)await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hashToken(token)).run();
  return sessionResponse('',0);
 }
 if(!['login','signup'].includes(action))return json({error:'Unknown account action.'},404);
 const data=await req.json().catch(()=>null);
 const email=typeof data?.email==='string'?data.email.trim().toLowerCase():'';
 const password=data?.password;
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<10||password.length>128)return json({error:'Enter an email address and a password of 10–128 characters.'},400);
 const t=now(),windowEnd=(Math.floor(t/900)+1)*900;
 const ip=req.headers.get('cf-connecting-ip')||'local';
 for(const [scope,limit] of [['network:'+ip,180],['email:'+email,15]]){
  const bucket=await hashToken(scope);
  const entry=await db.prepare('INSERT INTO auth_limits VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN resets=excluded.resets THEN hits+1 ELSE 1 END,resets=excluded.resets RETURNING hits').bind(bucket,windowEnd).first();
  if(entry.hits>limit)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 }
 let user=await db.prepare('SELECT * FROM students WHERE email=?').bind(email).first();
 const salt=user?.salt||randomHex(16),digest=await passwordDigest(password,salt);
 if(action==='signup'){
  const legacyId=env.legacyStudent;
  const id=legacyId||crypto.randomUUID();
  const result=await db.prepare('INSERT OR IGNORE INTO students VALUES(?,?,?,?)').bind(id,email,salt,digest).run();
  if(!result.meta.changes)return json({error:'Account creation was unsuccessful. Try signing in.'},409);
  user={id};
 }else{
  let diff=0;const saved=user?.digest||'0'.repeat(64);
  for(let i=0;i<64;i++)diff|=digest.charCodeAt(i)^saved.charCodeAt(i);
  if(!user||diff)return json({error:'Email or password is incorrect.'},401);
 }
 const token=randomHex(32),age=14*86400;
 await db.prepare('INSERT INTO sessions VALUES(?,?,?)').bind(await hashToken(token),user.id,t+age).run();
 await db.prepare('DELETE FROM sessions WHERE expires<=?').bind(t).run();
 await db.prepare('DELETE FROM auth_limits WHERE resets<=?').bind(t).run();
 return sessionResponse(token,age);
}
