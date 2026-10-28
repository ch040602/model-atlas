import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course-prefix(?=\/)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const prefix of ['', '/course-prefix'])for(const lang of ['ko','en'])for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const url=route.request().url();if(!url.startsWith(`http://127.0.0.1:${server.address().port}/`)){external.push(url);return route.abort();}return route.continue();});
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/cnn-explainer/public/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const formulas=page.locator('#description math');await formulas.first().waitFor({state:'visible',timeout:45000});assert.equal(await formulas.count(),2);
  const relu=formulas.nth(0),softmax=formulas.nth(1);
  assert.match(await relu.getAttribute('aria-label'),lang==='ko'?/렐루/:/ReLU of x/);
  assert.match(await softmax.getAttribute('aria-label'),lang==='ko'?/소프트맥스/:/Softmax of x/);
  assert.equal(await page.getByRole('math').count(),2);
  const math=await softmax.evaluate(el=>{const fraction=el.querySelector('mfrac'),sum=el.querySelector('munder');return {ns:el.namespaceURI,display:getComputedStyle(el).display,rect:el.getBoundingClientRect().toJSON(),numerator:fraction.firstElementChild.getBoundingClientRect().toJSON(),denominator:fraction.lastElementChild.getBoundingClientRect().toJSON(),sum:sum.textContent};});
  assert.equal(math.ns,'http://www.w3.org/1998/Math/MathML');assert.ok(math.rect.width>0&&math.rect.height>0);assert.ok(math.numerator.bottom<=math.denominator.top,'numerator and denominator rendered vertically');assert.equal(math.sum,'∑j');
  assert.ok(!external.some(url=>/mathjax/i.test(url)),'no MathJax request');assert.deepEqual(errors,[]);
  if(process.env.CNN_MATH_SCREENSHOTS&&prefix==='')await softmax.locator('xpath=..').screenshot({path:`test-results/cnn-math-${lang}-${width}.png`});await page.close();
 }
 console.log('PASS: native CNN formulas, bilingual accessible names, MathML fraction layout, blocked external resources and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
