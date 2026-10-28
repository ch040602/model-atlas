import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vectors=JSON.parse(await readFile(path.join(root,'upstream/diffusion-explainer/assets/json/text_vector.json'),'utf8'));
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
async function choose(page,index){await page.locator('#dropdown-button-container').focus();await page.keyboard.press('Enter');await page.locator(`#prompt-selector-dropdown-option-${index}`).focus();await page.keyboard.press('Enter');}
async function values(page){return page.locator('.text-vector-generator-l2-vector-cell:not(.text-vector-generator-l2-vector-cell-last)').allTextContents();}
async function verifyValues(page){const prompt=await page.evaluate(()=>window.selectedPrompt);assert.ok(vectors[prompt],prompt);assert.deepEqual(await values(page),vectors[prompt].slice(0,3).flatMap(row=>row.slice(0,3).map(v=>v.toFixed(2))));}
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const lang of ['ko','en'])for(const width of [390,1600]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${origin}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.umapData && document.querySelector('#model-atlas-text-vector-status')?.textContent.includes(window.modelAtlasHtml('loaded','불러왔습니다')));
  const note=page.locator('#model-atlas-text-vector-note');assert.ok(await note.isHidden());
  if(await page.evaluate(()=>window.playing))await page.locator('#controller-button-play-container').click();
  await page.locator('#text-vector-generator-container').focus();await page.keyboard.press('Enter');await note.waitFor({state:'visible'});
  assert.match(await note.innerText(),lang==='ko'?/대응은 확인되지 않았습니다/ : /alignment with CLIP tokens is not verified/);
  assert.match(await note.innerText(),lang==='ko'?/인코더를 실행하지 않습니다/ : /encoder is not run here/);
  await verifyValues(page);
  for(const index of [1,8,12]){await choose(page,index);await page.waitForFunction(()=>document.querySelector('#model-atlas-text-vector-status').textContent.includes(window.modelAtlasHtml('loaded','불러왔습니다')));await verifyValues(page);assert.ok(await note.isVisible());}
  const bounds=await page.evaluate(()=>{const a=document.querySelector('#model-atlas-text-vector-note'),b=document.querySelector('#architecture-wrapper'),m=document.querySelector('#main');return {top:a.getBoundingClientRect().top,bottom:a.getBoundingClientRect().bottom,wrapperBottom:b.getBoundingClientRect().bottom,mainBottom:m.getBoundingClientRect().bottom,overflow:a.scrollWidth-a.clientWidth};});
  assert.ok(bounds.top>=bounds.wrapperBottom-1&&bounds.bottom<=bounds.mainBottom+1&&bounds.overflow<=1,JSON.stringify(bounds));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.textVectorGeneratorL2Expanded);assert.ok(await note.isHidden());
  assert.deepEqual(errors,[]);await page.close();
 }
 for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(`${origin}/#diffusion`,{waitUntil:'domcontentloaded'});
  if((await page.locator('html').getAttribute('lang'))!==lang)await page.locator('#language').click();
  await page.locator('#navigation [data-nav="diffusion"]').click();await page.locator('[data-resource] > summary').click();
  const frame=page.frameLocator('iframe.lab-frame-diffusion');await frame.locator('#text-vector-generator-container').focus();await page.keyboard.press('Enter');
  const note=frame.locator('#model-atlas-text-vector-note');await note.waitFor({state:'visible'});assert.match(await note.innerText(),lang==='ko'?/대응은 확인되지 않았습니다/ : /alignment with CLIP tokens is not verified/);await page.close();
 }
 for(const invalid of ['missing','http']){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let count=0;
  await page.route('**/assets/json/text_vector.json',route=>{if(++count===1)return route.fulfill(invalid==='http'?{status:404,body:'missing'}:{status:200,contentType:'application/json',body:'{}'});return route.continue();});
  await page.goto(`${origin}/upstream/diffusion-explainer/?lang=en`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.umapData && document.querySelector('#model-atlas-text-vector-status')?.textContent.includes('Could not load'));
  assert.deepEqual(await values(page),Array(9).fill('—'));await choose(page,1);
  await page.waitForFunction(()=>document.querySelector('#model-atlas-text-vector-status').textContent.includes('loaded'));await verifyValues(page);assert.deepEqual(errors,[]);await page.close();
 }
 {
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let count=0,release;const held=new Promise(r=>release=r);
  await page.route('**/assets/json/text_vector.json',async route=>{if(++count===1){await held;return route.fulfill({status:404,body:'late failure'});}return route.continue();});
  await page.goto(`${origin}/upstream/diffusion-explainer/?lang=en`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.umapData);
  await choose(page,1);await page.waitForFunction(()=>document.querySelector('#model-atlas-text-vector-status').textContent.includes('loaded'));await verifyValues(page);
  release();await page.waitForResponse(r=>r.url().includes('/text_vector.json')&&r.status()===404);await page.waitForTimeout(100);await verifyValues(page);assert.match(await page.locator('#model-atlas-text-vector-status').textContent(),/loaded/);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: Diffusion saved text vectors, labels, failure recovery and stale requests');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
