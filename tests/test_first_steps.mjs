import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {firstExperiment,firstStepsMarkup} from '../first-steps.js';
import {mathHelpMarkup,topicMath} from '../math-help.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const kinds=['foundation','cnn','rnn','diffusion','transformer','gan'];
// Independent checks of the claims learners can investigate, not just HTML snapshots.
for(let i=0;i<=16;i++){
 const w=i/4,f=firstExperiment('foundation',w);
 near(f.loss,(2*w-6)**2);near(firstExperiment('foundation',w+.25).prediction-f.prediction,.5);
}
near(firstExperiment('foundation',3).loss,0);
for(let i=0;i<=8;i++){
 const w=i/4,c=firstExperiment('cnn',w);
 near(firstExperiment('cnn',w+.25).response-c.response,.75);
 assert.ok(c.activation>=0);if(c.response<=0)near(c.activation,0);
}
near(firstExperiment('cnn',1).response,2);near(firstExperiment('cnn',1).flat,0);
near(firstExperiment('rnn',0).last,0);
let previous=-Infinity;
for(let i=0;i<=10;i++){
 const r=firstExperiment('rnn',i/10);assert.ok(r.last>previous);previous=r.last;
 assert.ok(r.last<r.first);near(r.reversed,Math.tanh(1));
}
near(firstExperiment('diffusion',-1).clean,2);near(firstExperiment('diffusion',-1).loss,0);
for(let i=0;i<=8;i++){
 const e=-2+i/4,d=firstExperiment('diffusion',e);
 near(firstExperiment('diffusion',e+.25).clean-d.clean,-.1875);
 near((d.clean-2)**2,.75**2*d.loss);
}
near(firstExperiment('transformer',0).mixed,4);
previous=Infinity;
for(let i=0;i<=16;i++){
 const raw=-4+i/2,t=firstExperiment('transformer',raw);
 assert.ok(t.mixed<previous);previous=t.mixed;
 assert.ok(t.mixed>2&&t.mixed<6);near(t.weight/(1-t.weight),Math.exp(raw/2));
}
for(let i=0;i<=16;i++){
 const a=-2+i/4,g=firstExperiment('gan',a),loss=x=>Math.log1p(Math.exp(-a*x)),h=1e-5;
 assert.ok(Math.abs(g.gradient-(loss(h)-loss(-h))/(2*h))<1e-8);
 assert.ok(loss(g.next)<=loss(0));assert.ok(g.score>=.5);
}
for(const lang of ['ko','en']){
 for(const kind of kinds)assert.doesNotMatch(firstStepsMarkup(kind,lang),/katex-error|NaN|undefined/);
 for(const keys of Object.values(topicMath))assert.doesNotMatch(mathHelpMarkup(keys,lang),/katex-error|NaN|undefined/);
}

const root=path.resolve('.'),server=createServer(async(req,res)=>{try{
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
  const page=await browser.newPage({viewport:{width,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+prefix+'/');
  for(const lang of ['ko','en']){
   if(lang==='en')await page.locator('#language').click();
   for(const kind of kinds){
    await page.locator(`#navigation [data-nav="${kind}"]`).click();
    const first=page.locator('.first-steps');await first.waitFor();
    const lesson=await first.locator('.first-lesson').boundingBox(),experiment=await first.locator('.first-try').boundingBox();
    if(width>=1440){
     assert.ok(experiment.x>=lesson.x+lesson.width-1,'experiment alongside explanation');
     const main=await page.locator('#main').boundingBox();
     assert.ok(experiment.y-main.y<700,'experiment is reachable without a long introductory scroll');
    }else assert.ok(experiment.y>=lesson.y+lesson.height-1,'mobile experiment follows explanation');
    assert.ok(Number.parseFloat(await first.locator('.first-lesson > p').first().evaluate(e=>getComputedStyle(e).fontSize))>=14,'retain readable body text');
    assert.equal(await first.locator('.first-step').count(),4);
    for(const detail of await first.locator('.first-step').all()){
     if(!await detail.evaluate(e=>e.open)){await detail.locator('summary').focus();await page.keyboard.press('Enter');}
     assert.ok(await detail.locator('.katex').count()>0);
    }
    await first.locator('.first-check summary').focus();await page.keyboard.press('Enter');
    assert.ok((await first.locator('.first-check details p').innerText()).length>80);
    const math=first.locator('.math-help');await math.locator(':scope > summary').click();
    for(const detail of await math.locator(':scope > details').all()){
     await detail.locator(':scope > summary').click();assert.ok(await detail.locator('.katex').count()>0);
    }
    const slider=first.locator('#first-value');await slider.focus();await page.keyboard.press('Home');
    const min=Number(await slider.getAttribute('min'));
    assert.equal(await first.locator('#first-value-label').textContent(),String(min));
    assert.deepEqual(await first.locator('#first-result .atlas-math').evaluateAll(es=>es.map(e=>e.dataset.mathSource)),firstExperiment(kind,min).tex.split(/,?\\qquad\s*/));
    await page.keyboard.press('ArrowRight');const saved=await slider.inputValue();
    await page.locator('#language').click();assert.equal(await slider.inputValue(),saved);
    await page.locator('#language').click();assert.equal(await slider.inputValue(),saved);
    await page.locator(`#navigation [data-nav="${kind==='foundation'?'cnn':'foundation'}"]`).click();
    await page.locator(`#navigation [data-nav="${kind}"]`).click();assert.equal(await slider.inputValue(),saved);
    if(!prefix&&lang==='ko'&&['foundation','transformer'].includes(kind)){
     await first.locator('.first-step').nth(1).locator('summary').click();
     await first.screenshot({path:`test-results/first-${kind}-${width}.png`});
    }
    const next=first.locator('.first-next'),target=await next.getAttribute('data-unit-jump');
    await next.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),target);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await page.locator('.katex-error').count(),0);
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: six numerical introductory experiments; 24 bilingual steps; math help, keyboard, retained values, onward links, 390/1440px and root/prefix');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
