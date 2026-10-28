import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml'};
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined), args: ['--enable-unsafe-swiftshader']});
  for (const lang of ['ko', 'en']) for (const width of [390, 1440]) {
    const page = await browser.newPage({viewport: {width, height: 900}}), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/upstream/ganlab/demo/?lang=${lang}`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.querySelector('gan-lab')?.iterationCount === 1931, null, {timeout: 45000});
    const check = async (g, d) => {
      const result = await page.locator('gan-lab').evaluate(lab => ({
        gShown: Number(document.getElementById('num-g-layers').textContent),
        dShown: Number(document.getElementById('num-d-layers').textContent),
        // Each layer has a weight and bias; the last pair is the output layer.
        gActual: lab.model.gVariables.length / 2 - 1,
        dActual: lab.model.dVariables.length / 2 - 1,
        gCheckpoint: lab.numGeneratorLayers,
        dCheckpoint: lab.numDiscriminatorLayers
      }));
      assert.deepEqual(result, {gShown: g, dShown: d, gActual: g, dActual: d, gCheckpoint: g - 1, dCheckpoint: d - 1});
    };
    await check(2, 2);
    await page.locator('#edit-model-button').click();
    for (const [control, g, d] of [['g-layers-remove-button', 1, 2], ['d-layers-add-button', 1, 3], ['g-layers-add-button', 2, 3], ['d-layers-remove-button', 2, 2]]) {
      await page.locator('#' + control).click();
      await check(g, d);
    }
    if (lang === 'en' && width === 1440) {
      for (let i = 0; i < 7; i++) await page.locator('#g-layers-remove-button').click();
      await check(1, 2);
      for (let i = 0; i < 7; i++) await page.locator('#d-layers-add-button').click();
      await check(1, 6);
    }
    await page.locator('#component-options-noise paper-dropdown-menu').click();
    await page.locator('#noise-dropdown paper-item').filter({hasText: lang === 'ko' ? '1D 균등' : '1D Uniform'}).click();
    assert.equal(await page.locator('gan-lab').evaluate(lab => lab.selectedNoiseType), '1D Uniform');
    await page.locator('#toggle-pretrained').click();
    await page.waitForFunction(() => document.querySelector('gan-lab')?.iterationCount === 1931, null, {timeout: 45000});
    await check(2, 2);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: GAN displayed layer counts match real model variables and restored checkpoints in both languages and viewport widths');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
