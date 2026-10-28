import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {retrieveExample,ragOutput} from '../rag-retrieval-lab.js';

// Closed-form comparison: rare terms occur in one document, blue in two, blocks in three.
const rare=1+Math.log(2),blue=1+Math.log(4/3);
const expected=[
 [2*rare*rare/(Math.sqrt(2)*rare*Math.sqrt(2*rare*rare+1)),0,0],
 [1/(Math.sqrt(blue*blue+1)*Math.sqrt(2*rare*rare+1)),Math.sqrt((blue*blue+1)/(rare*rare+blue*blue+1)),Math.sqrt((blue*blue+1)/(rare*rare+blue*blue+1))],
 [0,0,0]
];
for(let i=0;i<3;i++){
 const r=retrieveExample(i);
 for(let j=0;j<3;j++)assert.ok(Math.abs(r.rows[j].score-expected[i][j])<1e-12);
}
assert.equal(retrieveExample(0).selected.id,1);
assert.equal(retrieveExample(1).rows[1].score,retrieveExample(1).rows[2].score);
assert.equal(retrieveExample(1).selected.id,2);
assert.equal(retrieveExample(2).selected,null);
assert.match(ragOutput(2,'ko'),/계산 불가/);
assert.match(ragOutput(2,'en'),/undefined/);
assert.throws(()=>retrieveExample(3),RangeError);

const server=createServer(async(req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
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
  await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#retrieval-generation`);
  assert.equal(await page.locator('[data-rag-context]').textContent(),'[D1] alpha red blocks');
  await page.locator('[data-rag-query]').selectOption('1');
  assert.equal(await page.locator('[data-rag-context]').textContent(),'[D2] beta blue blocks');
  await page.locator('[data-rag-query]').focus();await page.keyboard.press('End');
  assert.equal(await page.locator('[data-rag-context]').textContent(),'선택된 근거 없음');
  assert.match(await page.locator('#rag-output').textContent(),/계산 불가/);
  await page.locator('#language').click();
  assert.equal(await page.locator('[data-rag-query]').inputValue(),'2');
  assert.equal(await page.locator('[data-rag-context]').textContent(),'No evidence selected');
  assert.match(await page.locator('#rag-output').textContent(),/undefined/);
  assert.match(await page.locator('.rag-lab').textContent(),/does not run a language model/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  await page.locator('#language').click();
  assert.equal(await page.locator('[data-rag-query]').inputValue(),'2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: TF-IDF retrieval closed-form checks, tie, zero query, bilingual state, keyboard and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
