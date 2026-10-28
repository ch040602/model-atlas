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
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const language of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${language}`,{waitUntil:'domcontentloaded'});
    const title=page.locator('[data-click="embedding-step-title"]');
    await title.waitFor({state:'visible',timeout:45000});
    await page.locator('.text-card .card-header h3').waitFor({state:'visible',timeout:45000});
    // Delay the textbook's zero-delay page-entry callbacks to emulate a busy event loop.
    await page.evaluate(()=>{
      const original=window.setTimeout;
      window.__delayedTextbookEntries=0;
      window.setTimeout=function(fn,delay,...args){
        if(delay===0 && typeof fn==='function' && /textPages\[.*\]\?\.on\(\)/.test(String(fn))) {
          window.__delayedTextbookEntries++;
          return original.call(window,fn,600,...args);
        }
        return original.call(window,fn,delay,...args);
      };
    });
    await title.focus();
    await title.press('Enter');
    await page.waitForTimeout(1100);
    await page.locator('.embedding .token-embedding .textbook-tooltip').focus();
    await page.locator('.embedding .token-embedding .textbook-tooltip').press('Enter');
    await page.waitForFunction(()=>document.querySelector('.text-card .card-header h3')?.textContent.includes('Token')||document.querySelector('.text-card .card-header h3')?.textContent.includes('토큰'));
    await page.locator('.text-card .close-btn').press('Enter');
    await page.waitForFunction(()=>document.activeElement?.getAttribute('data-click')==='embedding-step-title');
    await page.waitForTimeout(750);
    assert.ok(await page.evaluate(()=>window.__delayedTextbookEntries)>0,'page-entry callbacks were delayed');
    assert.equal(await title.getAttribute('aria-expanded'),'false',`${language}: delayed page entry must not reopen embedding after close`);
    // Move rapidly from token to position: only the current page may highlight.
    await title.focus();
    await title.press('Enter');
    await page.waitForTimeout(1100);
    await page.locator('.embedding .token-embedding .textbook-tooltip').focus();
    await page.locator('.embedding .token-embedding .textbook-tooltip').press('Enter');
    await page.getByRole('button',{name:language==='ko'?'다음 설명':'Next explanation'}).press('Enter');
    await page.waitForTimeout(750);
    assert.match(await page.locator('.text-card .card-header h3').textContent(),language==='ko'?/위치 인코딩/:/Positional Encoding/);
    assert.equal(await page.locator('.token-column .column.position-embedding.textbook-highlight').count(),1,'current page remains highlighted');
    assert.equal(await page.locator('.token-column .column.token-string.textbook-highlight').count(),0,'superseded token page cannot highlight');
    const entriesBefore=await page.evaluate(()=>window.__delayedTextbookEntries);
    await page.getByRole('button',{name:language==='ko'?'이전 설명':'Previous explanation'}).press('Enter');
    await page.waitForFunction(n=>window.__delayedTextbookEntries>n,entriesBefore);
    await page.getByRole('button',{name:language==='ko'?'다음 설명':'Next explanation'}).press('Enter');
    await page.getByRole('button',{name:language==='ko'?'다음 설명':'Next explanation'}).press('Enter');
    assert.ok(await page.evaluate(()=>window.__delayedTextbookEntries)>=entriesBefore+3,'each rapid page change queued its entry');
    await page.waitForTimeout(750);
    assert.equal(await title.getAttribute('aria-expanded'),'false','leaving embedding pages closes the details');
    assert.equal(await page.locator('.token-column .column.position-embedding.textbook-highlight').count(),0);
    await page.locator('.text-card .close-btn').press('Enter');
    await page.close();
  }
  console.log('PASS: delayed Transformer textbook entries obey close and rapid navigation in both languages');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
