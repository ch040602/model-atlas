import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
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
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const prefix of ['','/course']) for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const cdn=[],local=[],errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/gh/cferdinandi/smooth-scroll@15/**',route=>{cdn.push(route.request().url());return route.abort('failed');});
    page.on('response',response=>{if(new URL(response.url()).pathname===`${prefix}/vendor/cnn/smooth-scroll-15.2.1.polyfills.min.js`)local.push(response);});
    await page.goto(`${base}${prefix}/upstream/cnn-explainer/public/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#detailed-button:not([disabled])',{timeout:45000});
    const paragraph=page.locator(`#relu-nonlinearity-${lang}`);
    await paragraph.waitFor({state:'attached'});
    const explanation=await paragraph.innerText();
    assert.ok(explanation.includes(lang==='ko'?'최대 풀링도 비선형':'Max pooling is also nonlinear'));
    assert.ok(explanation.includes(lang==='ko'?'−1, 0, 1':'x=−1, 0 and 1'));
    assert.equal(await paragraph.locator('a').getAttribute('href'),'https://www.deeplearningbook.org/contents/mlp.html');
    assert.equal(await page.locator(`#relu-nonlinearity-${lang==='ko'?'en':'ko'}`).count(),0);
    assert.equal(await page.evaluate(()=>typeof window.SmoothScroll),'function');
    assert.equal(cdn.length,0);
    assert.ok(local.some(response=>response.ok()),`${prefix || '/'} ${lang}: local script loaded`);
    const node=page.locator('#layer-2-node-0');
    await node.focus();
    await node.press('Enter');
    const info=page.getByRole('button',{name:lang==='ko'?'설명 글로 이동':'Jump to article section'});
    await info.waitFor({state:'visible'});
    await page.evaluate(()=>{window.__scrollStopped=false;document.addEventListener('scrollStop',()=>{window.__scrollStopped=true;},{once:true});});
    await info.focus();
    await info.press('Enter');
    await page.waitForFunction(()=>window.__scrollStopped,null,{timeout:5000});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'article-relu');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: CNN local Smooth Scroll loads and article jumps work in both languages at root and project prefix');
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
