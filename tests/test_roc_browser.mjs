import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {rocAt,rocSamples} from '../roc-lab.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const language of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+prefix+'/concepts.html#roc');if(language==='en')await page.locator('#language').click();
  assert.equal(await page.locator('#roc-title').textContent(),language==='ko'?'점수에서 ROC 곡선까지':'From scores to the ROC curve');
  const slider=page.locator('#roc-threshold');await slider.focus();await page.keyboard.press('Home');
  for(let i=0;i<=20;i++){
   if(i)await page.keyboard.press('ArrowRight');const threshold=i/20,r=rocAt(threshold);
   assert.equal(Number(await slider.inputValue()),threshold);
   assert.equal(await page.locator('[data-roc-tpr]').textContent(),r.tpr.toFixed(3));
   assert.equal(await page.locator('[data-roc-fpr]').textContent(),r.fpr.toFixed(3));
   assert.equal(await page.locator('[data-roc-precision]').textContent(),r.precision===null?(language==='ko'?'정의되지 않음':'undefined'):r.precision.toFixed(3));
   assert.equal(await page.locator('[data-roc-auc]').textContent(),'0.611');
   const cells=await page.locator('.roc-table-wrap tbody tr').allTextContents();
   for(let j=0;j<cells.length;j++)assert.ok(cells[j].endsWith(rocSamples[j].score>=threshold?(language==='ko'?'양성':'Positive'):(language==='ko'?'음성':'Negative')));
  }
  assert.ok(await page.locator('.roc-plot').getAttribute('aria-label'));
  if(!prefix&&width===390&&language==='ko'&&process.env.ROC_SCREENSHOT)await page.locator('.metric-lab').screenshot({path:'test-results/roc-mobile.png'});
  await page.locator('#language').click();assert.equal(await slider.inputValue(),'1');assert.equal(await page.locator('[data-roc-precision]').textContent(),language==='ko'?'undefined':'정의되지 않음');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'page overflows viewport');
  await page.goto(base+prefix+'/concepts.html#learning');if(width===390)await page.locator('#library-summary').click();await page.locator('#concept-search').fill('ROC');await page.locator('#library-list a[href="#roc"]').click();await page.locator('#roc-title').waitFor();
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: ROC threshold keyboard controls, bilingual state, search, root and prefix at mobile and desktop widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
