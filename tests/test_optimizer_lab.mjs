import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {optimizerInitial,optimizerStep} from '../optimizer-lab.js';
const schedules=[[.1],[...Array(50).fill(.1)],[...Array(10).fill(.5)],[0,0,.01,.1,0,.5,.1]];
const script=`import json,sys,torch
torch.set_default_dtype(torch.float64)
results=[]
for schedule in json.load(sys.stdin):
 params=[torch.nn.Parameter(torch.tensor(0.)) for _ in range(3)]
 opts=[torch.optim.SGD([params[0]],lr=0),torch.optim.SGD([params[1]],lr=0,momentum=.9),torch.optim.Adam([params[2]],lr=0,betas=(.9,.999),eps=1e-8)]
 states=[]
 for rate in schedule:
  for p,opt in zip(params,opts):
   opt.param_groups[0]['lr']=rate
   opt.zero_grad(); ((p-3)**2).backward(); opt.step()
  states.append({'weights':[p.item() for p in params],'momentum':opts[1].state[params[1]]['momentum_buffer'].item(),'m':opts[2].state[params[2]]['exp_avg'].item(),'v':opts[2].state[params[2]]['exp_avg_sq'].item()})
 results.append(states)
print(json.dumps(results))`;
const result=spawnSync('python',['-X','utf8','-c',script],{input:JSON.stringify(schedules),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
const reference=JSON.parse(result.stdout),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const [j,schedule] of schedules.entries()){
 let state=optimizerInitial();
 for(const [i,rate] of schedule.entries()){
  const before=state;const r=optimizerStep(state,rate);state=r.next;const expected=reference[j][i];
  [state.sgd.w,state.momentum.w,state.adam.w].forEach((v,k)=>near(v,expected.weights[k]));
  near(state.momentum.v,expected.momentum);near(state.adam.m,expected.m);near(state.adam.v,expected.v);
  if(rate===0){near(state.sgd.w,before.sgd.w);near(state.momentum.w,before.momentum.w);near(state.adam.w,before.adam.w);}
 }
}
assert.throws(()=>optimizerStep({...optimizerInitial(),step:200},.1),RangeError);
const server=createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/concepts.html#optimizers`);
  const count=page.locator('[data-optimizer-count]'),rows=page.locator('.optimizer-lab tbody tr');
  assert.equal(await count.textContent(),'0');assert.equal(await rows.count(),3);
  await page.locator('[data-optimizer-action="one"]').focus();await page.keyboard.press('Enter');assert.equal(await count.textContent(),'1');
  assert.match(await rows.nth(0).innerText(),/0\.6000/);assert.match(await rows.nth(2).innerText(),/0\.1000/);
  const weights=await rows.allTextContents();await page.locator('[data-optimizer-rate]').selectOption('0');await page.locator('[data-optimizer-action="one"]').click();
  assert.deepEqual(await rows.allTextContents(),weights);assert.equal(await count.textContent(),'2');assert.match(await page.locator('#optimizer-output').innerText(),/Adam m=/);
  await page.locator('#language').click();assert.match(await page.locator('#optimizer-title').textContent(),/Compare/);assert.equal(await count.textContent(),'2');assert.equal(await page.locator('[data-optimizer-rate]').inputValue(),'0');
  await page.locator('[data-optimizer-action="reset"]').click();
  for(let i=0;i<19;i++)await page.locator('[data-optimizer-action="ten"]').click();for(let i=0;i<5;i++)await page.locator('[data-optimizer-action="one"]').click();
  assert.equal(await count.textContent(),'195');await page.locator('[data-optimizer-action="ten"]').click();
  assert.equal(await count.textContent(),'200');assert.ok(await page.locator('[data-optimizer-action="ten"]').isDisabled());
  await page.locator('[data-optimizer-action="reset"]').click();assert.equal(await count.textContent(),'0');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));assert.deepEqual(errors,[]);
  if(process.env.OPTIMIZER_SCREENSHOTS)await page.locator('.optimizer-lab').screenshot({path:`test-results/optimizer-${width}.png`});await page.close();
 }
 console.log('PASS: SGD, momentum and Adam vs PyTorch, rate changes, bilingual keyboard, reset, limit and mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
