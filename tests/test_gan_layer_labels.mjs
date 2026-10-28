import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.bin':'application/octet-stream'};
const server = createServer(async (req, res) => { try {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/course(?=\/)/, '');
  let file = path.resolve(root, '.' + name);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
  if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
  createReadStream(file).pipe(res);
} catch { res.writeHead(404).end(); }});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined), args:['--enable-unsafe-swiftshader']});
  for (const prefix of ['', '/course']) for (const lang of ['ko', 'en']) for (const width of [390, 1440]) {
    const page = await browser.newPage({viewport:{width, height:900}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/pretrained_models/*.json', route => route.fulfill({status:404, body:'not available'}));
    await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/upstream/ganlab/demo/?lang=${lang}`, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.querySelector('gan-lab')?.model && document.querySelector('#pretrained-status')?.textContent, null, {timeout:45000});
    const cases = [
      ['overlap-plots', 'toggle-right-discriminator', 'vis-discriminator-output', '판별자 판정 표시', 'Discriminator classifications'],
      ['enable-manifold', 'toggle-right-generator', 'vis-manifold', '생성자 매니폴드 표시', 'Generator manifold'],
      ['show-t-samples', 'toggle-right-real-samples', 'vis-true-samples', '진짜 샘플 표시', 'Real samples'],
      ['show-g-samples', 'toggle-right-fake-samples', 'vis-generated-samples', '가짜 샘플 표시', 'Fake samples'],
      ['show-g-gradients', 'toggle-right-gradients', 'vis-generator-gradients', '판별자 입력 기울기 표시', 'Discriminator input gradients']
    ];
    for (const [id, description, layer, ko, en] of cases) {
      const box = page.locator('#' + id), label = lang === 'ko' ? ko : en;
      assert.equal(await page.getByRole('checkbox', {name:label, exact:true}).count(), 1);
      const before = await box.evaluate(el => el.checked);
      await box.focus(); await page.keyboard.press('Space');
      await page.waitForFunction(([id, expected]) => document.getElementById(id).checked === expected, [id, !before], {timeout:3000});
      assert.equal(await box.evaluate(el => el.checked), !before);
      assert.equal(await box.getAttribute('aria-checked'), String(!before));
      assert.equal(await page.locator('#' + description).getAttribute('aria-pressed'), String(!before));
      assert.equal(await page.locator('#' + layer).evaluate(el => el.style.visibility), before ? 'hidden' : 'visible');
      await page.locator('#' + description).click();
      assert.equal(await box.evaluate(el => el.checked), before);
      assert.equal(await box.getAttribute('aria-checked'), String(before));
    }
    const text = await page.locator('#layers-descriptions').innerText();
    assert.ok(text.includes(lang === 'ko' ? '이는 판별자의 예측이며 실제 출처의 정답은 아닙니다.' : "This is the discriminator's prediction, not the sample's true origin."));
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS: GAN layer labels and states ${prefix || '/'} ${lang} ${width}px`);
  }
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
