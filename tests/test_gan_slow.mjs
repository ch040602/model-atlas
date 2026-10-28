import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
const base=`http://127.0.0.1:${server.address().port}`;
const pageErrors=[];
async function openLab() {
  const page=await browser.newPage();
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(base+'/upstream/ganlab/demo/?lang=ko',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount===1931,null,{timeout:45000});
  return page;
}
try {
  const resetPage=await openLab();
  const reset=await resetPage.locator('gan-lab').evaluate(async el=>{
    const realTimeout=window.setTimeout, realFrame=window.requestAnimationFrame;
    window.setTimeout=(fn,ms,...args)=>realTimeout(fn,ms===1250||ms===1000?15:ms,...args);
    window.requestAnimationFrame=()=>0;
    try {
      el.disabledPretrainedMode(); el.createExperiment();
      el.onClickSlowModeButton(); el.play(); el.pause();
      el.createExperiment();
      let d=0,g=0;
      const dMin=el.model.dOptimizer.minimize.bind(el.model.dOptimizer);
      const gMin=el.model.gOptimizer.minimize.bind(el.model.gOptimizer);
      el.model.dOptimizer.minimize=(...args)=>{d++;return dMin(...args);};
      el.model.gOptimizer.minimize=(...args)=>{g++;return gMin(...args);};
      el.play();
      await new Promise(resolve=>realTimeout(resolve,1500));
      el.pause();
      return {d,g,count:el.iterationCount};
    } finally {window.setTimeout=realTimeout;window.requestAnimationFrame=realFrame;}
  });
  assert.deepEqual(reset,{d:2,g:1,count:1},'reset must cancel the suspended iteration before training the new model');
  await resetPage.close();
  const stepPage=await openLab();
  const step=await stepPage.locator('gan-lab').evaluate(async el=>{
    const realTimeout=window.setTimeout, realFrame=window.requestAnimationFrame;
    window.setTimeout=(fn,ms,...args)=>realTimeout(fn,ms===1250||ms===1000?15:ms,...args);
    window.requestAnimationFrame=()=>0;
    try {
      el.disabledPretrainedMode(); el.createExperiment();
      el.onClickSlowModeButton(); el.play(); el.pause();
      el.onClickStepModeButton(); el.onClickNextStepButton('G');
      const snapshot=()=>({count:el.iterationCount,
        d:el.model.dVariables.map(v=>Array.from(v.dataSync())),
        g:el.model.gVariables.map(v=>Array.from(v.dataSync()))});
      const before=snapshot();
      // Make a previously suspended timer runnable without starting a new loop.
      el.isPlaying=true;
      await new Promise(resolve=>realTimeout(resolve,600));
      el.isPlaying=false;
      return {before,after:snapshot()};
    } finally {window.setTimeout=realTimeout;window.requestAnimationFrame=realFrame;}
  });
  assert.deepEqual(step.after,step.before,'switching to step mode must cancel the suspended slow iteration');
  await stepPage.close();
  const partialPage=await openLab();
  const partial=await partialPage.locator('gan-lab').evaluate(async el=>{
    const realTimeout=window.setTimeout, realFrame=window.requestAnimationFrame;
    window.setTimeout=(fn,ms,...args)=>realTimeout(fn,ms===1250||ms===1000?60:ms,...args);
    window.requestAnimationFrame=()=>0;
    try {
      el.disabledPretrainedMode(); el.createExperiment();
      let d=0,g=0;
      const dMin=el.model.dOptimizer.minimize.bind(el.model.dOptimizer);
      const gMin=el.model.gOptimizer.minimize.bind(el.model.gOptimizer);
      el.model.dOptimizer.minimize=(...args)=>{d++;return dMin(...args);};
      el.model.gOptimizer.minimize=(...args)=>{g++;return gMin(...args);};
      el.onClickSlowModeButton(); el.play();
      const deadline=Date.now()+5000;
      while(d<2 && Date.now()<deadline) await new Promise(resolve=>realTimeout(resolve,10));
      const atPause={d,g};
      el.pause(); el.onClickStepModeButton(); el.onClickNextStepButton('G');
      el.isPlaying=true;
      await new Promise(resolve=>realTimeout(resolve,500));
      el.isPlaying=false;
      return {atPause,after:{d,g}};
    } finally {window.setTimeout=realTimeout;window.requestAnimationFrame=realFrame;}
  });
  assert.deepEqual(partial.atPause,{d:2,g:0},'test must pause after discriminator updates and before generator updates');
  assert.deepEqual(partial.after,{d:2,g:1},'a partial iteration must not resume after switching modes');
  await partialPage.close();
  const modePage=await openLab();
  const mode=await modePage.locator('gan-lab').evaluate(async el=>{
    const realTimeout=window.setTimeout, realFrame=window.requestAnimationFrame;
    window.setTimeout=(fn,ms,...args)=>realTimeout(fn,ms===1250||ms===1000?15:ms,...args);
    window.requestAnimationFrame=()=>0;
    try {
      el.disabledPretrainedMode(); el.createExperiment();
      let d=0,g=0;
      const dMin=el.model.dOptimizer.minimize.bind(el.model.dOptimizer);
      const gMin=el.model.gOptimizer.minimize.bind(el.model.gOptimizer);
      el.model.dOptimizer.minimize=(...args)=>{d++;return dMin(...args);};
      el.model.gOptimizer.minimize=(...args)=>{g++;return gMin(...args);};
      el.onClickSlowModeButton(); el.play();
      el.onClickSlowModeButton();
      await new Promise(resolve=>realTimeout(resolve,600));
      el.pause();
      return {d,g,count:el.iterationCount};
    } finally {window.setTimeout=realTimeout;window.requestAnimationFrame=realFrame;}
  });
  assert.deepEqual(mode,{d:2,g:1,count:2},'switching to fast mode must resume one loop and cancel the suspended iteration');
  await modePage.close();
  const pretrainedPage=await openLab();
  await pretrainedPage.locator('gan-lab').evaluate(el=>{
    el.disabledPretrainedMode(); el.createExperiment();
    el.onClickSlowModeButton(); el.play(); el.pause();
    el.usePretrained=true; el.loadModelAndCreateExperiment();
  });
  await pretrainedPage.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount===1931,null,{timeout:45000});
  const loaded=await pretrainedPage.locator('gan-lab').evaluate(async el=>{
    const manifest=await (await fetch('pretrained_models/pretrained_gaussians.json')).json();
    const bytes=await (await fetch('pretrained_models/pretrained_gaussians.weights.bin')).arrayBuffer();
    const view=new DataView(bytes); let offset=0,mismatches=0;
    for(const spec of manifest.weightsManifest[0].weights){
      const [type,index]=spec.name.split('-');
      const actual=(type==='d'?el.model.dVariables:el.model.gVariables)[Number(index)].dataSync();
      for(const value of actual){if(Math.abs(value-view.getFloat32(offset,true))>1e-7)mismatches++;offset+=4;}
    }
    return {mismatches,dots:document.querySelectorAll('#vis-generated-samples .generated-dot').length};
  });
  assert.equal(loaded.mismatches,0,'loading in slow mode must preserve checkpoint weights');
  assert.ok(loaded.dots>0,'loading in slow mode must render the pretrained distribution');
  const gradients=await pretrainedPage.locator('gan-lab').evaluate(async el=>{
    el.model.updateOptimizer('G','SGD',0.5);
    const old=Array.from(document.querySelectorAll('#vis-generator-gradients .gradient-generated'),n=>[...n.__data__]);
    el.isPlaying=true; el.slowMode=false;
    await el.iterateTraining(false,'G');
    el.isPlaying=false;
    const arrows=Array.from(document.querySelectorAll('#vis-generator-gradients .gradient-generated'),n=>[...n.__data__]);
    const noise=el.noiseProviderFixed.getNextCopy();
    const positions=el.model.generator(noise);
    const eps=0.001;
    const score=(offset)=>el.model.discriminator(positions.add(offset)).dataSync();
    const xp=score([eps,0]),xm=score([-eps,0]),yp=score([0,eps]),ym=score([0,-eps]);
    const p=positions.dataSync();
    return arrows.map((a,i)=>({positionError:Math.max(Math.abs(a[0]-p[2*i]),Math.abs(a[1]-p[2*i+1])),
      error:Math.max(Math.abs(a[2]-(xp[i]-xm[i])/(2*eps)),Math.abs(a[3]-(yp[i]-ym[i])/(2*eps))),
      moved:Math.hypot(a[0]-old[i][0],a[1]-old[i][1])}));
  });
  assert.ok(gradients.length>100,'the test must cover the rendered sample arrows');
  assert.ok(gradients.some(g=>g.moved>1e-4),'the generator update must move at least one sample');
  assert.ok(gradients.every(g=>g.positionError<1e-6),'arrows must start at updated samples');
  assert.ok(gradients.filter(g=>g.error<0.003).length/gradients.length>0.95,
    'arrows must match finite differences at updated positions, allowing ReLU kinks and floating-point error');
  await pretrainedPage.close();
  assert.deepEqual(pageErrors,[],'slow iteration cancellation must not cause uncaught page errors');
  console.log('PASS: GAN slow iteration cancellation, pretrained weights and post-update input gradients');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
