import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {skipgramInitial,skipgramStep} from '../skipgram-lab.js';

for(const negative of [false,true])for(const rate of [0,0.1,0.5,1])for(const scale of [-1,0,0.6,2]){
 const v=skipgramInitial();for(const name of Object.keys(v))v[name]=v[name].map(x=>x*scale);
 const before=structuredClone(v),r=skipgramStep(v,negative,rate);
 for(const [name,key] of [['center','gradCenter'],['positive','gradPositive'],['negative','gradNegative']])for(let i=0;i<2;i++){
  const plus=structuredClone(v),minus=structuredClone(v),h=1e-5;
  plus[name][i]+=h;minus[name][i]-=h;
  const numerical=(skipgramStep(plus,negative,0).loss-skipgramStep(minus,negative,0).loss)/(2*h);
  assert.ok(Math.abs(r[key][i]-numerical)<1e-9);
  assert.ok(Math.abs(r.next[name][i]-(v[name][i]-rate*numerical))<1e-9);
 }
 assert.deepEqual(v,before);
 if(!negative)assert.deepEqual(r.next.negative,v.negative);
 if(rate===0)assert.deepEqual(r.next,v);
}
assert.throws(()=>skipgramStep(skipgramInitial(),true,-1),RangeError);
assert.throws(()=>skipgramStep(skipgramInitial(),true,2),RangeError);

const server=createServer(async(req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
 try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/concepts.html#word-vectors');
  const initial=await page.locator('[data-skipgram-result="loss"]').textContent();
  await page.locator('[data-skipgram-step]').focus();await page.keyboard.press('Enter');
  assert.notEqual(await page.locator('[data-skipgram-result="loss"]').textContent(),initial);
  assert.match(await page.locator('[data-skipgram-feedback]').textContent(),/→/);
  let previous=Number(await page.locator('[data-skipgram-result="loss"]').textContent());
  for(let i=0;i<4;i++){
   await page.locator('[data-skipgram-step]').click();
   const current=Number(await page.locator('[data-skipgram-result="loss"]').textContent());
   assert.ok(current<previous);previous=current;
  }
  const result=await page.locator('#skipgram-output').textContent();
  await page.locator('#language').click();
  assert.match(await page.locator('#skipgram-title').textContent(),/train word vectors/);
  assert.equal(await page.locator('[data-skipgram-result="loss"]').textContent(),result.match(/L =.*?=\s*([\d.]+)/)[1]);
  await page.locator('[data-skipgram-negative]').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-skipgram-feedback]').count(),0);
  await page.locator('[data-skipgram-rate]').selectOption({value:'0'});
  const zero=await page.locator('[data-skipgram-result="loss"]').textContent();
  await page.locator('[data-skipgram-step]').click();
  assert.equal(await page.locator('[data-skipgram-result="loss"]').textContent(),zero);
  await page.locator('.concept-sequence a[href="#text-counts"]').click();
  await page.locator('.concept-sequence a[href="#word-vectors"]').click();
  assert.equal(await page.locator('[data-skipgram-rate]').inputValue(),'0');
  assert.equal(await page.locator('[data-skipgram-negative]').isChecked(),false);
  await page.locator('[data-skipgram-reset]').click();
  await page.locator('[data-skipgram-negative]').check();
  assert.equal(await page.locator('[data-skipgram-result="loss"]').textContent(),initial);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.deepEqual(errors,[]);
  if(process.env.CONCEPT_SCREENSHOTS)await page.locator('.skipgram-lab').screenshot({path:`test-results/skipgram-${width}.png`});
  await page.close();
 }
 console.log('PASS: Skip-gram finite differences, simultaneous updates, bilingual and keyboard behavior, reset and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
