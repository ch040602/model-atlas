import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {stat, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.md':'text/plain; charset=utf-8', '.LICENSE':'text/plain; charset=utf-8'};
const server = createServer(async (req, res) => { try {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/course(?=\/)/, '');
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
  if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
  createReadStream(file).pipe(res);
} catch { res.writeHead(404).end(); }});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined)});
  for (const prefix of ['', '/course']) for (const lang of ['ko', 'en']) for (const width of [390, 1440]) {
    const page = await browser.newPage({viewport:{width, height:900}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const base = `http://127.0.0.1:${server.address().port}${prefix}`;
    await page.goto(`${base}/credits.html?lang=${lang}`);
    const section = page.locator(`[data-credits-lang="${lang}"]`);
    assert.ok(await section.isVisible());
    assert.ok(await page.locator(`[data-credits-lang="${lang === 'ko' ? 'en' : 'ko'}"]`).isHidden());
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
    assert.equal(await section.locator('li').count(), 5);
    assert.equal(await section.locator('a[href^="third-party-licenses/"][href$=".LICENSE"]').count(), 5);
    for (const href of await section.locator('a[href^="third-party-licenses/"],a[href="LICENSES.md"]').evaluateAll(as => as.map(a => a.href))) {
      assert.equal((await page.request.get(href)).status(), 200, href);
    }
    assert.ok((await page.request.get(`${base}/third-party-licenses/ganlab.LICENSE`)).ok());
    assert.match(await section.innerText(), lang === 'ko' ? /아직 확인하지 못했습니다/ : /remain unverified/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
    if (!prefix && width === 390) {
      await mkdir(path.join(root, 'test-results'), {recursive:true});
      await page.screenshot({path:path.join(root, 'test-results', `credits-${lang}-mobile.png`), fullPage:true});
    }
    const toggle = page.locator('#language');
    await toggle.focus(); await page.keyboard.press('Enter');
    const other = lang === 'ko' ? 'en' : 'ko';
    assert.equal(await page.locator('html').getAttribute('lang'), other);
    assert.ok(await page.locator(`[data-credits-lang="${other}"]`).isVisible());
    assert.equal(new URL(page.url()).searchParams.get('lang'), other);
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), other);
    await page.goto(`${base}/#foundation`);
    assert.equal(await page.locator('html').getAttribute('lang'), other);
    const footerLink = page.locator('footer a[href="credits.html"]');
    assert.equal(await footerLink.count(), 1);
    await footerLink.click();
    assert.equal(await page.locator('html').getAttribute('lang'), other);
    await page.goto(`${base}/concepts.html#metrics`);
    const conceptLink = page.locator('main a[href="credits.html"]');
    assert.equal(await conceptLink.count(), 1);
    await conceptLink.click();
    assert.equal(await page.locator('html').getAttribute('lang'), other);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS: credits, notices and navigation ${prefix || '/'} ${lang} ${width}px`);
  }
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
