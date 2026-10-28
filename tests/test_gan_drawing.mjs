import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.wasm':'application/wasm'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1100,height:700},hasTouch:true});
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('#navigation [data-nav="gan"]').click();
  await page.locator('[data-resource] > summary').click();
  const frame=await (await page.locator('iframe').elementHandle()).contentFrame();
  await frame.waitForFunction(()=>document.querySelector('gan-lab')?.drawing,null,{timeout:45000});
  await frame.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount===1931,null,{timeout:45000});
  assert.equal(await frame.locator('#next-step-button').getAttribute('title'),'단계별 학습 메뉴 열기 / 닫기');
  assert.equal((await frame.locator('#iteration-count').locator('..').textContent()).includes('반복 횟수'),true);
  const checkpointMismatch=await frame.locator('gan-lab').evaluate(async el=>{
    const manifest=await (await fetch('pretrained_models/pretrained_gaussians.json')).json();
    const bytes=await (await fetch('pretrained_models/pretrained_gaussians.weights.bin')).arrayBuffer();
    const view=new DataView(bytes); let offset=0, mismatches=0;
    for(const spec of manifest.weightsManifest[0].weights){
      const [type,index]=spec.name.split('-');
      const actual=(type==='d'?el.model.dVariables:el.model.gVariables)[Number(index)].dataSync();
      for(const value of actual){if(Math.abs(value-view.getFloat32(offset,true))>1e-7)mismatches++; offset+=4;}
    }
    return mismatches;
  });
  assert.equal(checkpointMismatch,0,'pretrained visualization must not change saved weights');
  await frame.locator('#distribution-item-drawing').click();
  let alertMessage;
  page.once('dialog',async dialog=>{alertMessage=dialog.message(); await dialog.accept();});
  await frame.locator('#finish-drawing').click();
  assert.equal(alertMessage,'캔버스에 먼저 분포를 그려 주세요.');
  const canvas=frame.locator('#input-drawing-canvas');
  await canvas.click({position:{x:100,y:300}});
  const points=await frame.locator('gan-lab').evaluate(el=>el.drawing.drawingPositions);
  assert.equal(points.length,1);
  assert.ok(Math.abs(points[0][0]-.25)<.01 && Math.abs(points[0][1]-.25)<.01,`canvas quarter position should map to [0.25,0.25]: ${JSON.stringify(points)}`);
  await canvas.evaluate(el=>{el.style.width='200px';el.style.height='200px';});
  await canvas.click({position:{x:50,y:150}});
  const scaled=await frame.locator('gan-lab').evaluate(el=>el.drawing.drawingPositions.at(-1));
  assert.ok(Math.abs(scaled[0]-.25)<.01 && Math.abs(scaled[1]-.25)<.01,`scaled canvas coordinates: ${JSON.stringify(scaled)}`);
  const box=await canvas.boundingBox();
  await page.touchscreen.tap(box.x+50,box.y+150);
  const touch=await frame.locator('gan-lab').evaluate(el=>el.drawing.drawingPositions.at(-1));
  assert.ok(Math.abs(touch[0]-.25)<.01 && Math.abs(touch[1]-.25)<.01,`touch coordinates: ${JSON.stringify(touch)}`);
  await page.mouse.move(box.x+100,box.y+100);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width+20,box.y+100);
  await page.mouse.up();
  const countAfterRelease=await frame.locator('gan-lab').evaluate(el=>el.drawing.drawingPositions.length);
  await page.mouse.move(box.x+100,box.y+100);
  assert.equal(await frame.locator('gan-lab').evaluate(el=>el.drawing.drawingPositions.length),countAfterRelease);
  await frame.locator('#finish-drawing').click();
  assert.equal(await frame.locator('#drawing-container').evaluate(el=>getComputedStyle(el).display),'none');
  assert.equal(await frame.locator('gan-lab').evaluate(el=>el.selectedShapeName),'drawing');
  const weights=()=>frame.locator('gan-lab').evaluate(el=>({
    g:el.model.gVariables.map(v=>Array.from(v.dataSync())),
    d:el.model.dVariables.map(v=>Array.from(v.dataSync())),
    count:el.iterationCount
  }));
  const before=await weights();
  await frame.locator('#next-step-button').click();
  assert.equal((await weights()).count,before.count,'opening the step menu must not train');
  await frame.locator('#next-step-g-button').click();
  const afterG=await weights();
  assert.equal(afterG.count,before.count+1);
  assert.deepEqual(afterG.d,before.d,'generator-only step must not change discriminator weights');
  assert.notDeepEqual(afterG.g,before.g,'generator-only step must update generator weights');
  await frame.locator('#next-step-d-button').click();
  const afterD=await weights();
  assert.equal(afterD.count,afterG.count+1);
  assert.deepEqual(afterD.g,afterG.g,'discriminator-only step must not change generator weights');
  assert.notDeepEqual(afterD.d,afterG.d,'discriminator-only step must update discriminator weights');
  await frame.locator('#next-step-all-button').click();
  const afterBoth=await weights();
  assert.equal(afterBoth.count,afterD.count+1);
  assert.notDeepEqual(afterBoth.g,afterD.g);
  assert.notDeepEqual(afterBoth.d,afterD.d);
  const pauseSnapshot=await frame.locator('gan-lab').evaluate(el=>{
    const snapshot=()=>({count:el.iterationCount,
      g:el.model.gVariables.map(v=>Array.from(v.dataSync())),
      d:el.model.dVariables.map(v=>Array.from(v.dataSync()))});
    el.play();
    const before=snapshot();
    el.pause();
    return {before,after:snapshot()};
  });
  assert.deepEqual(pauseSnapshot.after,pauseSnapshot.before,'pausing must not perform another update');
  const staleFrame=await frame.locator('gan-lab').evaluate(el=>{
    const original=window.requestAnimationFrame, callbacks=[];
    window.requestAnimationFrame=fn=>{callbacks.push(fn); return callbacks.length;};
    try {
      el.play(); el.pause(); el.play();
      const before=el.iterationCount;
      callbacks.shift()(performance.now());
      const after=el.iterationCount;
      el.pause();
      return {before,after};
    } finally { window.requestAnimationFrame=original; }
  });
  assert.equal(staleFrame.after,staleFrame.before,'a frame queued before pause must not start a second training loop');
  const slowBefore=await frame.locator('gan-lab').evaluate(el=>{
    el.onClickSlowModeButton();
    el.play();
    const count=el.iterationCount;
    el.pause();
    return count;
  });
  await page.waitForTimeout(1600);
  assert.equal((await weights()).count,slowBefore,'slow-mode pause must hold the current iteration');
  await frame.locator('gan-lab').evaluate(el=>el.play());
  assert.equal((await weights()).count,slowBefore,'resuming a suspended slow iteration must not start another');
  await page.waitForTimeout(1600);
  assert.equal((await weights()).count,slowBefore,'only the suspended slow iteration should resume');
  await page.goto(base+'/upstream/ganlab/demo/?lang=en',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('gan-lab')?.drawing,null,{timeout:45000});
  assert.equal(await page.locator('#next-step-button').getAttribute('title'),'Show or hide single-step controls');
  assert.equal((await page.locator('#iteration-count').locator('..').textContent()).includes('Iteration'),true);
  await page.locator('#distribution-item-drawing').click();
  page.once('dialog',async dialog=>{alertMessage=dialog.message(); await dialog.accept();});
  await page.locator('#finish-drawing').click();
  assert.equal(alertMessage,'Draw something on the canvas first.');
  console.log('PASS: checkpoint fidelity, step controls, pause/resume, drawing coordinates, touch emulation and bilingual alerts');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
