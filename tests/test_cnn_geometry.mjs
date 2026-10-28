import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {convolutionGeometry} from '../cnn-geometry-lab.js';

for(let I=3;I<=8;I++) for(let K=1;K<=5;K++) for(let P=0;P<=2;P++) for(let S=1;S<=3;S++) {
  const x=convolutionGeometry({inputSize:I,kernelSize:K,padding:P,stride:S});
  const total=I+2*P;
  assert.equal(x.windows.length,total<K?0:Math.floor((total-K)/S)+1);
  for(const [i,w] of x.windows.entries()) {
    assert.equal(w.start,i*S);
    const expected=Array.from({length:K},(_,j)=>{const pos=w.start+j-P;return pos<0||pos>=I?0:pos+1;});
    assert.deepEqual(w.values,expected);
    assert.equal(w.sum,expected.reduce((a,b)=>a+b,0));
  }
  const remaining=Array.from({length:total},(_,j)=>j).filter(j=>!x.windows.some(w=>j>=w.start&&j<w.start+K));
  assert.deepEqual(x.uncovered,remaining);
}
assert.throws(()=>convolutionGeometry({inputSize:0,kernelSize:1,padding:0,stride:1}));
assert.throws(()=>convolutionGeometry({inputSize:5,kernelSize:2,padding:0,stride:0}));
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');const type={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/#cnn',{waitUntil:'domcontentloaded'});
    const output=page.locator('#geometry-output');
    assert.match(await output.textContent(),/\[0, 1, 2, 3, 4, 5, 0\]/);
    await page.locator('[data-geometry-action=next]').click();
    assert.match(await output.textContent(),/\[0, 1, 2\].*= 3/);
    await page.locator('[data-geometry-action=next]').click();
    assert.match(await output.textContent(),/출력 = \[3, 9, 9\]/);
    assert.match(await output.textContent(),/⌊\(5 \+ 2 × 1 − 3\) \/ 2⌋ \+ 1 = 3/);
    async function set(key,value){await page.locator(`#geometry-${key}`).fill(String(value));}
    await set('padding',0); await set('stride',3);
    assert.match(await output.textContent(),/출력 = \[6\]/);
    assert.match(await output.textContent(),/인덱스: \[3, 4\]/);
    await set('inputSize',3);await set('kernelSize',5);
    assert.match(await output.textContent(),/필터가 패딩된 입력보다 길어/);
    assert.doesNotMatch(await output.textContent(),/O = ⌊/);
    await page.locator('#language').click();
    assert.match(await output.textContent(),/The filter is longer than the padded input/);
    assert.equal(await page.locator('#geometry-value-kernelSize').textContent(),'5');
    await set('padding',1);
    assert.match(await output.textContent(),/Output = \[6\]/);
    await set('inputSize',8);await set('kernelSize',5);await set('padding',2);await set('stride',1);
    assert.match(await output.textContent(),/Output = \[6, 10, 15, 20, 25, 30, 26, 21\]/);
    const maxSizes=await page.locator('.geometry-lab').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth}));
    assert.ok(maxSizes.scroll<=maxSizes.width+1,`expanded geometry overflow ${width}: ${JSON.stringify(maxSizes)}`);
    await page.locator('[data-nav=foundation]').first().click();
    await page.locator('[data-nav=cnn]').first().click();
    assert.equal(await page.locator('#geometry-status').textContent(),'3 / 3');
    assert.match(await output.textContent(),/Output = \[6, 10, 15, 20, 25, 30, 26, 21\]/);
    await page.locator('[data-geometry-action=previous]').focus();
    await page.locator('[data-geometry-action=previous]').press('Space');
    assert.equal(await page.locator('#geometry-status').textContent(),'2 / 3');
    assert.doesNotMatch(await output.textContent(),/O = ⌊/);
    await page.locator('[data-geometry-action=reset]').click();
    assert.equal(await page.locator('#geometry-status').textContent(),'1 / 3');
    const sizes=await page.locator('.geometry-lab').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth}));
    assert.ok(sizes.scroll<=sizes.width+1,`geometry overflow ${width}: ${JSON.stringify(sizes)}`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: exhaustive padding/stride geometry, invalid configurations and bilingual desktop/mobile browser controls');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
