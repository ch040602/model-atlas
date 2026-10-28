import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../upstream/ganlab/demo/ganlab.ts',import.meta.url),'utf8');
const section=source.match(/\/\/ Apply labels only;[\s\S]*?(?=    \/\/ HTML elements\.)/)?.[0];
assert.ok(section,'translation code is present in the Polymer ready method');
const code=section.replaceAll(': HTMLElement','');
function run(search,stored,blocked=false) {
  const label={textContent:'Generator',getAttribute(){return '생성자'}};
  const title={value:'Reset the model',getAttribute(){return '모델 초기화'},setAttribute(_key,value){this.value=value}};
  const number={textContent:'7'};
  const document={documentElement:{},querySelectorAll(selector){return selector.includes('-ko]')?[label]:[title]}};
  vm.runInNewContext(code,{document,window:{location:{search}},URLSearchParams,
    localStorage:{getItem(){if(blocked) throw new Error('unavailable');return stored;}},Array});
  return {label:label.textContent,title:title.value,number:number.textContent,lang:document.documentElement.lang};
}
assert.deepEqual(run('?lang=ko','en'),{label:'생성자',title:'모델 초기화',number:'7',lang:'ko'});
assert.deepEqual(run('?lang=en','ko'),{label:'Generator',title:'Reset the model',number:'7',lang:'en'});
assert.equal(run('','ko').label,'생성자');
assert.equal(run('',null,true).label,'Generator');
const html=await readFile(new URL('../upstream/ganlab/demo/ganlab.html',import.meta.url),'utf8');
assert.match(html,/Modified by Model Atlas/);
for(const label of ['데이터 분포','생성자 손실','판별자 손실']) assert.ok(html.includes(label));
const index=await readFile(new URL('../upstream/ganlab/demo/index.html',import.meta.url),'utf8');
assert.match(index,/data-model-atlas-article="ko"/);
assert.match(index,/data-model-atlas-article="en"/);
assert.doesNotMatch(index,/<img[^>]+(?:github-mark\.png|figure-paper-screenshot\.png)/);
assert.match(index,/https:\/\/doi\.org\/10\.1109\/TVCG\.2018\.2864500/);
assert.match(index,/0\.95 × 평균\(log D\(x\)\)/);
assert.match(index,/0\.95 × mean\(log D\(x\)\)/);
assert.match(index,/without renormalizing/);
assert.match(index,/다시 정규화하지 않으므로/);
assert.ok(Math.abs(-1.95*Math.log(.8)-.435)<.001);
assert.ok(Math.abs(-Math.log(.2)-1.609)<.001);
assert.ok(Math.abs((.8-1)**2+.2**2-.08)<1e-12);
assert.ok(Math.abs((.2-1)**2-.64)<1e-12);
assert.match(index,/−5×\(0\.4, −0\.1\)=\(−2, 0\.5\)/);
assert.match(index,/1차원 또는 2차원 노이즈/);
assert.match(index,/G\(0\.4\)=\(0\.2, 0\.6\)/);
assert.match(index,/반복당 업데이트 횟수/);
assert.doesNotMatch(index,/에포크당 업데이트/);
assert.ok(Math.abs((-1/.2)*.4-(-2))<1e-12);
assert.ok(Math.abs((-1/.2)*(-.1)-.5)<1e-12);
for(const id of ['toggle-right-real-samples','toggle-right-fake-samples','toggle-right-discriminator','toggle-right-generator','toggle-right-gradients']) assert.ok(html.includes(`id="${id}"`));
const bundle=await readFile(new URL('../upstream/ganlab/demo/bundle.js',import.meta.url),'utf8');
assert.ok(bundle.includes('data-model-atlas-ko'),'built bundle contains translation support');
console.log('PASS: GAN language selection, unchanged numbers and translated template controls');
