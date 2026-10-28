import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'};
const server=createServer(async(req,res)=>{
  try {
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
try {
  await mkdir(path.join(root,'test-results'),{recursive:true});
  const page=await browser.newPage({viewport:{width:390,height:844}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('[data-nav="transformer"]').click();
  for(let i=0;i<3;i++) await page.locator('[data-block-action="next"]').click();
  for(const lang of ['ko','en']) {
    assert.match(await page.locator('#block-output').textContent(),/\[1\.615, -0\.280\]/);
    await page.locator('[data-block-activation]').selectOption('relu');
    assert.match(await page.locator('#block-output').textContent(),/\[1\.695, -0\.200\]/);
    await page.locator('[data-block-activation]').selectOption('gelu');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,status:document.querySelector('#block-status').getBoundingClientRect().width,actions:document.querySelector('.transformer-block-lab .sequence-actions').getBoundingClientRect().width}));
    assert.ok(widths.scroll<=widths.client+1,`mobile ${lang} page overflows`);
    assert.ok(widths.status>=widths.actions-1,`mobile ${lang} step indicator should occupy its own row`);
    await page.locator('.transformer-block-lab').screenshot({path:path.join(root,'test-results',`transformer-block-gelu-mobile-${lang}.png`)});
    if(lang==='ko') await page.locator('#language').click();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: GELU and ReLU switching, translated explanation and mobile layout');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
