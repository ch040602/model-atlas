import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 await mkdir(path.join(root,'test-results'),{recursive:true});
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/#rnn`,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#gru-status').textContent(),'1 / 3');
  assert.ok(await page.locator('[data-gru-action="previous"]').isDisabled());
  await page.locator('[data-gru-action="next"]').click();await page.locator('[data-gru-action="next"]').click();
  assert.match(await page.locator('#gru-output').textContent(),/0\.569/);
  const slider=page.locator('[data-gru-input="updateLogit"]');await slider.focus();await slider.press('ArrowRight');
  assert.equal(await page.locator('#gru-value-updateLogit').textContent(),'0.100');
  assert.match(await page.locator('#gru-output').textContent(),/0\.570/);
  if(width===390)await page.locator('.gru-lab').screenshot({path:path.join(root,'test-results','gru-mobile-ko.png')});
  await page.locator('#language').click();
  assert.equal(await page.locator('#gru-status').textContent(),'3 / 3');
  assert.match(await page.locator('#gru-output').textContent(),/old-state weight/);
  assert.equal(await page.locator('#gru-value-updateLogit').textContent(),'0.100');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  if(width===390)await page.locator('.gru-lab').screenshot({path:path.join(root,'test-results','gru-mobile-en.png')});
  await page.locator('[data-gru-action="reset"]').click();assert.equal(await page.locator('#gru-status').textContent(),'1 / 3');
  await page.locator('#navigation [data-nav="cnn"]').click();await page.locator('#navigation [data-nav="rnn"]').click();
  assert.equal(await page.locator('#gru-status').textContent(),'1 / 3');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: GRU real browser stages, keyboard, languages, chapter navigation and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
