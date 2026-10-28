import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {mkdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  await mkdir(path.join(root,'test-results'),{recursive:true});
  const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:390,height:844}}), requests=[],errors=[];
    page.on('request',request=>requests.push(request.url()));
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${origin}/#transformer`,{waitUntil:'domcontentloaded'});
    if(lang==='en') await page.locator('#language').click();
    const link=page.locator('[data-transformer-article]');
    const url=new URL(await link.getAttribute('href'),page.url());
    assert.equal(url.searchParams.get('lang'),lang);
    assert.equal(url.searchParams.get('view'),'article');
    await page.goto(url.href,{waitUntil:'domcontentloaded'});
    await page.locator('.article-reader #description').waitFor({state:'visible',timeout:45000});
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await page.locator('#landing').count(),0);
    assert.match(await page.locator('.article-reader nav p').textContent(),lang==='ko'?/방향키/:/arrow keys/);
    assert.match(await page.locator('#description h1').first().textContent(),lang==='ko'?/트랜스포머란/:/What is a Transformer/);
    const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,article:document.querySelector('#description').getBoundingClientRect().width}));
    assert.ok(dimensions.scroll<=dimensions.viewport+1,`${lang}: reader page fits: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.article<=dimensions.viewport,`${lang}: article fits screen`);
    for(const name of ['embedding','qkv','attention','mlp','sampling']) {
      const region=page.locator(`.${name}-example-scroll`);
      assert.ok(await region.evaluate(el=>el.scrollWidth>el.clientWidth),`${lang}: ${name} table can scroll`);
      await region.focus();
      assert.equal(await region.evaluate(el=>document.activeElement===el),true);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(250);
      assert.ok(await region.evaluate(el=>el.scrollLeft>0),`${lang}: ${name} responds to keyboard`);
    }
    assert.ok(await page.locator('#description .katex-display').count()>0);
    const mathRegions=page.locator('#description .math-scroll');
    assert.equal(await mathRegions.count(),await page.locator('#description .katex-display').count());
    const math=await mathRegions.evaluateAll(nodes=>nodes.map(el=>({width:el.clientWidth,scroll:el.scrollWidth,overflow:getComputedStyle(el).overflowX})));
    assert.ok(math.every(m=>m.scroll<=m.width+1||m.overflow==='auto'),`${lang}: long formulas scroll inside article`);
    for(let i=0;i<math.length;i++) if(math[i].scroll>math[i].width+1) {
      const region=mathRegions.nth(i);await region.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);
      assert.ok(await region.evaluate(el=>el.scrollLeft>0),`${lang}: formula responds to keyboard`);
    }
    await page.locator('#figure-attention-guide').screenshot({path:path.join(root,'test-results',`transformer-reader-mobile-${lang}.png`)});
    await page.locator('#figure-attention-guide').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(root,'test-results',`transformer-reader-viewport-${lang}.png`)});
    assert.equal(requests.some(url=>/gpt2\.onnx\.part|tokenizer(_config)?\.json/.test(url)),false,'article view does not load model or tokenizer');
    assert.deepEqual(errors,[]);
    const back=page.locator('.article-reader nav a');
    const backUrl=new URL(await back.getAttribute('href'),page.url());
    assert.equal(backUrl.searchParams.get('lang'),lang);
    assert.equal(backUrl.searchParams.has('view'),false);
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.route('**/resolve/**/tokenizer*.json',route=>route.abort());
    await back.click();
    await page.locator('#landing').waitFor({state:'visible',timeout:45000});
    assert.equal(await page.locator('.article-reader').count(),0,`${lang}: back link opens the original lab`);
    await page.close();
  }
  console.log('PASS: bilingual mobile Transformer reader, course links, math, tables and no model load');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
