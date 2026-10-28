import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const lang of ['ko','en']){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+prefix+'/concepts.html#nonlinear-mlp');
    if(lang==='en')await page.locator('#language').click();
    const sample=page.locator('#xortrain-sample'),rate=page.locator('#xortrain-rate'),step=page.locator('[data-xortrain-step]'),loss=page.locator('[data-xortrain-loss]'),one=page.locator('[data-xortrain-action="one"]'),hundred=page.locator('[data-xortrain-action="hundred"]');
    assert.equal(await step.textContent(),'0');assert.equal(await loss.textContent(),'0.5923');
    await sample.selectOption('3');assert.ok((await page.locator('#xortrain-output').textContent()).includes('x=(1, 1)'));
    await one.focus();await page.keyboard.press('Enter');assert.equal(await step.textContent(),'1');
    assert.ok((await page.locator('[data-xortrain-last]').textContent()).includes('η=1.0000'));
    await page.locator('[data-xortrain-action="ten"]').click();await hundred.click();
    assert.equal(await step.textContent(),'111');assert.ok(Number(await loss.textContent())<0.2);
    await page.locator('#language').click();
    assert.equal(await page.locator('#xortrain-sample').inputValue(),'3');assert.equal(await step.textContent(),'111');
    await page.locator('[data-xortrain-action="reset"]').click();assert.equal(await step.textContent(),'0');assert.equal(await loss.textContent(),'0.5923');
    await rate.fill('0');await one.click();assert.equal(await step.textContent(),'1');assert.equal(await loss.textContent(),'0.5923');
    await page.locator('[data-xortrain-action="reset"]').click();await rate.fill('1');
    for(let i=0;i<5;i++)await hundred.click();
    assert.equal(await step.textContent(),'500');assert.equal(await hundred.isDisabled(),true);assert.equal(await one.isDisabled(),true);
    assert.ok(Number(await loss.textContent())<0.03);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    if(width===390){const table=page.locator('.xor-training-lab .xor-table-wrap').last();await table.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelectorAll('.xor-training-lab .xor-table-wrap')[1]?.scrollLeft>0);}
    if(!prefix && width===1440 && lang==='ko' && process.env.XOR_TRAIN_SCREENSHOT)await page.locator('.xor-training-lab').screenshot({path:'test-results/xor-training.png'});
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: XOR training, reset, zero rate, limit, keyboard, language and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
