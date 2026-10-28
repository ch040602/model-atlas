import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp, readFile, rm, rmdir, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'model-atlas-startup-'));
const children = [];
let browser;

function start(command, args, options = {}) {
  const child = spawn(command, args, {cwd: temp, windowsHide: true, ...options});
  children.push(child);
  let stdout = '', stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timed out: ${stderr}`)), 15000);
    child.on('error', error => {clearTimeout(timer); reject(error);});
    child.on('exit', code => {clearTimeout(timer); reject(new Error(`Server exited (${code}): ${stderr}`));});
    child.stdout.on('data', chunk => {
      stdout += chunk;
      const match = stdout.match(/Model Atlas: (http:\/\/127\.0\.0\.1:\d+\/)/);
      if (match) {clearTimeout(timer); resolve({child, url: match[1]});}
    });
  });
}

try {
  const script = path.join(root, 'scripts', 'serve.py');
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const first = await start(python, ['-u', script, '--no-open']);
  let second;
  if (process.platform === 'win32') {
    // Intercept the automatic browser launch without changing the real desktop.
    const capture = path.join(temp, 'browser-url.txt');
    const fakeBrowser = path.join(temp, 'browser.py');
    await writeFile(fakeBrowser, 'import os, sys\nopen(os.environ["MODEL_ATLAS_TEST_BROWSER_CAPTURE"], "w", encoding="utf-8").write(sys.argv[1])\n');
    const env = {...process.env, BROWSER: `python "${fakeBrowser.replaceAll('\\', '/')}" %s`, MODEL_ATLAS_TEST_BROWSER_CAPTURE: capture};
    second = await start('cmd.exe', ['/d', '/c', path.join(root, 'START_MODEL_ATLAS.bat')], {env});
    for (let i = 0; i < 100 && !existsSync(capture); i++) await delay(100);
    assert.equal(await readFile(capture, 'utf8'), second.url, 'Windows launcher opens its own server URL');
  } else {
    second = await start(python, ['-u', script, '--no-open']);
  }
  assert.notEqual(first.url, second.url, 'concurrent launches need distinct ports');
  for (const {url} of [first, second]) {
    const page = await fetch(url);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Model Atlas/);
    const js = await fetch(new URL('app.js', url));
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);
  }

  const windowsChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' && existsSync(windowsChrome) ? windowsChrome : undefined);
  browser = await chromium.launch({headless: true, executablePath});
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  assert.match(await page.locator('main').innerText(), /START_MODEL_ATLAS\.bat/);
  assert.ok(await page.locator('.startup-notice').isVisible());
  await page.goto(pathToFileURL(path.join(root, 'concepts.html')).href);
  assert.ok(await page.locator('.startup-notice').isVisible());
  await page.goto(first.url);
  assert.equal(await page.locator('h1').first().textContent(), '학습의 기초');
  assert.equal(await page.locator('#navigation button').count(), 6);
  assert.equal(await page.locator('.startup-notice').count(), 0);
  await page.locator('#language').click();
  assert.equal(await page.locator('h1').first().textContent(), 'Learning basics');
  await page.locator('#concept-library-link').click();
  await page.locator('.startup-notice').waitFor({state: 'detached', timeout: 10000});
  assert.ok((await page.locator('main').innerText()).trim().length > 50);
  assert.equal(await page.locator('.startup-notice').count(), 0);

  const blocked = await browser.newPage();
  await blocked.route('**/app.js', route => route.abort());
  await blocked.goto(second.url);
  assert.ok(await blocked.locator('.startup-notice').isVisible(), 'blocked module must leave actionable help');
  console.log('PASS: direct-file and blocked-script help, Windows launcher/browser URL, distinct ports, MIME types, and real bilingual course');
} finally {
  if (browser) await browser.close();
  for (const child of children) {
    if (child.exitCode === null && child.pid) {
      if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {windowsHide: true});
      else child.kill();
    }
  }
  // This directory was created by mkdtemp above and contains only this test's files.
  for (const name of ['browser-url.txt', 'browser.py']) await rm(path.join(temp, name), {force: true});
  await rmdir(temp);
}
