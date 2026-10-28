import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    const tutorialClose=page.locator('.text-card .close-btn');
    await tutorialClose.waitFor({state:'visible',timeout:45000});
    await tutorialClose.click();
    const sankey=page.locator('g.attention path.sankey-path[cursor=pointer]').first();
    await sankey.waitFor({state:'attached',timeout:45000});
    await sankey.dispatchEvent('click');
    const popover=page.locator('.attention-weight-popover [data-click="weight-popover"]');
    await popover.waitFor({state:'visible',timeout:10000});
    const example=popover.locator('[data-model-atlas-attention-example]');
    const text=await example.innerText();
    assert.match(text,lang==='ko'?/i는 출력할 토큰의 위치/:/i is the output token position/);
    assert.match(text,lang==='ko'?/k는 참고하는 토큰의 위치/:/k is a token being attended to/);
    assert.match(text,lang==='ko'?/출력 투영/:/output projection/);
    assert.match(text,lang==='ko'?/설명용이며 위 그림의 실제 값이 아닙니다/:/illustrative and are not the values/);
    assert.ok(text.includes('0.25 × 2 + 0.75 × 6 = 5'));
    assert.equal(.25*2+.75*6,5);
    const banner=await popover.locator('[data-model-atlas-example-note]').innerText();
    assert.match(banner,lang==='ko'?/Value로 출력의 색을 계산/:/output colors are calculated/);
    const dataNote=popover.locator('[data-model-atlas-attention-data]');
    await dataNote.filter({hasText:lang==='ko'?'어텐션 행렬은 현재 모델의 값입니다':'The attention matrix comes from the current model'}).waitFor({timeout:10000});
    assert.match(await dataNote.innerText(),lang==='ko'?/GPT-2의 실제 값 벡터나 헤드 출력은 아닙니다/:/Neither is the actual GPT-2 value vector or head output/);
    const matrices=await popover.evaluate(el=>{
      const read=(selector,groups,cells)=>[...el.querySelectorAll(selector+' '+groups)].map(group=>[...group.querySelectorAll(cells)].map(cell=>cell.__data__.cell));
      return {
        attention:read('.attention-matrix','g.g-row','circle.cell'),
        values:read('.value-matrix','g.g-col','rect.cell'),
        output:read('.head-out-matrix','g.g-row','rect.cell')
      };
    });
    assert.ok(matrices.attention.length>1);
    assert.equal(matrices.values.length,8);
    assert.equal(matrices.output.length,matrices.attention.length);
    for(let i=0;i<matrices.output.length;i++) for(let j=0;j<matrices.values.length;j++) {
      const expected=matrices.attention[i].reduce((sum,weight,k)=>sum+(k<=i?weight*matrices.values[j][k]:0),0);
      assert.ok(Math.abs(matrices.output[i][j]-expected)<1e-12,JSON.stringify({i,j,expected,actual:matrices.output[i][j]}));
    }
    assert.ok(matrices.output.some((row,i)=>i>0&&row.some((v,j)=>Math.abs(v-matrices.output[0][j])>1e-5)));
    const size=await example.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight}));
    assert.ok(size.height>0 && size.scroll<=size.width+1,JSON.stringify(size));
    assert.equal(await popover.locator('.katex-error').count(),0);
    await page.waitForTimeout(800);
    const skip=popover.locator('[data-click="matrix-calc-forward-btn"]');
    if(await skip.isVisible()) await skip.click();
    await page.waitForTimeout(300);
    await popover.screenshot({path:path.join(root,'test-results',`transformer-attention-example-${lang}.png`)});
    await popover.locator('[data-click="matrix-calc-close-btn"]').click();
    await popover.waitFor({state:'detached'});
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: Transformer attention output indices and diagram matrix product in both languages');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
