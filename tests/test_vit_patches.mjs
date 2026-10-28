import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {vitInitial,vitCalculate,vitFirstPixel} from '../vit-patches-lab.js';

const initial=vitCalculate(vitInitial().pixels);
assert.deepEqual(initial.map(p=>p.flat),[[0,1,4,5],[2,3,6,7],[8,9,12,13],[10,11,14,15]]);
assert.deepEqual(initial.map(p=>p.projected),[[2,3],[4,5],[10,11],[12,13]]);
for(let seed=0;seed<32;seed++){
  const pixels=Array.from({length:16},(_,i)=>(i*7+seed*3)%16);
  const E=[[.5,0],[0,.5],[.5,0],[0,.5]];
  for(const p of vitCalculate(pixels)){
    const expected=[];
    for(let y=0;y<2;y++)for(let x=0;x<2;x++)expected.push(pixels[(p.row*2+y)*4+p.col*2+x]);
    assert.deepEqual(p.flat,expected);
    assert.equal(vitFirstPixel(p.patch),(p.row*2)*4+p.col*2);
    for(let j=0;j<2;j++){
      const projected=expected.reduce((sum,v,i)=>sum+v*E[i][j],0);
      assert.ok(Math.abs(p.projected[j]-projected)<1e-12);
      assert.ok(Math.abs(p.token[j]-(projected+[p.row*.2,p.col*.2][j]))<1e-12);
    }
  }
}
const equal=vitCalculate(Array(16).fill(5));
assert.deepEqual(equal.map(p=>p.token),[[5,5],[5,5.2],[5.2,5],[5.2,5.2]]);
assert.throws(()=>vitCalculate(Array(15).fill(0)),RangeError);
assert.throws(()=>vitCalculate(Array(16).fill(16)),RangeError);
assert.throws(()=>vitFirstPixel(4),RangeError);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/prefix(?=\/)/,'');let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const prefix of ['','/prefix'])for(const width of [390,1440])for(const lang of ['ko','en']){
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+prefix+'/concepts.html#vision-transformer');
    if(lang==='en')await page.locator('#language').click();
    const buttons=page.locator('[data-vit-patch]'),slider=page.locator('#vit-pixel'),out=page.locator('#vit-output');
    assert.equal(await buttons.count(),4);
    for(let i=0;i<4;i++){
      await buttons.nth(i).focus();await page.keyboard.press('Enter');
      assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');
      assert.equal(await slider.inputValue(),String(vitFirstPixel(i)));
      assert.equal(await out.locator('tbody tr.xor-selected th').textContent(),String(i+1));
    }
    await buttons.nth(2).click();
    assert.equal(await out.locator('tbody tr').nth(2).locator('td').last().textContent(),'[10.20, 11.00]');
    await slider.fill('14');
    assert.equal(await out.locator('tbody tr').nth(2).locator('td').last().textContent(),'[13.20, 11.00]');
    assert.equal(await out.locator('tbody tr').nth(0).locator('td').last().textContent(),'[2.00, 3.00]');
    await page.locator('#language').click();
    assert.equal(await page.locator('#vit-pixel').inputValue(),'14');
    assert.equal(await page.locator('[data-vit-patch="2"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#vit-output tbody tr').nth(2).locator('td').last().textContent(),'[13.20, 11.00]');
    if(width===390){const table=page.locator('.vit-lab .xor-table-wrap');await table.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('.vit-lab .xor-table-wrap')?.scrollLeft>0);}
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
    if(!prefix && width===390 && lang==='ko' && process.env.VIT_SCREENSHOT)await page.locator('.vit-lab').screenshot({path:'test-results/vit-mobile.png'});
    if(!prefix && width===1440 && lang==='ko'){
      await page.goto(base+'/concepts.html#learning');
      await page.locator('#concept-search').fill('Vision Transformer');
      await page.locator('#library-list a[href="#vision-transformer"]').click();
      await page.locator('#vit-lab-title').waitFor();
      assert.equal(await page.locator('#vit-pixel').inputValue(),'14');
    }
    await page.locator('a[href="index.html?section=embedding-title#transformer"]').click();
    await page.locator('#embedding-title').waitFor();
    await page.waitForFunction(()=>document.activeElement?.id==='embedding-title');
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: ViT patches, shared matrix, positional values, keyboard, bilingual state, navigation and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
