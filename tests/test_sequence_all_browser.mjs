import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/#rnn`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    const detail=page.locator('.sequence-lab[aria-labelledby="sequence-title"] details.training-bias');
    await detail.locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await detail.evaluate(e=>e.open),true);
    assert.match(await page.locator('#sequence-all-output').innerText(),/세 기울기 계산/);
    const rate=page.locator('#sequence-preview-rate');
    await rate.focus();await rate.press('ArrowRight');
    assert.equal(await rate.inputValue(),'0.15');
    assert.equal(await page.locator('#sequence-preview-rate-value').innerText(),'0.150');
    const before=await page.locator('#sequence-all-output').innerText();
    await page.locator('[data-sequence-all-steps]').check();
    const after=await page.locator('#sequence-all-output').innerText();
    assert.notEqual(after,before);
    assert.equal(await page.locator('[data-sequence-input="weight"]').inputValue(),'0.5');
    await page.locator('#language').click();
    assert.equal(await page.locator('#sequence-preview-rate').inputValue(),'0.15');
    assert.equal(await page.locator('[data-sequence-all-steps]').isChecked(),true);
    await page.locator('.sequence-lab[aria-labelledby="sequence-title"] details.training-bias summary').click();
    assert.match(await page.locator('#sequence-all-output').innerText(),/three gradients/);
    assert.match(await page.locator('#sequence-all-output').innerText(),/simultaneously/);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: bilingual RNN parameter preview, keyboard rate, loss modes, preserved values and mobile layout');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
