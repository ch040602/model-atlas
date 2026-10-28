import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {concepts} from '../concepts-data.js';
import {pcaProjection} from '../pca-lab.js';

const ml=Array.from({length:29},(_,i)=>String(i+1));
const dl=['1','2','3','4','5','6','7','8','9','10','11','12','12-1','12-2','12-3','12-4','13','13-1','13-2','13-3','14','14-1','14-2','15','15-1','15-2','15-3','16','16-1','16-2','16-3','17','17-1','17-2','17-3','18','18-1','18-2','18-3','19','19-1','19-2','19-3','20','20-1','20-2'];
assert.equal(new Set(concepts.map(c=>c.id)).size,concepts.length);
for(let angle=-90;angle<=90;angle+=5){
  const result=pcaProjection(angle);
  // Independent closed form for these four centered points.
  const expected=0.5+(21/58)*Math.sin(2*angle*Math.PI/180);
  assert.ok(Math.abs(result.ratio-expected)<1e-12);
  assert.ok(Math.abs(result.kept+result.error-result.total)<1e-12);
}
assert.ok(Math.abs(pcaProjection(45).ratio-25/29)<1e-12);
assert.ok(Math.abs(pcaProjection(-45).ratio-4/29)<1e-12);
assert.throws(()=>pcaProjection(NaN),RangeError);
for(const c of concepts) for(const key of ['id','group','ko','en','exKo','exEn','tryKo','tryEn','chapter']) assert.ok(c[key],c.id+' '+key);
for(const [field,expected] of [['ml',ml],['dl',dl]]) {
  const covered=new Set(concepts.flatMap(c=>c[field].map(String)));
  assert.deepEqual([...covered].sort(),expected.slice().sort(),field+' source question coverage');
}

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course\//,'/');
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  // Serve the local math renderer and fonts as well as root-level modules.
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript; charset=utf-8','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})});
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/index.html#foundation');
  await page.locator('#concept-library-link').click();
  await page.waitForURL('**/concepts.html');
  assert.equal(await page.locator('#library-list a').count(),concepts.length);
  await page.locator('#concept-search').fill('PCA');
  assert.equal(await page.locator('#library-list a').count(),1);
  await page.locator('#library-list a').click();
  await page.waitForURL('**/concepts.html#pca');
  await page.waitForFunction(()=>document.querySelector('main h1')?.textContent.includes('PCA'));
  assert.match(await page.locator('main h1').textContent(),/PCA/);
  assert.match(await page.locator('.pca-lab').textContent(),/−0.4, 0.4/);
  assert.match(await page.locator('#pca-output').textContent(),/50.0%/);
  await page.locator('#pca-angle').fill('45');
  assert.match(await page.locator('#pca-output').textContent(),/86.2%/);
  assert.match(await page.locator('#pca-output').textContent(),/0.640/);
  if(process.env.CONCEPT_SCREENSHOTS) await page.locator('.pca-lab').screenshot({path:'test-results/pca-desktop.png'});
  await page.locator('#pca-angle').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#pca-angle-value').textContent(),'40°');
  await page.locator('#pca-angle').fill('-45');
  assert.match(await page.locator('#pca-output').textContent(),/13.8%/);
  await page.locator('#language').click();
  assert.match(await page.locator('#pca-output').textContent(),/Retained variance ratio/);
  assert.equal(await page.locator('#pca-angle').inputValue(),'-45');
  await page.locator('#language').click();
  await page.locator('.concept-sequence a[href="#topics"]').click();
  await page.waitForFunction(()=>document.querySelector('main h1')?.textContent.includes('LSA'));
  await page.goBack();
  await page.waitForFunction(()=>document.querySelector('main h1')?.textContent.includes('PCA'));
  await page.locator('#concept-search').fill('');
  await page.locator('a[href="#metrics"]').click();
  await page.waitForSelector('#metric-result');
  if(process.env.CONCEPT_SCREENSHOTS) await page.screenshot({path:'test-results/concepts-desktop.png',fullPage:true});
  assert.match(await page.locator('#metric-result').textContent(),/80.0%.*66.7%.*70.0%/);
  await page.locator('[data-metric="fp"]').fill('0');
  assert.match(await page.locator('#metric-result').textContent(),/100.0%/);
  await page.locator('[data-metric="tp"]').fill('0');
  assert.match(await page.locator('#metric-result').textContent(),/정의되지 않음/);
  await page.locator('[data-metric="fn"]').fill('-1');
  assert.match(await page.locator('#metric-result').textContent(),/정수를 입력/);
  await page.locator('[data-metric="fn"]').fill('4');
  await page.locator('#library-list a[href="#kmeans"]').click();
  await page.waitForSelector('#cluster-result');
  assert.match(await page.locator('#cluster-result').textContent(),/A \[0, 2\], B \[8, 10\].*A=1, B=9.*8 → 4/);
  await page.locator('[data-cluster="b"]').fill('0');
  assert.match(await page.locator('#cluster-result').textContent(),/A \[0, 2, 8, 10\], B \[\].*A=5, B=0.*168 → 68/);
  await page.locator('[data-cluster="b"]').fill('21');
  assert.match(await page.locator('#cluster-result').textContent(),/−20부터 20까지/);
  await page.locator('#language').click();
  assert.match(await page.locator('#cluster-result').textContent(),/Enter numbers/);
  await page.locator('[data-cluster="b"]').fill('8');
  assert.match(await page.locator('#cluster-result').textContent(),/Assignment:.*New centers:.*8 → 4/);
  await page.locator('#language').click();
  await page.locator('#library-list a[href="#metrics"]').click();
  await page.waitForSelector('#metric-result');
  await page.locator('#language').click();
  assert.match(await page.locator('main h1').textContent(),/Regression and classification/);
  assert.match(await page.locator('#metric-result').textContent(),/undefined/);
  await page.locator('main a.next').click();
  await page.waitForURL('**/index.html?section=split-title#foundation');
  await page.waitForFunction(()=>document.activeElement?.id==='split-title');
  assert.equal(await page.locator('#concept-library-link').textContent(),'Concept library →');
  assert.ok(await page.locator('a[href="concepts.html#gradient"]').count());
  await page.locator('#navigation [data-nav="cnn"]').click();
  await page.waitForURL('**/index.html#cnn');
  await page.locator('#navigation [data-nav="foundation"]').click();
  await page.waitForURL('**/index.html#foundation');
  await page.reload();
  assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'split-title');
  const links=[
    ['learning','foundation','training-title'],['splits','foundation','split-title'],
    ['metrics','foundation','split-title'],['overfit','foundation','early-title'],
    ['gradient','foundation','training-title'],['optimizers','foundation','batch-title'],
    ['initialization','foundation','training-title'],['activation','cnn','conv-title'],
    ['loss','cnn','conv-title']
  ];
  for(const language of ['ko','en']){
    await page.evaluate(language=>localStorage.setItem('model-atlas-language',language),language);
    for(const [concept,chapter,target] of links){
      await page.goto(base+'/concepts.html#'+concept);
      await page.locator('main a.next').click();
      await page.waitForURL('**/index.html?section='+target+'#'+chapter);
      await page.waitForFunction(id=>document.activeElement?.id===id,target);
      assert.equal(await page.locator('#'+target).count(),1);
    }
  }
  await page.goto(base+'/concepts.html#svm-bayes');
  assert.equal(await page.locator('main a.next').getAttribute('href'),'index.html#foundation');
  assert.equal(await page.getByRole('heading',{name:'Return to the learning path'}).count(),1);
  assert.equal(await page.locator('#bayes-title').textContent(),'Calculate naive Bayes from word presence');
  await page.goto(base+'/index.html?section=split-title#cnn');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'');
  await page.goto(base+'/index.html?section=language#foundation');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'');
  await page.goto(base+'/index.html?other=keep&section=split-title#foundation');
  await page.waitForFunction(()=>document.activeElement?.id==='split-title');
  await page.locator('#navigation [data-nav="cnn"]').click();
  await page.waitForURL('**/index.html?other=keep#cnn');
  await page.goto(base+'/course/concepts.html#gradient');
  await page.locator('main a.next').click();
  await page.waitForURL('**/course/index.html?section=training-title#foundation');
  await page.waitForFunction(()=>document.activeElement?.id==='training-title');
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/concepts.html#gradient');
  await page.locator('main a.next').click();
  await page.waitForFunction(()=>document.activeElement?.id==='training-title');
  assert.ok(await page.locator('#training-title').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=20 && r.top<200;}));
  await page.goBack();
  await page.waitForURL('**/concepts.html#gradient');
  assert.match(await page.locator('main h1').textContent(),/Gradient descent/);
  await page.goto(base+'/concepts.html#pca');
  assert.match(await page.locator('main h1').textContent(),/PCA/);
  assert.equal(await page.locator('#library-navigation').evaluate(e=>e.open),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#pca-angle').fill('45');
  assert.match(await page.locator('#pca-output').textContent(),/86.2%/);
  if(process.env.CONCEPT_SCREENSHOTS) await page.screenshot({path:'test-results/concepts-mobile.png',fullPage:true});
  await page.goto(base+'/concepts.html#%');
  assert.match(await page.locator('main h1').textContent(),/Machine learning/);
  assert.deepEqual(errors,[]);
  console.log('PASS: PCA numerical checks, bilingual interactive concepts, direct exercise links, focus, navigation history, project-prefix hosting and mobile layout');
}finally{await browser?.close();server.close();}
