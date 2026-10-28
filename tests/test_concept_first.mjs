import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {concepts} from '../concepts-data.js';
import {conceptFirstSteps,conceptFirstMarkup} from '../concept-first-steps.js';

assert.deepEqual(Object.keys(conceptFirstSteps).sort(),concepts.map(c=>c.id).sort(),'no concept silently lacks an introductory example');
for(const c of concepts){
 const text=conceptFirstSteps[c.id];assert.equal(text.length,4);
 assert.ok(text.every(s=>typeof s==='string'&&s.length>35));
 for(const lang of ['ko','en'])assert.doesNotMatch(conceptFirstMarkup(c,lang),/katex-error|undefined|NaN/);
}
const root=path.resolve('.'),server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';let browser;
try{
 browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});mkdirSync('test-results',{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course']){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${prefix}/concepts.html`);
  for(const lang of ['ko','en']){
   if(lang==='en')await page.locator('#language').click();
   for(const c of concepts){
    const navigation=page.locator('#library-navigation');
    if(!await navigation.evaluate(e=>e.open))await navigation.locator(':scope > summary').click();
    await page.locator(`#library-list a[href="#${c.id}"]`).click();
    await page.waitForFunction(title=>document.querySelector('h1')?.textContent===title,c[lang]);
    const intro=page.locator('.concept-first');await intro.waitFor();
    assert.equal(await page.locator('h1').textContent(),c[lang]);
    const reason=intro.locator(':scope > details').first();
    await reason.locator(':scope > summary').focus();await page.keyboard.press('Enter');
    assert.equal(await reason.locator('p').innerText(),conceptFirstSteps[c.id][lang==='ko'?2:3]);
    const math=intro.locator('.math-help');await math.locator(':scope > summary').click();
    const term=math.locator(':scope > details').first();await term.locator('summary').click();
    assert.ok(await term.locator('.katex').count()>0);
    const link=new URL(await intro.locator(':scope > a').getAttribute('href'),page.url());
    assert.equal(link.pathname,prefix+'/index.html');assert.equal(link.searchParams.get('lang'),lang);
    assert.equal(link.searchParams.get('section'),'first-steps-title');assert.equal(link.hash,'#'+c.chapter);
    await math.locator(':scope > summary').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${c.id}/${lang}/${width}: page overflow`);
    assert.equal(await page.locator('.katex-error').count(),0);
    if(!prefix&&lang==='ko'&&['metrics','scene-reconstruction'].includes(c.id))await intro.screenshot({path:`test-results/concept-first-${c.id}-${width}.png`});
   }
  }
  // Follow a real prerequisite link and confirm its destination is usable.
  await page.locator('.concept-first > a').click();
  await page.locator('#first-steps-title').waitFor();
  await page.waitForFunction(()=>document.activeElement.id==='first-steps-title');
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: all 47 concept introductions in both languages, explanations and prerequisite help, keyboard, onward links, 390/1440px and root/prefix');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
