import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {rnnOutputExperiment} from '../rnn-output-lab.js';

const eps=1e-5;
for(let i=-15;i<=15;i++) for(let j=-20;j<=20;j++) for(const b of [-1,0,1]) {
  const u=i/10,v=j/10,r=rnnOutputExperiment(u,v,b);
  const loss=(a,c,d)=>rnnOutputExperiment(a,c,d).loss;
  const numerical=[(loss(u+eps,v,b)-loss(u-eps,v,b))/(2*eps),(loss(u,v+eps,b)-loss(u,v-eps,b))/(2*eps),(loss(u,v,b+eps)-loss(u,v,b-eps))/(2*eps)];
  [r.du,r.dv,r.db].forEach((gradient,k)=>assert.ok(Math.abs(gradient-numerical[k])<1e-8,`${u},${v},${b},${k}`));
  assert.ok(Math.abs(r.after.loss-loss(r.updated.u,r.updated.v,r.updated.b))<1e-12);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#rnn`);
    assert.equal(await page.locator('#rnn-output-status').textContent(),'1 / 5');
    await page.locator('#rnn-output-v').focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#rnn-output-value-v').textContent(),'1.100');
    for(let stage=2;stage<=5;stage++) {await page.locator('[data-rnn-output-action="next"]').click();assert.equal(await page.locator('#rnn-output-result li').count(),stage);}
    assert.ok(await page.locator('[data-rnn-output-action="next"]').isDisabled());
    const result=rnnOutputExperiment(0.5,1.1,0);
    assert.ok((await page.locator('#rnn-output-result').textContent()).includes(result.after.loss.toFixed(3)));
    await page.locator('#language').click();
    assert.equal(await page.locator('#rnn-output-status').textContent(),'5 / 5');
    assert.equal(await page.locator('#rnn-output-value-v').textContent(),'1.100');
    assert.match(await page.locator('#rnn-output-title').textContent(),/output layer/i);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    await page.locator('#navigation [data-nav="cnn"]').click();
    await page.locator('#navigation [data-nav="rnn"]').click();
    assert.equal(await page.locator('#rnn-output-status').textContent(),'1 / 5');
    assert.equal(await page.locator('#rnn-output-value-v').textContent(),'1.100');
    await page.locator('[data-rnn-output-action="next"]').click();
    await page.locator('[data-rnn-output-action="reset"]').click();
    assert.equal(await page.locator('#rnn-output-result li').count(),1);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: RNN output finite-difference gradients, simultaneous update, bilingual controls and mobile layout');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
