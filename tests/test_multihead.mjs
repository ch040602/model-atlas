import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  await mkdir(path.join(root,'test-results'),{recursive:true});
  const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/#transformer`);
  await page.locator('#multihead-output').waitFor();
  const parse=async name=>JSON.parse(await page.locator(`[data-multihead="${name}"]`).textContent());
  const softmax=(scores,mask)=>{const e=scores.map((s,i)=>mask&&i===2?0:Math.exp(s));const total=e.reduce((a,b)=>a+b);return e.map(v=>v/total);};
  const sum=(a,v)=>v[0].map((_,j)=>a.reduce((s,w,i)=>s+w*v[i][j],0));
  const close=(actual,expected,label)=>{assert.equal(actual.length,expected.length,label);actual.forEach((x,i)=>assert.ok(Math.abs(x-expected[i])<0.000501,`${label}[${i}]: ${x} vs ${expected[i]}`));};
  for(const lang of ['ko','en']) {
    if(lang==='en') await page.locator('#language').click();
    assert.match(await page.locator('#multihead-title').textContent(),lang==='ko'?/여러 어텐션/:/multiple attention heads/);
    assert.match(await page.locator('.multihead-lab').textContent(),lang==='ko'?/실제 GPT-2 가중치가 아닙니다/:/not GPT-2 weights/);
    for(const mask of [true,false]) for(const [q1,q2] of [[1,1],[-2,2],[0,0],[2,-2]]) {
      await page.locator('[data-attn-input="q1"]').fill(String(q1));
      await page.locator('[data-attn-input="q2"]').fill(String(q2));
      await page.locator('[data-attn-mask]').setChecked(mask);
      const a=softmax([q1,q2,q1+q2].map(s=>s/Math.sqrt(2)),mask);
      const b=softmax([0,1,1].map(s=>s/Math.sqrt(2)),mask);
      const h1=sum(a,[[1,0],[0,2],[2,2]]),h2=sum(b,[[0,1],[2,0],[2,2]]);
      const joined=[...h1,...h2],out=[h1[0]+.5*h2[0]-.5*h2[1],h1[1]+.5*h2[0]+h2[1]];
      for(const [name,expected] of [['weights1',a],['head1',h1],['weights2',b],['head2',h2],['joined',joined],['output',out]]) close(await parse(name),expected,`${lang} ${mask} ${q1},${q2} ${name}`);
    }
    const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(size.scroll<=size.width+1,`${lang}: document overflows ${JSON.stringify(size)}`);
    await page.locator('#unit-contents summary').click();
    await page.locator('[data-unit-jump="multihead-title"]').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'multihead-title');
    await page.locator('.multihead-lab').screenshot({path:path.join(root,'test-results',`multihead-mobile-${lang}.png`)});
    await page.locator('#unit-contents summary').click();
  }
  await page.locator('[data-attn-input="q1"]').focus();
  const before=await parse('output');await page.keyboard.press('ArrowLeft');assert.notDeepEqual(await parse('output'),before,'keyboard slider changes the multi-head result');
  assert.deepEqual(errors,[]);
  await page.setViewportSize({width:1440,height:900});
  await page.locator('.multihead-lab').screenshot({path:path.join(root,'test-results','multihead-desktop-en.png')});
  console.log('PASS: multi-head arithmetic over 16 states, bilingual mobile navigation, keyboard and live linkage');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
