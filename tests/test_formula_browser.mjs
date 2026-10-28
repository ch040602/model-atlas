import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {formulaDefaults,formulaWalkthrough,num,vec,scaleComparison} from '../formula-model.js';
import {formulaOriginalURL} from '../formula-walkthrough.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course']){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${prefix}/`);
  for(const lang of ['ko','en']){
   if(lang==='en')await page.locator('#language').click();
   for(const kind of ['cnn','rnn','transformer']){
    await page.locator(`#navigation [data-nav="${kind}"]`).click();
    const mainField=kind==='cnn'?'strength':kind==='rnn'?'x2':'x1';
    await page.locator('#architecture-input').fill(String(formulaDefaults[kind][mainField]));
    const m=formulaWalkthrough(kind,formulaDefaults[kind],lang);
    assert.equal(await page.locator('#formula-select option').count(),m.steps.length);
    await page.locator('[data-formula-action="reset"]').click();
    assert.equal(await page.locator('[data-formula-action="previous"]').isDisabled(),true);
    // Actually advance through every operation in both languages and layouts.
    for(const [i,s] of m.steps.entries()){
     if(i)await page.locator('[data-formula-action="next"]').click();
     assert.equal(await page.locator('#formula-output [data-formula-id]').getAttribute('data-formula-id'),s.id);
     assert.equal(await page.locator('.formula-result output').getAttribute('data-result'),s.result);
     // Check the rendered mathematical numbers and signs as well as the source
     // snapshot; KaTeX's HTML + accessible MathML intentionally duplicate text.
     const resultMath=page.locator('.formula-result math');
     const numbers=(await resultMath.locator('mn').allTextContents()).map(Number).sort((a,b)=>a-b);
     const numericSource=s.result.replace(/[₀-₉]/g,c=>String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));
     const expectedNumbers=[...numericSource.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0])).sort((a,b)=>a-b);
     assert.deepEqual(numbers,expectedNumbers,`${kind}/${s.id}: typeset result values`);
     assert.equal(((await resultMath.locator('mo').allTextContents()).join('').match(/[−-]/g)||[]).length,(s.result.match(/[−-]/g)||[]).length,`${kind}/${s.id}: negative signs`);
     assert.equal(await page.locator('.formula-result .katex-html').count(),1);
     assert.equal(await page.locator('#formula-history > li').count(),i+1);
     assert.equal(await page.locator('#formula-status').textContent(),`${i+1} / ${m.steps.length}`);
     assert.equal(await page.locator('.formula-carry [data-formula-jump]').count(),s.sources.length);
     assert.equal(await page.locator('[data-architecture-step][aria-pressed="true"]').getAttribute('data-architecture-step'),String(s.group));
     assert.equal(await page.locator('.formula-symbols dt').count(),s.symbols.length);
    }
    assert.equal(await page.locator('[data-formula-action="next"]').isDisabled(),true);
    assert.equal(await page.locator('#formula-complete details').evaluate(e=>e.open),true);
    assert.ok((await page.locator('#formula-history').textContent()).includes(m.steps[0].title));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    await page.locator('[data-formula-action="previous"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.formulaAction),'previous');
    // A dependency link must point at its real producer and move keyboard focus.
    const dep=m.steps.at(-2).sources[0];
    await page.locator('.formula-carry [data-formula-jump]').first().click();
    assert.equal(await page.locator('#formula-select').inputValue(),String(dep));
    assert.equal(await page.evaluate(()=>document.activeElement.id),'formula-current-title');
    // Keep an arbitrary selected operation when a shared control changes.
    const chosen=kind==='cnn'?12:kind==='rnn'?10:11;
    await page.locator('#formula-select').selectOption(String(chosen));
    await page.locator('#architecture-input').fill('0.4');
    const values={...formulaDefaults[kind],[kind==='cnn'?'strength':kind==='rnn'?'x2':'x1']:0.4};
    const changed=formulaWalkthrough(kind,values,lang);
    assert.equal(await page.locator('#formula-select').inputValue(),String(chosen));
    assert.equal(await page.locator('.formula-result output').getAttribute('data-result'),changed.steps[chosen].result);
    if(kind==='transformer'){
     await page.locator('#formula-dimension').fill('64');
     assert.equal(await page.locator('#formula-dimension-value').textContent(),'64');
     assert.ok(await page.locator('#formula-scale-result [data-math-source]').last().getAttribute('data-math-source')===vec(scaleComparison(64).weights));
     assert.equal(await page.locator('.formula-result output').getAttribute('data-result'),changed.steps[chosen].result,'comparison never changes the actual head');
    }
    // Real popup, preserved step/values, reload, language toggle and live inputs.
    const popupReady=page.waitForEvent('popup');await page.locator('#formula-full').click();const popup=await popupReady;
    popup.on('pageerror',e=>errors.push(e.message));await popup.locator('#formula-select').waitFor();
    assert.ok(new URL(popup.url()).pathname.startsWith(prefix+'/formulas.html'));
    assert.equal(await popup.locator('#formula-select').inputValue(),String(chosen));
    assert.equal(await popup.locator('.formula-result output').getAttribute('data-result'),changed.steps[chosen].result);
    await popup.reload();await popup.locator('#formula-output .formula-result').waitFor();
    assert.equal(await popup.locator('#formula-select').inputValue(),String(chosen));
    await popup.locator('[data-formula-language]').click();
    assert.equal(await popup.locator('.formula-result output').getAttribute('data-result'),changed.steps[chosen].result);
    assert.equal(await popup.locator('#formula-select').inputValue(),String(chosen));
    const field=kind==='cnn'?'strength':kind==='rnn'?'x2':'x1';await popup.locator(`[data-formula-value="${field}"]`).fill('0.7');values[field]=0.7;
    assert.equal(await popup.locator('.formula-result output').getAttribute('data-result'),formulaWalkthrough(kind,values).steps[chosen].result);
    if(kind==='transformer'){
     await popup.locator('[data-formula-activation]').selectOption('relu');
     const last=changed.steps.length-1;await popup.locator('#formula-select').selectOption(String(last));
     assert.equal(await popup.locator('.formula-result output').getAttribute('data-result'),formulaWalkthrough(kind,{...values,activation:'relu'}).steps[last].result);
    }
    assert.ok(await popup.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    await popup.close();
    // Verify actual upstream article anchors rather than substituting a dummy.
    if(width===1440&&prefix===''&&lang==='ko'&&kind!=='rnn'){
     const originalReady=page.waitForEvent('popup');await page.locator('[data-formula-original]').click();const original=await originalReady;
     const anchor=changed.steps[chosen].anchor;await original.locator(`#${anchor}`).waitFor({state:'visible',timeout:45000});
     assert.equal(new URL(original.url()).hash,'#'+anchor);
     await original.locator('.atlas-formula-reference').waitFor({state:'visible'});
     assert.ok(await original.locator('.atlas-formula-reference [data-math-source]').last().getAttribute('data-math-source')===changed.steps[chosen].result);
     assert.ok((await original.locator('.atlas-formula-reference').innerText()).includes(changed.steps[chosen].title));
     await original.waitForFunction(id=>{const e=document.getElementById(id),r=e?.getBoundingClientRect();return r&&r.top>=0&&r.top<innerHeight&&r.bottom>0;},anchor,{timeout:15000});
     const bounds=await original.locator(`#${anchor}`).evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,height:innerHeight}));
     assert.ok(bounds.top<bounds.height&&bounds.bottom>0,`${kind}: article anchor should be on screen: ${JSON.stringify(bounds)}`);
     await original.screenshot({path:`test-results/formula-original-${kind}.png`});await original.close();
    }
    if(prefix===''&&lang==='ko'){
     await page.locator('#formula-journey').scrollIntoViewIfNeeded();
     await page.locator('#formula-current-title').scrollIntoViewIfNeeded();
     await page.screenshot({path:`test-results/formula-${kind}-${width}.png`,fullPage:false});
    }
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 // The original's read-along card also works on a narrow screen under a prefix.
 for(const kind of ['cnn','transformer']){
  const page=await browser.newPage({viewport:{width:390,height:900}}),step=kind==='cnn'?12:11;
  const model=formulaWalkthrough(kind,formulaDefaults[kind],'en'),s=model.steps[step];
  await page.goto(`${base}/course/`+formulaOriginalURL(kind,'en',s.anchor,formulaDefaults[kind],step));
  const card=page.locator('.atlas-formula-reference');await card.waitFor({state:'visible'});
  assert.equal(await card.locator('details').evaluate(e=>e.open),false);
  await card.locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await card.locator('details').evaluate(e=>e.open),true);
  assert.ok(await card.locator('[data-math-source]').last().getAttribute('data-math-source')===s.result);
  assert.ok(await card.evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
  const nextReady=page.waitForEvent('popup');await card.locator('a').click();const next=await nextReady;
  await next.locator('#formula-select').waitFor();
  assert.ok(new URL(next.url()).pathname.startsWith('/course/formulas.html'));
  assert.equal(await next.locator('#formula-select').inputValue(),String(step));await next.close();
  await page.screenshot({path:`test-results/formula-original-${kind}-390-en.png`});
  await card.locator('[data-formula-reference-close]').click();assert.equal(await card.count(),0);await page.close();
 }
 // Hostile or invalid parameters must not be interpreted as HTML or NaN.
 const page=await browser.newPage();await page.goto(`${base}/formulas.html?model=__proto__&step=NaN&x1=Infinity&lang=%22%3E%3Cscript%3Ebad`);
 await page.locator('#formula-select').waitFor();assert.equal(await page.locator('#formula-select').inputValue(),'0');
 assert.ok(!(await page.locator('#formula-page').innerHTML()).includes('<script>bad'));await page.close();
 console.log('PASS: every operation, dependencies, growing history, linked diagrams/inputs, keyboard, scaling, real full-window pages and original article anchors; ko/en, 390/1440, root/prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
