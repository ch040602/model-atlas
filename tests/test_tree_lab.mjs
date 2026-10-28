import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {treeSplit,treePrediction} from '../tree-lab.js';

const labels=['A','B','A','B','B','A'];
const impurity=xs=>2*xs.filter(x=>x==='A').length*xs.filter(x=>x==='B').length/xs.length**2;
for(let threshold=1;threshold<=5;threshold++){
  const r=treeSplit(threshold),left=labels.slice(0,threshold),right=labels.slice(threshold);
  assert.equal(r.valid,true);
  assert.ok(Math.abs(r.weighted-(left.length*impurity(left)+right.length*impurity(right))/6)<1e-12);
  assert.ok(Math.abs(r.gain-(.5-r.weighted))<1e-12);
  for(let x=0;x<=7;x++){
    const leaf=x<=threshold?left:right,majority=leaf.filter(v=>v==='A').length>=leaf.filter(v=>v==='B').length?'A':'B';
    assert.equal(treePrediction(r,x).label,majority);
  }
}
assert.equal(treeSplit(2).gain,0);
assert.equal(treePrediction(treeSplit(2),1).tie,true);
for(const threshold of [0,6]){assert.equal(treeSplit(threshold).valid,false);assert.throws(()=>treePrediction(treeSplit(threshold),1),RangeError);}
for(const threshold of [-1,7,1.5,NaN])assert.throws(()=>treeSplit(threshold),RangeError);

const server=createServer(async(req,res)=>{
  const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';
  if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
  try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
  browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#trees`);
    const result=key=>page.locator(`[data-tree-result="${key}"]`).textContent();
    assert.equal(await result('weighted'),'0.444');assert.equal(await result('gain'),'0.056');
    assert.equal(await result('best'),'1, 5');assert.equal(await result('prediction'),'B');
    await page.locator('#tree-threshold').fill('2');
    assert.equal(await result('gain'),'0.000');assert.equal(await result('prediction'),'A');
    assert.match(await page.locator('#tree-output').textContent(),/동수/);
    await page.locator('#tree-threshold').focus();await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#tree-threshold').inputValue(),'1');
    await page.locator('#tree-threshold').fill('0');assert.equal(await page.locator('[data-tree-invalid]').count(),1);
    assert.equal(await page.locator('[data-tree-result="prediction"]').count(),0);
    await page.locator('#tree-threshold').fill('6');assert.equal(await page.locator('[data-tree-invalid]').count(),1);
    await page.locator('#tree-threshold').fill('3');await page.locator('#tree-input').fill('1');
    assert.equal(await result('prediction'),'A');
    await page.locator('#language').click();
    assert.match(await page.locator('#tree-title').textContent(),/decision-tree split/);
    assert.equal(await page.locator('#tree-threshold').inputValue(),'3');assert.equal(await page.locator('#tree-input').inputValue(),'1');
    assert.equal(await result('prediction'),'A');
    await page.locator('#library-navigation').evaluate(element=>{element.open=true;});
    await page.locator('#concept-search').fill('decision');
    assert.equal(await page.locator('#library-list a[href="#trees"]').count(),1);
    await page.locator('#library-list a[href="#trees"]').click();
    assert.equal(await result('prediction'),'A');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: all split arithmetic and predictions, invalid and tied cases, bilingual state, keyboard and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
