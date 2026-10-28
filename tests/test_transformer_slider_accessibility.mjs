import assert from 'node:assert/strict';
import {labGuides} from '../lab-guides.js';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const lang of ['ko','en']) {
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
  await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const temp=page.locator('.temperature-slider input[type=range]'),sampling=page.locator('.sampling-slider input[type=range]');
  await temp.waitFor({state:'visible',timeout:45000});
  const guide=labGuides.transformer[lang].join(' ');
  for(const selector of ['[data-click="dropdown-btn"]','[data-click="generate-btn"]']) {
   const label=(await page.locator(selector).innerText()).trim();
   assert.ok(guide.includes(label),`guide contains rendered Transformer control: ${label}`);
  }
  const selector=page.locator('.temperature-slider select');
  assert.equal(await selector.getAttribute('aria-label'),lang==='ko'?'온도 값 선택':'Select temperature value');
  assert.equal(await selector.locator('option:checked').textContent(),'0.8');
  assert.ok((await temp.boundingBox()).width>=40,'temperature slider remains usable beside selector');
  assert.ok((await selector.boundingBox()).height<=30,'selector fits control row');
  await selector.focus();await selector.press('ArrowDown');
  assert.equal(await selector.locator('option:checked').textContent(),'0.9');
  assert.equal(await temp.getAttribute('aria-valuetext'),'0.9','keyboard selection updates the slider');
  await selector.selectOption('6');
  assert.equal(await temp.getAttribute('aria-label'),lang==='ko'?'온도':'Temperature');
  assert.equal(await temp.getAttribute('aria-valuetext'),'0.8');
  assert.equal(await temp.inputValue(),'6','internal index differs from displayed value');
  assert.equal(await sampling.getAttribute('aria-label'),lang==='ko'?'상위 k 샘플링':'Top-k sampling');
  assert.equal(await sampling.getAttribute('aria-valuetext'),'k=5');
  await temp.focus();await temp.press('ArrowRight');assert.equal(await temp.getAttribute('aria-valuetext'),'0.9');
  assert.equal(await selector.locator('option:checked').textContent(),'0.9','slider updates the exact-value selector');
  await temp.press('Home');assert.equal(await temp.getAttribute('aria-valuetext'),'0.2');
  await temp.press('End');assert.equal(await temp.getAttribute('aria-valuetext'),'10');
  await selector.selectOption('3');
  assert.equal(await temp.getAttribute('aria-valuetext'),'0.5','selector updates the slider');
  await selector.selectOption('17');
  assert.equal(await temp.getAttribute('aria-valuetext'),'10');
  assert.equal(await temp.evaluate(el=>getComputedStyle(el).outlineStyle!=='none'),true,'temperature has visible keyboard focus');
  await sampling.focus();await sampling.press('ArrowRight');assert.equal(await sampling.getAttribute('aria-valuetext'),'k=6');
  const topP=page.locator('input[type=radio][value="top-p"]');await topP.focus();await topP.press('Space');
  assert.equal(await sampling.getAttribute('aria-label'),lang==='ko'?'누적 확률 p 샘플링':'Top-p sampling');
  assert.equal(await sampling.getAttribute('aria-valuetext'),'p=0.5');
  assert.equal(await topP.evaluate(el=>getComputedStyle(el).outlineStyle!=='none'),true,'radio has visible keyboard focus');
  await sampling.focus();await sampling.press('ArrowRight');assert.equal(await sampling.getAttribute('aria-valuetext'),'p=0.6');
  const ax=await page.context().newCDPSession(page);await ax.send('Accessibility.enable');
  const {root:{nodeId}}=await ax.send('DOM.getDocument');const {nodeId:sliderId}=await ax.send('DOM.querySelector',{nodeId,selector:'.temperature-slider input[type=range]'});
  const {nodes}=await ax.send('Accessibility.getPartialAXTree',{nodeId:sliderId,fetchRelatives:false});
  assert.equal(nodes[0].name.value,lang==='ko'?'온도':'Temperature');
  const {nodeId:selectId}=await ax.send('DOM.querySelector',{nodeId,selector:'.temperature-slider select'});
  const {nodes:selectNodes}=await ax.send('Accessibility.getPartialAXTree',{nodeId:selectId,fetchRelatives:false});
  assert.equal(selectNodes[0].name.value,lang==='ko'?'온도 값 선택':'Select temperature value');
  assert.equal(selectNodes[0].value.value,'10','selector exposes the actual temperature');
  assert.equal(nodes[0].description.value,`${lang==='ko'?'온도':'Temperature'}: 10`,'actual temperature is exposed in the browser accessibility description');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: bilingual exact-value selection, slider synchronization, keyboard focus and Chrome accessibility tree');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}


