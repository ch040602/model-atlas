import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const info = await stat(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': info.size });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined) });
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [], photoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/\/(whitedog|yellowflower)\.jpg/.test(request.url())) photoRequests.push(request.url()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/diffusion-explainer/?lang=${language}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.umapData && document.querySelector('#text-vector-generator-container'), null, { timeout: 45000 });
    if (await page.evaluate(() => window.playing)) await page.locator('#controller-button-play-container').click();
    await page.locator('#text-vector-generator-container').focus();
    await page.keyboard.press('Enter');
    const encoder = page.locator('#text-vector-generator-l2-text-encoder-container');
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#text-vector-generator-l2-expl-container')).opacity) > 0.99);
    await encoder.focus();
    await page.keyboard.press('Space');
    const diagram = page.locator('#generate-text-vector-l3-expl-container');
    await diagram.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'generate-text-vector-l3-expl-x-svg');
    for (const [index, expectedAlt, expectedCaption] of language === 'ko'
      ? [[1, '흰 강아지 그림', '흰 강아지 의 그림'], [2, '노란 꽃 그림', '노란 꽃 의 그림']]
      : [[1, 'Illustration of a white dog', 'image of white dog'], [2, 'Illustration of a yellow flower', 'drawing of yellow flower']]) {
      const image = diagram.locator(`#generate-text-vector-l3-expl-vis-input-img-${index}`);
      assert.equal(await image.getAttribute('alt'), expectedAlt);
      assert.match(await image.getAttribute('src'), /^data:image\/svg\+xml,/);
      assert.ok(await image.evaluate(el => el.complete && el.naturalWidth > 0 && el.naturalHeight > 0));
      const tokens = diagram.locator(`.generate-text-vector-l3-expl-vis-token-${index}`);
      assert.equal((await tokens.allTextContents()).join(' '), expectedCaption);
      for (const token of await tokens.all()) assert.ok(await token.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${language}: caption clipped`);
      for (let i = 0; i < 4; i++) assert.equal(await diagram.locator(`#generate-text-vector-l3-expl-vis-token-${index}-${i}`).count(), 1);
    }
    assert.match(await diagram.locator('#generate-text-vector-l3-expl-text-3').textContent(), language === 'ko' ? /실제 CLIP 출력이 아닙니다/ : /not measured CLIP outputs/);
    assert.match(await diagram.locator('#generate-text-vector-l3-expl-text-3').textContent(), language === 'ko' ? /실제 토큰화가 아닙니다/ : /not actual tokenization/);
    const bounds = await diagram.evaluate(el => ({ panel: el.getBoundingClientRect().bottom, text: el.querySelector('#generate-text-vector-l3-expl-text-container').getBoundingClientRect().bottom }));
    assert.ok(bounds.text <= bounds.panel + 1, `${language}: text extends outside diagram`);
    await mkdir(path.join(root, 'test-results'), { recursive: true });
    await diagram.screenshot({ path: path.join(root, 'test-results', `diffusion-clip-illustrations-${language}.png`) });
    await page.keyboard.press('Escape');
    assert.equal(await encoder.getAttribute('aria-expanded'), 'false');
    assert.equal(await encoder.evaluate(el => document.activeElement === el), true);
    assert.deepEqual(photoRequests, []);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: CLIP diagrams, bilingual captions and keyboard navigation without the two upstream photos');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
