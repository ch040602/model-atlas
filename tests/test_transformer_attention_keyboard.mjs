import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 if(process.env.ATTENTION_SCREENSHOTS)await mkdir('test-results',{recursive:true});
 for(const lang of ['ko','en'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const tutorialClose=page.locator('.text-card .close-btn');await tutorialClose.waitFor({state:'visible',timeout:45000});await tutorialClose.click();
  const main=page.locator('.block-steps.main');const toggle=main.locator('[data-model-atlas-attention-toggle]');await toggle.waitFor({state:'visible',timeout:45000});
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.getAttribute('aria-controls'),'model-atlas-attention-main');
  assert.equal(await page.locator('#model-atlas-attention-main').count(),1);assert.equal(await page.locator('#model-atlas-attention-next').count(),1);
  assert.equal(await toggle.getAttribute('aria-label'),lang==='ko'?'어텐션 계산 펼치기':'Expand attention calculation');
  await toggle.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');assert.ok(await toggle.evaluate(el=>document.activeElement===el));await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='true');
  assert.equal(await toggle.getAttribute('aria-label'),lang==='ko'?'어텐션 계산 접기':'Collapse attention calculation');
  assert.ok(await toggle.evaluate(el=>document.activeElement===el));
  await main.locator('.attention-qk').waitFor({state:'visible',timeout:15000});
  await main.locator('.attention-mask').waitFor({state:'visible',timeout:15000});
  await main.locator('.attention-softmax').waitFor({state:'visible',timeout:15000});
  const defaultPrevented=await main.locator('.attention-qk .textbook-tooltip').evaluate(el=>{const event=new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true});el.dispatchEvent(event);return event.defaultPrevented;});
  assert.equal(defaultPrevented,false,'unrelated keys must not trigger or cancel the matrix action');
  if(process.env.ATTENTION_SCREENSHOTS&&width===1440){await page.waitForTimeout(1500);await main.locator('.resize-watch.attention-matrix').screenshot({path:`test-results/attention-matrix-${lang}.png`});await page.screenshot({path:`test-results/attention-viewport-${lang}.png`});}
  await page.keyboard.press('Space');await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='false');
  assert.ok(await toggle.evaluate(el=>document.activeElement===el));
  await main.locator('.attention-result').waitFor({state:'visible',timeout:15000});
  await main.locator('.attention-result').click();
  await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='true');
  await toggle.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='false');
  await main.locator('.attention-result').waitFor({state:'visible',timeout:15000});
  await toggle.click();await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='true');
  await toggle.click();await page.waitForFunction(()=>document.querySelector('.block-steps.main [data-model-atlas-attention-toggle]')?.getAttribute('aria-expanded')==='false');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: Transformer attention toggle, state, keyboard focus and mouse interactions in both languages and widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
