import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {chapters} from '../curriculum.js';
import {quizzes,quizHints} from '../quizzes.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+name);
    if(file!==root&&!file.startsWith(root+path.sep)) return res.writeHead(403).end();
    if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    const choose=(q,c)=>page.locator(`[data-quiz="${q}"][data-choice="${c}"]`);
    const result=q=>page.locator(`#quiz-result-${q}`);
    for(const chapter of chapters) {
      await page.locator(`[data-nav="${chapter.id}"]`).first().click();
      for(const [q,entry] of quizzes[chapter.id].ko.entries()) {
        const correct=entry[2], wrong=entry[1].map((_,i)=>i).filter(i=>i!==correct);
        await choose(q,wrong[0]).focus();
        await choose(q,wrong[0]).press('Space');
        assert.ok((await result(q).textContent()).includes(quizHints[chapter.id].ko[q][wrong[0]]));
        assert.equal(await choose(q,wrong[0]).getAttribute('aria-pressed'),'true');
        assert.equal(await choose(q,correct).getAttribute('aria-pressed'),'false');
        await choose(q,wrong[1]).click();
        assert.ok((await result(q).textContent()).includes(quizHints[chapter.id].ko[q][wrong[1]]));
        await choose(q,correct).click();
        assert.ok((await result(q).textContent()).includes(entry[3]));
        assert.equal(await choose(q,correct).getAttribute('aria-pressed'),'true');
        assert.equal(await choose(q,wrong[1]).getAttribute('aria-pressed'),'false');
      }
      assert.ok(await page.locator('.question').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1)),`${chapter.id}: quiz fits viewport ${width}`);
    }
    await page.locator('[data-nav="foundation"]').first().click();
    await choose(0,1).click();
    await page.locator('#language').click();
    assert.ok((await result(0).textContent()).includes(quizHints.foundation.en[0][1]));
    assert.equal(await choose(0,1).getAttribute('aria-pressed'),'true');
    assert.ok((await result(1).textContent()).includes(quizzes.foundation.en[1][3]));
    for(const chapter of chapters) {
      await page.locator(`[data-nav="${chapter.id}"]`).first().click();
      for(const [q,entry] of quizzes[chapter.id].en.entries()) {
        const wrong=entry[1].findIndex((_,i)=>i!==entry[2]);
        await choose(q,wrong).click();
        assert.ok((await result(q).textContent()).includes(quizHints[chapter.id].en[q][wrong]));
      }
    }
    await page.locator('[data-nav="foundation"]').first().click();
    assert.ok((await result(0).textContent()).includes(quizHints.foundation.en[0][1]));
    await page.locator('#language').click();
    assert.ok((await result(0).textContent()).includes(quizHints.foundation.ko[0][1]));
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await result(0).textContent(),'');
    assert.equal(await choose(0,1).getAttribute('aria-pressed'),'false');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: answer-specific bilingual hints, session navigation, keyboard, reload and quiz layout');
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
