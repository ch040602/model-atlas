import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {tokenSequenceExperiment} from '../token-sequence-lab.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/)/,'');
 let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 if(process.env.PPL_SCREENSHOTS)await mkdir(path.join(root,'test-results'),{recursive:true});
 for(const prefix of ['','/course'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${prefix}/index.html#transformer`);
  const next=page.locator('[data-token-sequence-action="next"]'),prob=page.locator('[data-token-target-probability]');
  await next.click();
  assert.equal(await page.locator('[data-token-perplexity]').textContent(),'1.583');
  assert.equal(await page.locator('[data-token-sequence-probability]').textContent(),'0.252');
  await prob.fill('0.65');await prob.focus();await page.keyboard.press('ArrowRight');assert.equal(await prob.inputValue(),'0.7');const result=tokenSequenceExperiment('C',0.7);
  assert.equal(await page.locator('[data-token-mean-loss]').textContent(),result.meanLoss.toFixed(3));
  assert.equal(await page.locator('[data-token-perplexity]').textContent(),result.perplexity.toFixed(3));
  assert.equal(await page.locator('[data-token-sequence-probability]').textContent(),'0.504');
  await next.click();
  assert.match(await page.locator('[data-token-distribution]').textContent(),/B 0\.700/);
  await page.locator('[data-token-choice][value="B"]').check();
  assert.match(await page.locator('#token-sequence-output').textContent(),/BOS, A, B\) = 0\.900/);
  assert.equal(await page.locator('[data-token-perplexity]').textContent(),result.perplexity.toFixed(3));
  await page.locator('#language').click();
  assert.equal(await prob.inputValue(),'0.7');assert.equal(await page.locator('#token-sequence-status').textContent(),'3 / 3');
  assert.ok(await page.locator('[data-token-choice][value="B"]').isChecked());
  assert.match(await page.locator('#token-sequence-output').textContent(),/token-level perplexity/);
  if(process.env.PPL_SCREENSHOTS&&prefix==='')await page.locator('.token-sequence-lab').screenshot({path:`test-results/token-ppl-${width}.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  await page.locator('[data-token-sequence-action="reset"]').click();assert.equal(await prob.inputValue(),'0.7');
  await page.goto(`${base}${prefix}/concepts.html#perplexity`);assert.match(await page.locator('main h1').textContent(),/perplexity/i);
  if(width===390){await page.locator('#language').click();assert.match(await page.locator('main h1').textContent(),/퍼플렉시티/);}
  if(!await page.locator('#library-navigation').evaluate(el=>el.open))await page.locator('#library-navigation summary').click();
  await page.locator('#concept-search').fill(width===390?'퍼플렉시티':'perplexity');
  assert.equal(await page.locator('#library-list a').count(),1);await page.locator('#library-list a').click();
  await page.locator('main a.next').click();await page.waitForURL('**/index.html?section=token-sequence-title#transformer');
  await page.waitForFunction(()=>document.activeElement?.id==='token-sequence-title');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: adjustable next-token loss, likelihood, perplexity, language state and concept link at both widths and paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
