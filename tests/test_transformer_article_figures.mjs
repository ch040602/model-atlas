import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});createReadStream(f).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  await mkdir(path.join(root,'test-results'),{recursive:true});
  const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}}), errors=[], requests=[];
    page.on('request',request=>requests.push(new URL(request.url()).pathname));
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/model-v2/gpt2.onnx.part*',route=>route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/transformer-explainer/build/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.locator('#figure-embedding-guide').waitFor({state:'attached',timeout:45000});
    const table=page.locator('table.embedding-example'), guide=page.locator('#figure-embedding-guide');
    assert.equal(await table.count(),1);
    assert.equal(await table.getAttribute('aria-describedby'),'figure-embedding-guide');
    assert.match(await guide.textContent(),lang==='ko'?/설명용 예시.*실제 GPT-2/:/illustrative example, not actual GPT-2/);
    assert.match(await guide.textContent(),/768/);
    const rows=await table.locator('tbody tr').evaluateAll(nodes=>nodes.map(row=>Array.from(row.children,cell=>cell.textContent.trim())));
    assert.equal(rows.length,3);
    assert.equal(rows[0][1],rows[2][1]);
    assert.equal(rows[0][2],rows[2][2]);
    assert.notEqual(rows[0][3],rows[2][3]);
    for(const row of rows) {
      const parse=value=>JSON.parse(value), token=parse(row[2]),position=parse(row[3]),sum=parse(row[4]);
      assert.equal(token.length,2);assert.equal(position.length,2);assert.equal(sum.length,2);
      for(let i=0;i<2;i++) assert.ok(Math.abs(token[i]+position[i]-sum[i])<1e-10);
    }
    assert.notEqual(rows[0][4],rows[2][4]);
    assert.equal(requests.some(url=>url.endsWith('/article_assets/embedding.png')),false,'the article does not request the replaced image');
    await page.locator('.embedding-example-scroll').screenshot({path:path.join(root,'test-results',`transformer-embedding-example-${lang}.png`)});
    const projection=page.locator('table.qkv-example'), projectionGuide=page.locator('#figure-qkv-guide');
    assert.equal(await projection.count(),1);
    assert.equal(await projection.getAttribute('aria-describedby'),'figure-qkv-guide');
    assert.match(await projectionGuide.textContent(),lang==='ko'?/설명용 예시.*실제 GPT-2/:/illustrative example.*not actual GPT-2/);
    assert.match(await projectionGuide.textContent(),/6, 768.*768, 2304.*6, 2304/);
    const projectionRows=await projection.locator('tbody tr').evaluateAll(nodes=>nodes.map(row=>({name:row.children[0].textContent.trim(),weights:JSON.parse(row.children[1].textContent),bias:Number(row.children[2].textContent),result:Number(row.querySelector('strong').textContent)})));
    assert.deepEqual(projectionRows.map(row=>row.name),['Q','K','V']);
    for(const row of projectionRows) assert.ok(Math.abs(row.weights[0]+2*row.weights[1]+row.bias-row.result)<1e-10);
    assert.deepEqual(projectionRows.map(row=>row.result),[-0.3,0.9,1]);
    assert.equal(requests.some(url=>url.endsWith('/article_assets/QKV.png')),false,'the article does not request the replaced QKV image');
    await page.locator('.qkv-example-scroll').screenshot({path:path.join(root,'test-results',`transformer-qkv-example-${lang}.png`)});
    const attention=page.locator('table.attention-example'), attentionGuide=page.locator('#figure-attention-guide');
    assert.equal(await attention.count(),1);
    assert.equal(await attention.getAttribute('aria-describedby'),'figure-attention-guide');
    assert.match(await attentionGuide.textContent(),lang==='ko'?/설명용 값.*실제 모델 출력이 아닙니다/:/illustrative, not actual model output/);
    const attentionRows=await attention.locator('tbody tr').evaluateAll(nodes=>nodes.map(row=>Array.from(row.children,cell=>cell.textContent.trim())));
    assert.equal(attentionRows.length,2);
    const expectedWeight=1/(1+Math.exp(-1/Math.sqrt(2)));
    for(let i=0;i<2;i++) {
      const row=attentionRows[i], scores=JSON.parse(row[1]), weights=JSON.parse(row[3]);
      assert.ok(Math.abs(scores[0]-1/Math.sqrt(2))<0.0005 && scores[1]===0);
      assert.equal(row[2].includes('−∞'),i===0);
      const expected=i===0?[1,0]:[expectedWeight,1-expectedWeight];
      for(let j=0;j<2;j++) assert.ok(Math.abs(weights[j]-expected[j])<0.0005);
      assert.ok(Math.abs(Number(row[4].split('≈')[1])-(expected[0]*2+expected[1]*4))<0.0005);
    }
    assert.equal(requests.some(url=>url.endsWith('/article_assets/attention.png')),false,'the article does not request the replaced attention image');
    await page.locator('.attention-example-scroll').screenshot({path:path.join(root,'test-results',`transformer-attention-example-${lang}.png`)});
    const mlp=page.locator('table.mlp-example'), mlpGuide=page.locator('#figure-mlp-guide');
    assert.equal(await mlp.count(),1);
    assert.equal(await mlp.getAttribute('aria-describedby'),'figure-mlp-guide');
    assert.match(await mlpGuide.textContent(),lang==='ko'?/tanh 근사식.*원본 구현은 기본 정확 GELU/:/tanh approximation.*original implementation.*exact GELU/);
    assert.match(await mlpGuide.textContent(),/768→3072→768/);
    const u=1/Math.sqrt(1+1e-5);
    const gelu=x=>x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+0.044715*x*x*x)))/2;
    const h=[gelu(u),gelu(-u),0], mlpProjection=[h[0]+2*h[1]+0.1,h[1]];
    const expectedStages={norm:[u,-u],expand:[u,-u,0],gelu:h,project:mlpProjection,residual:[1+mlpProjection[0],-1+mlpProjection[1]]};
    const mlpRows=await mlp.locator('tbody tr').evaluateAll(nodes=>nodes.map(row=>({stage:row.dataset.stage,result:JSON.parse(row.lastElementChild.textContent)})));
    assert.equal(mlpRows.length,5);
    for(const row of mlpRows) {
      assert.ok(Object.hasOwn(expectedStages,row.stage));
      assert.equal(row.result.length,expectedStages[row.stage].length);
      row.result.forEach((value,i)=>assert.ok(Math.abs(value-expectedStages[row.stage][i])<0.0005,`${lang}: ${row.stage} component ${i}`));
    }
    assert.equal(requests.some(url=>url.endsWith('/article_assets/mlp.png')),false);
    await page.locator('.mlp-example-scroll').screenshot({path:path.join(root,'test-results',`transformer-mlp-example-${lang}.png`)});
    const sampling=page.locator('table.sampling-example'), samplingGuide=page.locator('#figure-softmax-guide');
    assert.equal(await sampling.count(),1);
    assert.equal(await sampling.getAttribute('aria-describedby'),'figure-softmax-guide');
    assert.match(await samplingGuide.textContent(),lang==='ko'?/설명용 예시/:/illustrative example/);
    const samplingRows=await sampling.locator('tbody tr').evaluateAll(nodes=>nodes.map(row=>Array.from(row.children,cell=>cell.textContent.trim())));
    const firstProbability=1/(1+Math.exp(-2));
    assert.deepEqual(samplingRows.map(row=>row.slice(0,4)),[['A','2','4','4'],['B','1','2','2'],['C','0','0','−∞']]);
    const expectedProbabilities=[firstProbability,1-firstProbability,0];
    samplingRows.forEach((row,i)=>assert.ok(Math.abs(Number(row[4])-expectedProbabilities[i])<0.0005));
    assert.equal(requests.some(url=>url.endsWith('/article_assets/softmax.png')),false);
    await page.locator('.sampling-example-scroll').screenshot({path:path.join(root,'test-results',`transformer-sampling-example-${lang}.png`)});
    assert.match(await page.locator('#figure-attention-guide').textContent(),lang==='ko'?/추론 시 꺼집니다/:/disabled during inference/);
    await page.setViewportSize({width:390,height:844});
    const scroll=page.locator('.attention-example-scroll');
    await scroll.focus();
    assert.equal(await scroll.evaluate(el=>document.activeElement===el),true,`${lang}: table scroll region is keyboard focusable`);
    await scroll.screenshot({path:path.join(root,'test-results',`transformer-attention-mobile-${lang}.png`)});
    const overflow=await scroll.evaluate(el=>el.scrollWidth>el.clientWidth);
    if(overflow) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
      assert.ok(await scroll.evaluate(el=>el.scrollLeft>0),`${lang}: arrow key scrolls the table`);
    }
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: bilingual embedding, QKV, attention, MLP and next-token probability calculations');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
