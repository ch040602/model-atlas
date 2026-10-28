import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {gradientDirection,gradientPresets,gradientLabOutput} from '../gradient-direction-lab.js';
import {formulaDetails,formulaDetailMarkup,detailsForStep} from '../formula-details.js';
import {formulaDefaults,formulaWalkthrough} from '../formula-model.js';
import {formulaExplanationContent} from '../formula-walkthrough.js';
import {formulaDerivations} from '../formula-derivations.js';

const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let cases=0;
// Independently differentiate and evaluate the loss; include η=0, 0.5, 1 and >1.
for(let iw=-30;iw<=30;iw+=2)for(let iy=-20;iy<=20;iy+=2)for(let ir=0;ir<=30;ir++){
 const v={w:iw/10,y:iy/10,rate:ir/20},r=gradientDirection(v),loss=w=>(w-v.y)**2,eps=1e-5;
 near(r.g,(loss(v.w+eps)-loss(v.w-eps))/(2*eps));
 near(r.downLoss,loss(r.down));near(r.upLoss,loss(r.up));near(r.downLoss,r.loss*r.ratio);
 near(r.downLoss-r.loss,r.linearChange+(v.rate*r.g)**2);
 near(r.upLoss,r.loss*(1+2*v.rate)**2);
 if(r.loss>1e-10&&v.rate>0&&v.rate<1)assert.ok(r.downLoss<r.loss);
 if(r.loss>1e-10&&v.rate>1)assert.ok(r.downLoss>r.loss);
 cases++;
}
for(const lang of ['ko','en']){
 assert.deepEqual(Object.keys(formulaDetails),Object.keys(formulaDerivations));
 for(const key of Object.keys(formulaDetails))assert.doesNotMatch(formulaDetailMarkup([key],lang,true),/katex-error|>undefined<|\bNaN\b/);
 for(const [kind,v] of Object.entries(formulaDefaults))for(const [index,step] of formulaWalkthrough(kind,v,lang).steps.entries()){
  assert.ok(detailsForStep(kind,step.id).every(id=>formulaDetails[id]));
  assert.match(formulaExplanationContent(kind,v,lang,index),/data-math-detail=/);
 }
 for(const v of Object.values(gradientPresets))assert.doesNotMatch(gradientLabOutput(v,lang,5),/katex-error|>undefined<|\bNaN\b/);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined)});
 mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course'])for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await page.goto(`${base}${prefix}/index.html?lang=${lang}&section=gradient-direction-title#foundation`);
  await page.locator('#gradient-direction-output > ol > li').waitFor();
  assert.equal(await page.locator('#gradient-direction-output > ol > li').count(),1);
  for(let i=0;i<4;i++)await page.locator('[data-gradient-stage=next]').click();
  assert.equal(await page.locator('#gradient-direction-output > ol > li').count(),5);
  assert.equal(await page.locator('[data-gradient-stage=next]').isDisabled(),true);
  for(const [preset,v] of Object.entries(gradientPresets)){
   await page.locator(`[data-gradient-preset=${preset}]`).click();
   const r=gradientDirection(v);
   for(const [key,w,loss] of [['original',v.w,r.loss],['subtract',r.down,r.downLoss],['add',r.up,r.upLoss]]){
    const el=page.locator(`[data-gradient-result=${key}]`);
    near(Number(await el.getAttribute('data-weight')),w);near(Number(await el.getAttribute('data-loss')),loss);
   }
  }
  await page.locator('#gradient-rate').focus();await page.keyboard.press('Home');
  near(Number(await page.locator('[data-gradient-result=subtract]').getAttribute('data-loss')),1);
  await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#gradient-rate').inputValue(),'0.05');
  // Language rerender keeps values and revealed stage; navigation returns to this experiment.
  await page.locator('#language').click();assert.equal(await page.locator('#gradient-rate').inputValue(),'0.05');
  assert.equal(await page.locator('#gradient-direction-output > ol > li').count(),5);
  await page.locator('#language').click();
  assert.equal(await page.locator('.katex-error').count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
  if(!prefix&&lang==='ko')await page.locator('.gradient-direction-lab').screenshot({path:`test-results/gradient-${width}.png`});
  for(const [kind,id,key] of [['cnn','update','descent'],['rnn','shared-gradient','bptt'],['transformer','scale','scale']]){
   const index=formulaWalkthrough(kind,formulaDefaults[kind],lang).steps.findIndex(s=>s.id===id);
   await page.goto(`${base}${prefix}/formulas.html?model=${kind}&lang=${lang}&step=${index}`);
   await page.locator(`[data-explanation-id=${id}] [data-math-detail=${key}]`).waitFor();
   assert.equal(await page.locator(`[data-math-detail=${key}]`).getAttribute('open'),'');
   assert.equal(await page.locator('.katex-error').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  for(const [kind,key] of [['diffusion','denoise'],['gan','adversarial']]){
   await page.goto(`${base}${prefix}/index.html?lang=${lang}#${kind}`);
   const details=page.locator(`[data-math-detail=${key}]`);await details.locator(':scope > summary').click();
   const derivation=details.locator('.derivation-steps');await derivation.locator(':scope > summary').click();
   assert.equal(await derivation.locator('li').count(),3);
   assert.equal(await details.getAttribute('open'),'');assert.ok(await details.locator('.katex').count()>0);
   assert.equal(await page.locator('.katex-error').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log(`PASS: ${cases} independent gradient/loss cases; bilingual detail coverage of 82 operations; gradient signs, zero, overshoot, exact bounds, staged controls, keyboard, retained state and five models at 390/1440px, root/prefix`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
