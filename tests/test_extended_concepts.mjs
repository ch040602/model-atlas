import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {extendedConcepts} from '../extended-concepts.js';
import {tfidfExample} from '../tfidf-lab.js';
import {boxIoU} from '../iou-lab.js';

for(const addBird of [false,true])for(let doc=0;doc<3;doc++){
 const r=tfidfExample(addBird,doc),expectedDf=[2,3,addBird?2:1];
 assert.deepEqual(r.df,expectedDf);
 for(let i=0;i<3;i++){
  assert.ok(Math.abs(r.idf[i]-(1+Math.log(4/(1+expectedDf[i]))))<1e-12);
  assert.ok(Math.abs(r.raw[i]-r.counts[doc][i]*r.idf[i])<1e-12);
 }
 assert.ok(Math.abs(Math.hypot(...r.normalized)-1)<1e-12);
}
assert.throws(()=>tfidfExample(false,3),RangeError);
assert.throws(()=>tfidfExample('yes',0),RangeError);
for(const [x,overlap] of [2,3,3,2,1,0,0,0].entries())for(const threshold of [.1,.5,.75,.9]){
 const r=boxIoU(x,threshold),intersection=overlap*3,union=21-intersection;
 assert.equal(r.intersection,intersection);assert.equal(r.union,union);
 assert.equal(r.iou,intersection/union);assert.equal(r.passes,intersection/union>=threshold);
}
assert.throws(()=>boxIoU(-1,.5),RangeError);assert.throws(()=>boxIoU(1,0),RangeError);
const server=createServer(async(req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!/^[\w./-]+$/.test(file)||file.split('/').includes('..'))return res.writeHead(404).end();
 try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':file.endsWith('.woff')?'font/woff':file.endsWith('.ttf')?'font/ttf':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/index.html');
  await page.locator('#extended-path-link').click();
  await page.waitForURL('**/concepts.html#big-data-context');
  await page.locator('.concept-first').waitFor();
  for(const [i,c] of extendedConcepts.entries()){
   assert.equal(await page.locator('h1').textContent(),c.ko);
   assert.equal(await page.locator(`a[href="${c.reference}"]`).count()>0,true);
   if(i<extendedConcepts.length-1){await page.locator(`.concept-sequence a[href="#${extendedConcepts[i+1].id}"]`).click();await page.waitForFunction(label=>document.querySelector('h1')?.textContent===label,extendedConcepts[i+1].ko);}
  }
  await page.goto(base+'/concepts.html#text-counts');
  await page.reload();
  assert.equal(await page.locator('[data-tfidf-result="vector"]').textContent(),'[0.932, 0.362, 0.000]');
  await page.locator('[data-tfidf-doc]').selectOption({value:'1'});
  assert.deepEqual(errors,[]);
  const old=await page.locator('[data-tfidf-result="vector"]').textContent();
  await page.locator('[data-tfidf-bird]').focus();await page.keyboard.press('Space');
  assert.notEqual(await page.locator('[data-tfidf-result="vector"]').textContent(),old);
  const value=await page.locator('[data-tfidf-result="vector"]').textContent();
  await page.locator('#language').click();
  assert.match(await page.locator('#tfidf-title').textContent(),/word counts/);
  assert.equal(await page.locator('[data-tfidf-doc]').inputValue(),'1');assert.ok(await page.locator('[data-tfidf-bird]').isChecked());
  assert.equal(await page.locator('[data-tfidf-result="vector"]').textContent(),value);
  await page.locator('#library-navigation').evaluate(e=>{e.open=true});
  await page.locator('#concept-search').fill('vision transformer');
  assert.ok(await page.locator('#library-list a[href="#vision-transformer"]').count());
  for(const id of ['nonlinear-mlp','word-vectors','detection-models']){
   await page.goto(base+'/concepts.html#'+id);
   assert.ok(await page.locator('a[href^="https://github.com/"]').count());
  }
  assert.equal(await page.locator('[data-iou-result="iou"]').textContent(),'0.750');
  await page.locator('#iou-x').fill('5');assert.equal(await page.locator('[data-iou-result="iou"]').textContent(),'0.000');
  await page.locator('#iou-x').focus();await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('[data-iou-result="iou"]').textContent(),'0.167');
  await page.locator('#iou-threshold').fill('0.15');
  assert.equal(await page.locator('[data-iou-result="comparison"]').textContent(),'at or above threshold');
  await page.locator('#language').click();assert.equal(await page.locator('#iou-x').inputValue(),'4');
  assert.equal(await page.locator('#iou-threshold').inputValue(),'0.15');assert.match(await page.locator('[data-iou-result="comparison"]').textContent(),/기준 이상/);
  if(process.env.CONCEPT_SCREENSHOTS)await page.locator('.iou-lab').screenshot({path:`test-results/iou-${width}.png`});
  await page.locator('#language').click();
  for(const [id,query,example,exampleKo=example] of [
   ['pose-tracking','object tracking','5'],
   ['scene-reconstruction','novel views','(1,0,2)'],
   ['visual-question-answering','visual question answering','three balls in total and two red balls','전체 공은 3개, 빨간 공은 2개']
  ]){
   await page.locator('#library-navigation').evaluate(e=>{e.open=true});
   await page.locator('#concept-search').fill(query);
   const link=page.locator(`#library-list a[href="#${id}"]`);
   assert.equal(await link.count(),1);
   await link.click();
   await page.waitForFunction(title=>document.querySelector('h1')?.textContent===title,extendedConcepts.find(c=>c.id===id).en);
   await page.locator('.answer-guide summary').click();
   assert.ok((await page.locator('.example-card').innerText()).includes(example));
   if(id==='pose-tracking')assert.equal(await page.locator('a[href="https://arxiv.org/abs/1812.08008"]').count(),1);
   if(id==='scene-reconstruction')assert.equal(await page.locator('a[href="https://arxiv.org/abs/2308.04079"]').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   await page.locator('#language').click();
   await page.locator('.answer-guide summary').click();
   assert.ok((await page.locator('.example-card').innerText()).includes(exampleKo));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   await page.locator('#language').click();
  }
  await page.locator('#concept-search').fill('');
  for(const c of extendedConcepts){
   await page.goto(base+'/concepts.html#'+c.id);
   await page.waitForFunction(label=>document.querySelector('h1')?.textContent===label,c.en);
   assert.ok((await page.locator('.example-card').textContent()).length>20);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: TF-IDF and IoU, bilingual extended path, references, state, keyboard, search and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
