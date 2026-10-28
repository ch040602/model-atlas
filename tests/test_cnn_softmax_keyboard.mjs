import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
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
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  await mkdir(path.join(root,'test-results'),{recursive:true});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/cnn-explainer/public/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#detailed-button:not([disabled])',{timeout:45000});
    for(const [name,url] of (lang==='ko'
      ? [['연구 논문','https://arxiv.org/abs/2004.15004'],['시연 영상','https://youtu.be/HnWIHWFbuUQ'],['오픈소스 코드','https://github.com/poloclub/cnn-explainer']]
      : [['Research paper','https://arxiv.org/abs/2004.15004'],['Demo video','https://youtu.be/HnWIHWFbuUQ'],['Open-source code','https://github.com/poloclub/cnn-explainer']])) {
      const link=page.getByRole('link',{name,exact:true});
      assert.equal(await link.count(),1);
      assert.equal(await link.getAttribute('href'),url);
      assert.equal(await link.locator('img').getAttribute('alt'),'');
    }
    const node=page.locator('#layer-11-node-0');
    await node.focus(); await node.press('Enter');
    const open=page.getByRole('button',{name:lang==='ko'?'Softmax 계산 열기':'Open softmax calculation'});
    await open.waitFor({state:'attached'});
    await open.focus(); await open.press('Enter');
    const picker=page.getByRole('combobox',{name:lang==='ko'?'강조할 클래스 로짓':'Highlight class logit'});
    await picker.waitFor({state:'visible'});
    const pointerAlts=await page.locator('.annotation img[src$="pointer.svg"]').evaluateAll(images=>images.map(image=>image.getAttribute('alt')));
    assert.ok(pointerAlts.length>0 && pointerAlts.every(alt=>alt===''));
    assert.equal(await picker.locator('option').count(),11);
    assert.match(await picker.locator('option').nth(1).textContent(),lang==='ko'?/구명보트: -?\d/:/lifeboat: -?\d/);
    await page.waitForSelector('#logit-circle-2');
    await picker.focus();
    await picker.selectOption('2');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-2')?.style.fontWeight==='bold');
    assert.equal(await page.locator('#logit-circle-2').evaluate(el=>el.style.strokeWidth),'2');
    await picker.selectOption('4');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-4')?.style.fontWeight==='bold');
    assert.equal(await page.locator('#softmax-svg .formula-term-4').first().evaluate(el=>el.style.fillOpacity),'1');
    assert.equal(await page.locator('#logit-circle-2').evaluate(el=>el.style.strokeWidth),'1');
    await page.waitForFunction(()=>document.querySelector('#logit-circle-4')?.style.strokeWidth==='2',null,{timeout:30000});
    await picker.locator('xpath=ancestor::div[contains(@class,"container")][1]').screenshot({path:path.join(root,'test-results',`cnn-softmax-picker-${lang}.png`)});
    const term=page.locator('#softmax-svg .denominator text').filter({has:page.locator('.formula-term-1')});
    await term.dispatchEvent('mouseover');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-1')?.style.fontWeight==='bold');
    await term.dispatchEvent('mouseleave');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-4')?.style.fontWeight==='bold');
    await page.locator('#logit-circle-2').dispatchEvent('mouseover');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-2')?.style.fontWeight==='bold');
    await page.locator('#logit-circle-2').dispatchEvent('mouseleave');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-4')?.style.fontWeight==='bold');
    await picker.press('ArrowDown');
    assert.equal(await picker.inputValue(),'5');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-5')?.style.fontWeight==='bold');
    await page.waitForFunction(()=>document.querySelector('#logit-circle-5')?.style.strokeWidth==='2',null,{timeout:30000});
    await picker.press('Tab');
    assert.equal(await picker.inputValue(),'-1');
    await page.waitForFunction(()=>document.querySelector('#softmax-svg .formula-term-5')?.style.fontWeight==='normal');
    assert.equal(await page.locator('#logit-circle-5').evaluate(el=>el.style.strokeWidth),'1');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: CNN Softmax keyboard logit selection, highlighting, hover and cleanup in both languages');
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
