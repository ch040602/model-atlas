import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'};
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
  const cases=[
    {query:'?lang=ko',stored:'en',lang:'ko'},
    {query:'?lang=en',stored:'ko',lang:'en'},
    {query:'',stored:'ko',lang:'ko'},
    {query:'?lang=invalid',stored:'en',lang:'en'},
    {query:'',stored:null,lang:'en'},
    {query:'',blocked:true,lang:'en'}
  ];
  for (const c of cases) {
    const page=await browser.newPage();
    await page.addInitScript(({stored,blocked})=>{
      if (blocked) Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});
      else if(stored) localStorage.setItem('model-atlas-language',stored);
    },c);
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.origin!==base||url.pathname.endsWith('/ganlab.html')||url.pathname.includes('/node_modules/')) return route.abort();
      return route.continue();
    });
    await page.goto(`${base}/upstream/ganlab/demo/${c.query}`,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('html').getAttribute('lang'),c.lang);
    assert.equal(await page.locator('#loading span').textContent(),c.lang==='ko'?'불러오는 중...':'Loading...');
    assert.equal(await page.locator('#loading small').textContent(),c.lang==='ko'?'수십 초가 걸릴 수 있습니다.':'It may take a few tens of seconds.');
    assert.equal(await page.locator('#tool-description span').textContent(),c.lang==='ko'?'브라우저에서 생성적 적대 신경망(GAN)을 실습하세요!':'Play with Generative Adversarial Networks (GANs) in your browser!');
    assert.equal(await page.locator('[data-model-atlas-article="ko"]').isVisible(),c.lang==='ko');
    assert.equal(await page.locator('[data-model-atlas-article="en"]').isVisible(),c.lang==='en');
    assert.equal(await page.evaluate(()=>!!customElements.get('gan-lab')),false,'interactive component was blocked');
    await page.close();
  }
  console.log('PASS: GAN initial page language and loading text with interactive component blocked');
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
