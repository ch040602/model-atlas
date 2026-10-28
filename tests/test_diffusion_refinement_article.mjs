import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml'};
const server = createServer(async (req, res) => { try {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/course(?=\/)/, '');
  let file = path.resolve(root, '.' + name);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
  if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  const info = await stat(file);
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length':info.size});
  createReadStream(file).pipe(res);
} catch { res.writeHead(404).end(); }});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined)});
  await mkdir(path.join(root, 'test-results'), {recursive:true});
  for (const prefix of ['', '/course']) for (const lang of ['ko', 'en']) for (const width of [390, 1440]) {
    const page = await browser.newPage({viewport:{width, height:1000}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/diffusion-explainer/?lang=${lang}`, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.umapData && document.querySelector('#description-equation-denoise'));
    const section = page.locator('#description-subsec-image-representation-refining');
    const text = await section.innerText();
    for (const phrase of (lang === 'ko' ? [
      '압축된 다차원 이미지 표현', '모델을 새로 실행하지는 않습니다', '같은 잠재 표현과 시간 단계',
      '빈 프롬프트를 조건으로', '스케줄러에 전달할 조건 강화 노이즈 예측', '1보다 큰 값',
      '스케일 0, 1, 7, 20', '예측 노이즈를 항상 그대로 빼는 것은 아닙니다', '정확한 갱신식은 아닙니다'
    ] : [
      'compact, multidimensional image representation', 'does not run the model', 'same latent and timestep',
      'conditioned on an empty prompt', 'guided noise prediction passed to the scheduler', 'Values above 1',
      'scales 0, 1, 7 and 20', 'not necessarily subtracted directly', 'not the exact scheduler equation'
    ])) assert.ok(text.includes(phrase), `${lang}: missing ${phrase}`);
    assert.equal(await section.locator('a[href="https://github.com/CompVis/stable-diffusion/blob/main/ldm/models/diffusion/ddim.py"]').count(), 1);
    for (const selector of ['#description-equation-gs', '#description-equation-denoise']) {
      const dimensions = await page.locator(selector).evaluate(el => ({width:el.clientWidth, content:el.scrollWidth}));
      assert.ok(dimensions.content <= dimensions.width + 1, `${selector} overflows: ${JSON.stringify(dimensions)}`);
    }
    if (!prefix && width === 390) await section.screenshot({path:path.join(root, 'test-results', `diffusion-refinement-article-${lang}.png`)});
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS: Diffusion refinement article ${prefix || '/'} ${lang} ${width}px`);
  }
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
