const app=document.querySelector('#app'),modal=document.querySelector('#modal');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const button=(text,action,cls='')=>'<button type="button" class="'+cls+'" data-act="'+action+'">'+text+'</button>';
const date=t=>new Date(t*1000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
let catalog,attempt,timer,offset=0,saves=Promise.resolve(),version=0,saveFailed=false,submitting=false;
async function api(path,data){
 const res=await fetch('/api/'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(res.status===401&&!path.startsWith('auth/')){showAuth();throw Error('Sign in required')}
 const result=await res.json();if(!res.ok)throw Error(result.error||'Request failed');return result;
}
function showAuth(mode='login'){
 clearInterval(timer);attempt=null;modal.close();
 document.querySelector('.student').textContent='Student workspace';
 const signup=mode==='signup';
 app.innerHTML='<section class="auth-layout"><div class="auth-intro"><span class="eyebrow">KRIES Paper 1</span><h1>Your practice desk</h1><p>Sign in to take a timed mock, resume a paper and see your scores.</p>'+facts()+'</div><form class="card auth-form" id="account-form" data-mode="'+mode+'"><h2>'+(signup?'Create your account':'Student login')+'</h2><label>Email address<input name="email" type="email" maxlength="254" required autocomplete="email"></label><label>Password<input name="password" type="password" minlength="10" maxlength="128" required autocomplete="'+(signup?'new-password':'current-password')+'"></label>'+(signup?'<small>Use at least 10 characters.</small>':'')+'<p class="note" role="alert"></p><button type="submit">'+(signup?'Create account':'Log in')+'</button><p>'+(signup?'Already registered? ':'New to the portal? ')+button(signup?'Log in':'Create account',signup?'login':'signup','ghost')+'</p></form></section>';
}
document.addEventListener('submit',async event=>{
 const form=event.target;if(form.id!=='account-form')return;
 event.preventDefault();const submit=form.querySelector('[type=submit]');submit.disabled=true;
 try{await api('auth/'+form.dataset.mode,Object.fromEntries(new FormData(form)));await home()}
 catch(err){form.querySelector('.note').textContent=err.message;submit.disabled=false}
});
function alertBox(message){modal.innerHTML='<h2>Practice portal</h2><p>'+esc(message)+'</p>'+button('Close','close','light');if(!modal.open)modal.showModal()}
function facts(){return '<div class="facts"><span><b>100</b> questions</span><span><b>120</b> minutes</span><span><b>100</b> marks</span></div>'}
async function home(){
 clearInterval(timer);catalog=await api('home');attempt=null;
 document.querySelector('.student').innerHTML='<span>'+esc(catalog.email)+'</span>'+button('Log out','logout','ghost');
 const live=catalog.attempts.find(a=>a.ended===null),past=catalog.attempts.filter(a=>a.ended!==null);
 const history=past.map((a,i)=>'<div class="history row"><div><b>Paper 1 · Attempt '+(past.length-i)+'</b><div class="muted">'+date(a.ended)+'</div></div>'+button(a.score+' / 100 &nbsp; ›','open/'+a.id,'light')+'</div>').join('');
 app.innerHTML='<section class="hero"><div><span class="eyebrow">Full-length mock examination</span><h1>KRIES Paper 1</h1><p>General studies and mental ability for the Karnataka residential schools examination.</p>'+facts()+button(live?'Resume mock test &nbsp; →':'Start mock test &nbsp; →',live?'open/'+live.id:'instructions')+'</div><div class="paperart" aria-hidden="true"><div class="sheet"><small>GENERAL STUDIES</small><strong>Paper I</strong><div class="bubbles">01 ◯ ● ◯ ◯<br>02 ◯ ◯ ● ◯<br>03 ● ◯ ◯ ◯<br>04 ◯ ◯ ◯ ●</div></div><div class="pencil"></div></div></section><div class="grid"><section class="card"><h2>Exam catalogue</h2><div class="catalog"><span class="icon">I</span><div><b>'+esc(catalog.exam.title)+'</b><div class="muted">General paper · English</div></div></div><details><summary>Syllabus &amp; marking</summary><p>Each correct answer earns 1 mark. Each wrong answer deducts 0.25. Skipped questions earn 0. Topic allocations are practice estimates.</p><ul>'+catalog.exam.topics.map(([n,q])=>'<li>'+esc(n)+' · '+q+'</li>').join('')+'</ul></details></section><section class="card"><h2>Your attempts</h2>'+(history||'<p class="muted">Your scores and answer reviews will appear here after your first mock test.</p>')+'</section></div>';
}
function instructions(){
 modal.innerHTML='<span class="eyebrow">Before you begin</span><h2>Paper 1 instructions</h2>'+facts()+'<ul><li>Choose one of four answers for each question.</li><li>Correct +1 · Wrong −0.25 · Skipped 0.</li><li>Answers save as you go. Return on this account to resume before time expires.</li><li>The two-hour timer starts when you begin. Your saved responses count at expiry.</li></ul><p class="muted">English practice questions follow the supplied syllabus. The difficulty mix is approximate.</p><div class="actions">'+button('Begin test','start')+button('Cancel','close','light')+'</div>';modal.showModal();
}
function loadAttempt(a){
 clearInterval(timer);attempt=a;offset=a.serverTime*1000-Date.now();saveFailed=false;submitting=false;
 if(a.ended!==null){result();return}examView();tick();timer=setInterval(tick,1000);
}
function tick(){
 if(!attempt||attempt.ended!==null)return;
 const remaining=Math.max(0,Math.ceil((attempt.deadline*1000-Date.now()-offset)/1000));
 const el=document.querySelector('.time');if(el)el.textContent=[Math.floor(remaining/3600),Math.floor(remaining/60)%60,remaining%60].map(v=>String(v).padStart(2,'0')).join(':');
 if(!remaining&&!submitting){submitting=true;api('attempt/'+attempt.id).then(loadAttempt).catch(()=>{submitting=false;status('Time expired. Reconnecting to retrieve your score…')})}
}
function status(s){const el=document.querySelector('#status');if(el)el.textContent=s}
function save(){
 const a=attempt,seq=++version,snapshot={answers:{...a.answers},flags:[...a.flags],position:a.position};
 status('Saving…');saves=saves.then(async()=>{
 if(a!==attempt||a.ended!==null)return;
 const reply=await api('attempt/'+a.id,{...snapshot,revision:a.revision});
 if(reply.ended!=null){loadAttempt(reply);return}
 a.revision=reply.revision;if(seq===version){saveFailed=false;status('Saved')}
 }).catch(e=>{saveFailed=true;status(e.message+' · Use Retry save below.');});return saves;
}
function examView(){
 const a=attempt,i=a.position,q=a.questions[i],n=Object.keys(a.answers).length;
 app.innerHTML='<div class="row"><div><span class="eyebrow">Mock examination</span><h2>KRIES Paper 1</h2></div><div><small>Time remaining</small><div class="time">—</div></div></div><div class="examgrid"><section class="card"><div class="row"><span class="eyebrow">Question '+(i+1)+' of 100</span><span class="tag">'+esc(catalog.exam.topics[q.topic][0])+'</span></div><div class="question">'+esc(q.prompt)+'</div>'+q.options.map((v,k)=>'<button class="choice" data-act="answer/'+k+'" aria-pressed="'+(a.answers[i]===k)+'"><span>'+String.fromCharCode(65+k)+'</span>'+esc(v)+'</button>').join('')+'<div class="actions">'+button(a.flags.includes(i)?'Unmark review':'Mark for review','flag','light')+button('Clear answer','clear','ghost')+'</div><div class="row actions">'+(i>0?button('← Previous','go/'+(i-1),'light'):'<span></span>')+(i<99?button('Next question →','go/'+(i+1)):button('Submit test','confirm'))+'</div><div class="note" id="status" role="status"></div></section><aside class="card"><h2>Question palette</h2><p class="muted">'+n+' answered · '+(100-n)+' remaining · '+a.flags.length+' flagged</p><div class="palette">'+a.questions.map((_,k)=>'<button aria-label="Question '+(k+1)+(k in a.answers?', answered':'')+(a.flags.includes(k)?', marked for review':'')+'" class="'+(k in a.answers?'answered ':'')+(k===i?'here ':'')+(a.flags.includes(k)?'marked':'')+'" data-act="go/'+k+'">'+(k+1)+'</button>').join('')+'</div><div class="actions">'+button('Submit test','confirm','light')+button('Retry save','save','ghost')+button('Save & exit','exit','ghost')+'</div></aside></div>';
 tick();
}
function result(){
 const a=attempt,answered=Object.keys(a.answers).length;
 const right=a.questions.filter((q,i)=>a.answers[i]===q.key).length,wrong=answered-right;
 const breakdown=catalog.exam.topics.map(([name],k)=>{const qs=a.questions.map((q,i)=>({q,i})).filter(v=>v.q.topic===k);const correct=qs.filter(({q,i})=>a.answers[i]===q.key).length;return '<div class="row"><span>'+esc(name)+'</span><b>'+correct+'/'+qs.length+'</b></div><div class="track"><i style="width:'+100*correct/qs.length+'%"></i></div>'}).join('');
 app.innerHTML='<div class="row"><div><span class="eyebrow">Completed mock</span><h1>Paper 1 results</h1></div>'+button('Back to practice desk','home','light')+'</div><div class="grid"><section class="card"><h2>Your score</h2><div class="score">'+a.score+'<small> / 100</small></div><div class="actions">'+[[right,'Correct'],[wrong,'Incorrect'],[100-answered,'Skipped']].map(([v,t])=>'<div class="stat"><b>'+v+'</b>'+t+'</div>').join('')+'</div><p>Gross marks · '+right+' &nbsp; | &nbsp; Deduction · '+wrong+' × '+a.penalty+' = '+(wrong*a.penalty)+'</p><p>Accuracy on attempted questions · '+(answered?Math.round(100*right/answered):0)+'%</p>'+button('Start a different paper →','instructions')+'</section><section class="card"><details open><summary>Performance by topic</summary>'+breakdown+'</details></section></div><section class="card review" style="margin-top:20px"><h2>Answer review</h2>'+a.questions.map((q,i)=>'<details><summary>Question '+(i+1)+' · '+(a.answers[i]===q.key?'Correct':i in a.answers?'Incorrect':'Skipped')+'</summary><p>'+esc(q.prompt)+'</p><p>Your answer · '+esc(q.options[a.answers[i]]||'Skipped')+'<br><b>Correct answer · '+esc(q.options[q.key])+'</b></p><p class="muted">'+esc(q.explanation)+'</p>'+(q.source&&/^https:\/\//.test(q.source)?'<p><a target="_blank" rel="noopener noreferrer" href="'+esc(q.source)+'">Event source · '+esc(q.eventDate)+'</a></p>':'')+'</details>').join('')+'</section>';
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-act]');if(!b)return;const [act,arg]=b.dataset.act.split('/');
 try{
 if(act==='signup'||act==='login')return showAuth(act);
 if(act==='logout'){await saves;await api('auth/logout',{});showAuth();return}
 if(act==='close')return modal.close();if(act==='instructions')return instructions();
 if(act==='home')return await home();
 if(act==='start'||act==='open'){b.disabled=true;const a=act==='start'?await api('start',{}):await api('attempt/'+arg);modal.close();loadAttempt(a);return}
 if(!attempt||submitting)return;
 if(act==='confirm'){modal.innerHTML='<h2>Submit this paper?</h2><p>You have answered '+Object.keys(attempt.answers).length+' of 100 questions and flagged '+attempt.flags.length+' for review.</p><div class="actions">'+button('Submit & view score','submit')+button('Keep working','close','light')+'</div>';modal.showModal();return}
 if(act==='submit'){submitting=true;b.disabled=true;await saves;const a=attempt;const r=await api('attempt/'+a.id+'/submit',{revision:a.revision,answers:a.answers,flags:a.flags,position:a.position});modal.close();loadAttempt(r);return}
 if(act==='exit'){await save();if(!saveFailed)await home();return}
 if(act==='go')attempt.position=Number(arg);
 if(act==='answer')attempt.answers[attempt.position]=Number(arg);
 if(act==='clear')delete attempt.answers[attempt.position];
 if(act==='flag'){const i=attempt.position;attempt.flags=attempt.flags.includes(i)?attempt.flags.filter(k=>k!==i):[...attempt.flags,i]}
 examView();save();
 }catch(err){submitting=false;b.disabled=false;alertBox(err.message)}
});
home().catch(e=>{if(e.message!=='Sign in required'){app.innerHTML='<div class="card"><h2>Practice desk unavailable</h2><p>'+esc(e.message)+'</p>'+button('Retry','home')+'</div>'}});
