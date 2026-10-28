import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const lang of ['ko','en'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount===1931,null,{timeout:45000});
  assert.ok(await page.locator(`#gan-${lang}-loss-display`).isVisible());
  const values=await page.locator('gan-lab').evaluate(async el=>{
   const captured=[];
   for(const type of ['Log loss','LeastSq loss']){
    el.disabledPretrainedMode();el.createExperiment();el.model.lossType=type;
    const dBase=el.model.dLoss.bind(el.model),gBase=el.model.gLoss.bind(el.model);
    const dCalls=[],gCalls=[];
    el.model.dLoss=(...args)=>{const value=dBase(...args);dCalls.push(value.dataSync()[0]);return value;};
    el.model.gLoss=(...args)=>{const value=gBase(...args);gCalls.push(value.dataSync()[0]);return value;};
    el.isPlaying=true;await el.iterateTraining(false);el.isPlaying=false;
    const snapshot=()=>({dText:document.getElementById('d-loss-value').textContent,gText:document.getElementById('g-loss-value').textContent,dChart:el.costChartData[0].at(-1).y,gChart:el.costChartData[1].at(-1).y});
    const actual=snapshot();
    el.model.dLoss=(...args)=>dBase(...args).mul(0);
    el.model.gLoss=(...args)=>gBase(...args).mul(0);
    el.isPlaying=true;await el.iterateTraining(false);el.isPlaying=false;
    const zero=snapshot();
    el.model.dLoss=dBase;el.model.gLoss=gBase;
    el.isPlaying=true;await el.iterateTraining(false,'G');el.isPlaying=false;
    const onlyG=snapshot();
    el.isPlaying=true;await el.iterateTraining(false,'D');el.isPlaying=false;
    const onlyD=snapshot();
    captured.push({type,dCalls,gCalls,actual,zero,onlyG,onlyD});
   }
   return captured;
  });
  for(const {type,dCalls,gCalls,actual,zero,onlyG,onlyD} of values){
   assert.ok(dCalls.length>=1&&gCalls.length>=1,`${type}: test must perform actual optimizer updates`);
   assert.ok(dCalls.at(-1)>0&&gCalls.at(-1)>0);
   assert.equal(actual.dText,dCalls.at(-1).toFixed(3));assert.equal(actual.dChart,dCalls.at(-1).toFixed(3));
   assert.equal(actual.gText,gCalls.at(-1).toFixed(3));assert.equal(actual.gChart,gCalls.at(-1).toFixed(3));
   assert.deepEqual(zero,{dText:'0.000',gText:'0.000',dChart:'0.000',gChart:'0.000'});
   assert.equal(onlyG.dText,'0.000');assert.equal(onlyG.dChart,null);
   assert.equal(onlyD.gText,onlyG.gText);assert.equal(onlyD.gChart,null);
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: GAN loss numbers and charts match actual last training losses for both objectives; zeros display in Korean and English at mobile and desktop widths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
