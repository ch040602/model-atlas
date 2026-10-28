import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,readFileSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {formulaDefaults,formulaWalkthrough} from '../formula-model.js';
import {stepTex,summaryTex,textMath} from '../formula-tex.js';
import {mathMarkup} from '../math-render.js';
import {formulaStepContent} from '../formula-walkthrough.js';
import {architectureDetail,architectureModel} from '../architecture-map.js';

// Every authored equation and every dynamic presentation must parse strictly,
// including negative states and both selectable Transformer activations.
let cases=0;
for(const kind of Object.keys(formulaDefaults))for(const lang of ['ko','en']){
 const variations=[formulaDefaults[kind],{...formulaDefaults[kind],center:-0.7,strength:0,bias:-0.4,x1:-1.2,x2:0.5,x3:-0.8,weight:-0.7,gamma:-1,beta:0.3,activation:'relu'}, {...formulaDefaults[kind],x1:0,x2:0,gamma:0,beta:0}];
 for(const v of variations){
  const model=formulaWalkthrough(kind,v,lang);
  for(const [i,s] of model.steps.entries()){
   for(const [field,tex] of Object.entries(stepTex(kind,s))){
    assert.ok(!tex.includes('/'),`${kind}/${s.id}/${field}: slash left in math`);
    assert.doesNotMatch(mathMarkup(tex),/katex-error|undefined|NaN/);
   }
   assert.doesNotMatch(formulaStepContent(kind,v,lang,i),/katex-error|undefined|NaN/);cases++;
  }
  for(const tex of summaryTex(kind,model))assert.doesNotMatch(mathMarkup(tex),/katex-error|undefined/);
  for(let i=0;i<architectureModel(kind,v,lang).names.length;i++)assert.doesNotMatch(architectureDetail(kind,lang,v,i),/katex-error|undefined/);
 }
}
assert.equal(textMath('4.000 / (2×2)'),String.raw`\frac{4.000}{2\times 2}`);
assert.equal(textMath('√(2/π)'),String.raw`\sqrt{\frac{2}{\pi }}`);
assert.equal(textMath('1−-0.500²'),String.raw`1-(-0.500)^{2}`,'square the negative state before subtracting');

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// The vendored files retain the exact installed version and font notices.
for(const [local,upstream] of [['katex.js','katex.mjs'],['katex.min.css','katex.min.css']]){
 assert.deepEqual(readFileSync(path.join(root,'vendor/katex',local)),readFileSync(path.join(root,'upstream/transformer-explainer/node_modules/katex/dist',upstream)));
}
assert.ok(readFileSync(path.join(root,'vendor/katex/fonts/OFL.txt'),'utf8').includes('Reserved Font Name'));
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
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[],fonts=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(/vendor\/katex/.test(r.url())){if(r.status()!==200)failed.push(r.url());if(/\.woff2$/.test(r.url()))fonts.push(r.url());}});
  // No renderer, stylesheet or font may depend on a remote service.
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  for(const [kind,id] of [['cnn','pool-divide'],['rnn','shared-gradient'],['transformer','scale']]){
   const model=formulaWalkthrough(kind,formulaDefaults[kind],lang),index=model.steps.findIndex(s=>s.id===id);
   await page.goto(`${base}${prefix}/formulas.html?model=${kind}&lang=${lang}&step=${index}`);
   const equation=page.locator('.formula-equation');await equation.locator('.katex').waitFor();await page.evaluate(()=>document.fonts.ready);
   assert.equal(await equation.locator('math').count(),1);
   assert.equal(await equation.locator('.katex-html[aria-hidden="true"]').count(),1);
   assert.equal(await page.locator('.katex-error').count(),0);
   const fraction=equation.locator('.katex-html .mfrac').first();assert.ok(await fraction.isVisible());
   const geometry=await fraction.evaluate(e=>{
    const rows=[...e.querySelector('.vlist').children],line=rows.find(s=>s.querySelector('.frac-line'));
    const values=rows.filter(s=>!s.querySelector('.frac-line')&&s.textContent.trim());
    return {line:line.getBoundingClientRect().top,rows:values.map(s=>({text:s.textContent,top:s.getBoundingClientRect().top}))};
   });
   assert.ok(geometry.rows.some(r=>r.top<geometry.line),'numerator is above fraction rule');
   assert.ok(geometry.rows.some(r=>r.top>geometry.line),'denominator is below fraction rule');
   if(kind==='transformer'){
    assert.equal(await equation.locator('math mfrac > msqrt').count(),1,'root is in the denominator');
    await page.locator('#formula-dimension').fill('64');
    assert.ok((await page.locator('#formula-scale-result annotation').last().textContent()).includes('\\sqrt{64}'));
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   if(prefix===''&&lang==='ko'){
    await page.evaluate(()=>window.scrollTo(0,document.querySelector('#formula-output').getBoundingClientRect().top+scrollY-12));
    await page.screenshot({path:`test-results/math-${kind}-${width}.png`});
   }
   // Final summaries contain wider expressions: keep them readable by scrolling
   // the equation, rather than causing the whole mobile page to overflow.
   await page.locator('#formula-select').selectOption(String(model.steps.length-1));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   assert.ok(await page.locator('#formula-complete .katex').count()>=3);
   if(kind==='transformer'){
    await page.locator('[data-formula-activation]').selectOption('relu');
    await page.locator('#formula-select').selectOption('30');
    assert.match(await page.locator('.formula-equation annotation').textContent(),/ReLU/);
   }
  }
  assert.ok(fonts.length>0,'real local fonts loaded');assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);await page.close();
 }
 console.log(`PASS: ${cases} bilingual/default/negative/zero/activation presentations, strict TeX, unchanged vendored assets, visible stacked fractions and root denominators, local fonts with remote requests blocked, summaries, 390/1440 and root/prefix`);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
