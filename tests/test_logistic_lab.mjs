import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {logisticInitial,logisticTraining,logisticEvaluation,logisticCalculate,logisticStep} from '../logistic-lab.js';

const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const initial=logisticCalculate(logisticInitial());
near(initial.loss,Math.log(2));near(initial.dw,-0.5);near(initial.db,0);
assert.equal(logisticTraining.length,4);assert.equal(logisticEvaluation.length,2);
for(const w of [-3,-.5,0,.5,3])for(const b of [-2,0,2]){
 const s={w,b,step:0},r=logisticCalculate(s),h=1e-5;
 near(r.dw,(logisticCalculate({...s,w:w+h}).loss-logisticCalculate({...s,w:w-h}).loss)/(2*h));
 near(r.db,(logisticCalculate({...s,b:b+h}).loss-logisticCalculate({...s,b:b-h}).loss)/(2*h));
 for(const row of r.rows){near(row.p,1/(1+Math.exp(-row.z)));near(row.loss,-(row.y*Math.log(row.p)+(1-row.y)*Math.log(1-row.p)));}
 const step=logisticStep(s,.7);near(step.next.w,w-.7*r.dw);near(step.next.b,b-.7*r.db);
}
assert.throws(()=>logisticStep(logisticInitial(),-1),RangeError);
assert.throws(()=>logisticStep(logisticInitial(),NaN),RangeError);
const zero=logisticStep(logisticInitial(),0);near(zero.before.loss,zero.after);assert.equal(zero.next.step,1);
let state=logisticInitial();for(let i=0;i<100;i++)state=logisticStep(state,.5).next;
assert.ok(logisticCalculate(state).loss<initial.loss);assert.ok(state.b<0);

const server=createServer(async(req,res)=>{
 const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course\//,'/').slice(1)||'index.html';
 if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
 try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 if(process.env.LOGISTIC_SCREENSHOTS)await mkdir('test-results',{recursive:true});
 for(const prefix of ['', '/course'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/concepts.html#linear-models`);
  const value=key=>page.locator(`[data-logistic-${key}]`).textContent();
  assert.equal(await value('step'),'0');assert.equal(await value('loss'),'0.693');assert.equal(await value('dw'),'-0.500');assert.equal(await value('db'),'0.000');
  await page.locator('#logistic-rate').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#logistic-rate').inputValue(),'0.55');
  await page.locator('[data-logistic-action="one"]').click();const first=logisticStep(logisticInitial(),.55);
  assert.equal(await value('weight'),first.next.w.toFixed(3));assert.equal(await value('loss'),first.after.toFixed(3));assert.equal(await value('eval'),logisticCalculate(first.next,logisticEvaluation).loss.toFixed(3));
  await page.locator('[data-logistic-action="ten"]').click();assert.equal(await value('step'),'11');assert.ok(Number(await value('bias'))<0);
  const weight=await value('weight');await page.locator('#language').click();assert.match(await page.locator('#logistic-title').textContent(),/Train logistic regression/);
  assert.equal(await value('step'),'11');assert.equal(await value('weight'),weight);assert.equal(await page.locator('#logistic-rate').inputValue(),'0.55');
  if(process.env.LOGISTIC_SCREENSHOTS&&prefix==='')await page.locator('.tree-lab').screenshot({path:`test-results/logistic-${width}.png`});
  if(!await page.locator('#library-navigation').evaluate(el=>el.open))await page.locator('#library-navigation summary').click();
  await page.locator('#concept-search').fill('logistic');assert.equal(await page.locator('#library-list a[href="#linear-models"]').count(),1);await page.locator('#library-list a[href="#linear-models"]').click();assert.equal(await value('step'),'11');
  for(let i=0;i<9;i++)await page.locator('[data-logistic-action="ten"]').click();assert.equal(await value('step'),'100');assert.ok(await page.locator('[data-logistic-action="one"]').isDisabled());
  await page.locator('[data-logistic-action="reset"]').click();assert.equal(await value('step'),'0');assert.equal(await page.locator('#logistic-rate').inputValue(),'0.55');
  await page.locator('#logistic-rate').fill('0');await page.locator('[data-logistic-action="one"]').click();assert.equal(await value('weight'),'0.000');assert.equal(await value('step'),'1');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: logistic gradients, updates, evaluation, bilingual state, keyboard, search, limits and responsive paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
