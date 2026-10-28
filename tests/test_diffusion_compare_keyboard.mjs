import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    const info=await stat(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const lang of ['ko','en']) {
    const page=await browser.newPage({viewport:{width:1600,height:1000}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/diffusion-explainer/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.umapData && document.querySelector('#global-umap-zoom-in-button'));
    if (await page.evaluate(()=>window.playing)) await page.locator('#controller-button-play-container').click();
    const choice=await page.evaluate(()=>({prompts:[window.selectedPrompt,window.selectedPrompt2],seed:window.seed,gs:window.gs,coords:window.umapData[window.selectedPrompt][window.seed][window.gs][0],coords2:window.umapData[window.selectedPrompt2][window.seed][window.gs][0]}));
    const initialImages=await Promise.all(choice.prompts.map(prompt=>readFile(path.join(root,'upstream/diffusion-explainer/assets/latent_viz',prompt,`${choice.seed}_${choice.gs}_0.jpg`))));
    assert.equal(createHash('sha256').update(initialImages[0]).digest('hex'),createHash('sha256').update(initialImages[1]).digest('hex'));
    assert.notDeepEqual(choice.coords,choice.coords2,'the saved projection starts at different positions despite identical displayed images');
    const guide=page.locator('#model-atlas-trajectory-guide');
    assert.equal(await guide.isHidden(),true);
    const keyword=page.locator('#prompt-selector-dropdown-box-container .prompt-keyword').first();
    const back=page.locator('#exit-button-container');
    const zoomIn=page.locator('#global-umap-zoom-in-button');
    const zoomOut=page.locator('#global-umap-zoom-out-button');
    assert.equal(await keyword.getAttribute('role'),'button');
    assert.match(await keyword.getAttribute('aria-label'),lang==='ko'?/비교할 문구:/ : /Compare changes to:/);
    assert.equal(await back.getAttribute('tabindex'),'-1');
    for (let round=0; round<2; round++) {
      await page.keyboard.press('Tab');
      await keyword.focus();
      assert.equal(await keyword.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
      await page.keyboard.press(round?'Space':'Enter');
      await page.waitForFunction(()=>window.compare);
      assert.equal(await page.evaluate(()=>document.activeElement.id),'exit-button-container');
      assert.equal(await keyword.getAttribute('tabindex'),'-1');
      assert.equal(await back.getAttribute('aria-hidden'),'false');
      assert.equal(await guide.isVisible(),true);
      if (!round) await guide.screenshot({path:path.join(root,'test-results',`diffusion-trajectory-guide-${lang}.png`)});
      assert.match(await guide.textContent(),lang==='ko'?/정확한 거리나 이미지 품질 점수가 아닙니다/ : /not an exact distance or quality score/);
      assert.match(await guide.textContent(),lang==='ko'?/좌표 차이의 원인은 확인되지 않습니다/ : /reason for the offset is not established/);
      if (!round) for (const step of [1,10,50]) {
        await page.locator('#controller-timestep-slider').fill(String(step));
        const graph=await page.evaluate(()=>[1,2].map(series=>({
          points:[...document.querySelectorAll(`#global-umap-g-${series} circle`)].filter(e=>Number(getComputedStyle(e).opacity)>0).length,
          current:document.querySelector(`#global-umap-node-${series}-${window.timestep}`).__data__,
          saved:window.umapData[series===1?window.selectedPrompt:window.selectedPrompt2][window.seed][window.gs][window.timestep]
        })));
        for (const series of graph) { assert.equal(series.points,step+1); assert.deepEqual(series.current,series.saved); }
      }
      await zoomIn.waitFor({state:'visible'});
      assert.equal(await zoomIn.getAttribute('aria-label'),lang==='ko'?'궤적 확대':'Zoom in on trajectory');
      assert.equal(await zoomOut.getAttribute('aria-label'),lang==='ko'?'궤적 축소':'Zoom out on trajectory');
      await zoomIn.focus();
      const original=await page.locator('#global-umap-zoom-text').textContent();
      await page.keyboard.press('Enter');
      await page.waitForFunction(previous=>document.querySelector('#global-umap-zoom-text').textContent!==previous,original);
      await zoomOut.focus();
      await page.keyboard.press('Space');
      await page.waitForFunction(previous=>document.querySelector('#global-umap-zoom-text').textContent===previous,original);
      await back.focus();
      await page.keyboard.press(round?'Enter':'Space');
      await page.waitForFunction(()=>!window.compare);
      assert.equal(await keyword.getAttribute('tabindex'),'0');
      assert.equal(await back.getAttribute('aria-hidden'),'true');
      assert.equal(await guide.isHidden(),true);
      assert.equal(await keyword.evaluate(el=>document.activeElement===el),true);
      if (!round) {
        await page.locator('#dropdown-button-container').focus();
        await page.keyboard.press('Enter');
        await page.locator('#prompt-selector-dropdown-option-1').focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(()=>window.selectedPromptGroupIdx===1);
        assert.match(await keyword.textContent(),/very very/);
        assert.equal(await keyword.getAttribute('tabindex'),'0');
      }
    }
    await keyword.click();
    await page.waitForFunction(()=>window.compare);
    await back.click();
    await page.waitForFunction(()=>!window.compare);
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`PASS: diffusion comparison keyboard controls and prompt replacement (${lang})`);
  }
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
