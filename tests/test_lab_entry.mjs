import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/study(?=\/|$)/,''));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/study/`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const language of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:390,height:850}});
    let headStatus=404,heads=0,gets=0;
    await page.route('**/upstream/**',async route=>{
      if(route.request().method()==='HEAD') {heads++; if(headStatus==='network')return route.abort('failed');return route.fulfill({status:headStatus,body:''});}
      gets++; return route.fulfill({status:200,contentType:'text/html',body:'<html><body>lab</body></html>'});
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});
    if(language==='en')await page.locator('#language').click();
    for(const chapter of ['cnn','diffusion','transformer','gan']) {
      headStatus=chapter==='gan'?410:404;
      const priorHeads=heads;
      await page.locator(`#navigation [data-nav="${chapter}"]`).click();
      assert.equal(await page.locator('iframe.lab-frame').getAttribute('src'),null);
      assert.equal(heads,priorHeads);
      await page.locator('[data-resource] > summary').click();
      const diagnostic=page.locator('[data-lab-diagnostic]');
      await diagnostic.waitFor({state:'visible'});
      assert.equal(heads,priorHeads+1);
      assert.ok(await page.locator('iframe.lab-frame').getAttribute('src'));
      assert.match(await diagnostic.innerText(),language==='ko'?/진입 페이지만 검사/:/only the lab entry page/);
      assert.match(await diagnostic.innerText(),/python scripts\/bootstrap.py --build/);
      assert.equal(await diagnostic.getAttribute('role'),'status');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
      const retry=diagnostic.locator('[data-lab-retry]');
      headStatus=405;
      let pending=page.waitForResponse(response=>response.request().method()==='HEAD' && response.status()===405);
      await retry.click();await pending;
      assert.equal(await diagnostic.isVisible(),true,'an inconclusive retry preserves the last confirmed result');
      headStatus=200;
      await retry.focus();await retry.press('Enter');
      await diagnostic.waitFor({state:'hidden'});
      assert.equal(heads,priorHeads+3);
    }
    for(const status of [405,'network']) {
      headStatus=status;
      await page.locator('#navigation [data-nav="cnn"]').click();
      const before=heads;
      const request=page.waitForRequest(req=>req.method()==='HEAD' && req.url().includes('/upstream/cnn-explainer/public/'));
      await page.locator('[data-resource] > summary').click();
      await request;
      await page.waitForTimeout(200);
      assert.equal(heads,before+1);
      assert.equal(await page.locator('[data-lab-diagnostic]').isVisible(),false,`${status} must not be reported as missing`);
      assert.ok(await page.locator('iframe.lab-frame').getAttribute('src'));
      await page.locator('#navigation [data-nav="gan"]').click();
    }
    await page.close();
  }
  console.log('PASS: bilingual missing-lab guidance, retry, non-missing errors, lazy loading, project prefix and mobile layout');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
