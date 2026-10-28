import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,existsSync} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

// Exercise the exact source functions on two channels and a nonzero bias.
let source=await readFile(new URL('../upstream/cnn-explainer/src/utils/cnn.js',import.meta.url),'utf8');
assert.equal((source.match(/const convolute =/g)||[]).length,1);
source=source.replace('const convolute =','export const convolute =');
const {singleConv,convolute}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const first=[[1,2],[3,4]],second=[[4,3],[2,1]];
assert.deepEqual(singleConv(first,[[1]]),first);
assert.deepEqual(singleConv(second,[[-2]]),[[-8,-6],[-4,-2]]);
const node={type:'conv',output:[[0,0],[0,0]],bias:0.5,inputLinks:[{source:{output:first},weight:[[1]]},{source:{output:second},weight:[[-2]]}]};
convolute([node]);assert.deepEqual(node.output,[[-6.5,-3.5],[-0.5,2.5]]);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{try{
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name.startsWith('/course/'))name=name.slice('/course'.length);
 let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}[path.extname(file)]||'application/octet-stream'});createReadStream(file).pipe(res);
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='win32'&&existsSync(chrome)?chrome:undefined),args:['--enable-unsafe-swiftshader']});
 for(const prefix of ['','/course'])for(const lang of ['ko','en']){
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${prefix}/upstream/cnn-explainer/public/?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#detailed-button:not([disabled])',{timeout:45000});
  const node=page.locator('#layer-1-node-0');await node.focus();await node.press('Enter');
  const channels=page.locator('.intermediate-node[role="button"]');await channels.first().waitFor({state:'attached'});assert.ok(await channels.count()>=2);
  for(const index of [0,1]){
   const channel=channels.nth(index);await channel.focus();await channel.press('Enter');
   const note=page.locator('[data-partial-convolution-note]');await note.waitFor({state:'visible'});
   assert.match(await note.textContent(),lang==='ko'?/선택한 입력 채널 하나의 기여만/:/selected input channel’s contribution only/);
   assert.match(await note.textContent(),lang==='ko'?/다른 채널의 기여와 편향이 포함되지 않습니다/:/does not include those other contributions or the bias/);
   assert.ok(await note.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   if(process.env.CNN_DETAIL_SCREENSHOT&&prefix===''&&lang==='ko'&&index===0)await page.locator('#detailview').screenshot({path:'test-results/cnn-partial-ko.png'});
   const close=page.getByRole('button',{name:lang==='ko'?'상세 화면 닫기':'Close detail'});await close.focus();await close.press('Enter');
   assert.equal(await channel.evaluate(el=>document.activeElement===el),true);
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: actual CNN channel contributions and bias, bilingual keyboard detail at root and project prefix');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
