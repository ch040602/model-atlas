import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {linkedBlockExample} from '../linked-transformer-block.js';

// Independent reference using explicit matrix multiplication and stable softmax.
const norm=(x,gamma=1,beta=0)=>{const m=(x[0]+x[1])/2;const variance=((x[0]-m)**2+(x[1]-m)**2)/2;return x.map(v=>gamma*(v-m)/Math.sqrt(variance+.01)+beta);};
const mul=(v,m)=>m[0].map((_,j)=>v.reduce((s,x,i)=>s+x*m[i][j],0));
function reference(x,activation,gamma=1,beta=0) {
 const u=[[1,0],x].map(v=>norm(v,gamma,beta)),q=u[1][0],keys=[u.map(v=>v[0]),u.map(v=>v[1])],values=[u.map(v=>v[1]),u.map(v=>v[0])];
 const weights=keys.map(k=>{const z=k.map(v=>q*v),e=z.map(v=>Math.exp(v-Math.max(...z)));return e.map(v=>v/(e[0]+e[1]));});
 const heads=weights.map((a,i)=>a[0]*values[i][0]+a[1]*values[i][1]);
 const attention=mul(heads,[[1,.5],[-.5,1]]),residual=x.map((v,i)=>v+attention[i]),normalized=norm(residual,gamma,beta);
 const activate=x=>activation==='relu'?Math.max(0,x):x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+.044715*x*x*x)))/2;
 const mlp=normalized.map(x=>.5*activate(x));return {u,weights,heads,attention,residual,normalized,mlp,result:residual.map((x,i)=>x+mlp[i])};
}
const close=(a,b,tolerance=1e-10)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<tolerance,`${a} != ${b}`));};
for(const activation of ['gelu','relu']) for(const x1 of [-2,-1,0,1,2]) for(const x2 of [-2,-1,0,1,2]) {
 const a=linkedBlockExample({x1,x2,attention:1.2,activation}),b=reference([x1,x2],activation);
 close(a.positions[0],b.u[0]);close(a.positions[1],b.u[1]);
 for(let i=0;i<2;i++){close(a.heads[i].weights,b.weights[i]);close([a.heads[i].output],[b.heads[i]]);}
 close(a.attention,b.attention);close(a.block.residual,b.residual);close(a.block.ln2.output,b.normalized);close(a.block.mlp,b.mlp);close(a.block.output,b.result);
}
for(const gamma of [-2,0,0.5,1,2]) for(const beta of [-1,0,1]) for(const x of [[1,0],[1,1],[-2,2]]) {
 const a=linkedBlockExample({x1:x[0],x2:x[1],attention:0,activation:'gelu',gamma,beta}),b=reference(x,'gelu',gamma,beta);
 close(a.positions[0],b.u[0]);close(a.positions[1],b.u[1]);close(a.attention,b.attention);close(a.block.ln2.output,b.normalized);close(a.block.output,b.result);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try {
 await mkdir(path.join(root,'test-results'),{recursive:true});const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/#transformer`);await page.locator('#linked-block-output').waitFor();
 const get=async key=>JSON.parse(await page.locator(`[data-linked="${key}"]`).textContent());
 for(const lang of ['ko','en']) {
  if(lang==='en') await page.locator('#language').click();
  assert.match(await page.locator('#linked-block-title').textContent(),lang==='ko'?/처음부터 끝까지/:/complete Transformer block/);
  for(const activation of ['gelu','relu']) for(const [x1,x2] of [[1,0],[1,1],[-2,2],[2,-1]]) {
   await page.locator('[data-block-input="x1"]').fill(String(x1));await page.locator('[data-block-input="x2"]').fill(String(x2));await page.locator('[data-block-activation]').selectOption(activation);
   const r=reference([x1,x2],activation);
   for(const [key,expected] of [['norm1',r.u[0]],['norm2',r.u[1]],['weights1',r.weights[0]],['weights2',r.weights[1]],['concat',r.heads],['attention',r.attention],['residual',r.residual],['norm-residual',r.normalized],['mlp',r.mlp],['result',r.result]]) close(await get(key),expected,0.000501);
  }
  await page.locator('[data-block-input="gamma"]').fill('0.5');
  await page.locator('[data-block-input="beta"]').fill('1');
  const altered=reference([2,-1],'relu',0.5,1);
  for(const [key,expected] of [['norm1',altered.u[0]],['norm2',altered.u[1]],['attention',altered.attention],['norm-residual',altered.normalized],['result',altered.result]]) close(await get(key),expected,0.000501);
  assert.match(await page.locator('#block-output').textContent(),/0\.500 ×/);
  await page.locator('[data-block-input="gamma"]').fill('1');
  await page.locator('[data-block-input="beta"]').fill('0');
  const before=await get('result');await page.locator('[data-block-input="attention"]').fill('1.5');close(await get('result'),before);
  await page.locator('[data-attn-input="q1"]').fill('-1');close(await get('result'),before);
  await page.locator('#unit-contents summary').click();await page.locator('[data-unit-jump="linked-block-title"]').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'linked-block-title');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  await page.locator('.linked-block-lab').screenshot({path:path.join(root,'test-results',`linked-block-mobile-${lang}.png`)});await page.locator('#unit-contents summary').click();
 }
 await page.locator('[data-block-input="gamma"]').fill('0.5');
 await page.locator('[data-block-input="beta"]').fill('1');
 const beforeLanguage=await get('result');await page.locator('#language').click();
 assert.equal(await page.locator('[data-block-input="gamma"]').inputValue(),'0.5');
 assert.equal(await page.locator('[data-block-input="beta"]').inputValue(),'1');
 close(await get('result'),beforeLanguage);
 await page.locator('[data-block-input="gamma"]').focus();const before=await get('result');await page.keyboard.press('ArrowLeft');assert.notDeepEqual(await get('result'),before);
 assert.deepEqual(errors,[]);console.log('PASS: 95 independent block calculations; bilingual mobile, keyboard, shared normalization and language-state preservation');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
