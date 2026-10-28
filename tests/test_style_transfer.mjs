import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {styleTransferExample} from '../style-transfer-lab.js';

const cases = [];
for (const swap of [false, true]) for (let weight = 0; weight <= 4; weight += .25) for (let rate = 0; rate <= .5; rate += .05) cases.push({swap, weight, rate});
const reference = spawnSync('python', ['-X', 'utf8', '-c', `import json,sys,torch
torch.set_default_dtype(torch.float64)
C=torch.tensor([[1.,0.],[0.,1.]])
S=torch.tensor([[1.,1.],[1.,0.]])
A=S@S.T/2
out=[]
for case in json.load(sys.stdin):
 F=torch.tensor([[.6,.4],[.2,.8]])
 if case['swap']: F=F.flip(1)
 F.requires_grad_()
 G=F@F.T/2
 c=((F-C)**2).mean(); s=((G-A)**2).mean(); loss=c+case['weight']*s
 grad,=torch.autograd.grad(loss,F)
 next=F.detach()-case['rate']*grad
 nc=((next-C)**2).mean(); ns=((next@next.T/2-A)**2).mean()
 out.append([G.tolist(),c.item(),s.item(),grad.tolist(),next.tolist(),(nc+case['weight']*ns).item()])
print(json.dumps(out))`], {input: JSON.stringify(cases), encoding: 'utf8'});
assert.equal(reference.status, 0, reference.stderr);
const expected = JSON.parse(reference.stdout);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-12, `${a} != ${b}`);
cases.forEach(({weight,rate,swap}, i) => {
  const r=styleTransferExample(weight,rate,swap), e=expected[i];
  for(let j=0;j<2;j++)for(let k=0;k<2;k++){close(r.current[j][k],e[0][j][k]);close(r.gradient[j][k],e[3][j][k]);close(r.next[j][k],e[4][j][k]);}
  close(r.contentLoss,e[1]);close(r.styleLoss,e[2]);close(r.nextTotal,e[5]);
});
const a=styleTransferExample(1,.2,false), b=styleTransferExample(1,.2,true);
assert.deepEqual(a.current,b.current);close(a.styleLoss,b.styleLoss);assert.notEqual(a.contentLoss,b.contentLoss);
for(const args of [[-1,.2,false],[1,.6,false],[NaN,0,false],[1,.2,'yes']])assert.throws(()=>styleTransferExample(...args),RangeError);

const server=createServer(async(req,res)=>{
  let file=new URL(req.url,'http://localhost').pathname.replace(/^\/course\//,'/').slice(1)||'index.html';
  if(!/^[\w.-]+$/.test(file))return res.writeHead(404).end();
  try{const data=await readFile(new URL('../'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript; charset=utf-8'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:existsSync(chrome)?{executablePath:chrome}:{})});
  for(const prefix of ['', '/course'])for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/concepts.html#style-transfer`);
    assert.match(await page.locator('#style-transfer-title').innerText(),/그램 행렬/);
    const initialStyle=await page.locator('[data-style-result="style"]').innerText();
    const initialContent=await page.locator('[data-style-result="content"]').innerText();
    await page.locator('[data-style-swap]').focus();await page.keyboard.press('Space');
    assert.equal(await page.locator('[data-style-result="style"]').innerText(),initialStyle);
    assert.notEqual(await page.locator('[data-style-result="content"]').innerText(),initialContent);
    await page.locator('#style-weight').focus();await page.keyboard.press('End');
    await page.locator('#style-rate').focus();await page.keyboard.press('Home');
    assert.equal(await page.locator('[data-style-result="total"]').innerText(),await page.locator('[data-style-result="next-total"]').innerText());
    await page.locator('#language').click();
    assert.match(await page.locator('#style-transfer-title').innerText(),/Gram matrices/);
    assert.equal(await page.locator('#style-weight').inputValue(),'4');
    assert.equal(await page.locator('#style-rate').inputValue(),'0');
    assert.ok(await page.locator('[data-style-swap]').isChecked());
    assert.match(await page.locator('#style-transfer-output').innerText(),/no|not|need not/);
    await page.locator('#library-navigation').evaluate(e=>{e.open=true});
    await page.locator('#concept-search').fill('style transfer');
    assert.equal(await page.locator('#library-list a[href="#style-transfer"]').count(),1);
    assert.equal(await page.locator('a[href="https://docs.pytorch.org/tutorials/advanced/neural_style_tutorial.html"]').count(),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    assert.deepEqual(errors,[]);
    if(process.env.CONCEPT_SCREENSHOTS&&prefix==='')await page.locator('[aria-labelledby="style-transfer-title"]').screenshot({path:`test-results/style-transfer-${width}.png`});
    await page.close();
  }
  console.log(`PASS: ${cases.length} style-transfer cases against PyTorch autograd, position invariance, keyboard, bilingual state and layout`);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
