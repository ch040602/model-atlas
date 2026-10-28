import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {xorForward,xorInputs} from '../xor-lab.js';

const sigmoid=z=>1/(1+Math.exp(-z));
for(const [a,b] of xorInputs)for(const mode of ['relu','linear']){
  const r=xorForward(a,b,mode);
  assert.equal(r.target,(a+b)%2);
  const expectedLogit=mode==='relu'?6*Math.abs(a-b)-3:-3;
  assert.equal(r.logit,expectedLogit);
  assert.ok(Math.abs(r.probability-sigmoid(expectedLogit))<1e-12);
  assert.equal(r.prediction,expectedLogit>=0?1:0);
}
assert.throws(()=>xorForward(2,0,'relu'),RangeError);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const lang of ['ko','en']){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+prefix+'/concepts.html#nonlinear-mlp');
    if(lang==='en')await page.locator('#language').click();
    const input=page.locator('#xor-input'),activation=page.locator('#xor-activation'),out=page.locator('#xor-output');
    for(let i=0;i<4;i++){
      await input.selectOption(String(i));
      assert.equal(await out.locator('tbody tr.xor-selected').count(),1);
      assert.equal(await out.locator('tbody tr.xor-selected td').first().textContent(),`(${xorInputs[i][0]}, ${xorInputs[i][1]})`);
      assert.equal((await out.locator('tbody tr.xor-selected td').nth(2).textContent()),(i===1||i===2)?'0.953':'0.047');
    }
    await input.selectOption('1');await activation.focus();await page.keyboard.press('End');await page.keyboard.press('Enter');
    assert.equal(await activation.inputValue(),'linear');
    assert.equal(await out.locator('tbody tr.xor-selected td').nth(2).textContent(),'0.047');
    await page.locator('#language').click();
    assert.equal(await page.locator('#xor-input').inputValue(),'1');
    assert.equal(await page.locator('#xor-activation').inputValue(),'linear');
    assert.equal(await page.locator('#xor-output tbody tr.xor-selected td').nth(2).textContent(),'0.047');
    if(width===390){
      const table=page.locator('.xor-lab .xor-table-wrap');await table.focus();await page.keyboard.press('ArrowRight');
      await page.waitForFunction(()=>document.querySelector('.xor-lab .xor-table-wrap')?.scrollLeft>0);
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    if(!prefix && width===1440 && lang==='ko'){
      await page.goto(base+'/concepts.html#learning');
      await page.locator('#concept-search').fill('XOR');
      await page.locator('#library-list a[href="#nonlinear-mlp"]').click();
      await page.locator('#xor-title').waitFor();
    }
    if(!prefix && width===390 && lang==='ko' && process.env.XOR_SCREENSHOT) await page.locator('.xor-lab').screenshot({path:'test-results/xor-mobile.png'});
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: all XOR inputs and activations, independent values, keyboard, bilingual state and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
