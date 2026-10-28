import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {earlyInitial,earlyNext} from '../early-stopping-lab.js';

// Independently calculated analytic solution: w_t = 1 - 0.5^t.
for(const patience of [1,2,3]){
  let state=earlyInitial(patience);
  for(let t=1;t<=1+patience;t++){
    state=earlyNext(state);
    const expected=1-0.5**t, point=state.history.at(-1);
    assert.ok(Math.abs(point.w-expected)<1e-12);
    assert.ok(Math.abs(point.train-2.5*(expected-1)**2)<1e-12);
    assert.ok(Math.abs(point.validation-2.5*(expected-0.6)**2)<1e-12);
    assert.equal(state.best.epoch,1);
    assert.equal(state.stopped,t===1+patience);
  }
  assert.strictEqual(earlyNext(state),state);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const lang of ['ko','en']){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+prefix+'/#foundation',{waitUntil:'domcontentloaded'});
    if(lang==='en')await page.locator('#language').click();
    const select=page.locator('#early-patience'),next=page.locator('[data-early-action="next"]'),out=page.locator('#early-output');
    await select.selectOption('3');
    await next.focus();await page.keyboard.press('Enter');
    assert.equal(await select.isDisabled(),true);
    assert.ok((await out.textContent()).includes('0.5000'));
    assert.ok((await out.textContent()).includes('0.0250'));
    await page.locator('#language').click();
    assert.equal(await page.locator('#early-patience').inputValue(),'3');
    assert.ok((await out.textContent()).includes('0.5000'));
    for(let i=0;i<3;i++)await next.click();
    assert.equal(await next.isDisabled(),true);
    const result=await out.textContent();
    assert.ok(result.includes('3 / 3'));assert.ok(result.includes('0.9375'));assert.ok(result.includes('0.5000'));
    const restore=page.locator('[data-early-action="restore"]');await restore.focus();await page.keyboard.press('Space');
    assert.equal(await restore.isDisabled(),true);
    assert.match(await out.textContent(),/0\.5000.*0\.9375/);
    assert.ok((await out.textContent()).includes('0.0250'));
    await page.locator('#language').click();assert.equal(await page.locator('[data-early-action="restore"]').isDisabled(),true);
    await page.locator('[data-early-action="reset"]').click();
    assert.equal(await next.isEnabled(),true);assert.equal(await select.isEnabled(),true);
    assert.equal(await out.locator('tbody tr').count(),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`overflow ${prefix} ${width} ${lang}`);
    if(!prefix && width===1440 && lang==='ko'){
      await page.goto(base+'/concepts.html#overfit');
      await page.locator('a[href="index.html?section=early-title#foundation"]').click();
      await page.waitForURL('**/index.html?section=early-title#foundation');
      await page.waitForFunction(()=>document.activeElement?.id==='early-title');
      if(process.env.EARLY_SCREENSHOT) await page.locator('.early-lab').screenshot({path:'test-results/early-stopping.png'});
    }
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: early stopping analytic values, patience, checkpoints, keyboard, both languages and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
