import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

// Use the root lockfile for D3 v5 and the Transformer's pinned esbuild.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules=path.join(root,'node_modules');
const esbuild=await import(pathToFileURL(path.join(root,'upstream','transformer-explainer','node_modules','esbuild','lib','main.js')).href);
const d3Dir=path.join(modules,'d3');
const d3=JSON.parse(await readFile(path.join(d3Dir,'package.json'),'utf8'));
if(d3.version!=='5.16.0') throw new Error(`Expected D3 5.16.0, found ${d3.version}`);
const result=await esbuild.build({absWorkingDir:root,entryPoints:[path.join(d3Dir,'index.js')],
  bundle:true,format:'iife',globalName:'d3',target:['es2020'],minify:true,
  legalComments:'inline',metafile:true,write:false});
const used=new Set();
const outputMetadata=Object.values(result.metafile.outputs);
if(outputMetadata.length!==1) throw new Error('Expected one D3 bundle output');
for(const [file,info] of Object.entries(outputMetadata[0].inputs)) {
  if(info.bytesInOutput===0) continue;
  const normalized=file.replaceAll('\\','/');
  if((normalized.match(/(?:^|\/)node_modules\//g)||[]).length!==1)
    throw new Error(`Cannot attribute nested or non-package input: ${file}`);
  const match=normalized.match(/(?:^|\/)node_modules\/(?:@([^/]+)\/)?([^/]+)\//);
  if(!match) throw new Error(`Cannot attribute bundled input: ${file}`);
  used.add(match[1]?`@${match[1]}/${match[2]}`:match[2]);
}
let notices='CNN Explainer D3 bundle: packages actually included by esbuild\n'+
  'Generated from the root npm lockfile. Run node scripts/build_cnn_d3.mjs --check to verify.\n\n';
for(const name of [...used].sort()) {
  const dir=path.join(modules,...name.split('/'));
  const manifest=JSON.parse(await readFile(path.join(dir,'package.json'),'utf8'));
  let license;
  for(const file of ['LICENSE','LICENSE.txt','LICENSE.md','COPYING']) {
    try { license=await readFile(path.join(dir,file),'utf8'); break; }
    catch(error) {if(error.code!=='ENOENT') throw error;}
  }
  if(!license) throw new Error(`Missing license text for bundled package ${name}`);
  notices+=`===== ${name} ${manifest.version} (${manifest.license}) =====\n${license.trim()}\n\n`;
}
const javascript='// D3 5.16.0 bundle; package notices: third-party-licenses/cnn-d3-bundle-notices.txt\n'+result.outputFiles[0].text;
const outputs=[[path.join(root,'vendor','d3-5.16.0.min.js'),javascript],
  [path.join(root,'third-party-licenses','cnn-d3-bundle-notices.txt'),notices]];
const check=process.argv.includes('--check');
for(const [file,content] of outputs) {
  if(check) {
    const current=await readFile(file,'utf8');
    if(current!==content) throw new Error(`Generated file differs: ${path.relative(root,file)}`);
  } else {await mkdir(path.dirname(file),{recursive:true});await writeFile(file,content,'utf8');}
}
console.log(`${check?'PASS':'Wrote'} D3 bundle and notices for ${used.size} included packages`);
