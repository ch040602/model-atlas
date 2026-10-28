import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
const order=async(page,selectors)=>{
 const ids=await page.locator(selectors.join(',')).evaluateAll(es=>es.map(e=>e.id));
 assert.deepEqual(ids,selectors.map(s=>s.slice(1)));
};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined)});
 mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course'])for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await page.goto(`${base}${prefix}/`);if(lang==='en')await page.locator('#language').click();
  assert.equal(await page.locator('.topbar').count(),0);
  assert.equal(await page.locator('.sidebar #language').count(),1);
  assert.deepEqual(await page.locator('#navigation [data-nav]').evaluateAll(es=>es.map(e=>e.dataset.nav)),['foundation','cnn','rnn','diffusion','transformer','gan']);
  await order(page,['#math-basics-title','#concept-title','#symbols-title','#worked-title','#main-lab-title','#split-title','#training-title','#batch-title','#early-title','#quiz-title']);
  assert.equal(await page.locator('.sidebar [data-formula-start]').count(),3);
  for(const [kind,count] of [['cnn',20],['rnn',21],['transformer',41]]){
   const link=page.locator(`.sidebar [data-formula-start=${kind}]`);
   await link.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'formula-title');
   assert.equal(new URL(page.url()).hash,`#${kind}`);
   assert.equal(await page.locator('#formula-status').textContent(),`1 / ${count}`);
   assert.ok(await page.locator('[data-formula-action=previous]').isDisabled());
   await order(page,['#route-title','#concept-title','#symbols-title','#architecture-title','#formula-title','#worked-title','#main-lab-title',...(kind==='rnn'?[]:['#resource-title']),'#quiz-title']);
   const frame=page.locator('iframe.lab-frame');assert.equal(await frame.count(),kind==='rnn'?0:1);
   if(kind!=='rnn'){
    assert.equal(await frame.getAttribute('src'),null);
    assert.equal(await page.locator('.architecture-map [data-resource]').count(),0);
   }
   const slider=page.locator('#architecture-input');await slider.fill('0.7');
   await page.locator('#formula-select').selectOption('5');
   await link.click();
   assert.equal(await slider.inputValue(),'0.7','starting over preserves the adjusted model input');
   assert.equal(await page.locator('#formula-select').inputValue(),'0');
   assert.equal(await page.locator('#formula-status').textContent(),`1 / ${count}`);
   // Sidebar remains reachable when the very long lesson has been scrolled.
   if(width===1440){
    await page.locator('#quiz-title').evaluate(e=>e.scrollIntoView());
    assert.ok(Math.abs((await page.locator('.sidebar').boundingBox()).y)<1);
    assert.ok(await link.isVisible());
   }
   const href=await link.getAttribute('href');await page.goto(new URL(href,page.url()).href);
   await page.waitForFunction(()=>document.activeElement.id==='formula-title');
   assert.equal(await page.locator('#formula-select').inputValue(),'0');
   assert.ok(new URL(page.url()).pathname.startsWith(`${prefix}/index.html`));
  }
  await page.locator('#navigation [data-nav=diffusion]').click();
  await order(page,['#concept-title','#diff-title','#latent-title','#clip-title','#cross-title','#cfg-title','#resource-title','#quiz-title']);
  if(prefix===''&&lang==='ko'){
   await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`test-results/learning-order-${width}.png`});
  }
  // No own-site page retains a top strip; each has the same sidebar entry points.
  for(const file of ['concepts.html#metrics','credits.html','formulas.html?model=transformer&lang='+lang+'&step=11&x1=0.7']){
   await page.goto(`${base}${prefix}/${file}`);await page.locator('.sidebar [data-formula-start]').first().waitFor();
   assert.equal(await page.locator('.topbar,.formula-page-header').count(),0);
   assert.equal(await page.locator('.sidebar [data-formula-start]').count(),3);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(file.startsWith('formulas')){
    await page.locator('[data-formula-value=x1]').fill('0.9');
    await page.locator('.sidebar [data-formula-start=transformer]').click();
    assert.equal(await page.locator('#formula-select').inputValue(),'0');
    assert.equal(await page.locator('[data-formula-value=x1]').inputValue(),'0.9');
    await page.locator('[data-formula-language]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='ko'?'en':'ko');
    if(prefix===''&&lang==='ko'){
     await page.locator('#formula-select').selectOption('11');
     await page.locator('.formula-workspace').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-24));
     await page.screenshot({path:`test-results/sidebar-formula-${width}.png`});
    }
   }else{
    const next=await page.locator('.sidebar [data-formula-start=cnn]').getAttribute('href');
    await page.goto(new URL(next,page.url()).href);await page.waitForFunction(()=>document.activeElement.id==='formula-title');
    assert.equal(await page.locator('#formula-select').inputValue(),'0');
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: final section order, persistent formula sidebar, all three starts/deep links, retained inputs, sticky desktop access, bar-free course/library/credits/reader, language and keyboard; ko/en, 390/1440, root/prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
