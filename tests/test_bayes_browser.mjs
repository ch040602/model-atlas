import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {bayesCalculate} from '../bayes-lab.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const language of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+prefix+'/concepts.html#svm-bayes');if(language==='en')await page.locator('#language').click();
  assert.equal(await page.locator('#bayes-title').textContent(),language==='ko'?'단어 유무로 나이브 베이즈 계산하기':'Calculate naive Bayes from word presence');
  const words=page.locator('[data-bayes-word]'),alpha=page.locator('#bayes-alpha');assert.equal(await words.count(),3);
  assert.equal(await page.locator('[data-bayes-prob="ham"]').textContent(),'0.0000');
  await alpha.focus();await page.keyboard.press('End');assert.equal(await alpha.inputValue(),'1');
  for(let i=0;i<8;i++){
   const bits=[i>>2&1,i>>1&1,i&1];
   for(let j=0;j<3;j++)if((await words.nth(j).isChecked())!==!!bits[j]){await words.nth(j).focus();await page.keyboard.press('Space');}
   const expected=bayesCalculate(bits,1);
   assert.equal(await page.locator('[data-bayes-prob="spam"]').textContent(),expected.probabilities[0].toFixed(4));
   assert.equal(await page.locator('[data-bayes-prob="ham"]').textContent(),expected.probabilities[1].toFixed(4));
  }
  await page.locator('#language').click();assert.equal(await alpha.inputValue(),'1');assert.deepEqual(await words.evaluateAll(xs=>xs.map(x=>x.checked)),[true,true,true]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'page overflows viewport');
  if(!prefix&&width===390&&language==='ko'&&process.env.BAYES_SCREENSHOT)await page.locator('.bayes-lab').screenshot({path:'test-results/bayes-mobile.png'});
  await page.goto(base+prefix+'/concepts.html#learning');if(width===390)await page.locator('#library-summary').click();await page.locator('#concept-search').fill(language==='ko'?'베이즈':'Bayes');await page.locator('#library-list a[href="#svm-bayes"]').click();await page.locator('#bayes-title').waitFor();
  assert.equal(await alpha.inputValue(),'1');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: naive Bayes keyboard controls, bilingual state, search, root and prefix at mobile and desktop widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
