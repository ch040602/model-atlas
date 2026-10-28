import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.bin':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/course(?=\/)/,'');
  let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
  for(const prefix of ['','/course'])for(const lang of ['ko','en'])for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/pretrained_models/*.json',route=>route.fulfill({status:404,body:'not available'}));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/ganlab/demo/?lang=${lang}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('gan-lab')?.model && document.querySelector('#pretrained-status')?.textContent,null,{timeout:45000});
    const items=page.locator('.distribution-item');
    assert.equal(await items.count(),5);
    const names=lang==='ko'?['단순한 선','가우시안 혼합 분포','고리','분리된 세 영역','직접 그리기']:['Simple line','Mixture of Gaussians','Ring','3 disjoint regions','Draw one by yourself'];
    for(let i=0;i<5;i++){
      await items.nth(i).focus();
      assert.equal(await items.nth(i).getAttribute('role'),'button');
      assert.equal(await items.nth(i).getAttribute('tabindex'),'0');
      assert.equal(await items.nth(i).getAttribute('aria-label'),names[i]);
      assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('distribution-item')),true);
      assert.equal(await page.getByRole('button',{name:names[i],exact:true}).count(),1);
    }
    await items.nth(0).focus();
    assert.notEqual(await items.nth(0).evaluate(el=>getComputedStyle(el).outlineStyle),'none');
    await page.keyboard.press('Tab');
    assert.equal(await items.nth(1).evaluate(el=>document.activeElement===el),true);
    assert.equal(await items.nth(1).getAttribute('aria-pressed'),'true');
    for(const [index,key,shape] of [[0,'Enter','line'],[2,'Space','ring'],[3,'Enter','disjoint']]){
      await items.nth(index).focus();await page.keyboard.press(key);
      assert.equal(await page.locator('gan-lab').evaluate(lab=>lab.selectedShapeName),shape);
      assert.deepEqual(await items.evaluateAll(els=>els.map(el=>el.getAttribute('aria-pressed'))),[0,1,2,3,4].map(i=>String(i===index)));
      assert.equal(await page.locator('gan-lab').evaluate(lab=>lab.usePretrained),false);
    }
    await items.nth(1).click();
    assert.equal(await page.locator('gan-lab').evaluate(lab=>lab.selectedShapeName),'gaussians');
    assert.equal(await items.nth(1).getAttribute('aria-pressed'),'true');
    await page.locator('#next-step-button').click();
    await page.locator('#next-step-d-button').click();
    await page.waitForFunction(()=>document.querySelector('gan-lab')?.iterationCount>0,null,{timeout:45000});
    await items.nth(4).focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('gan-lab').evaluate(lab=>lab.selectedShapeName),'drawing');
    assert.equal(await items.nth(4).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#drawing-container').isVisible(),true);
    assert.deepEqual(errors,[]);await page.close();
    console.log(`PASS: GAN distribution keyboard, pointer and scratch update ${prefix || '/'} ${lang} ${width}px`);
  }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
