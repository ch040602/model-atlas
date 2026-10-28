import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {batchNormPreview} from '../batchnorm-lab.js';
import {dropoutExample} from '../dropout-lab.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
let state={mean:0,variance:1,count:0};
for(const third of [1,4,-2,2,0,3]) {
 const r=batchNormPreview(third,state), x=[0,2,third], mean=(2+third)/3;
 const s=x.reduce((a,v)=>a+(v-mean)**2,0);
 close(r.mean,mean);close(r.variance,s/3);close(r.unbiased,s/2);
 close(r.nextMean,.9*state.mean+.1*mean);close(r.nextVariance,.9*state.variance+.1*s/2);
 r.training.forEach((y,i)=>close(y,(x[i]-mean)/Math.sqrt(s/3+.01)));
 close(r.evaluation,(2-state.mean)/Math.sqrt(state.variance+.01));
 state={mean:r.nextMean,variance:r.nextVariance,count:state.count+1};
}
assert.throws(()=>batchNormPreview(NaN,state),RangeError);
assert.throws(()=>batchNormPreview(5,state),RangeError);
// Enumerate every mask, checking total probability and expected activation.
for(const p of [0,0.25,0.5,0.75]) {
 let total=0, expected=[0,0,0];
 for(let bits=0;bits<8;bits++) {
  const mask=[0,1,2].map(i=>(bits>>i)&1), kept=mask.reduce((a,b)=>a+b,0);
  const r=dropoutExample(p,mask,'train'), probability=(1-p)**kept*p**(3-kept);
  close(r.probability,probability);total+=probability;
  r.output.forEach((v,i)=>{close(v,mask[i]*(i+1)/(1-p));expected[i]+=probability*v;});
  assert.deepEqual(dropoutExample(p,mask,'eval').output,[1,2,3]);
 }
 close(total,1);expected.forEach((v,i)=>close(v,i+1));
}
assert.throws(()=>dropoutExample(1,[1,0,1],'train'),RangeError);
const server=createServer(async(req,res)=>{
 const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';
 if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
 try {const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try {
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#batchnorm`);
 const text=key=>page.locator(`[data-bn="${key}"]`).textContent();
 assert.equal(await text('count'),'0');assert.equal(await text('mean'),'1.000');assert.equal(await text('variance'),'0.667');
 assert.equal(await text('evaluation'),'1.990');assert.equal(await text('next-mean'),'0.100');assert.equal(await text('next-variance'),'1.000');
 await page.locator('[data-batchnorm-apply]').click();
 assert.equal(await text('count'),'1');assert.equal(await text('current'),'[0.100, 1.000]');assert.equal(await text('evaluation'),'1.891');
 await page.locator('#batchnorm-third').fill('4');assert.equal(await text('count'),'1');assert.equal(await text('evaluation'),'1.891');
 await page.locator('[data-batchnorm-apply]').focus();await page.keyboard.press('Enter');
 assert.equal(await text('count'),'2');assert.equal(await text('current'),'[0.290, 1.300]');
 const before=await text('evaluation');await page.locator('#language').click();
 assert.match(await page.locator('#batchnorm-title').textContent(),/Compare batch statistics/);
 assert.equal(await page.locator('#batchnorm-third').inputValue(),'4');assert.equal(await text('count'),'2');assert.equal(await text('evaluation'),before);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
 if(process.env.CONCEPT_SCREENSHOTS)await page.locator('.batchnorm-lab').screenshot({path:'test-results/batchnorm-mobile.png'});
 await page.locator('[data-batchnorm-reset]').focus();await page.keyboard.press('Space');
 assert.equal(await text('count'),'0');assert.equal(await text('current'),'[0.000, 1.000]');assert.equal(await text('evaluation'),'1.990');
 await page.locator('#batchnorm-third').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#batchnorm-third').inputValue(),'3.5');
 const dropout=key=>page.locator(`[data-dropout-result="${key}"]`).textContent();
 assert.equal(await dropout('probability'),'0.125');assert.equal(await dropout('output'),'[2.000, 0.000, 6.000]');
 await page.locator('[data-dropout-mode]').selectOption('eval');assert.equal(await dropout('output'),'[1.000, 2.000, 3.000]');
 await page.locator('[data-dropout-p]').fill('0');assert.equal(await dropout('probability'),'0.000');
 assert.match(await page.locator('#dropout-output').textContent(),/cannot occur/);
 await page.locator('[data-dropout-mask="1"]').focus();await page.keyboard.press('Space');
 assert.equal(await dropout('probability'),'1.000');assert.equal(await dropout('output'),'[1.000, 2.000, 3.000]');
 await page.locator('[data-dropout-p]').fill('0.75');await page.locator('[data-dropout-mode]').selectOption('train');
 assert.equal(await dropout('probability'),'0.016');assert.equal(await dropout('output'),'[4.000, 8.000, 12.000]');
 await page.locator('#language').click();assert.match(await page.locator('#dropout-title').textContent(),/드롭아웃/);
 assert.equal(await page.locator('[data-dropout-p]').inputValue(),'0.75');assert.equal(await page.locator('[data-dropout-mode]').inputValue(),'train');
 assert.equal(await dropout('output'),'[4.000, 8.000, 12.000]');assert.ok(await page.locator('[data-dropout-mask="1"]').isChecked());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
 if(process.env.CONCEPT_SCREENSHOTS)await page.locator('.dropout-lab').screenshot({path:'test-results/dropout-mobile-ko.png'});
 assert.deepEqual(errors,[]);console.log('PASS: batch normalization and exhaustive dropout masks; bilingual state, keyboard and mobile');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
