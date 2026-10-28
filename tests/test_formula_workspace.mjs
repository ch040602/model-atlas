import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {formulaDefaults,formulaWalkthrough} from '../formula-model.js';
import {mathConcepts,conceptsForStep} from '../concept-help.js';
import {stepTex} from '../formula-tex.js';
import {mathMarkup} from '../math-render.js';

for(const concept of Object.values(mathConcepts)){
 assert.equal(concept.name.length,2);assert.equal(concept.text.length,2);assert.equal(concept.example.length,2);
 assert.doesNotMatch(mathMarkup(concept.tex),/katex-error|undefined/);
}
for(const [kind,values] of Object.entries(formulaDefaults))for(const step of formulaWalkthrough(kind,values).steps){
 for(const id of conceptsForStep(kind,step,stepTex(kind,step).equation))assert.ok(mathConcepts[id]);
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
  for(const kind of ['cnn','rnn','transformer']){
   const model=formulaWalkthrough(kind,formulaDefaults[kind],lang);
   const index=model.steps.findIndex(s=>s.id===(kind==='cnn'?'relu':kind==='rnn'?'tanh-1':'scale'));
   await page.goto(`${base}${prefix}/formulas.html?model=${kind}&lang=${lang}&step=${index}`);
   const left=page.locator('.formula-explanation'),right=page.locator('.formula-equations');
   await page.locator('#formula-current-title').waitFor();await page.evaluate(()=>document.fonts.ready);
   let l=await left.boundingBox(),r=await right.boundingBox();
   if(width>1000)assert.ok(l.x+l.width<r.x,'explanation is left of equations');else assert.ok(l.y+l.height<=r.y,'mobile stacks explanation before equations');
   assert.equal(await page.locator('[data-explanation-id]').getAttribute('data-explanation-id'),model.steps[index].id);
   assert.equal(await page.locator('[data-formula-id]').getAttribute('data-formula-id'),model.steps[index].id);
   await page.locator('[data-formula-action=next]').click();
   assert.equal(await page.locator('[data-explanation-id]').getAttribute('data-explanation-id'),model.steps[index+1].id);
   assert.equal(await page.locator('[data-formula-id]').getAttribute('data-formula-id'),model.steps[index+1].id);
   assert.equal(await page.locator('.formula-result output').getAttribute('data-result'),model.steps[index+1].result);
   await page.locator('#formula-select').selectOption(String(index));
   const concept=kind==='cnn'?'relu':kind==='rnn'?'tanh':'keydim';
   const chip=page.locator(`.formula-active [data-concept=${concept}]`),popup=page.locator('#atlas-concept-popover');
   await chip.focus();await page.waitForFunction(()=>document.querySelector('#atlas-concept-popover').matches(':popover-open'));
   assert.equal(await popup.getAttribute('data-concept-id'),concept);assert.equal(await popup.getAttribute('lang'),lang);
   assert.equal(await chip.getAttribute('aria-describedby'),'atlas-concept-popover');
   assert.equal(await popup.locator('.katex').count(),1);
   assert.ok((await popup.textContent()).includes(mathConcepts[concept].text[lang==='ko'?0:1]));
   const bounds=await popup.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=1001,'popover fits viewport');
   await page.keyboard.press('Escape');assert.equal(await popup.isVisible(),false,`${width}/${prefix}/${lang}/${kind}: Escape dismisses concept help`);
   await page.waitForTimeout(180);assert.equal(await popup.isVisible(),false,'stationary pointer must not reopen a formula exposed by Escape');
   assert.equal(await chip.getAttribute('aria-expanded'),'false');
   // Operators in the visual KaTeX tree have hover help; no focusable content is
   // inserted into that aria-hidden branch. Its accessible MathML stays intact.
   const marker=page.locator(`.formula-equation [data-math-concept=${concept}]`).first();
   await marker.hover();await page.waitForFunction(()=>document.querySelector('#atlas-concept-popover').matches(':popover-open'));
   assert.equal(await popup.getAttribute('data-concept-id'),concept);
   await popup.hover();await page.waitForTimeout(220);assert.equal(await popup.isVisible(),true,'moving into the card keeps it open');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.katex-html :is(button,a,[tabindex])').count(),0);
   // Click pins the card. Clicking elsewhere or rerendering dismisses it.
   await chip.click();assert.equal(await popup.isVisible(),true);
   await page.mouse.move(width-2,2);await page.waitForTimeout(220);assert.equal(await popup.isVisible(),true);
   await page.locator('#formula-current-title').click();assert.equal(await popup.isVisible(),false);
   await chip.focus();await page.locator('[data-formula-action=next]').click();assert.equal(await popup.isVisible(),false);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   if(prefix===''&&lang==='ko'&&kind==='transformer'){
    await page.locator('#formula-select').selectOption(String(index));await page.locator('.formula-workspace').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-24));
    await page.screenshot({path:`test-results/workspace-standalone-${width}.png`});
    await page.locator('.formula-active [data-concept=keydim]').click();
    await page.screenshot({path:`test-results/workspace-help-${width}.png`});await page.keyboard.press('Escape');
   }
  }
  // Course mode uses the same reader, including full-window state.
  await page.goto(`${base}${prefix}/?lang=${lang}#cnn`);
  // The course locale comes from storage, not a query argument.
  if(await page.evaluate(()=>document.documentElement.lang)!==lang)await page.locator('#language').click();
  await page.locator('#formula-select').selectOption('9');
  const l=await page.locator('.formula-explanation').boundingBox(),r=await page.locator('.formula-equations').boundingBox();
  if(width>1000)assert.ok(l.x+l.width<r.x);else assert.ok(l.y+l.height<=r.y);
  const full=await page.locator('#formula-full').getAttribute('href');assert.ok(full.includes(`lang=${lang}`)&&full.includes('step=9'));
  assert.equal(await page.locator('#formula-full').getAttribute('target'),'_blank');
  assert.equal(await page.locator('[data-formula-original]').getAttribute('target'),'_blank');
  const style=await page.locator('[data-formula-action=next]').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,radius:getComputedStyle(e).borderRadius,height:e.getBoundingClientRect().height}));
  assert.equal(style.bg,'rgb(0, 100, 224)');assert.equal(style.radius,'100px');assert.ok(style.height>=44);
  if(prefix===''&&lang==='ko'){
   await page.locator('.formula-workspace').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-96));await page.screenshot({path:`test-results/workspace-course-${width}.png`});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 // Actual touch events, rather than only desktop clicks on a narrow viewport.
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await touch.goto(`${base}/formulas.html?model=cnn&lang=ko&step=9`);
 const chip=touch.locator('.formula-active [data-concept=relu]');
 await chip.tap();assert.equal(await touch.locator('#atlas-concept-popover').isVisible(),true);
 await touch.locator('#formula-current-title').tap();assert.equal(await touch.locator('#atlas-concept-popover').isVisible(),false);
 await touch.close();
 console.log('PASS: synchronized left/right and mobile readers, 25 bilingual concept cards, actual math hover, focus, Escape, pin/outside/rerender dismissal, touch, unclipped popovers, full-window state, Meta palette/actions, root/prefix and both languages');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
