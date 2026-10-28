import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {fgsmExample} from '../fgsm-lab.js';

// Independent finite-difference check of loss with respect to each input.
const loss=x=>Math.log(1+Math.exp(-(2*x[0]-2*x[1]-0.2)));
for(const epsilon of [0,0.01,0.04,0.06,0.1,0.3]){
 const r=fgsmExample(epsilon),h=1e-5;
 for(let i=0;i<2;i++){
  const a=[...r.x],b=[...r.x];a[i]+=h;b[i]-=h;
  assert.ok(Math.abs(r.gradient[i]-(loss(a)-loss(b))/(2*h))<1e-9);
  assert.ok(Math.abs(r.changed[i]-(r.x[i]+epsilon*Math.sign(r.gradient[i])))<1e-12);
 }
 assert.ok(Math.abs(r.after.loss-loss(r.changed))<1e-12);
 assert.ok(r.maxChange<=epsilon+1e-12);
 assert.ok(r.after.loss>=r.before.loss-1e-12);
}
assert.equal(fgsmExample(0).after.prediction,1);
assert.equal(fgsmExample(0.04).after.prediction,1);
assert.equal(fgsmExample(0.05).after.prediction,1); // tie goes to class 1
assert.equal(fgsmExample(0.06).after.prediction,0);
for(const epsilon of [-0.01,0.31,NaN])assert.throws(()=>fgsmExample(epsilon),RangeError);
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
  await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#adversarial-examples`);
  assert.equal(await page.locator('[data-fgsm-result="class"]').textContent(),'0');
  const slider=page.locator('[data-fgsm-epsilon]');await slider.focus();await page.keyboard.press('Home');
  assert.equal(await slider.inputValue(),'0');assert.equal(await page.locator('[data-fgsm-result="class"]').textContent(),'1');
  await page.keyboard.press('End');assert.equal(await slider.inputValue(),'0.3');assert.equal(await page.locator('[data-fgsm-result="class"]').textContent(),'0');
  const changed=await page.locator('[data-fgsm-result="input"]').textContent();
  await page.locator('#language').click();assert.match(await page.locator('#fgsm-title').textContent(),/Change an input/);
  assert.equal(await slider.inputValue(),'0.3');assert.equal(await page.locator('[data-fgsm-result="input"]').textContent(),changed);
  await page.locator('.concept-sequence a[href="#vision-transformer"]').click();
  await page.locator('.concept-sequence a[href="#adversarial-examples"]').click();
  assert.equal(await slider.inputValue(),'0.3');
  if(!(await page.locator('#library-navigation').evaluate(el=>el.open)))await page.locator('#library-summary').click();
  await page.locator('#concept-search').fill('adversarial');assert.equal(await page.locator('#library-list a[href="#adversarial-examples"]').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));assert.deepEqual(errors,[]);
  if(process.env.CONCEPT_SCREENSHOTS)await page.locator('[aria-labelledby="fgsm-title"]').screenshot({path:`test-results/fgsm-${width}.png`});
  await page.close();
 }
 console.log('PASS: FGSM finite differences, budget and prediction, bilingual keyboard, navigation, search and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
