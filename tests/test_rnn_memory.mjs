import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {memoryInitial,memoryEvaluate,memoryUpdate,memoryClip} from '../rnn-memory-training.js';
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
for(const p of [memoryInitial(),{wx:-.3,wh:1.2,b:.2,v:-.5,c:.4},{wx:1.1,wh:-.8,b:-.3,v:1.5,c:-.2}]){
 const r=memoryEvaluate(p),eps=1e-6;
 assert.equal(r.samples.length,4);
 for(const key of Object.keys(p)){
  const plus={...p,[key]:p[key]+eps},minus={...p,[key]:p[key]-eps};
  near(r.gradient[key],(memoryEvaluate(plus).loss-memoryEvaluate(minus).loss)/(2*eps));
 }
 const step=memoryUpdate(p,.1);
 for(const key of Object.keys(p))near(step.next[key],p[key]-.1*r.gradient[key],1e-12);
 assert.deepEqual(memoryUpdate(p,0).next,p);
}
// A 3-4-5 vector tests scaling, unchanged and zero-norm branches independently.
const scaled=memoryClip({a:3,b:4},2);assert.equal(scaled.norm,5);assert.equal(scaled.factor,.4);near(scaled.applied.a,1.2,1e-12);near(scaled.applied.b,1.6,1e-12);
assert.deepEqual(memoryClip({a:3,b:4},5),{norm:5,factor:1,applied:{a:3,b:4}});
assert.deepEqual(memoryClip({a:0,b:0},0),{norm:0,factor:1,applied:{a:0,b:0}});
assert.equal(memoryClip({a:3,b:4},null).factor,1);
assert.throws(()=>memoryClip({a:1},-1),RangeError);
for(const threshold of [0,.05,.2,1,null]){
 const p=memoryInitial(), step=memoryUpdate(p,.1,threshold), original=memoryEvaluate(p).gradient;
 const norm=Math.hypot(...Object.values(original));
 const factor=threshold===null||norm===0?1:Math.min(1,threshold/norm);
 near(step.clip.norm,norm,1e-12);near(step.clip.factor,factor,1e-12);
 for(const key of Object.keys(p))near(step.next[key],p[key]-.1*factor*original[key],1e-12);
}
const start=memoryInitial();let state=start;
for(let i=0;i<10;i++)state=memoryUpdate(state,.1).next;
const evaluationAt10=memoryEvaluate(state,.5).loss;
for(let i=10;i<50;i++)state=memoryUpdate(state,.1).next;
assert.ok(memoryEvaluate(state).loss<memoryEvaluate(start).loss);
assert.ok(memoryEvaluate(state,.5).loss>evaluationAt10,'held-out loss can rise');
assert.ok(memoryEvaluate(state,.5).samples.every(s=>Math.abs(s.x[0])===.5&&Math.abs(s.x[2])===.5));
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/)/,'');let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const prefix of ['','/course'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/#rnn`);
  const count=page.locator('[data-memory-count]'),train=page.locator('[data-memory-loss="train"]'),test=page.locator('[data-memory-loss="test"]');
  assert.equal(await count.textContent(),'0');assert.equal(await page.locator('.memory-lab tbody tr').count(),8);
  const initial=await train.textContent(), initialTest=await test.textContent();
  const clip=page.locator('[data-memory-clip]'),factor=page.locator('[data-memory-factor]');
  assert.equal(await clip.inputValue(),'off');assert.equal(await factor.textContent(),'1.0000');
  await clip.selectOption('0.05');assert.ok(Number(await factor.textContent())<1);
  assert.equal(await count.textContent(),'0');assert.equal(await train.textContent(),initial);
  await page.locator('[data-memory-action="one"]').click();
  const clipped=await train.textContent(), expectedClipped=memoryUpdate(memoryInitial(),.1,.05);
  for(const [key,label] of [['wx','Wₓ'],['wh','Wₕ'],['b','b'],['v','V'],['c','c']])assert.ok((await page.locator('#memory-output').textContent()).includes(`${label}=${(Math.abs(expectedClipped.next[key])<.00005?0:expectedClipped.next[key]).toFixed(4)}`));
  assert.match(await page.locator('#memory-output').textContent(),/마지막 갱신의 노름 제한: 0.0500/);
  await page.locator('#language').click();
  assert.equal(await clip.inputValue(),'0.05');assert.match(await page.locator('#memory-output').textContent(),/Norm limit for last update: 0.0500/);
  await clip.selectOption('1');assert.match(await page.locator('#memory-output').textContent(),/Norm limit for last update: 0.0500/);
  await page.locator('#language').click();
  await page.locator('[data-memory-action="reset"]').click();await clip.selectOption('off');
  await page.locator('[data-memory-action="one"]').click();assert.notEqual(await train.textContent(),clipped);
  await page.locator('[data-memory-action="reset"]').click();
  await page.locator('[data-memory-rate]').selectOption('0');
  await page.locator('[data-memory-action="one"]').focus();await page.keyboard.press('Enter');
  assert.equal(await count.textContent(),'1');assert.equal(await train.textContent(),initial);assert.equal(await test.textContent(),initialTest);
  await page.locator('[data-memory-action="reset"]').click();
  await page.locator('[data-memory-rate]').selectOption('0.1');
  await page.locator('[data-memory-action="ten"]').click();
  const testAt10=await test.textContent();
  for(let i=0;i<4;i++)await page.locator('[data-memory-action="ten"]').click();
  assert.equal(await count.textContent(),'50');assert.ok(Number(await train.textContent())<Number(initial));assert.ok(Number(await test.textContent())>Number(testAt10));
  const trained=await train.textContent(),evalLoss=await test.textContent();
  await page.locator('#language').click();
  assert.equal(await count.textContent(),'50');assert.equal(await train.textContent(),trained);assert.equal(await test.textContent(),evalLoss);assert.equal(await page.locator('[data-memory-rate]').inputValue(),'0.1');
  assert.match(await page.locator('#memory-title').textContent(),/Train repeatedly/);
  await page.locator('#navigation [data-nav="cnn"]').click();await page.locator('#navigation [data-nav="rnn"]').click();
  assert.equal(await count.textContent(),'50');assert.equal(await train.textContent(),trained);
  for(let i=0;i<15;i++)await page.locator('[data-memory-action="ten"]').click();
  assert.equal(await count.textContent(),'200');assert.ok(await page.locator('[data-memory-action="ten"]').isDisabled());assert.ok(await page.locator('[data-memory-action="one"]').isDisabled());
  await page.locator('[data-memory-action="reset"]').click();assert.equal(await count.textContent(),'0');assert.equal(await train.textContent(),initial);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.ok(await page.locator('.memory-lab .training-history').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'table fits viewport');
  if(process.env.MEMORY_SCREENSHOTS)await page.locator('.memory-lab').screenshot({path:`test-results/rnn-memory-${width}.png`});
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/concepts.html#gradient-clipping`);
  assert.match(await page.locator('main h1').textContent(),/Gradient clipping/);
  if(width===390){await page.locator('#language').click();assert.match(await page.locator('main h1').textContent(),/기울기 클리핑/);}
  await page.locator('main a.next').click();await page.waitForURL('**/index.html?section=memory-title#rnn');
  await page.waitForFunction(()=>document.activeElement?.id==='memory-title');
  assert.equal(await page.locator('[data-memory-clip]').inputValue(),'off');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: RNN BPTT, clipped updates, bilingual state, concept links, keyboard, reset, mobile and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
