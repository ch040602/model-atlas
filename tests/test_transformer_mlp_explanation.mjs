import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const model=await readFile(path.join(root,'upstream/transformer-explainer/src/utils/model/model.py'),'utf8');
assert.match(model,/self\.c_fc\s*= nn\.Linear\(config\.n_embd, 4 \* config\.n_embd/);
assert.match(model,/self\.c_proj\s*= nn\.Linear\(4 \* config\.n_embd, config\.n_embd/);
assert.match(model,/x = self\.c_fc\(x\)[\s\S]*?x = self\.gelu\(x\)[\s\S]*?x = self\.c_proj\(x\)/);
assert.match(model,/x = x \+ self\.attn\(self\.ln_1\(x\)\)[\s\S]*?x = x \+ self\.mlp\(self\.ln_2\(x\)\)/);

const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const info=await stat(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Content-Length':info.size});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const lang of ['ko','en']) for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    const close=page.locator('.text-card .close-btn');
    await close.waitFor({state:'visible',timeout:45000});
    await close.click();
    const checks=[
      ['qkv','qkv-emgeddings',lang==='ko'?/첫 번째 층 정규화/:/first layer normalization/],
      ['mlpUp','mlp-emgeddings',lang==='ko'?/두 번째 층 정규화/:/second layer normalization/],
      ['mlpDown','mlp-down-emgeddings',/GELU/],
      ['softmax','hidden-states',lang==='ko'?/마지막 층 정규화/:/final layer normalization/]
    ];
    for(const [kind,id,expected] of checks) {
      const sankey=page.locator(`g.${kind} path.sankey-path[cursor=pointer]`).first();
      await sankey.waitFor({state:'attached',timeout:45000});
      await sankey.dispatchEvent('click');
      const popover=page.locator('[data-click=weight-popover]').last();
      await popover.waitFor({state:'attached'});
      const button=popover.locator(`#${id}`);
      await button.focus();
      const help=page.locator(`[data-click="help-popover-${id}"]`);
      await help.waitFor({state:'visible'});
      assert.match(await help.innerText(),expected);
      await button.press('Escape');
      await help.waitFor({state:'hidden'});
      if(kind==='mlpDown') {
        const formulas=await popover.locator('.katex-mathml annotation').allTextContents();
        assert.ok(formulas.some(text=>text.includes('Emb_{1,3072}')&&text.includes('W_{3072,1}')),formulas.join('\n'));
        assert.ok(formulas.some(text=>text.includes('^{3072}')&&text.includes('Compressed_{ij}')),formulas.join('\n'));
        assert.equal(await popover.locator('.katex-error').count(),0);
      }
      await popover.locator('[data-click=matrix-calc-close-btn]').dispatchEvent('click');
      await popover.waitFor({state:'detached'});
    }
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: GPT-2 projection dimensions, activations and normalization explanations in Korean and English');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
