import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {convolutionExperiment, convolutionTraining, convolutionClassification} from '../convolution-lab.js';
import {poolingExperiment} from '../pooling-lab.js';

// Integer arithmetic gives the exact pre-activation numerator for every slider state.
const target=[0,1,0,1], pool={source:'conv',example:1.5,gradient:1};
for(let center=-10;center<=10;center++) for(let strength=0;strength<=20;strength++) for(let bias=-10;bias<=10;bias++) {
  const c=center/10, s=strength/10, b=bias/10;
  const z=[strength*center+10*bias,strength*(20-center)+10*bias,strength*center+10*bias,strength*(20-center)+10*bias];
  const a=z.map(x=>Math.max(0,x)/100), dz=[c,2-c,c,2-c];
  const expectedGradient=a.reduce((sum,x,i)=>sum+(z[i]>0 ? (x-target[i])*dz[i]/2 : 0),0);
  const forward=convolutionExperiment(c,s,b), training=convolutionTraining(c,s,b), classifier=convolutionClassification(c,s,b);
  for(let i=0;i<4;i++) {
    assert.ok(Math.abs(forward.positions[i].sum-z[i]/100)<1e-12,`${c},${s},${b},${i}`);
    if(z[i]===0) {
      assert.equal(forward.positions[i].sum,0,`zero boundary ${c},${s},${b},${i}`);
      assert.ok(training.contributions[i].delta === 0);
      assert.equal(classifier.contributions[i].reluDerivative,0);
    }
  }
  assert.ok(Math.abs(training.gradient-expectedGradient)<1e-12);
  const pooled=a.reduce((x,y)=>x+y,0)/4, probability=1/(1+Math.exp(-pooled));
  const classGradient=dz.reduce((sum,x,i)=>sum+(z[i]>0 ? (probability-1)*x/4 : 0),0);
  assert.ok(Math.abs(classifier.gradient-classGradient)<1e-12);
  const pooledResult=poolingExperiment({center:c,strength:s,bias:b},pool);
  const exactMax=Math.max(...a), winners=a.flatMap((x,i)=>x===exactMax?[i]:[]);
  assert.equal(pooledResult.ties,winners.length,`ties ${c},${s},${b}`);
  assert.equal(pooledResult.winner,winners[0],`winner ${c},${s},${b}`);
}
// A genuinely positive small input remains positive when there is no cancellation.
assert.ok(convolutionExperiment(0,1e-18,0).positions[1].sum>0);
const closeButDistinct=poolingExperiment({center:0,strength:1,bias:0},{...pool,source:'example',example:1-1e-10});
assert.equal(closeButDistinct.ties,1);
assert.equal(closeButDistinct.winner,2);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440])for(const prefix of ['','/course']) {
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/#cnn`);
  for(const lang of ['ko','en']) {
   if(lang==='en')await page.locator('#language').click();
   await page.locator('#conv-center').fill('-1');await page.locator('#conv-strength').fill('0.1');await page.locator('#conv-bias').fill('-0.3');
   while(await page.locator('#conv-status').textContent()!=='10 / 10')await page.locator('[data-conv-action="next"]').click();
   const output=await page.locator('#conv-output').textContent();
   assert.match(output,/∂L\/∂s = 0\.00/);
   assert.match(output,lang==='ko'?/미분 가능하지 않아/:/not differentiable at z=0/);
   await page.locator('#conv-center').fill('1');await page.locator('#conv-strength').fill('0.2');await page.locator('#conv-bias').fill('-0.1');
   while(await page.locator('#pool-status').textContent()!=='3 / 3')await page.locator('[data-pool-action="next"]').click();
   const poolOutput=await page.locator('#pool-output').textContent();
   assert.match(poolOutput,lang==='ko'?/4곳에서 같아/:/4 positions/);
   assert.match(poolOutput,lang==='ko'?/부동소수점 오차 수준/:/floating-point error scale/);
   assert.match(poolOutput,/1\.00, 0\.00 ; 0\.00, 0\.00/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: all 9,261 CNN slider states against integer reference; boundary and tie UI in both languages, mobile and project prefix');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
