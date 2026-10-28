import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {cnnPoint,originalTopics} from '../original-cursor-context.js';
import {mathMarkup} from '../math-render.js';

// Independent multi-channel calculation, including signed and tiny weights.
const channels=[[[1,2,3],[4,5,6],[7,8,9]],[[9,8,7],[6,5,4],[3,2,1]]];
const weights=[[[1,-1],[.5,2]],[[1e-8,2],[-1,.5]]];
const node={type:'conv',bias:-.3,inputLinks:channels.map((output,i)=>({source:{output},weight:weights[i]})),output:[[22.2,23.7],[26.7,28.2]]};
for(let row=0;row<2;row++)for(let col=0;col<2;col++){
 const result=cnnPoint(node,row,col);let expected=-.3;
 for(let k=0;k<2;k++)for(let u=0;u<2;u++)for(let v=0;v<2;v++)expected+=channels[k][row+u][col+v]*weights[k][u][v];
 assert.ok(Math.abs(result.recomputed-expected)<1e-10);
 assert.equal(result.channels.length,2);assert.equal(result.channels[0].terms.length,4);
}
for(const data of Object.values(originalTopics))if(data.tex)assert.doesNotMatch(mathMarkup(data.tex),/katex-error/);
const root=path.resolve('.'),server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser,page;
const paths={cnn:'cnn-explainer/public/',transformer:'transformer-explainer/build/',diffusion:'diffusion-explainer/',gan:'ganlab/demo/'};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const lang of ['ko','en'])for(const prefix of ['','/course'])for(const [kind,entry] of Object.entries(paths)){
  page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390});const errors=[];
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  // Real small tokenizer files are allowed; block large model downloads. The
  // Transformer then displays its real, local, cached example results.
  await page.route('**/*',r=>r.request().url().startsWith(base)&&!r.request().url().includes('/model-v2/')||r.request().url().includes('huggingface.co/')?r.continue():r.abort());
  await page.goto(`${base}${prefix}/upstream/${entry}?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const panel=page.locator('#atlas-cursor-help');await page.locator('#atlas-cursor-toggle').waitFor();
  let target;
  if(kind==='cnn')target=page.locator('#layer-1-node-0');
  else if(kind==='transformer')target=page.locator('.attention-matrix-container').first();
  else if(kind==='diffusion')target=page.locator('#latent-denoiser-container');
  else target=page.locator('#component-d-loss');
  await target.waitFor({state:'visible'});await target.scrollIntoViewIfNeeded();
  await target.focus();await panel.waitFor({state:'visible'});
  assert.ok((await panel.locator('#atlas-cursor-description').textContent()).length>40);
  assert.equal(await target.getAttribute('aria-keyshortcuts'),'F2');
  await page.keyboard.press('F2');assert.equal(await panel.evaluate(e=>e===document.activeElement),true);
  assert.equal(await panel.locator('[data-cursor-pin]').getAttribute('aria-pressed'),'true');
  // A pinned card stays readable while the pointer crosses unrelated space.
  await page.mouse.move(5,5);assert.ok(await panel.isVisible());
  const mathHelp=panel.locator('.atlas-cursor-content > .math-help');
  await mathHelp.locator(':scope > summary').click();
  const definition=mathHelp.locator(':scope > details').first();
  await definition.locator(':scope > summary').click();
  assert.ok((await definition.locator('p').innerText()).length>80);
  assert.ok(await definition.locator('.katex').count()>0);
  const helpBounds=await panel.boundingBox();
  assert.ok(helpBounds.y>=0 && helpBounds.y+helpBounds.height<=1001,'expanded vocabulary remains in the viewport');
  await mathHelp.locator(':scope > summary').click();
  if(kind==='cnn'){
   await panel.locator('[data-cursor-derivation] > summary').click();
   await panel.locator('.formula-detail').first().waitFor();
   assert.ok(await panel.locator('.katex .frac-line').count()>0);
   const raw=await target.evaluate(e=>{
    const n=e.__data__,r=Math.floor(n.output.length/2),c=Math.floor(n.output[0].length/2);
    let sum=n.bias;for(const link of n.inputLinks)for(let u=0;u<link.weight.length;u++)for(let v=0;v<link.weight[u].length;v++)sum+=link.source.output[r+u][c+v]*link.weight[u][v];
    return {sum,value:n.output[r][c]};
   });assert.ok(Math.abs(raw.sum-raw.value)<1e-4*Math.max(1,Math.abs(raw.value)));
   assert.match(await panel.textContent(),lang==='ko'?/입력 채널의 기여/:/channel contributions/);
   const described=await target.getAttribute('aria-describedby');assert.match(described,/cnn-keyboard-guide/);
   if(width===1440&&lang==='en'&&!prefix){
    await page.keyboard.press('Escape');await page.mouse.move(0,0);
    const image=target.locator('image').first(),box=await image.boundingBox();
    const shape=await target.evaluate(e=>e.__data__.output.length);
    for(const [row,col] of [[2,3],[17,24]]){
     await page.mouse.move(box.x+(col+.5)*box.width/shape,box.y+(row+.5)*box.height/shape);
     await page.waitForFunction(({row,col})=>document.querySelector('.atlas-cursor-live')?.textContent.includes(`[row ${row}, column ${col}]`),{row,col});
     const rawValue=await target.evaluate((e,{row,col})=>e.__data__.output[row][col],{row,col});
     assert.ok((await panel.textContent()).includes(String(Number(rawValue.toPrecision(6)))));
    }
    await panel.locator('[data-cursor-pin]').click();
   }
  }else if(kind==='transformer'){
   // Leave the original example/model fallback to finish before reading data.
   await page.waitForFunction(()=>[...document.querySelectorAll('.attention-softmax .main .cell')].some(e=>Number.isFinite(e.__data__?.cell)),null,{timeout:45000});
   await page.keyboard.press('Escape');await page.mouse.move(0,0);
   const cell=page.locator('.attention-result .main circle.cell').filter({visible:true}).last();
   const cellHandle=await cell.elementHandle();await cellHandle.scrollIntoViewIfNeeded();await cellHandle.hover();await panel.waitFor({state:'visible'});
   assert.match(await panel.textContent(),lang==='ko'?/참고 비중 aᵢⱼ/:/Attention weight aᵢⱼ/);
   const raw=await cellHandle.evaluate(e=>({value:e.__data__.cell,row:e.__data__.rowIndex,col:e.__data__.colIndex}));
   assert.match(await panel.textContent(),new RegExp(String(Number(raw.value.toPrecision(6))).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
   await panel.locator('[data-cursor-pin]').click();
   if(width===1440&&lang==='en'&&!prefix){
    await page.keyboard.press('Escape');await page.mouse.move(0,0);
    const future=(await page.locator('.attention-result .main').first().evaluateHandle(e=>[...e.querySelectorAll('circle.cell')].find(c=>c.__data__.rowIndex===0&&c.__data__.colIndex===1))).asElement();
    await future.hover();await panel.waitFor({state:'visible'});
    assert.match(await panel.textContent(),/actual post-softmax weight is zero/);
    assert.doesNotMatch(await panel.textContent(),/−∞%/);
    await page.keyboard.press('Escape');
    await page.locator('g.qkv path.sankey-path[cursor=pointer]').first().dispatchEvent('click');
    const example=page.locator('[data-click=weight-popover]').last();await example.waitFor({state:'visible'});
    await example.locator('#qkv-weights').focus();await panel.waitFor({state:'visible'});
    assert.match(await panel.locator('#atlas-cursor-title').textContent(),/Q, K, V/);
    assert.equal(await panel.locator('.atlas-cursor-live').count(),0,'illustrative weight matrices must not be labeled actual attention scores');
    await page.keyboard.press('F2');
   }
  }else if(kind==='diffusion'){
   assert.match(await panel.textContent(),lang==='ko'?/저장된 결과/:/saved results/);
   // Stop the original animation, then read a new snapshot of its displayed step.
   await page.keyboard.press('Escape');
   const pause=page.locator('#controller-button-pause');if(await pause.isVisible())await pause.click();
   await target.focus();await page.keyboard.press('F2');await panel.locator('[data-cursor-refresh]').click();
   const live=await page.locator('#controller-timestep-number').textContent();assert.ok((await panel.textContent()).includes(live.trim()));
  }else{
   assert.match(await panel.textContent(),/0\.95/);
   // Use the real Polymer control, then read its current loss selection.
   await page.locator('#loss-type-dropdown').evaluate(e=>{e.selected='LeastSq loss';e.dispatchEvent(new CustomEvent('iron-select',{bubbles:true}));});
   await panel.locator('[data-cursor-refresh]').click();
   assert.match(await panel.textContent(),lang==='ko'?/현재 제곱 손실/:/Selected least-squares loss/);
   assert.doesNotMatch(await panel.locator('.atlas-cursor-live').textContent(),/0\.95/);
  }
  assert.equal(await panel.locator('.katex-error').count(),0);
  const bounds=await panel.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=1001);
  if(lang==='ko'&&!prefix){await panel.evaluate(e=>{e.scrollTop=0;});await panel.screenshot({path:`test-results/cursor-${kind}-${width}.png`});}
  await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
  await page.locator('#atlas-cursor-toggle').click();assert.equal(await page.locator('#atlas-cursor-toggle').getAttribute('aria-pressed'),'false');
  await target.focus();assert.ok(await panel.isHidden());
  await page.locator('#atlas-cursor-toggle').click();
  await target.focus();await panel.waitFor({state:'visible'});
  if(width===390){
   await page.keyboard.press('Escape');await page.mouse.move(0,0);await target.tap();
   assert.ok(await panel.isVisible());assert.equal(await panel.locator('[data-cursor-pin]').getAttribute('aria-pressed'),'true');
  }
  assert.deepEqual(errors.filter(e=>/original-cursor|formula-detail|math-render/.test(e)),[]);
  await page.close();
  console.log(`PASS: ${kind} ${lang} ${width}px ${prefix||'/'} cursor / focus / pin / current values`);
 }
 // Real course embedding loads the helper through the original entry too.
 page=await browser.newPage();await page.goto(base+'/index.html?lang=ko#cnn');
 await page.locator('details[data-resource] > summary').click();
 const frame=page.frameLocator('iframe.lab-frame');await frame.locator('#atlas-cursor-toggle').waitFor();
 console.log('PASS: original cursor helper in the real embedded CNN lab');
}catch(error){if(page)await page.screenshot({path:'test-results/cursor-failure.png'}).catch(()=>{});console.error(error);process.exitCode=1;}
finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
