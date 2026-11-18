import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {eventDay} from './src/current.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const css=await read('public/site.css'), js=await read('public/app.js');
const ui=(await read('public/index.html')).replace('/*STYLE*/',()=>css).replace('/*SCRIPT*/',()=>js);

const bank=JSON.parse(await read('approved.json'));
const ids=new Set();
for(const q of bank){
 if(!/^ai-[a-zA-Z0-9-]+$/.test(q.id)||ids.has(q.id)||!Number.isInteger(q.topic)||q.topic<0||q.topic>14||typeof q.prompt!=='string'||!q.prompt.trim()||!Array.isArray(q.choices)||q.choices.length!==4||!q.choices.every(x=>typeof x==='string'&&x.trim())||new Set(q.choices).size!==4||!q.explanation?.trim())throw Error('Invalid approved item '+q.id);
 if(q.topic===0&&(!eventDay(q.eventDate)||!/^https:\/\//.test(q.source||'')))throw Error('Current affairs need a valid event date and source URL');
 ids.add(q.id);
}
await mkdir('dist/.openai',{recursive:true});await mkdir('dist/server',{recursive:true});
try{await copyFile('.openai/hosting.json','dist/.openai/hosting.json')}catch(err){if(err.code!=='ENOENT')throw err}
await writeFile('dist/server/index.js',[
 'const pageHtml='+JSON.stringify(ui)+';', 'const extraItems='+JSON.stringify(bank)+';',
 (await read('src/topics.mjs')).replaceAll('export const','const'), await read('src/bank.mjs'),(await read('src/current.mjs')).replaceAll('export function','function'),await read('src/applied.mjs'),await read('src/auth.mjs'),await read('src/generator.mjs'),await read('src/server.mjs')
].join('\n'));
