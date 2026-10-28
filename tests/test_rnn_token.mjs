import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {tokenInitial,tokenEvaluate,tokenUpdate} from '../rnn-token-training.js';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
const cases=[tokenInitial(),{wx:-.3,wh:1.2,b:.2,v:-.5,c:.4},{wx:1.1,wh:-.8,b:-.3,v:1.5,c:-.2}];
let p=tokenInitial();for(let i=0;i<10;i++){cases.push(p);p=tokenUpdate(p,.1).next;}
const py=`import sys,json,torch
torch.set_default_dtype(torch.float64)
out=[]
for params in json.load(sys.stdin):
 w={k:torch.tensor(v,dtype=torch.float64,requires_grad=True) for k,v in params.items()}
 losses=[]; probs=[]
 for first in [-1,1]:
  for second in [-1,1]:
   h1=torch.tanh(w['wx']*first+w['b'])
   h2=torch.tanh(w['wx']*second+w['wh']*h1+w['b'])
   logits=torch.stack([torch.zeros_like(h2),w['v']*h2+w['c']])
   losses.append(torch.nn.functional.cross_entropy(logits.unsqueeze(0),torch.tensor([int(first==1)])))
   probs.append(torch.softmax(logits,dim=0)[1].item())
 loss=torch.stack(losses).mean(); loss.backward()
 out.append({'loss':loss.item(),'gradient':{k:v.grad.item() for k,v in w.items()},'probs':probs})
print(json.dumps(out))`;
const ref=spawnSync('python',['-X','utf8','-c',py],{input:JSON.stringify(cases),encoding:'utf8'});
assert.equal(ref.status,0,ref.stderr);const expected=JSON.parse(ref.stdout);
for(const [i,params] of cases.entries()){
 const r=tokenEvaluate(params),eps=1e-6;
 near(r.loss,expected[i].loss);r.samples.forEach((s,j)=>near(s.probability,expected[i].probs[j]));
 for(const key of Object.keys(params)){
  near(r.gradient[key],expected[i].gradient[key]);
  near(r.gradient[key],(tokenEvaluate({...params,[key]:params[key]+eps}).loss-tokenEvaluate({...params,[key]:params[key]-eps}).loss)/(2*eps),1e-6);
  near(tokenUpdate(params,.1).next[key],params[key]-.1*r.gradient[key]);
 }
 assert.deepEqual(tokenUpdate(params,0).next,params);
}
assert.ok(tokenEvaluate(p).loss<tokenEvaluate(tokenInitial()).loss);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/#rnn`);
  const count=page.locator('[data-token-count]'),loss=page.locator('[data-token-loss]');
  assert.equal(await count.textContent(),'0');assert.equal(await page.locator('.token-lab tbody tr').count(),4);
  const initial=await loss.textContent();
  await page.locator('[data-token-sample]').selectOption('3');assert.match(await page.locator('#token-output').textContent(),/x₁=1, x₂=1/);
  await page.locator('[data-token-rate]').selectOption('0');await page.locator('[data-token-action="one"]').focus();await page.keyboard.press('Enter');
  assert.equal(await count.textContent(),'1');assert.equal(await loss.textContent(),initial);
  await page.locator('[data-token-action="reset"]').click();await page.locator('[data-token-rate]').selectOption('0.1');await page.locator('[data-token-action="ten"]').click();
  assert.equal(await count.textContent(),'10');assert.ok(Number(await loss.textContent())<Number(initial));const trained=await loss.textContent();
  await page.locator('#language').click();assert.match(await page.locator('#token-title').textContent(),/Learn to predict/);assert.equal(await loss.textContent(),trained);assert.equal(await page.locator('[data-token-sample]').inputValue(),'3');
  await page.locator('#navigation [data-nav="cnn"]').click();await page.locator('#navigation [data-nav="rnn"]').click();assert.equal(await loss.textContent(),trained);
  for(let i=0;i<19;i++)await page.locator('[data-token-action="ten"]').click();
  assert.equal(await count.textContent(),'200');assert.ok(await page.locator('[data-token-action="one"]').isDisabled());
  await page.locator('[data-token-action="reset"]').click();assert.equal(await count.textContent(),'0');assert.equal(await loss.textContent(),initial);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  if(process.env.TOKEN_SCREENSHOTS)await page.locator('.token-lab').screenshot({path:`test-results/rnn-token-${width}.png`});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: PyTorch and finite-difference gradients, training, Korean/English, keyboard, state, reset, limit, mobile');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
