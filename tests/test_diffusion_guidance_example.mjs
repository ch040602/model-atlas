import assert from 'node:assert/strict';
import {labGuides,labConnections} from '../lab-guides.js';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    const info=await stat(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1600,height:1000}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.umapData && document.querySelector('#model-atlas-guidance-example'));
    const guide=labGuides.diffusion[lang].join(' '), connection=labConnections.diffusion[lang].join(' ');
    for(const selector of ['#controller-timestep-text','#text-vector-generator-latent-denoiser-text-1-text','#seed-control-text']) {
      const label=(await page.locator(selector).textContent()).trim();
      assert.ok(guide.includes(label),`guide contains rendered Diffusion control: ${label}`);
    }
    const refiner=lang==='ko'?'이미지 표현 정제기':'Image Representation Refiner';
    assert.ok((await page.locator('#latent-denoiser-container').textContent()).includes(refiner));
    assert.ok(connection.includes(refiner));
    if(await page.evaluate(()=>window.playing)) await page.locator('#controller-button-play-container').click();
    const latent=page.locator('#latent-denoiser-container');
    await latent.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>window.latentDenoiserL2Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l2-expl-container')).opacity)>0.99);
    const how=page.locator('#denoise-latent-l2-expl-guidance-scale-expl-text-how');
    await how.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>window.latentDenoiserL3Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l3-expl-container')).opacity)>0.99);
    const example=page.locator('#model-atlas-guidance-example');
    for(const scale of [0,1,7,20]) {
      const button=page.getByRole('button',{name:lang==='ko'?`가이던스 스케일 ${scale}`:`Guidance scale ${scale}`,exact:true});
      await button.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>Number(window.gs)),scale);
      assert.ok((await example.textContent()).includes(`0.2 + ${scale} × (0.3 − 0.2) = ${(0.2+scale*0.1).toFixed(1)}`));
      assert.match(await example.textContent(),lang==='ko'?/가상의 숫자/:/hypothetical values/);
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      assert.match(await page.locator('#generated-image').getAttribute('src'),new RegExp(`_${scale}\\.0_\\d+\\.jpg$`));
      const bounds=await page.evaluate(()=>({text:document.querySelector('#latent-denoiser-l3-expl-text-container').getBoundingClientRect().bottom,box:document.querySelector('#latent-denoiser-container').getBoundingClientRect().bottom,wrapper:document.querySelector('#architecture-wrapper').getBoundingClientRect().bottom}));
      assert.ok(bounds.text<=bounds.box+1 && bounds.box<=bounds.wrapper+1,JSON.stringify(bounds));
    }
    await page.locator('#architecture-wrapper').screenshot({path:path.join(root,'test-results',`diffusion-guidance-example-${lang}.png`)});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.latentDenoiserL3Expanded);
    assert.equal(await how.getAttribute('aria-expanded'),'false');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.latentDenoiserL2Expanded);
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#gs-dropdown-box')).display!=='none' && Number(getComputedStyle(document.querySelector('#text-vector-generator-latent-denoiser-text')).opacity)>0.99);
    await page.locator('#gs-dropdown-box').focus(); await page.keyboard.press('Enter');
    await page.locator('#gs-dropdown-option-1').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>Number(window.gs)),1);
    assert.ok((await example.textContent()).includes('0.2 + 1 × (0.3 − 0.2) = 0.3'));
    await latent.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>window.latentDenoiserL2Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l2-expl-container')).opacity)>0.99);
    await how.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>window.latentDenoiserL3Expanded && Number(getComputedStyle(document.querySelector('#latent-denoiser-l3-expl-container')).opacity)>0.99);
    assert.equal(await page.locator('#latent-denoiser-l3-expl-vis-tick-g circle[aria-pressed="true"]').getAttribute('aria-label'),lang==='ko'?'가이던스 스케일 1':'Guidance scale 1');
    assert.ok((await example.textContent()).includes('0.2 + 1 × (0.3 − 0.2) = 0.3'));
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: Diffusion guidance example follows all scale selections in Korean and English');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
