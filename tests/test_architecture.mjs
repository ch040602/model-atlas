import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {convolutionClassification} from '../convolution-lab.js';
import {sequenceExperiment} from '../sequence-lab.js';
import {linkedBlockExample} from '../linked-transformer-block.js';
import {transformerFormulaValues} from '../formula-model.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/|$)/,'');
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});
  createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const number=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vec=x=>`[${x.map(number).join(', ')}]`;
const configs={
 cnn:{count:5,field:'#conv-strength',value:'1.5',second:'#conv-center',secondValue:'0.4',detail:'conv-title'},
 rnn:{count:4,field:'#sequence-x2',value:'0.4',second:'#sequence-weight',secondValue:'0.8',detail:'sequence-title'},
 transformer:{count:7,field:'#block-x1',value:'0.5',second:'#block-gamma',secondValue:'0.7',detail:'linked-block-title'}
};
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
 if(process.env.ARCH_SCREENSHOTS)mkdirSync(path.join(root,'test-results'),{recursive:true});
 for(const width of [390,1440])for(const prefix of ['','/course']){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${prefix}/`);
  for(const lang of ['ko','en']){
   if(lang==='en')await page.locator('#language').click();
   for(const [kind,c] of Object.entries(configs)){
    await page.locator(`#navigation [data-nav="${kind}"]`).click();
    assert.equal(await page.locator('.architecture-node').count(),c.count);
    assert.ok(await page.locator('#architecture-title').isVisible());
    assert.ok((await page.locator('#architecture-detail').innerText()).length>60);
    // The top and detailed controls must track changes in both directions.
    await page.locator('#architecture-input').fill(c.value);
    assert.equal(await page.locator(c.field).inputValue(),c.value);
    await page.locator(c.field).fill('0.2');
    assert.equal(await page.locator('#architecture-input').inputValue(),'0.2');
    await page.locator('#architecture-input').fill(c.value);
    await page.locator(c.second).fill(c.secondValue);
    for(let i=0;i<c.count;i++){
     const node=page.locator(`[data-architecture-step="${i}"]`);
     await node.focus();await page.keyboard.press('Enter');
     assert.equal(await page.locator('[data-architecture-step][aria-pressed="true"]').getAttribute('data-architecture-step'),String(i));
     assert.equal(await page.locator('#architecture-status').textContent(),`${i+1} / ${c.count}`);
     assert.equal(await page.locator('#architecture-detail code').getAttribute('data-architecture-math'),String(i));
     assert.equal(await page.evaluate(()=>document.activeElement.dataset.architectureStep),String(i));
     assert.ok((await page.locator('#architecture-detail code').innerText()).length>10);
    }
    let expected;
    if(kind==='cnn')expected=vec(convolutionClassification(0.4,1.5,0).before.probabilities);
    if(kind==='rnn')expected=number(sequenceExperiment([1,0.4,0],0.8,0.8).loss);
    if(kind==='transformer'){
     const linked=linkedBlockExample({x1:0.5,x2:0,gamma:0.7,beta:0,activation:'gelu'});
     expected=vec(transformerFormulaValues({x1:0.5,x2:0,gamma:0.7,beta:0,activation:'gelu'}).probabilities);
     await page.locator('[data-architecture-step="3"]').click();
     assert.ok((await page.locator('#architecture-detail code').getAttribute('data-math-source')).includes(vec(linked.heads[0].weights)));
     await page.locator('[data-architecture-step="6"]').click();
    }
    assert.ok((await page.locator('#architecture-detail code').getAttribute('data-math-source')).includes(expected),`${kind}/${lang}: expected ${expected}`);
    assert.equal(await page.locator('[data-architecture-action="next"]').isDisabled(),true);
    await page.locator('[data-architecture-action="previous"]').click();
    assert.equal(await page.locator('#architecture-status').textContent(),`${c.count-1} / ${c.count}`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    if(kind!=='rnn'){
     const url=await page.locator('.architecture-links a').getAttribute('href');
     const response=await page.request.get(new URL(url,page.url()).href);
     assert.equal(response.status(),200,`${kind}: original entry page available`);
     const original=page.locator('[data-resource]');
     assert.equal(await page.locator('iframe').count(),1,'only one original frame exists');
     assert.equal(await original.locator('iframe').getAttribute('src'),null);
     if(width===1440 && prefix==='' && lang==='ko'){
      await original.locator('summary').click();
      const embedded=original.locator('iframe');
      await embedded.waitFor({state:'attached'});
      const frame=await (await embedded.elementHandle()).contentFrame();
      await frame.locator(kind==='cnn'?'#cnn-layer-group-11':'.main-section.active .token-string .label').first().waitFor({state:'visible',timeout:45000});
      assert.ok((await embedded.getAttribute('src')).includes(`?lang=${lang}`));
      await original.locator('[data-lab-scroll="right"]').click();
      assert.ok(await original.locator('.lab-viewport').evaluate(el=>el.scrollLeft>0));
      await original.locator('[data-lab-scroll="left"]').click();
      if(process.env.ARCH_SCREENSHOTS)await original.locator('.lab-viewport').screenshot({path:`test-results/architecture-embedded-${kind}.png`});
      await original.locator('summary').click();
      await original.locator('summary').click();
      assert.equal(await original.locator('iframe').count(),1,'reopening keeps the existing visualization');
      await original.locator('summary').click();
     }
    }
    if(process.env.ARCH_SCREENSHOTS && prefix==='' && lang==='ko'){
     await page.locator('[data-architecture-step="0"]').click();
     await page.locator('.architecture-map').screenshot({path:`test-results/architecture-new-${kind}-${width}.png`,style:'.topbar{visibility:hidden!important}'});
    }
    await page.locator(`[data-architecture-jump="${c.detail}"]`).click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),c.detail);
   }
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: architecture diagrams, formulas, linked controls, keyboard, original entries, two languages, widths and paths');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
