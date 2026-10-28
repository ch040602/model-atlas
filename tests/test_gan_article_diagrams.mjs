import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
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
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  await mkdir(path.join(root,'test-results'),{recursive:true});
  for(const prefix of ['', '/course']) for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}}), requests=[], responses=new Map();
    page.on('request',request=>requests.push(new URL(request.url()).pathname));
    page.on('response',response=>responses.set(new URL(response.url()).pathname,response.status()));
    await page.route('**/*',route=>{
      const u=new URL(route.request().url());
      if(u.origin!==base || u.pathname.endsWith('/ganlab.html') || u.pathname.includes('/node_modules/')) return route.abort();
      return route.continue();
    });
    await page.goto(`${base}${prefix}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'load'});
    const article=page.locator(`[data-model-atlas-article="${lang}"]`);
    assert.ok(await article.isVisible());
    const normalization=article.locator(`#gan-${lang}-normalized-metrics`);
    assert.ok(await normalization.isVisible());
    assert.match(await normalization.textContent(),lang==='ko'?/정규화된 분포에서 계산한 값의 1.09배/:/1.09 times the values calculated on those normalized distributions/);
    const images=article.locator('.supporting-figure img');
    assert.equal(await images.count(),5);
    for(let i=0;i<5;i++) {
      const img=images.nth(i), info=await img.evaluate(node=>({src:new URL(node.src).pathname,alt:node.alt,complete:node.complete,width:node.naturalWidth}));
      assert.ok(info.alt && info.complete && info.width>0,JSON.stringify(info));
      assert.equal(responses.get(info.src),200,info.src);
      assert.ok(info.src.startsWith(`${prefix}/vendor/ganlab/article-`));
    }
    assert.ok(!requests.some(url=>/\/figures\/figure-(data-selected|animated-ring|generator-transformation|discriminator-heatmap|gradients-interplay)\./.test(url)));
    assert.match(await article.textContent(),lang==='ko'?/실제 학습 결과가 아니며 수렴을 보장하지 않습니다/:/not a training run and do not guarantee convergence/);
    await images.nth(1).screenshot({path:path.join(root,'test-results',`gan-article-evolution-${lang}.png`)});
    await page.close();
  }
  console.log('PASS: original GAN diagrams, bilingual alt text and captions at root and project prefix');
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
