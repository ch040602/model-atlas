import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.startsWith('/course/'))name=name.slice('/course'.length);
 let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const mock=`window.__videoCalls=[];window.YT={Player:function(id,options){const p={mute(){window.__videoCalls.push(['mute'])},seekTo(t,allow){if(window.__throwSeek)throw new Error('seek failed');window.__videoCalls.push(['seek',t,allow])},playVideo(){window.__videoCalls.push(['play'])}};window.__fireReady=()=>options.events.onReady({target:p});window.__fireError=()=>options.events.onError({target:p});return p;}};setTimeout(()=>window.onYouTubeIframeAPIReady(),0);`;
let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const prefix of ['','/course'])for(const lang of ['ko','en'])for(const mode of ['blocked','delayed']){
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.startsWith(base))return route.continue();
   if(mode==='delayed'&&url==='https://www.youtube.com/iframe_api')return route.fulfill({status:200,contentType:'application/javascript',body:mock});
   return route.abort();
  });
  await page.goto(`${base}${prefix}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const chapters=page.locator('#description li > a.video-part-link');assert.equal(await chapters.count(),5);
  assert.equal(await page.locator('#description [data-model-atlas-article="en"] a.video-part-link').count(),2);
  assert.equal(await page.locator('#video-demo-iframe').getAttribute('title'),lang==='ko'?'GAN Lab 시연 영상':'GAN Lab demonstration video');
  for(const [index,second] of [0,38,65,111,139].entries()){
   const link=chapters.nth(index),url=new URL(await link.getAttribute('href'));
   assert.equal(url.origin,'https://www.youtube.com');assert.equal(url.searchParams.get('v'),'eTq9T_sPTYQ');assert.equal(url.searchParams.get('t'),`${second}s`);
   assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
  }
  await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a.video-part-link')){window.__handled=e.defaultPrevented;if(!window.__allowExternal)e.preventDefault();}}));
  const chapter=chapters.nth(3);await chapter.focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>window.__handled),false,'unavailable player leaves fallback link active');
  if(mode==='blocked'&&lang==='ko'&&prefix===''){
   let fallbackUrl='';
   await page.context().route('https://www.youtube.com/watch**',route=>{fallbackUrl=route.request().url();return route.abort();});
   await page.evaluate(()=>{window.__allowExternal=true;});
   const [popup]=await Promise.all([page.waitForEvent('popup'),chapter.click()]);
   await new Promise((resolve,reject)=>{const deadline=Date.now()+5000;const check=()=>fallbackUrl?resolve():Date.now()>deadline?reject(new Error('fallback request missing')):setTimeout(check,20);check();});
   assert.equal(new URL(fallbackUrl).searchParams.get('t'),'111s');
   await popup.close();await page.evaluate(()=>{window.__allowExternal=false;});
  }
  if(mode==='delayed'){
   await page.waitForFunction(()=>typeof window.__fireReady==='function');
   await page.evaluate(()=>window.__fireReady());
   await chapter.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>window.__handled),true);
   assert.deepEqual(await page.evaluate(()=>window.__videoCalls),[['mute'],['seek',111,true],['play']]);
   await chapter.dispatchEvent('click',{ctrlKey:true,button:0});
   assert.equal(await page.evaluate(()=>window.__handled),false,'modified click keeps link behavior');
   assert.equal((await page.evaluate(()=>window.__videoCalls)).length,3);
   await page.evaluate(()=>{window.__throwSeek=true;});
   await chapter.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>window.__handled),false,'failed seek leaves fallback link active');
   await page.evaluate(()=>{window.__throwSeek=false;window.__fireError();});
   await chapter.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>window.__handled),false,'player error leaves fallback link active');
   assert.equal((await page.evaluate(()=>window.__videoCalls)).length,3);
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: GAN tutorial timestamp links and keyboard with blocked, delayed and ready player in both languages and paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
