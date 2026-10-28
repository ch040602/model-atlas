import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
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
const base = `http://127.0.0.1:${server.address().port}`;
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined), args: ['--enable-unsafe-swiftshader'] });
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/model-v2/gpt2.onnx.part*', route => route.abort());
    await page.goto(`${base}/upstream/transformer-explainer/build/?lang=${language}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.text-card .close-btn').waitFor({ state: 'visible', timeout: 45000 });
    await page.locator('.text-card .close-btn').click();
    const cards = [
      ['activation', /MLP/, [/r = x \+ Attention\(LN₁\(x\)\)/, /LN₂\(r\)/, /GELU\(−1\) ≈ −0\.159/]],
      ['layernorm', language === 'ko' ? /층 정규화/ : /Layer Normalization/, [language === 'ko' ? /토큰별 벡터/ : /each token.s vector/, /γ/, /β/, language === 'ko' ? /항상 0과 1인 것은 아닙니다/ : /not guaranteed to be 0 and 1/]],
      ['dropout', language === 'ko' ? /드롭아웃/ : /Dropout/, [/1\/\(1−p\)/, /\[2, 4\] → \[0, 8\]/, language === 'ko' ? /추론 시에는 끕니다/ : /disabled during inference/]],
      ['residual-end', language === 'ko' ? /잔차 연결/ : /Residual Connection/, [/r = x \+ Attention\(LN₁\(x\)\)/, /y = r \+ MLP\(LN₂\(r\)\)/]]
    ];
    for (const [kind, title, patterns] of cards) {
      const control = page.locator(`[data-click="${kind}"]`).first();
      await control.waitFor({ state: 'attached', timeout: 45000 });
      await control.focus();
      await control.press('Enter');
      const heading = page.locator('.text-card .card-header h3');
      await heading.waitFor({ state: 'visible' });
      assert.match(await heading.textContent(), title);
      const content = page.locator('.text-card .carousel-slide.active .textbook-content');
      const body = await content.innerText();
      for (const pattern of patterns) assert.match(body, pattern, `${language}: ${kind}`);
      const bounds = await content.evaluate(el => ({ content: el.scrollHeight, available: el.parentElement.clientHeight, width: el.scrollWidth, availableWidth: el.clientWidth }));
      assert.ok(bounds.content <= bounds.available + 1 && bounds.width <= bounds.availableWidth + 1, `${language}: ${kind} content overflows ${JSON.stringify(bounds)}`);
      if (kind === 'activation') {
        const previous = page.getByRole('button', { name: language === 'ko' ? '이전 설명' : 'Previous explanation' });
        const next = page.getByRole('button', { name: language === 'ko' ? '다음 설명' : 'Next explanation' });
        for (let i = 0; i < 4; i++) await previous.press('Enter');
        assert.match(await heading.textContent(), language === 'ko' ? /질의, 키, 값/ : /Query, Key, Value/);
        assert.match(await content.innerText(), language === 'ko' ? /입력을 층 정규화한 뒤/ : /input for each token is layer-normalized/);
        assert.ok(await content.evaluate(el => el.scrollHeight <= el.parentElement.clientHeight + 1), `${language}: QKV card overflows`);
        for (let i = 0; i < 5; i++) await next.press('Enter');
        assert.match(await heading.textContent(), language === 'ko' ? /출력 로짓/ : /Output Logit/);
        assert.match(await content.innerText(), language === 'ko' ? /최종 층 정규화한 뒤/ : /final layer normalization is applied/);
        assert.ok(await content.evaluate(el => el.scrollHeight <= el.parentElement.clientHeight + 1), `${language}: output card overflows`);
      }
    }
    await page.locator('.text-card .close-btn').press('Enter');
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-click') === 'residual-end');
    const sampling = page.locator('.sampling-type #sampling');
    await sampling.focus();
    await sampling.press('Enter');
    const heading = page.locator('.text-card .card-header h3');
    await heading.waitFor({ state: 'visible' });
    assert.match(await heading.textContent(), language === 'ko' ? /샘플링 전략/ : /Sampling Strategy/);
    const content = page.locator('.text-card .carousel-slide.active .textbook-content');
    const body = await content.innerText();
    assert.match(body, language === 'ko' ? /전체 확률을 먼저 계산/ : /first computes probabilities over the full vocabulary/);
    assert.match(body, language === 'ko' ? /누적 합이 p 이상/ : /reaching cumulative p/);
    assert.match(body, /\[0\.60, 0\.25, 0\.15\]/);
    assert.match(body, /0\.706/);
    assert.match(body, /0\.294/);
    assert.ok(Math.abs(.60/(.60+.25)-.706)<.001 && Math.abs(.25/(.60+.25)-.294)<.001);
    const bounds = await content.evaluate(el => ({ content: el.scrollHeight, available: el.parentElement.clientHeight, width: el.scrollWidth, availableWidth: el.clientWidth }));
    assert.ok(bounds.content <= bounds.available + 1 && bounds.width <= bounds.availableWidth + 1, `${language}: sampling card overflows ${JSON.stringify(bounds)}`);
    await page.locator('.text-card .close-btn').press('Enter');
    await page.waitForFunction(() => document.activeElement?.id === 'sampling');
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: bilingual Transformer cards follow the model and fit the visible dialog');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
