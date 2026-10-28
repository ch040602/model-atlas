import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 if(process.env.CNN_ICON_SCREENSHOTS)await mkdir(path.join(root,'test-results'),{recursive:true});
 for(const prefix of ['','/course'])for(const lang of ['ko','en'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),external=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(base+'/')){external.push(url);return route.abort();}return route.continue();});
  await page.goto(`${base}${prefix}/upstream/cnn-explainer/public/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#detailed-button:not([disabled])',{timeout:45000});
  const add=page.getByRole('button',{name:lang==='ko'?'입력 이미지 추가':'Add new input image'});
  await add.focus();await add.press('Enter');
  const modal=page.locator('.modal.is-active');await modal.waitFor({state:'visible'});
  assert.equal(await modal.locator('.model-atlas-icon[aria-hidden="true"]').count(),2);
  const bounds=await modal.locator('.modal-card').boundingBox();assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width+1,`dialog fits viewport: ${JSON.stringify(bounds)}`);
  for(const control of await modal.locator('.modal-card input, .modal-card button').all()){const box=await control.boundingBox();if(box)assert.ok(box.x>=0&&box.x+box.width<=width+1,'dialog control fits viewport');}
  for(const icon of await modal.locator('.model-atlas-icon').all())assert.ok(await icon.isVisible());
  if(process.env.CNN_ICON_SCREENSHOTS&&prefix==='')await page.screenshot({path:`test-results/cnn-icons-modal-${lang}-${width}.png`});
  await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});
  const node=page.locator('#layer-2-node-0');await node.focus();await node.press('Enter');
  const pause=page.locator('#detailview .play-button[aria-label]').filter({has:page.locator('.model-atlas-control-icon')});
  await pause.waitFor({state:'visible'});
  const icon=pause.locator('.model-atlas-control-icon');assert.equal(await icon.getAttribute('aria-hidden'),'true');assert.equal(await icon.textContent(),'Ⅱ');assert.ok(await icon.isVisible());
  await pause.focus();await pause.press('Enter');
  const play=pause;assert.equal(await play.getAttribute('aria-label'),lang==='ko'?'애니메이션 재생':'Play animation');assert.equal(await play.locator('.model-atlas-control-icon').textContent(),'▶');
  await play.press('Space');assert.equal(await pause.locator('.model-atlas-control-icon').textContent(),'Ⅱ');
  const info=page.getByRole('button',{name:lang==='ko'?'설명 글로 이동':'Jump to article section'});
  const close=page.getByRole('button',{name:lang==='ko'?'상세 화면 닫기':'Close detail'});
  assert.equal(await info.locator('.model-atlas-control-icon').textContent(),'i');assert.equal(await close.locator('.model-atlas-control-icon').textContent(),'×');
  if(process.env.CNN_ICON_SCREENSHOTS&&prefix==='')await page.locator('#detailview').screenshot({path:`test-results/cnn-icons-detail-${lang}-${width}.png`});
  await close.focus();await close.press('Enter');assert.equal(await node.evaluate(el=>document.activeElement===el),true);
  assert.ok(!external.some(url=>/fontawesome/i.test(url)));assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: local CNN icons, keyboard controls, external blocking, both languages, widths and project paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
