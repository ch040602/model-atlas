import assert from 'node:assert/strict';
import {labGuides} from '../lab-guides.js';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.bin':'application/octet-stream'};
const server=createServer(async(req,res)=>{
  try {
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(name.startsWith('/course/')) name=name.slice('/course'.length);
    let file=path.resolve(root,'.'+name);
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
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const prefix of ['', '/course']) for(const lang of ['ko','en']) {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const loaded=new Map(), errors=[], requests=[];
    await context.route('**/*',route=>/cdnjs\.cloudflare\.com\/ajax\/libs\/(dialog-polyfill|material-design-lite|Chart.js)\//.test(route.request().url())?route.abort():route.continue());
    context.on('response',response=>{const url=new URL(response.url());if(url.pathname.includes('/vendor/ganlab/')) loaded.set(url.pathname,response.status());});
    context.on('request',request=>requests.push(new URL(request.url()).pathname));
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('gan-lab')?.evalChart && Number(document.querySelector('#iteration-count')?.textContent.replaceAll(',',''))>0,null,{timeout:45000});
    const guide=labGuides.gan[lang].join(' ');
    for(const selector of ['#toggle-pretrained span','#next-step-g-button span','#next-step-d-button span','#next-step-all-button span','#component-discriminator-learning label[data-model-atlas-ko="학습률:"]']) {
      const label=(await page.locator(selector).textContent()).trim().replace(/:$/, '');
      assert.ok(guide.includes(label),`guide contains rendered GAN control: ${label}`);
    }
    for(const name of ['dialog-polyfill-0.4.9.js','dialog-polyfill-0.4.9.css','material-1.3.0.min.js','material.amber-blue-1.3.0.min.css','chart-bundle-2.4.0.min.js']) {
      assert.equal(loaded.get(`${prefix}/vendor/ganlab/${name}`),200,`${prefix || '/'} ${lang}: ${name}`);
    }
    assert.equal(await page.evaluate(()=>typeof window.dialogPolyfill.registerDialog),'function');
    assert.equal(await page.locator('#play-pause-button').evaluate(e=>getComputedStyle(e).borderRadius),'50%');
    await page.locator('#play-pause-button').click();
    const previous=await page.locator('#iteration-count').textContent();
    const lastChartStep=await page.evaluate(()=>document.querySelector('gan-lab').evalChart.data.datasets[0].data.at(-1)?.x ?? -1);
    await page.locator('#play-pause-button').click();
    await page.waitForFunction(count=>document.querySelector('#iteration-count')?.textContent!==count,previous,{timeout:45000});
    await page.waitForFunction(step=>document.querySelector('gan-lab').evalChart.data.datasets[0].data.at(-1)?.x>step,lastChartStep,{timeout:45000});
    const chart=await page.evaluate(()=>{const chart=document.querySelector('gan-lab').evalChart; const canvas=document.querySelector('#eval-chart'); return {datasets:chart.data.datasets.map(d=>d.data.at(-1)),width:canvas.width,height:canvas.height};});
    assert.equal(chart.datasets.length,2);
    assert.ok(chart.datasets.every(point=>Number.isFinite(Number(point.y)) && point.y !== null));
    assert.ok(chart.width>0 && chart.height>0);
    await page.locator('#play-pause-button').click();
    for(const name of ['line','gaussians','ring','disjoint']) {
      const selector=page.locator(`#distribution-item-${name}`);
      assert.equal(loaded.get(`${prefix}/vendor/ganlab/distribution-${name}.svg`),200);
      assert.equal(await selector.evaluate(img=>img.complete && img.naturalWidth===56),true);
      await page.evaluate(()=>{window.__previousGANModel=document.querySelector('gan-lab').model;});
      await selector.click();
      await page.waitForFunction(name=>document.querySelector('gan-lab').selectedShapeName===name && document.querySelector('gan-lab').model!==window.__previousGANModel,name,{timeout:45000});
      assert.equal(await selector.evaluate(img=>img.classList.contains('selected')),true);
    }
    assert.equal(requests.some(url=>/\/(?:images\/distribution-(?:line|gaussians|ring|disjoint)|figures\/figure-icon-(?:draw|edit|play|slow|step))\.png$/.test(url)),false);
    await page.locator('#edit-model-button').click();
    assert.ok(await page.locator('#component-options-loss paper-dropdown-menu').isVisible());
    assert.equal(errors.length,0,errors.join('\n'));
    await context.close();
    console.log(`PASS: GAN local UI assets, charts and training at ${prefix || '/'} (${lang})`);
  }
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
