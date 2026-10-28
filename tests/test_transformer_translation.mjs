import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import vm from 'node:vm';

const page=await readFile(new URL('../upstream/transformer-explainer/src/routes/+page.svelte',import.meta.url),'utf8');
const section=page.match(/onMount\(\(\) => \{([\s\S]*?)\n\t\}\);/)?.[1];
assert.ok(section && section.includes('modelAtlasKorean.set'), 'client locale initialization exists');
function load(search, stored, blocked=false) {
  let language;
  const context={window:{location:{search}},URLSearchParams,document:{documentElement:{}},
    localStorage:{getItem(){if(blocked) throw new Error('unavailable');return stored;}},
    modelAtlasKorean:{set(value){language=value}}};
  vm.runInNewContext(section,context);
  return {language,htmlLang:context.document.documentElement.lang};
}
assert.deepEqual(load('?lang=ko','en'),{language:true,htmlLang:'ko'});
assert.deepEqual(load('?lang=en','ko'),{language:false,htmlLang:'en'});
assert.deepEqual(load('','ko'),{language:true,htmlLang:'ko'});
assert.deepEqual(load('',null,true),{language:false,htmlLang:'en'});
const buildDir=new URL('../upstream/transformer-explainer/build/_app/immutable/nodes/',import.meta.url);
const names=(await readdir(buildDir)).filter(name=>name.endsWith('.js'));
const chunkDir=new URL('../upstream/transformer-explainer/build/_app/immutable/chunks/',import.meta.url);
const chunks=(await readdir(chunkDir)).filter(name=>name.endsWith('.js'));
const contents=(await Promise.all([...names.map(name=>readFile(new URL(name,buildDir),'utf8')),...chunks.map(name=>readFile(new URL(name,chunkDir),'utf8'))])).join('\n');
for (const label of ['예시','생성','온도','샘플링','트랜스포머란?','잔차 연결','드롭아웃','두 번째 위치의 Q=','작은 예:']) assert.ok(contents.includes(label),`built bundle contains ${label}`);
const textbook=await readFile(new URL('../upstream/transformer-explainer/src/utils/textbookPages.ts',import.meta.url),'utf8');
const ids=[...textbook.split('export const textPages:')[1].matchAll(/^\s{2}id: '([^']+)'/gm)].map(match=>match[1]);
const translations=[...textbook.split('export const textPages:')[0].matchAll(/'([^']+)': \{ title:/g)].map(match=>match[1]);
assert.deepEqual(translations,ids,'each textbook page has a Korean translation');
const article=await readFile(new URL('../upstream/transformer-explainer/src/components/article/Article.svelte',import.meta.url),'utf8');
const weight=1/(1+Math.exp(1/Math.sqrt(2)));
assert.ok(Math.abs(weight-0.330)<0.001 && Math.abs((1-weight)*2+weight*4-2.660)<0.001,'article attention example is numerically consistent');
assert.match(article,/0\.670×2 \+ 0\.330×4 ≈ 2\.660/);
const model=await readFile(new URL('../upstream/transformer-explainer/src/utils/model/model.py',import.meta.url),'utf8');
assert.match(model,/self\.lm_head = nn\.Linear\(config\.n_embd, config\.vocab_size, bias=False\)/);
assert.match(model,/x = x \+ self\.attn\(self\.ln_1\(x\)\)[\s\S]*?x = x \+ self\.mlp\(self\.ln_2\(x\)\)/,'model applies pre-normalized attention and MLP residuals in order');
assert.match(model,/x = self\.transformer\.ln_f\(x\)[\s\S]*?logits = self\.lm_head\(x\[:, \[-1\], :\]\)/,'inference projects the final position after final normalization');
const logit=await readFile(new URL('../upstream/transformer-explainer/src/components/Popovers/LogitWeightPopover.svelte',import.meta.url),'utf8');
assert.doesNotMatch(logit,/lm-head-bias|Bias_[1j]/,'GPT-2 output projection has no bias term');
assert.match(logit,/실제 모델 값이나 곱셈 결과가 아닙니다|편향 없이/);
const shared=await readFile(new URL('../upstream/transformer-explainer/src/components/common/WeightPopoverCard.svelte',import.meta.url),'utf8');
assert.match(shared,/id === 'attention'/,'attention has a distinct mixed real/illustrative description');
for(const name of ['QKVWeightPopover','AttentionWeightPopover','MLPWeightPopover','MLPDownWeightPopover','LogitWeightPopover']) {
  const component=await readFile(new URL(`../upstream/transformer-explainer/src/components/Popovers/${name}.svelte`,import.meta.url),'utf8');
  assert.match(component,/clearTimeout\(animationDelay\)/,`${name} cancels pending animation on close`);
}
for(const name of ['LinearSoftmax','OperationGroup','WeightPopovers']) {
  const component=await readFile(new URL(`../upstream/transformer-explainer/src/components/${name}.svelte`,import.meta.url),'utf8');
  assert.doesNotMatch(component,/\.\/popovers\//,'imports use case-sensitive directory name');
}
console.log('PASS: Transformer client language selection, translated controls, textbook pages and article example');
