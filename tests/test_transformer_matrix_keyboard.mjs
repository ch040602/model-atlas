import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
const cases=[
 ['qkv','Q·K·V 계산','Q·K·V calculation'],
 ['attention','어텐션 출력 계산','Attention output calculation'],
 ['mlpUp','MLP 확장 계산','MLP expansion calculation'],
 ['mlpDown','MLP 축소 계산','MLP compression calculation'],
 ['softmax','출력 로짓 계산','Output logits calculation']
];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const lang of ['ko','en'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const tutorialClose=page.locator('.text-card .close-btn');await tutorialClose.waitFor({state:'visible',timeout:45000});await tutorialClose.click();
  const nav=page.getByRole('navigation',{name:lang==='ko'?'행렬 계산 보기':'View matrix calculations'});
  await nav.waitFor({state:'visible'});assert.equal(await nav.locator('button').count(),5);
  for(const [id,ko,en] of cases){
   const button=nav.getByRole('button',{name:lang==='ko'?ko:en,exact:true});
   assert.equal(await button.getAttribute('aria-controls'),`model-atlas-matrix-${id}`);
   assert.equal(await button.getAttribute('aria-expanded'),'false');
   await button.focus();await page.keyboard.press(id==='attention'?'Space':'Enter');
   const panel=page.locator(`#model-atlas-matrix-${id}`),close=panel.locator('[data-click="matrix-calc-close-btn"]');
   await panel.waitFor({state:'visible'});await close.waitFor({state:'visible'});
   assert.equal(await button.getAttribute('aria-expanded'),'true');
   assert.ok(await close.evaluate(el=>document.activeElement===el),`${id}: focus enters panel`);
   const rect=await close.boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=width&&rect.y>=0&&rect.y+rect.height<=900,`${id}: focused close visible at ${width}: ${JSON.stringify(rect)}`);
   if(id==='qkv'){
    const help=panel.locator('[data-click="help-icon"]').first();await help.focus();
    assert.equal(await help.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await help.getAttribute('aria-expanded'),'false');
    assert.equal(await button.getAttribute('aria-expanded'),'true','Escape closes help before its panel');
   }
   await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});
   assert.ok(await button.evaluate(el=>document.activeElement===el),`${id}: Escape returns focus`);
   assert.equal(await button.getAttribute('aria-expanded'),'false');
   await button.click();await panel.waitFor({state:'visible'});await close.click();await panel.waitFor({state:'detached'});
   assert.ok(await button.evaluate(el=>document.activeElement===el),`${id}: close returns focus`);
  }
  const qkv=nav.getByRole('button',{name:lang==='ko'?cases[0][1]:cases[0][2],exact:true});
  const mlp=nav.getByRole('button',{name:lang==='ko'?cases[2][1]:cases[2][2],exact:true});
  await qkv.click();await mlp.click();
  assert.equal(await qkv.getAttribute('aria-expanded'),'false');assert.equal(await mlp.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');assert.ok(await mlp.evaluate(el=>document.activeElement===el),'switching panels returns focus to the latest opener');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: five Transformer matrix panels, names, keyboard and pointer focus in Korean and English at mobile and desktop widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
