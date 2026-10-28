import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
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
  for(const width of [390,1280]) {
    const page=await browser.newPage({viewport:{width,height:844}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#diffusion`);
    await page.locator('#unit-contents summary').click();
    assert.equal(await page.locator('[data-unit-jump="clip-title"]').count(),1);
    await page.locator('[data-unit-jump="clip-title"]').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'clip-title');
    await page.locator('#clip-component').fill('0');
    for(let i=0;i<4;i++) await page.locator('[data-clip-action="next"]').click();
    assert.equal(await page.locator('#clip-status').textContent(),'5 / 5');
    assert.match(await page.locator('#clip-output').textContent(),/0\.127/);
    assert.ok(await page.locator('[data-clip-action="next"]').isDisabled());
    let widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    assert.ok(widths.scroll<=widths.client+1,`Korean page overflows at ${width}: ${JSON.stringify(widths)}`);
    await page.locator('#language').click();
    assert.match(await page.locator('#clip-output').textContent(),/token-level hidden states/);
    assert.equal(await page.locator('#clip-status').textContent(),'5 / 5');
    widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    assert.ok(widths.scroll<=widths.client+1,`English page overflows at ${width}: ${JSON.stringify(widths)}`);
    await page.locator('[data-clip-action="previous"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#clip-status').textContent(),'4 / 5');
    await page.locator('[data-clip-action="reset"]').click();
    assert.equal(await page.locator('#clip-status').textContent(),'1 / 5');
    await page.locator('#clip-scale').fill('4');
    assert.equal(await page.locator('#clip-value-scale').textContent(),'4.000');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: CLIP navigation, bilingual controls, keyboard and mobile layout');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
