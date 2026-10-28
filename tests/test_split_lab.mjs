import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {splitData,candidates,meanSquaredLoss,splitLabOutput} from '../split-lab.js';
for(const [key,expected] of Object.entries({train:[0.625,0,0.625],validation:[2.5,0.625,0],test:[2.025,0.4,0.025]})) {
  candidates.forEach((w,i)=>assert.ok(Math.abs(meanSquaredLoss(splitData[key],w)-expected[i])<1e-12,`${key} ${w}`));
}
for(const lang of ['ko','en']) for(const stage of [1,2,3]) assert.ok(!splitLabOutput(lang,stage,'1').includes('2.800'));
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base+'/#foundation',{waitUntil:'domcontentloaded'});
    if(lang==='en')await page.locator('#language').click();
    const out=page.locator('#split-output'),next=page.locator('[data-split-action="next"]'),previous=page.locator('[data-split-action="previous"]'),select=page.locator('#split-choice');
    assert.equal(await select.isVisible(),false);assert.ok(!(await out.textContent()).includes('2.800'));
    await next.click();assert.ok((await out.textContent()).includes('0.625'));assert.ok(!(await out.textContent()).includes('2.800'));
    await next.click();assert.equal(await next.isDisabled(),true);assert.equal(await select.isVisible(),true);
    await select.selectOption('1');assert.equal(await next.isEnabled(),true);assert.ok((await out.textContent()).includes('2.500'));assert.ok(!(await out.textContent()).includes('2.800'));
    await next.click();assert.ok((await out.textContent()).includes('2.800'));assert.ok((await out.textContent()).includes('0.400'));assert.equal(await select.isDisabled(),true);assert.equal(await previous.isDisabled(),true);
    await page.locator('#language').click();assert.equal(await page.locator('#split-choice').inputValue(),'1');assert.equal(await page.locator('#split-choice').isDisabled(),true);assert.ok((await page.locator('#split-output').textContent()).includes('0.400'));
    await page.locator('[data-split-action="reset"]').click();assert.equal(await page.locator('#split-choice').isVisible(),false);assert.ok(!(await page.locator('#split-output').textContent()).includes('2.800'));
    await page.locator('[data-split-action="next"]').click();await page.locator('[data-split-action="next"]').click();await page.locator('#split-choice').selectOption('1.5');await page.locator('[data-split-action="next"]').click();assert.ok((await page.locator('#split-output').textContent()).includes('0.025'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`overflow at ${width}/${lang}`);
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: independent losses, staged selection and test reveal, language persistence, reset and mobile');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
