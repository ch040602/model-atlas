import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    const info=await stat(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size});
    if(req.method==='HEAD') res.end(); else createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined);
const browser=await chromium.launch({headless:true,executablePath});
try {
  await mkdir(path.join(root,'test-results'),{recursive:true});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{Math.random=()=>.99;});
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('[data-click="prob-step"] .token-string [data-rank]',{timeout:45000});
    await page.locator('.temperature-slider select').selectOption('17');
    await page.locator('input[name="sampling-type"][value="top-p"]').check({force:true});
    await page.locator('.sampling-slider input[type="range"]').fill('1');
    await page.waitForFunction(()=>{
      const row=document.querySelector('[data-click="prob-step"] .token-string .final_token_highlight');
      return row && Number(row.getAttribute('data-rank'))>=50;
    },null,{timeout:45000});
    const rows=page.locator('[data-click="prob-step"] .token-string [data-rank]');
    assert.equal(await rows.count(),51);
    assert.ok(Number(await rows.nth(10).getAttribute('data-rank'))>=50,'off-list sample appears after the first ten rows');
    assert.equal(await rows.nth(10).getAttribute('class').then(c=>c.includes('final_token_highlight')),true);
    assert.equal(await rows.nth(11).getAttribute('data-rank'),'10');
    await page.locator('[data-click="prob-step-title"]').dispatchEvent('click');
    await page.locator('[data-model-atlas-sampling-note]').waitFor({state:'visible'});
    assert.match(await page.locator('[data-model-atlas-sampling-note]').textContent(),lang==='ko'?/전체 어휘로 Top-p/:/full vocabulary/);
    assert.match(await page.locator('.softmax-popover-content').textContent(),lang==='ko'?/누적 ≥ p까지 포함/:/Through cumulative ≥ p/);
    const selectedText=(await rows.nth(10).textContent()).trim();
    assert.match(await page.locator('.softmax-popover-title').textContent(),new RegExp(selectedText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.match(await page.locator('.softmax-popover .final-step .highlight').textContent(),/[1-9].*%/,'small nonzero sampled probability is not rounded to zero');
    assert.match(await page.locator('.softmax-popover .norm-step .frac-top .number').textContent(),/[1-9]/,'small nonzero original probability is not rounded to zero');
    await page.waitForTimeout(1300);
    const bounds=await page.locator('.softmax-popover-content').boundingBox();
    assert.ok(bounds.x>=0 && bounds.x+bounds.width<=1440,`probability explanation fits viewport: ${JSON.stringify(bounds)}`);
    await page.screenshot({path:path.join(root,'test-results',`transformer-top-p-${lang}.png`)});
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`PASS: ${lang} full-vocabulary top-p controls, off-list sample and explanation`);
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
