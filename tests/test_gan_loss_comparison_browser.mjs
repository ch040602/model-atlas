import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {ganTrainingExperiment} from '../gan-training-lab.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 await mkdir(path.join(root,'test-results'),{recursive:true});
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/#gan`,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#gantrain-status').textContent(),'1 / 5');
  for(let i=0;i<3;i++)await page.locator('[data-gantrain-action="next"]').click();
  const output=page.locator('#gantrain-output');
  assert.match(await output.textContent(),/같은 시작점에서 제곱 손실과 비교/);
  const slider=page.locator('[data-gantrain-input="generator"]');
  await slider.focus();await slider.press('ArrowRight');
  assert.equal(await page.locator('#gantrain-value-generator').textContent(),'0.100');
  const r=ganTrainingExperiment(1,0.1,1,0);
  assert.ok((await output.textContent()).includes(`= ${r.squareGradient.toFixed(3)}`));
  assert.match(await output.textContent(),/서로 이어서 적용하지 않습니다/);
  await page.locator('[data-gantrain-action="next"]').click();
  assert.ok((await output.textContent()).includes(`= ${r.nextSquareLoss.toFixed(3)}`));
  if(width===390)await page.locator('.gan-training-lab').screenshot({path:path.join(root,'test-results','gan-loss-comparison-ko-mobile.png')});
  await page.locator('#language').click();
  assert.equal(await page.locator('#gantrain-status').textContent(),'5 / 5');
  assert.match(await output.textContent(),/not applied sequentially/);
  assert.match(await output.textContent(),/sigmoid derivative/);
  assert.equal(await page.locator('#gantrain-value-generator').textContent(),'0.100');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  if(width===390)await page.locator('.gan-training-lab').screenshot({path:path.join(root,'test-results','gan-loss-comparison-en-mobile.png')});
  await page.locator('[data-gantrain-action="reset"]').click();assert.equal(await page.locator('#gantrain-status').textContent(),'1 / 5');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: GAN loss comparison, keyboard, both languages and mobile layout');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
