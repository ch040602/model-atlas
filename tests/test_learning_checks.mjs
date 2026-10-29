import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,readdirSync,readFileSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {concepts} from '../concepts-data.js';
import {conceptQuestions} from '../concept-prompts.js';
import {chapters} from '../curriculum.js';
import {conceptChecks,chapterChecks,conceptAnswerMarkup,interviewMarkup} from '../learning-checks.js';
import {practiceAnswers} from '../practice-answers.js';
import {convolutionExperiment} from '../convolution-lab.js';
import {lstmExample} from '../lstm-lab.js';
import {gruExample} from '../gru-lab.js';
import {sequenceExperiment} from '../sequence-lab.js';
import {embeddingExample} from '../embedding-lab.js';
import {conditioningExample} from '../diffusion-conditioning-lab.js';
import {retrieveExample} from '../rag-retrieval-lab.js';
import {ganModesExperiment} from '../gan-modes-lab.js';

assert.deepEqual(Object.keys(conceptQuestions).sort(),concepts.map(c=>c.id).sort());
assert.deepEqual(Object.keys(conceptChecks).sort(),concepts.map(c=>c.id).sort());
assert.deepEqual(Object.keys(chapterChecks).sort(),chapters.map(c=>c.id).sort());
for(const [id,data] of Object.entries({...conceptChecks,...chapterChecks})){
 for(const lang of ['ko','en']){
  assert.equal(data[lang].length,4,id);
  assert.ok(data[lang].every((s,i)=>typeof s==='string'&&s.length>(i===2?5:20)),`${id}/${lang}: complete authored answer`);
  assert.doesNotMatch(interviewMarkup(id,lang,!!chapterChecks[id]),/>undefined<|>NaN<|katex-error/);
  if(conceptChecks[id])assert.doesNotMatch(conceptAnswerMarkup(id,lang),/>undefined<|>NaN<|katex-error/);
 }
}
// Inventory is derived from existing lab sources, independently of the registry.
for(const file of readdirSync('.').filter(f=>/\.js$/.test(f)&&(/lab|training/.test(f)||['diffusion-cross-attention.js','linked-transformer-block.js'].includes(f)))){
 for(const [,id] of readFileSync(file,'utf8').matchAll(/<h2 id="([a-z-]+)"/g)){
  assert.ok(practiceAnswers[id],`${file}: missing answer guide for ${id}`);
 }
}
assert.equal(Object.keys(practiceAnswers).length,50);
for(const [id,data] of Object.entries(practiceAnswers))for(const lang of ['ko','en']){
 assert.equal(data[lang].length,3,id);assert.ok(data[lang].every(s=>s.length>20));
}
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
// Independently validate the numerical claims against the actual engines.
assert.deepEqual(convolutionExperiment(1,1,0).positions.map(p=>p.sum),[1,1,1,1]);
assert.deepEqual(convolutionExperiment(0,1,0).positions.map(p=>p.sum),[0,2,0,2]);
const lstm=lstmExample({previous:1,forgetLogit:0,inputLogit:0,outputLogit:0,candidateLogit:0});
near(lstm.c,.5);near(lstm.h,.23105857863000487);
near(gruExample({previous:1,resetLogit:0,updateLogit:0,inputTerm:0,recurrentTerm:0}).next,.5);
near(sequenceExperiment([1,0],.5,0).states[2],.3633994843890525,1e-8);
assert.deepEqual(embeddingExample('AB').map(x=>x.sum),[[1.1,.3],[-.2,1.4]]);
assert.deepEqual(embeddingExample('BA').map(x=>x.sum),[[.1,1.3],[.8,.4]]);
for(const p of [0,.5,1])for(const draw of [.1,.9]){
 const a=conditioningExample(p,draw,0),b=conditioningExample(p,draw,1);
 near(a.guided,a.empty);near(b.guided,b.conditioned);
 if(draw<p)near(a.gradB,0);
}
assert.equal(retrieveExample(0).selected.id,1);
assert.equal(retrieveExample(1).selected.id,2);
assert.equal(retrieveExample(2).selected,null);
near(ganModesExperiment(.5,.8).js,0);
near(ganModesExperiment(0,.8).loss,ganModesExperiment(1,.8).loss);
// Hand-derived examples used in the written explanations.
near(1-.1*2, .8);near((0-.1*(-2)-1)**2,.64);
near(Math.hypot(1.2,1.6),2);
near((.8*.35*.9)**(-1/3),1.583,0.001);
near((2*Math.exp(2)+6)/(Math.exp(2)+1),2.477,0.001);
for(const [x1,x2,y] of [[0,0,0],[0,1,1],[1,0,1],[1,1,0]])near(Math.max(0,x1+x2)-2*Math.max(0,x1+x2-1),y);

