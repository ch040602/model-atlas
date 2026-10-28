import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 if(process.env.DIFFUSION_NOISE_SCREENSHOTS)await mkdir(path.join(root,'test-results'),{recursive:true});
 for(const lang of ['ko','en'])for(const width of [390,1600]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.umapData && document.querySelector('#model-atlas-noise-illustration-note'));
  if(await page.evaluate(()=>window.playing))await page.locator('#controller-button-play-container').click();
  const latent=page.locator('#latent-denoiser-container');await latent.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.latentDenoiserL2Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l2-expl-container')).opacity)>0.99);
  const note=page.locator('#model-atlas-noise-illustration-note'),image=page.locator('#denoise-latent-l2-expl-noise-img');
  assert.ok(await note.isVisible());
  assert.match(await note.innerText(),lang==='ko'?/고정 예시로, 선택한 단계의 예측값이 아닙니다/ : /fixed, not the selected step's prediction/);
  assert.match(await note.innerText(),lang==='ko'?/스케줄러는 예측 노이즈로 표현을 갱신/ : /scheduler uses the predicted noise to update/);
  assert.equal(await image.getAttribute('alt'),lang==='ko'?'예측 노이즈를 나타내는 고정 예시 그림':'Fixed illustration of predicted noise');
  const bounds=await page.evaluate(()=>{const a=document.querySelector('#model-atlas-noise-illustration-note'),b=document.querySelector('#architecture-wrapper'),main=document.querySelector('#main');const r=a.getBoundingClientRect(),p=b.getBoundingClientRect(),m=main.getBoundingClientRect();return {top:r.top,bottom:r.bottom,wrapperBottom:p.bottom,mainBottom:m.bottom,overflow:a.scrollWidth-a.clientWidth};});
  assert.ok(bounds.top>=bounds.wrapperBottom-1&&bounds.bottom<=bounds.mainBottom+1&&bounds.overflow<=1,JSON.stringify(bounds));
  const initial=await image.getAttribute('src');
  for(const step of [1,50]){await page.locator('#controller-timestep-slider').fill(String(step));assert.equal(await image.getAttribute('src'),initial);}
  await page.locator('#dropdown-button-container').focus();await page.keyboard.press('Enter');await page.locator('#prompt-selector-dropdown-option-1').focus();await page.keyboard.press('Enter');
  assert.equal(await image.getAttribute('src'),initial);
  if(process.env.DIFFUSION_NOISE_SCREENSHOTS&&width===1600)await page.locator('#main').screenshot({path:path.join(root,'test-results',`diffusion-noise-illustration-${lang}.png`)});
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.latentDenoiserL2Expanded);assert.ok(await note.isHidden());
  assert.deepEqual(errors,[]);await page.close();
 }
 for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(`http://127.0.0.1:${server.address().port}/#diffusion`,{waitUntil:'domcontentloaded'});
  if((await page.locator('html').getAttribute('lang'))!==lang)await page.locator('#language').click();
  await page.locator('#navigation [data-nav="diffusion"]').click();
  await page.locator('[data-resource] > summary').click();
  const frame=page.frameLocator('iframe.lab-frame-diffusion');
  await frame.locator('#denoise-latent-l2-expl-noise-img').waitFor({state:'attached'});
  await frame.locator('#latent-denoiser-container').focus();await page.keyboard.press('Enter');
  const note=frame.locator('#model-atlas-noise-illustration-note');await note.waitFor({state:'visible'});
  assert.match(await note.textContent(),lang==='ko'?/고정 예시/ : /noise picture is fixed/);
  await page.close();
 }
 console.log('PASS: fixed Diffusion noise illustration is labeled in both languages at mobile and desktop widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
