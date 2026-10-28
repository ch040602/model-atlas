import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../upstream/diffusion-explainer/index.html',import.meta.url),'utf8');
const script=html.match(/<!-- Model Atlas localization:[\s\S]*?<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'localization script exists in the actual source');
function load(search, stored, blocked=false) {
  const context={window:{location:{search}},document:{documentElement:{}},URLSearchParams,
    localStorage:{getItem(){if(blocked) throw new Error('unavailable');return stored;}}};
  vm.runInNewContext(script,context);
  return context;
}
const ko=load('?lang=ko','en');
assert.equal(ko.document.documentElement.lang,'ko');
assert.equal(ko.window.modelAtlasText('Guidance scale'),'가이던스 스케일');
assert.equal(ko.window.modelAtlasText('Timestep'),'시간 단계');
assert.equal(ko.window.modelAtlasText('Untranslated input'),'Untranslated input');
assert.equal(ko.window.modelAtlasHtml('English','한국어'),'한국어');
const en=load('?lang=en','ko');
assert.equal(en.document.documentElement.lang,'en');
assert.equal(en.window.modelAtlasText('Guidance scale'),'Guidance scale');
assert.equal(en.window.modelAtlasHtml('English','한국어'),'English');
assert.equal(load('', 'ko').window.modelAtlasText('Seed'),'시드');
assert.equal(load('', null, true).window.modelAtlasText('Seed'),'Seed');
const prompts=await readFile(new URL('../upstream/diffusion-explainer/js/prompts.js',import.meta.url),'utf8');
const nodes=Object.fromEntries(['model-atlas-prompt-translation','model-atlas-prompt-selected','model-atlas-prompt-comparison'].map(id=>[id,{hidden:true,textContent:''}]));
const promptContext={window:{modelAtlasHtml:(_en,ko)=>ko},document:{getElementById:id=>nodes[id]}};
vm.runInNewContext(prompts,promptContext);
assert.equal(promptContext.window.modelAtlasPromptKo.length,promptContext.window.prompts.length);
for(let i=0;i<promptContext.window.prompts.length;i++) {
  promptContext.window.selectedPromptGroupIdx=i;
  promptContext.window.updateModelAtlasPromptTranslations();
  assert.equal(nodes['model-atlas-prompt-selected'].textContent,promptContext.window.modelAtlasPromptKo[i][0]);
  assert.equal(nodes['model-atlas-prompt-comparison'].textContent,promptContext.window.modelAtlasPromptKo[i][1]);
  assert.ok(promptContext.window.modelAtlasPromptKo[i].every(s=>s.length>0));
}
// Execute the actual article construction with chainable D3 stubs and inspect
// selected output. This is a source-level integration check, not a browser test.
const article=await readFile(new URL('../upstream/diffusion-explainer/js/description.js',import.meta.url),'utf8');
function renderArticle(context) {
  const fragments=[];
  const selection=new Proxy({}, {get(_target, method){
    return (...args)=>{if(method==='html'||method==='text') fragments.push(args[0]); return selection;};
  }});
  context.d3={select(){return selection},selectAll(){return selection}};
  vm.runInNewContext(article,context);
  return fragments.join('\n');
}
const koreanArticle=renderArticle(ko), englishArticle=renderArticle(en);
assert.match(koreanArticle,/무작위 노이즈에서 시작/);
assert.match(koreanArticle,/href="#description-subsec-text-representation-generation"/);
assert.match(koreanArticle,/프롬프트 조건 노이즈/);
assert.match(koreanArticle,/정확한 갱신식은 스케줄러에 따라 다릅니다/);
assert.match(koreanArticle,/강조된 단어를 눌러/);
assert.match(koreanArticle,/은닉 상태 순서열/);
assert.match(koreanArticle,/실제 출력이 아닌 예시/);
assert.match(koreanArticle,/연구진이 개발했습니다/);
assert.match(englishArticle,/Stable Diffusion is a text-to-image model/);
assert.match(englishArticle,/Noise Prediction/);
assert.match(englishArticle,/impact of prompt/);
assert.match(englishArticle,/exact update depends on the scheduler/);
assert.match(englishArticle,/Click the keywords highlighted/);
assert.match(englishArticle,/sequence of hidden states/);
assert.match(englishArticle,/illustrative, not measured outputs/);
console.log('PASS: diffusion language selection, translated controls, article fragments and English fallback');