const root=path.resolve('.');
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course']){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[],seen=new Set();page.on('pageerror',e=>errors.push(e.message));
  const checkLayout=async label=>{
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: overflow`);
   assert.equal(await page.locator('.katex-error').count(),0,`${label}: math parse`);
   assert.equal(await page.locator('[data-interview]').count(),1);
   assert.equal(await page.locator('#interview-title').count(),1);
  };
  const openInterview=async id=>{
   const box=page.locator(`[data-interview="${id}"]`);
   for(const detail of await box.locator(':scope > details').all()){
    await detail.locator(':scope > summary').focus();await page.keyboard.press('Enter');
    assert.equal(await detail.evaluate(e=>e.open),true);
   }
   assert.ok((await box.innerText()).length>300);
  };
  for(const lang of ['ko','en']){
   await page.goto(`${base}${prefix}/index.html`);
   if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#language').click();
   for(const c of chapters){
    await page.locator(`#navigation [data-nav="${c.id}"]`).click();
    await page.locator(`[data-interview="${c.id}"]`).waitFor();
    const ids=await page.locator('#main .sequence-lab > h2').evaluateAll(nodes=>nodes.map(n=>n.id));
    for(const id of ids){assert.equal(await page.locator(`[data-practice-answer="${id}"]`).count(),1,`${id}: rendered once`);seen.add(id);}
    assert.equal(await page.locator(`[data-practice-answer="main-${c.id}"]`).count(),1);
    assert.equal(await page.locator('.practice-answer details[open]').count(),0,'answers start hidden');
    const first=page.locator('.practice-answer details').first();await first.locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await first.evaluate(e=>e.open),true,'keyboard reveal');
    await page.locator('#calculation-next').click();
    assert.equal(await first.evaluate(e=>e.open),true,'live updates keep answer disclosure');
    const slider=page.locator('#first-value');await slider.focus();await slider.press('ArrowRight');
    assert.ok((await page.locator('#first-result .answer-label').innerText()).includes(lang==='ko'?'정답':'answer'));
    await openInterview(c.id);await checkLayout(`${c.id}/${lang}/${width}/${prefix}`);
    assert.equal(await page.locator('iframe.lab-frame[src]').count(),0,'answer guides do not eager-load originals');
    if(c.resource)assert.equal(await page.locator(`[data-practice-answer="original-${c.id}"]`).count(),1);
    if(!prefix&&lang==='ko'&&c.id==='transformer')await page.locator('[data-interview]').screenshot({path:`test-results/interview-${width}.png`});
   }
   await page.goto(`${base}${prefix}/concepts.html?lang=${lang}`);
   // Concepts use stored language or query parameter; set visibly if needed.
   if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#language').click();
   for(const c of concepts){
    const nav=page.locator('#library-navigation');if(!await nav.evaluate(e=>e.open))await nav.locator(':scope > summary').click();
    // The first concept is already rendered; avoid racing a redundant hashchange.
    if(!await page.locator(`[data-concept-answer="${c.id}"]`).count())await page.locator(`#library-list a[href="#${c.id}"]`).click();
    await page.locator(`[data-concept-answer="${c.id}"]`).waitFor();
    const answer=page.locator(`[data-concept-answer="${c.id}"]`);
    assert.equal(await answer.evaluate(e=>e.open),false,'predict before revealing');
    assert.equal(await page.locator('.example-card > p').textContent(),conceptQuestions[c.id][lang==='ko'?0:1]);
    const explanation=await page.locator('.concept-explanation').boundingBox(),question=await page.locator('.example-card').boundingBox();
    if(width>=1440)assert.ok(question.x>=explanation.x+explanation.width-1,'question alongside explanation');
    else assert.ok(question.y>=explanation.y+explanation.height-1,'mobile question follows explanation');
    assert.equal(await page.locator('.concept-definition').count(),1,'formal definition remains available');
    await answer.locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await answer.evaluate(e=>e.open),true);
    assert.ok((await answer.innerText()).includes(conceptChecks[c.id][lang][0]),`${c.id}/${lang}: ${await answer.innerText()}`);
    for(const id of await page.locator('#main .sequence-lab > h2, #main .metric-lab > h2, #main .pca-lab > h2').evaluateAll(nodes=>nodes.map(n=>n.id))){
     assert.equal(await page.locator(`[data-practice-answer="${id}"]`).count(),1,`${id}: mounted`);seen.add(id);
    }
    // Include lab layouts with distinct class names in coverage.
    for(const id of await page.locator('[data-practice-answer]').evaluateAll(nodes=>nodes.map(n=>n.dataset.practiceAnswer)))seen.add(id);
    await openInterview(c.id);await checkLayout(`${c.id}/${lang}/${width}/${prefix}`);
    if(!prefix&&lang==='ko'&&c.id==='gradient')await answer.screenshot({path:`test-results/answer-${width}.png`});
   }
  }
  assert.deepEqual([...seen].sort(),Object.keys(practiceAnswers).sort(),'every registered lab actually renders with its guide');
  await page.goto(`${base}${prefix}/index.html?lang=en&section=interview-title#transformer`);
  await page.waitForFunction(()=>document.activeElement?.id==='interview-title');
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS: answers/interviews, 50 labs, 47 concepts, six units; KO/EN ${width}px ${prefix||'root'}`);
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
