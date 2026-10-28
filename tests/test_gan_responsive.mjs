import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+name);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const width of [390,1440])for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  await page.goto(`${base}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('gan-lab')?.model,null,{timeout:45000});
  const article=page.locator(`[data-model-atlas-article="${lang}"]`),help=page.locator('#mobile-lab-help'),demo=page.locator('#demo');
  assert.ok(await article.isVisible());
  const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,article:document.querySelector('#description').getBoundingClientRect().width,demo:document.querySelector('#demo').clientWidth,demoContent:document.querySelector('#demo').scrollWidth}));
  if(width===390){
   assert.ok(dimensions.page<=dimensions.viewport+1,JSON.stringify(dimensions));
   assert.ok(dimensions.article<=dimensions.viewport,JSON.stringify(dimensions));
   assert.ok(dimensions.demoContent>dimensions.demo,JSON.stringify(dimensions));
   assert.ok(await help.isVisible());
   assert.equal(await demo.getAttribute('aria-label'),lang==='ko'?'가로로 이동하는 GAN 실습':'Horizontally scrollable GAN Lab');
   for(const img of await article.locator('.supporting-figure img').all()){
    const rect=await img.boundingBox();assert.ok(rect.width<=dimensions.article+1);
   }
   await demo.focus();await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('#demo').scrollLeft>0);
   if(lang==='ko'){
    // Exercise actual model training after the responsive layout is applied.
    const counts=await page.locator('gan-lab').evaluate(el=>{
     el.disabledPretrainedMode();el.createExperiment();
     const before=el.model.gVariables.map(v=>Array.from(v.dataSync()));
     el.onClickStepModeButton();el.onClickNextStepButton('G');
     const after=el.model.gVariables.map(v=>Array.from(v.dataSync()));
     return {changed:before.some((v,i)=>v.some((x,j)=>x!==after[i][j]))};
    });
    assert.ok(counts.changed,'generator update changes actual weights');
   }
  }else{
   assert.ok(!(await help.isVisible()));
   assert.equal(dimensions.demoContent,dimensions.demo);
  }
  if(process.env.GAN_RESPONSIVE_SCREENSHOT&&width===390)await article.screenshot({path:`test-results/gan-responsive-${lang}.png`});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: GAN article and scrollable lab in Korean and English, mobile keyboard and generator training, desktop layout');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
