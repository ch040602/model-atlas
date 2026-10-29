import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const routes={foundation:['math-basics-title','concept-title','split-title','gradient-direction-title','training-title','batch-title','early-title','quiz-title'],cnn:['concept-title','architecture-title','formula-title','conv-title','pool-title','resource-title','quiz-title'],rnn:['concept-title','architecture-title','formula-title','sequence-title','rnn-output-title','memory-title','rnn-flow-title','lstm-title','quiz-title'],diffusion:['concept-title','diff-title','latent-title','clip-title','cross-title','cfg-title','resource-title','quiz-title'],transformer:['concept-title','architecture-title','formula-title','embedding-title','attn-title','linked-block-title','token-sequence-title','sample-title','resource-title','quiz-title'],gan:['concept-title','gantrain-title','ganmodes-title','resource-title','quiz-title']};
for(const targets of Object.values(routes))targets.unshift('first-steps-title');
const server=createServer(async(req,res)=>{try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
 for(const width of [390,1440])for(const prefix of ['','/course']){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // The route test exercises loading without downloading the four real labs and their model assets.
  await page.route('**/*', route => route.request().isNavigationRequest() && route.request().frame().parentFrame() ? route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Lab placeholder</title>'}) : route.continue());
  await page.goto(base+prefix+'/');
  for(const lang of ['ko','en']){
   if(lang==='en')await page.locator('#language').click();
   for(const [id,targets] of Object.entries(routes)){
    await page.locator(`#navigation [data-nav="${id}"]`).click();
    if(!await page.locator('.beginner-route').evaluate(e=>e.open))await page.locator('#route-title').click();
    assert.equal(await page.locator('#route-title').textContent(),lang==='ko'?'처음이라면 이 순서로':'A suggested first pass');
    assert.deepEqual(await page.locator('[data-route-jump]').evaluateAll(els=>els.map(e=>e.dataset.routeJump)),targets);
    if(process.env.ROUTE_SCREENSHOTS && prefix==='' && ['cnn','transformer'].includes(id)) await page.locator('.beginner-route').screenshot({path:`test-results/route-${id}-${lang}-${width}.png`});
    for(const target of targets){
     assert.equal(await page.locator(`#${target}`).count(),1);
     const button=page.locator(`[data-route-jump="${target}"]`);
     assert.ok((await button.textContent()).trim().length>10);
     await button.focus();await button.press('Enter');
     assert.equal(await page.evaluate(()=>document.activeElement.id),target,`${id}/${lang}: ${target}`);
     assert.equal(new URL(page.url()).hash,`#${id}`);
    }
    if(id==='diffusion') {
     await page.locator('[data-route-jump="clip-title"]').focus();await page.keyboard.press('Enter');
     await page.locator('#clip-component').fill('0.5');
     while(await page.locator('#clip-status').textContent()!=='5 / 5')await page.locator('[data-clip-action="next"]').click();
     const clip=await page.locator('#clip-output').textContent();
     assert.ok(clip.includes(lang==='ko'?'토큰별 은닉 상태':'token-level hidden states'));
     assert.ok(clip.includes(lang==='ko'?'서로 독립적으로':'assumed independently'));
     await page.locator('[data-route-jump="cross-title"]').focus();await page.keyboard.press('Enter');
     await page.locator('#cross-query').fill('2');
     while(await page.locator('#cross-status').textContent()!=='3 / 3')await page.locator('[data-cross-action="next"]').click();
     assert.match(await page.locator('#cross-output').textContent(),/\[0\.670, 0\.660\]/);
     const connection=await page.locator('.lab-connection').textContent();
     assert.ok(connection.includes(lang==='ko'?'위 가상 벡터는 원본에 표시된 값':'toy vectors above are not the displayed original values'));
    }
    if(id==='transformer') {
     await page.locator('[data-route-jump="attn-title"]').focus();await page.keyboard.press('Enter');
     while(await page.locator('#attn-status').textContent()!=='6 / 11')await page.locator('[data-attn-action="next"]').click();
     const explanation=await page.locator('#attn-output').textContent();
     assert.ok(explanation.includes('[BOS, A, B]'));
     assert.ok(explanation.includes(lang==='ko'?'정답 A는 따로 지정':'target A is assigned separately'));
     const mask=page.locator('[data-attn-mask]');
     await mask.check();let result=await page.locator('#attn-output').textContent();
     assert.match(result,/−∞/);
     await mask.uncheck();result=await page.locator('#attn-output').textContent();
     assert.doesNotMatch(result,/−∞/);
     await page.locator('[data-route-jump="token-sequence-title"]').focus();await page.keyboard.press('Enter');
     assert.equal(await page.evaluate(()=>document.activeElement.id),'token-sequence-title');
     assert.match(await page.locator('#token-sequence-output').textContent(),/BOS, A/);
    }
    if(id==='rnn') {
     const order=await page.locator('main section[aria-labelledby]').evaluateAll(els=>els.map(e=>e.getAttribute('aria-labelledby')));
     assert.ok(order.indexOf('sequence-title') < order.indexOf('rnn-output-title'));
     assert.ok(order.indexOf('rnn-output-title') < order.indexOf('memory-title'));
     const intro=await page.locator('[aria-labelledby="rnn-output-title"] > p').first().textContent();
     assert.ok(intro.includes(lang==='ko'?'RNN의 시간 흐름과 학습':'RNN through time and learning'));
    }
    if(targets.includes('resource-title')){
     const panel=page.locator('[data-resource]'), frame=panel.locator('iframe.lab-frame');
     assert.equal(await panel.evaluate(e=>e.open),false);
     assert.equal(await frame.getAttribute('src'),null);
     const routeLabel=await page.locator('[data-route-jump="resource-title"]').textContent();
     assert.ok(routeLabel.includes(lang==='ko'?'제목을 펼친 뒤':'expand its heading'));
     await page.locator('[data-route-jump="resource-title"]').focus();
     await page.keyboard.press('Enter');
     assert.equal(await page.evaluate(()=>document.activeElement.id),'resource-title');
     await page.keyboard.press('Enter');
     await page.waitForFunction(()=>document.querySelector('[data-resource]').open && document.querySelector('iframe.lab-frame').hasAttribute('src'));
     assert.equal(await frame.getAttribute('src'),await frame.getAttribute('data-src'));
     assert.equal(await page.evaluate(()=>document.activeElement.id),'resource-title');
     await page.keyboard.press('Enter');
     assert.equal(await panel.evaluate(e=>e.open),false);
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: all six beginner routes and targets, both languages, keyboard, lazy original with stubbed lab, mobile and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
