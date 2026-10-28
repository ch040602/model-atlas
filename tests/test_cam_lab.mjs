import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {camExample} from '../cam-lab.js';

const cases=[];
for(const a of [-2,-0.5,0,0.5,2]) for(const b of [-2,-0.5,0,0.5,2]) for(const bias of [-2,0,1])cases.push([a,b,bias]);
const script=`import json, sys, torch
f=torch.tensor([[[2.,1.],[0.,1.]],[[1.,0.],[2.,1.]]],dtype=torch.float64)
out=[]
for a,b,bias in json.load(sys.stdin):
 w=torch.tensor([a,b],dtype=torch.float64)
 layer=torch.nn.Linear(2,1,dtype=torch.float64)
 with torch.no_grad():
  layer.weight.copy_(w.reshape(1,2)); layer.bias.fill_(bias)
 pooled=torch.nn.functional.adaptive_avg_pool2d(f,1).reshape(2)
 out.append({'map':(f*w.reshape(2,1,1)).sum(dim=0).flatten().tolist(),'logit':layer(pooled).item()})
print(json.dumps(out))`;
const reference=spawnSync('python',['-X','utf8','-c',script],{input:JSON.stringify(cases),encoding:'utf8'});
assert.equal(reference.status,0,reference.stderr);
const expected=JSON.parse(reference.stdout);
cases.forEach(([a,b,bias],i)=>{
 const actual=camExample(a,b,bias);
 actual.map.forEach((x,j)=>assert.ok(Math.abs(x-expected[i].map[j])<1e-12));
 assert.ok(Math.abs(actual.logit-expected[i].logit)<1e-12);
 assert.ok(Math.abs(actual.meanMap+bias-actual.logit)<1e-12);
});
assert.deepEqual(camExample(.5,-1,.25).map,[0,.5,-2,-.5]);
assert.equal(camExample(.5,-1,.25).logit,-.25);
assert.deepEqual(camExample(.5,-1,.25).map,camExample(.5,-1,2).map);
assert.throws(()=>camExample(NaN,0,0),RangeError);

const server=createServer(async(req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
 try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#vision-cam`);
  assert.match(await page.locator('#cam-title').textContent(),/CAM/);
  assert.equal(await page.locator('[data-cam-result="logit"]').textContent(),'-0.250');
  const map=await page.locator('.cam-map').innerText();
  assert.equal(await page.locator('.cam-map td').count(),4);
  const bias=page.locator('#cam-bias');await bias.focus();await page.keyboard.press('End');
  assert.equal(await bias.inputValue(),'2');
  assert.equal(await page.locator('.cam-map').innerText(),map);
  assert.equal(await page.locator('[data-cam-result="logit"]').textContent(),'1.500');
  const weight=page.locator('#cam-weight1');await weight.focus();await page.keyboard.press('Home');
  assert.notEqual(await page.locator('.cam-map').innerText(),map);
  const changed=await page.locator('[data-cam-result="logit"]').textContent();
  await page.locator('#language').click();
  assert.match(await page.locator('#cam-title').textContent(),/feature maps/);
  assert.equal(await page.locator('#cam-weight1').inputValue(),'-2');
  assert.equal(await page.locator('[data-cam-result="logit"]').textContent(),changed);
  assert.match(await page.locator('.cam-results').innerText(),/not a probability/);
  if(!(await page.locator('#library-navigation').evaluate(el=>el.open)))await page.locator('#library-summary').click();
  await page.locator('#concept-search').fill('localization');
  assert.equal(await page.locator('#library-list a[href="#vision-cam"]').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.deepEqual(errors,[]);
  if(process.env.CONCEPT_SCREENSHOTS)await page.locator('[aria-labelledby="cam-title"]').screenshot({path:`test-results/cam-${width}.png`});
  await page.close();
 }
 console.log('PASS: CAM against PyTorch, bias invariance, bilingual keyboard controls and responsive layout');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
