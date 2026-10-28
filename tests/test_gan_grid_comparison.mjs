import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream,existsSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import ts from '../upstream/ganlab/node_modules/typescript/lib/typescript.js';
import {ganGridExample} from '../gan-modes-lab.js';

const source=await readFile(new URL('../upstream/ganlab/demo/ganlab_evaluators.ts',import.meta.url),'utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {GANLabEvaluatorGridDensities}=await import('data:text/javascript;base64,'+Buffer.from(javascript).toString('base64'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`);
const A=[0.001,0.001],B=[0.04,0.001];
for(let i=0;i<=20;i++){
 const q=i/20,reference=new GANLabEvaluatorGridDensities(30);
 const real=Array.from({length:20},(_,j)=>j<10?A:B).flat();
 const generated=Array.from({length:20},(_,j)=>j<i?A:B);
 reference.createGridsForTrue(real,20);reference.updateGridsForGenerated(generated);
 const result=ganGridExample(q);close(result.js,reference.getJSDivergenceScore());close(result.kl,reference.getKLDivergenceScore());
 const p=Array(900).fill(result.eps),r=Array(900).fill(result.eps);p[0]+=0.5;p[1]+=0.5;r[0]+=q;r[1]+=1-q;
 const sum=a=>a.reduce((v,x)=>v+x,0);close(sum(p),1.09);close(sum(r),1.09);
 const normalizedJs=p.reduce((acc,x,k)=>{const pn=x/result.total,qn=r[k]/result.total,m=(pn+qn)/2;return acc+0.5*(pn*Math.log2(pn/m)+qn*Math.log2(qn/m));},0);
 close(result.normalizedJs,normalizedJs);close(result.js,result.total*normalizedJs);
}
assert.equal(ganGridExample(0.5).js,0);for(const q of [-1,2,NaN])assert.throws(()=>ganGridExample(q),RangeError);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#gan');const q=page.locator('[data-ganmodes-input="q"]'),next=page.locator('[data-ganmodes-action="next"]');
  await q.fill('0');await next.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-ganmodes-grid-result="raw"]').textContent(),ganGridExample(0).js.toFixed(6));
  assert.equal(await page.locator('[data-ganmodes-grid-result="normalized"]').textContent(),ganGridExample(0).normalizedJs.toFixed(6));
  assert.match(await page.locator('[data-ganmodes-grid]').textContent(),/898/);
  await q.fill('0.5');assert.equal(await page.locator('[data-ganmodes-grid-result="raw"]').textContent(),'0.000000');
  await page.locator('#language').click();assert.match(await page.locator('[data-ganmodes-grid]').textContent(),/finite samples/);
  assert.equal(await q.inputValue(),'0.5');assert.equal(await page.locator('#ganmodes-status').textContent(),'2 / 3');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));assert.deepEqual(errors,[]);
  if(process.env.GAN_GRID_SCREENSHOT)await page.locator('[data-ganmodes-grid]').screenshot({path:`test-results/gan-grid-${width}.png`});
  await page.close();
 }
 console.log('PASS: actual GAN grid evaluator, normalized comparison, both languages, keyboard and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
