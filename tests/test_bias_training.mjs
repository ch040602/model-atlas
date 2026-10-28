import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {biasTrainingStep,biasTrainingOutput} from '../training-lab.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
let r=biasTrainingStep(0,1,0.5,0,0.1);
close(r.prediction,0);close(r.loss,1);close(r.weightGradient,0);close(r.biasGradient,-2);close(r.nextWeight,0.5);close(r.nextBias,0.2);close(r.nextLoss,0.64);
r=biasTrainingStep(1,1,0.5,0,0.1);close(r.weightGradient,-1);close(r.biasGradient,-1);close(r.nextWeight,0.6);close(r.nextBias,0.1);close(r.nextLoss,0.09);
for(const [x,y,w,b,rate] of [[2,-1,0.7,0.4,0.3],[-1.2,0.5,-0.8,-0.6,0.05],[0,1,1,0.2,0.1]]) {
  r=biasTrainingStep(x,y,w,b,rate);const h=1e-6,loss=(ww,bb)=>(ww*x+bb-y)**2;
  close(r.weightGradient,(loss(w+h,b)-loss(w-h,b))/(2*h));close(r.biasGradient,(loss(w,b+h)-loss(w,b-h))/(2*h));
  close(r.nextLoss,loss(w-rate*r.weightGradient,b-rate*r.biasGradient));
}
for(const lang of ['ko','en']) {
 const output=biasTrainingOutput({x:0,y:1,rate:0.1,demoBias:0},0.5,lang);
 assert.match(output,/b_new = 0\.000 − 0\.100 × -2\.000 = 0\.200/);assert.match(output,/L_new = \(0\.200 − 1\.000\)² = 0\.640/);
 assert.match(output,lang==='ko'?/입력 x=0/:/With x=0/);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const width of [390,1440]) for(const lang of ['ko','en']) {
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#foundation',{waitUntil:'domcontentloaded'});if(lang==='en')await page.locator('#language').click();
  await page.locator('#training-x').fill('0');await page.locator('#training-bias summary').click();
  const output=page.locator('#training-bias-output'),bias=page.locator('#training-bias-input');
  assert.match(await output.textContent(),/b_new = 0\.000 − 0\.100 × -2\.000 = 0\.200/);
  assert.equal(await page.locator('#training-status').textContent(),'0 / 20');
  await bias.fill('0.4');assert.match(await output.textContent(),/b_new = 0\.400 − 0\.100 × -1\.200 = 0\.520/);assert.equal(await page.locator('#training-status').textContent(),'0 / 20');
  await page.locator('[data-training-action="next"]').click();assert.equal(await page.locator('#training-status').textContent(),'1 / 20');assert.match(await output.textContent(),/b_new = 0\.400/);assert.match(await page.locator('#training-output').textContent(),/0\.500/);
  await bias.focus();await bias.press('ArrowRight');assert.equal(await bias.inputValue(),'0.5');assert.equal(await page.locator('#training-status').textContent(),'1 / 20');
  await page.locator('#language').click();await page.locator('#training-bias summary').click();assert.equal(await page.locator('#training-bias-input').inputValue(),'0.5');assert.equal(await page.locator('#training-status').textContent(),'1 / 20');assert.match(await page.locator('#training-bias-output').textContent(),/b_new = 0\.500/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`overflow ${lang} ${width}`);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: bias gradients, simultaneous preview, zero input, independent history, keyboard, bilingual and mobile');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
