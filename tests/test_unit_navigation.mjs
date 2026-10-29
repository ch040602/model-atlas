import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {chapters} from '../curriculum.js';
import {labGuides} from '../lab-guides.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined)});
  for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.locator('#unit-contents summary').click();
    for(const language of ['ko','en']) {
      if(language==='en') await page.locator('#language').click();
      for(const chapter of chapters) {
        await page.locator(`#navigation [data-nav="${chapter.id}"]`).click();
        assert.equal(await page.locator('#unit-contents').evaluate(el=>el.open),true);
        const expected=await page.locator('#main').evaluate(main=>Array.from(main.querySelectorAll('#first-steps-title, #architecture-title, #formula-title, #concept-title, #math-basics-title, #symbols-title, #worked-title, #main-lab-title, .sequence-lab > h2, #interview-title, #quiz-title, #resource-title')).map(target=>({id:target.id,label:(target.id==='resource-title'?target.firstElementChild.textContent:target.textContent).trim()})));
        const labs={foundation:['split-title','gradient-direction-title','training-title','batch-title','early-title'],cnn:['conv-title','geometry-title','pool-title','channel-title'],rnn:['sequence-title','rnn-output-title','memory-title','token-title','rnn-flow-title','lstm-title','gru-title'],diffusion:['diff-title','latent-title','clip-title','cross-title','cfg-title'],transformer:['embedding-title','attn-title','multihead-title','block-title','linked-block-title','token-sequence-title','sample-title'],gan:['gantrain-title','ganmodes-title']};
        const hasArchitecture=['cnn','rnn','transformer'].includes(chapter.id);
        const required=['first-steps-title','math-basics-title','concept-title','symbols-title',...(hasArchitecture?['architecture-title','formula-title']:[]),'worked-title','main-lab-title',...labs[chapter.id],...(chapter.resource?['resource-title']:[]),'interview-title','quiz-title'];
        assert.deepEqual(expected.map(item=>item.id),required,`${chapter.id}: every intended section appears in order`);
        const entries=await page.locator('#unit-contents-list button').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.unitJump,label:node.textContent})));
        assert.deepEqual(entries,expected,`${chapter.id}/${language}: exact order and labels`);
        assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
        for(const entry of entries) {
          const jump=page.locator('#unit-contents-list button').filter({hasText:entry.label});
          await jump.focus();await jump.press('Enter');
          assert.equal(await page.evaluate(()=>document.activeElement.id),entry.id,`${chapter.id}/${language}: focus ${entry.id}`);
          assert.equal(new URL(page.url()).hash,`#${chapter.id}`);
          const visible=await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect();return {top:r.top,bottom:r.bottom,bar:0,height:innerHeight};});
          assert.ok(visible.top>=visible.bar-1 && visible.bottom<=visible.height+1,`${entry.id} obscured at ${width}: ${JSON.stringify(visible)}`);
        }
        if(chapter.resource) {
          assert.deepEqual(await page.locator('.lab-guide li').allTextContents(),labGuides[chapter.id][language],`${chapter.id}/${language}: the integrated guide renders each instruction`);
          assert.equal(await page.locator('[data-resource]').evaluate(el=>el.open),false,'jump does not open original lab');
          assert.equal(await page.locator('iframe.lab-frame').getAttribute('src'),null,'jump does not load original lab');
          if(chapter.id==='gan') {
            const panel=page.locator('[data-resource]');
            assert.ok((await panel.textContent()).includes(language==='ko'?'작은 화면에서는 위 링크로 원본을 열어':'On a small screen, open the original'));
            assert.ok((await panel.locator('a').first().getAttribute('href')).endsWith(`?lang=${language}`));
          }
        }
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
      }
    }
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('PASS: in-unit navigation covers every chapter and language, focus, URL, lazy original and mobile layout');
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}

