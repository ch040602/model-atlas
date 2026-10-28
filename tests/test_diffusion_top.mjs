import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course\//,'/');
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  createReadStream(file).pipe(res);
 }catch{return res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const lang of ['ko','en'])for(const width of [390,1600])for(const prefix of ['', '/course']){
  const page=await browser.newPage({viewport:{width,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const top=page.getByRole('button',{name:lang==='ko'?'맨 위로':'top',exact:true});
  await top.waitFor();
  assert.equal(await top.locator('img').getAttribute('alt'),'');
  for(const action of ['Enter','Space','click']){
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   await page.waitForFunction(()=>window.scrollY>200);
   assert.ok(await page.evaluate(()=>window.scrollY>200));
   if(action==='click')await top.click();
   else{
    await top.focus();
    assert.equal(await top.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
    await page.keyboard.press(action);
   }
   await page.waitForFunction(()=>window.scrollY===0 && document.activeElement?.id==='header-title');
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width:1600,height:900}});
  await page.addInitScript(lang=>localStorage.setItem('model-atlas-language',lang),lang);
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.locator('#navigation [data-nav="diffusion"]').click();
  await page.locator('[data-resource] > summary').click();
  const frame=page.frameLocator('iframe.lab-frame-diffusion');
  const top=frame.getByRole('button',{name:lang==='ko'?'맨 위로':'top',exact:true});
  await top.waitFor({state:'attached'});
  await frame.locator('body').evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await top.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>{const d=document.querySelector('iframe.lab-frame-diffusion')?.contentDocument;return d?.defaultView?.scrollY===0 && d.activeElement?.id==='header-title';});
  await page.close();
 }
 console.log('PASS: Diffusion article return-to-top button, keyboard, pointer, focus, both languages, standalone and embedded paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
