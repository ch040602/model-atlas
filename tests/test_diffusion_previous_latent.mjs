import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
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
 for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.umapData && document.querySelector('#denoise-latent-l2-expl-prev-latent-img'));
  if(await page.evaluate(()=>window.playing))await page.locator('#controller-button-play-container').click();
  const latent=page.locator('#latent-denoiser-container');await latent.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.latentDenoiserL2Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l2-expl-container')).opacity)>0.99);
  async function check(label){
   const state=await page.evaluate(()=>({current:document.querySelector('#improved-latent-img').getAttribute('src'),previous:document.querySelector('#denoise-latent-l2-expl-prev-latent-img').getAttribute('src'),step:window.timestep,label:document.querySelector('#denoise-latent-l2-expl-prev-latent-timestep').textContent}));
   assert.equal(state.previous,state.current.replace(/_\d+\.jpg$/,`_${state.step-1}.jpg`),`${label}: ${JSON.stringify(state)}`);
   assert.equal(Number(state.label),state.step-1);
   assert.ok(existsSync(path.join(root,'upstream/diffusion-explainer',state.previous)),`${label}: previous image exists`);
  }
  for(const step of [1,30,50]){await page.locator('#controller-timestep-slider').fill(String(step));await check(`step ${step}`);}
  // Keyboard selection does not rely on a subsequent animation tick.
  await page.locator('#dropdown-button-container').focus();await page.keyboard.press('Enter');
  await page.locator('#prompt-selector-dropdown-option-1').focus();await page.keyboard.press('Enter');await check('keyboard prompt selection');
  for(const selector of ['#prompt-selector-dropdown-option-2','#gs-dropdown-option-0','#seed-dropdown-option-2']){
   const item=page.locator(selector);await item.dispatchEvent('mouseover');await check(`${selector} preview`);
   await page.locator('#controller-timestep-slider').fill('10');await check(`${selector} preview during step change`);
   await item.dispatchEvent('mouseout');await check(`${selector} preview exit`);
  }
  const how=page.locator('#denoise-latent-l2-expl-guidance-scale-expl-text-how');
  await how.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.latentDenoiserL3Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l3-expl-container')).opacity)>0.99);
  const scale=page.getByRole('button',{name:lang==='ko'?'가이던스 스케일 0':'Guidance scale 0',exact:true});
  await scale.focus();await page.keyboard.press('Enter');await check('keyboard guidance selection');
  assert.equal(Number(await page.evaluate(()=>window.gs)),0);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.latentDenoiserL3Expanded);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.latentDenoiserL2Expanded);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#seed-dropdown-box')).display!=='none' && Number(getComputedStyle(document.querySelector('#seed-control-container')).opacity)>0.99);
  await page.locator('#seed-dropdown-box').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#seed-dropdown-options-container')).display!=='none');
  await page.locator('#seed-dropdown-option-2').focus();await page.keyboard.press('Enter');await check('keyboard seed selection');
  assert.equal(Number(await page.evaluate(()=>window.seed)),2);
  await page.locator('#seed-dropdown-box').click();
  await page.locator('#seed-dropdown-option-3').hover();await check('pointer seed preview');
  assert.ok((await page.locator('#improved-latent-img').getAttribute('src')).includes('/3_'));
  await page.mouse.move(2,2);await check('pointer preview exit');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: previous and current Diffusion latents stay paired across selections, previews and display steps in both languages');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
