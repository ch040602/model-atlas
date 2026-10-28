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
const independentlyScroll=async(page)=>{
 const viewport=page.locator('.calculation-scroll');
 assert.ok(await viewport.evaluate(e=>e.scrollHeight>e.clientHeight+20),'history overflows its own viewport');
 await viewport.evaluate(e=>e.scrollTop=0);
 const position=await viewport.boundingBox(),windowY=await page.evaluate(()=>scrollY);
 await page.mouse.move(position.x+position.width/2,position.y+Math.min(70,position.height/2));
 await page.mouse.wheel(0,400);
 await page.waitForFunction(()=>document.querySelector('.calculation-scroll').scrollTop>10);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-windowY)<2,'wheel scroll stays inside history');
 await viewport.evaluate(e=>e.scrollTop=e.scrollHeight);
 await page.mouse.wheel(0,400);await page.waitForTimeout(120);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-windowY)<2,'reaching the history boundary does not scroll the lesson');
 await viewport.focus();await page.keyboard.press('Home');
 await page.waitForFunction(()=>document.querySelector('.calculation-scroll').scrollTop<2);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-windowY)<2,'keyboard scrolling stays inside history');
};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined)});
 mkdirSync('test-results',{recursive:true});
 for(const width of [390,1024,1440])for(const prefix of ['','/course'])for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await page.goto(base+prefix+'/');if(lang==='en')await page.locator('#language').click();
  assert.ok(await page.locator('#calculation-rail').isHidden());
  for(const [kind,count] of [['cnn',20],['rnn',21],['diffusion',7],['transformer',41],['gan',5]]){
   await page.locator(`#navigation [data-nav=${kind}]`).click();
   const rail=page.locator('#calculation-rail');
   assert.equal(await rail.getAttribute('data-model'),kind);
   assert.equal(await page.locator('.brand-mark').count(),0);
   assert.equal(await page.locator('.topbar').count(),0);
   assert.ok(await rail.isVisible());
   if(['cnn','rnn','transformer'].includes(kind)){
    assert.equal(await page.locator('main #formula-history').count(),0);
    await page.locator('#formula-select').selectOption(String(count-1));
    assert.equal(await rail.locator('#formula-history>li').count(),count);
    assert.equal(await rail.locator('[aria-current=step]').count(),1);
    const sameValue=await page.locator('#architecture-input').inputValue();
    await page.evaluate(()=>scrollTo(0,0));await independentlyScroll(page);
    await rail.locator('[data-formula-jump="2"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#formula-select').inputValue(),'2');
    assert.equal(await page.locator('#architecture-input').inputValue(),sameValue);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'formula-current-title');
    await page.locator('#formula-select').selectOption(String(count-1));
   }else{
    const group=kind==='diffusion'?'diff':'gantrain';
    const output=`${group}-output`;
    const list=rail.locator(`[data-calculation-source=${output}] .sequence-steps`);
    for(let step=1;step<count;step++)await page.locator(`[data-${group}-action=next]`).click();
    assert.equal(await list.locator(':scope>li').count(),count);
    assert.equal(await list.textContent(),await page.locator(`#${output} .sequence-steps`).textContent());
    const slider=page.locator(kind==='diffusion'?'#diff-clean':'#gantrain-generator');
    await slider.fill('0.7');
    assert.equal(await list.textContent(),await page.locator(`#${output} .sequence-steps`).textContent());
    const groups=kind==='diffusion'?['diff','latent','clip','cross','cfg']:['gantrain','ganmodes'];
    assert.deepEqual(await rail.locator('[data-calculation-source]').evaluateAll(es=>es.map(e=>e.dataset.calculationSource)),groups.map(id=>id+'-output'));
    for(const id of groups){
     assert.equal(await rail.locator(`[data-calculation-source=${id}-output] .sequence-steps`).textContent(),await page.locator(`#${id}-output .sequence-steps`).textContent());
    }
    await page.evaluate(()=>scrollTo(0,0));await independentlyScroll(page);
    await rail.locator(`[data-unit-jump=${group}-title]`).focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),group+'-title');
   }
   if(width===1440){
    const a=await rail.boundingBox(),b=await page.locator('main').boundingBox();
    assert.ok(a.x>=b.x+b.width-1,'history occupies a separate right column');assert.ok(Math.abs(a.y)<1);
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const duplicates=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i));
   assert.deepEqual(duplicates,[]);
   if(prefix===''&&lang==='ko'&&width!==1024){
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/calculation-rail-${kind}-${width}.png`});
   }
  }
  for(const file of ['concepts.html','credits.html','formulas.html?model=transformer&lang='+lang+'&step=40&x1=0.7']){
   await page.goto(`${base}${prefix}/${file}`);await page.locator('.sidebar [data-formula-start]').first().waitFor();
   assert.equal(await page.locator('.brand-mark').count(),0);
   if(file.startsWith('formulas')){
    assert.equal(await page.locator('#calculation-rail #formula-history>li').count(),41);
    await independentlyScroll(page);
    await page.locator('#calculation-rail [data-formula-jump="4"]').click();
    assert.equal(await page.locator('#formula-select').inputValue(),'4');
    await page.locator('[data-formula-language]').click();
    assert.equal(await page.locator('#formula-select').inputValue(),'4');
    assert.equal(await page.locator('[data-formula-value=x1]').inputValue(),'0.7');
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: five model-specific right rails, real independent wheel scrolling, live Diffusion/GAN groups, formula jumps and inputs, standalone language/state, no duplicate IDs or brand marks; ko/en, 390/1024/1440, root/prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
