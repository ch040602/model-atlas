import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.bin':'application/octet-stream'};
const server=createServer(async(req,res)=>{
  try {
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(name.startsWith('/course/')) name=name.slice('/course'.length);
    let file=path.resolve(root,'.'+name);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
try {
  for(const prefix of ['', '/course']) for(const lang of ['ko','en']) for(const blocked of ['json','bin']) {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const requests=[], errors=[];
    context.on('request',request=>{if(request.url().includes('/pretrained_models/')) requests.push(request.url());});
    await context.route(`**/pretrained_models/*.${blocked}`,route=>route.fulfill({status:404,body:'not available'}));
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('gan-lab')?.model && document.querySelector('#pretrained-status')?.textContent,null,{timeout:45000});
    assert.match(await page.locator('#pretrained-status').textContent(),lang==='ko'?/처음부터 시작/:/starting from scratch/);
    assert.equal(await page.locator('#toggle-pretrained').evaluate(e=>e.checked),false);
    assert.equal(await page.locator('gan-lab').evaluate(e=>e.iterationCount),0);
    const initialRequests=requests.length;
    await page.locator('#edit-model-button').click();
    const initialNeurons=await page.locator('gan-lab').evaluate(e=>e.numGeneratorNeurons);
    await page.locator('#g-neurons-add-button').click();
    assert.equal(await page.locator('gan-lab').evaluate(e=>e.numGeneratorNeurons),initialNeurons+1);
    await page.locator('#distribution-item-ring').click();
    assert.equal(await page.locator('gan-lab').evaluate(e=>e.selectedShapeName),'ring');
    assert.equal(await page.locator('gan-lab').evaluate(e=>e.numGeneratorNeurons),initialNeurons+1,'scratch mode preserves the chosen configuration');
    await page.locator('#play-pause-button').click();
    await page.waitForFunction(()=>document.querySelector('gan-lab').iterationCount>0,null,{timeout:45000});
    await page.locator('#play-pause-button').click();
    assert.equal(requests.length,initialRequests,'scratch mode must not request a checkpoint');
    assert.deepEqual(errors,[]);
    await context.close();
    console.log(`PASS: missing ${blocked} fallback and scratch training ${prefix||'/'} ${lang}`);
  }

  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/upstream/ganlab/demo/?lang=en`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount===1931,null,{timeout:45000});
  let release, signal;
  const held=new Promise(resolve=>{release=resolve;});
  const requested=new Promise(resolve=>{signal=resolve;});
  await context.route('**/pretrained_models/pretrained_gaussians.json',async route=>{signal(); await held; await route.continue();});
  await page.locator('gan-lab').evaluate(lab=>{
    const original=lab.loadPretrainedWeightFile.bind(lab);
    lab.loadPretrainedWeightFile=(...args)=>original(...args).then(value=>{window.__checkpointFinished=true;return value;});
  });
  await page.locator('#toggle-pretrained').click();
  await page.locator('#toggle-pretrained').click();
  await requested;
  await page.locator('#distribution-item-line').click();
  await page.evaluate(()=>{window.__scratchModel=document.querySelector('gan-lab').model;});
  release();
  await page.waitForFunction(()=>window.__checkpointFinished,null,{timeout:45000});
  const result=await page.locator('gan-lab').evaluate(lab=>({shape:lab.selectedShapeName,same:lab.model===window.__scratchModel,count:lab.iterationCount,pretrained:lab.usePretrained}));
  assert.deepEqual(result,{shape:'line',same:true,count:0,pretrained:false},'a delayed checkpoint must not overwrite the newer scratch experiment');
  assert.deepEqual(errors,[]);
  await context.close();
  console.log('PASS: delayed checkpoint does not replace a newer experiment');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
