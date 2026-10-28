import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const source=await readFile(new URL('../upstream/cnn-explainer/src/config.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('// Model Atlas localization')).replace('export const modelAtlasText', 'globalThis.modelAtlasText').replace('export const modelAtlasClassName', 'globalThis.modelAtlasClassName');
assert.ok(code.includes('modelAtlasLanguage'));
function load(search,stored,blocked=false) {
  const context={window:{location:{search}},document:{documentElement:{}},URLSearchParams,overviewConfig:{classLists:['lifeboat']},
    localStorage:{getItem(){if(blocked) throw new Error('unavailable'); return stored;}}};
  vm.runInNewContext(code,context);
  return context;
}
const ko=load('?lang=ko','en');
assert.equal(ko.document.documentElement.lang,'ko');
assert.equal(ko.modelAtlasText('Show detail','자세히 보기'),'자세히 보기');
assert.equal(ko.modelAtlasClassName(0),'구명보트');
const en=load('?lang=en','ko');
assert.equal(en.modelAtlasText('Show detail','자세히 보기'),'Show detail');
assert.equal(en.modelAtlasClassName(0),'lifeboat');
assert.equal(load('','ko').document.documentElement.lang,'ko');
assert.equal(load('',null,true).document.documentElement.lang,'en');
const html=await readFile(new URL('../upstream/cnn-explainer/public/index.html',import.meta.url),'utf8');
assert.doesNotMatch(html,/A Love of Thunder/,'restricted font is not requested by the page');
assert.match(html,/\.\.\/\.\.\/\.\.\/vendor\/tfjs-1\.0\.0\.min\.js/);
assert.doesNotMatch(html,/cdn\.jsdelivr\.net\/npm\/@tensorflow\/tfjs/);
const tfjs=await readFile(new URL('../vendor/tfjs-1.0.0.min.js',import.meta.url));
assert.equal(createHash('sha256').update(tfjs).digest('hex'),'665a0c2f9b5bf9dcba1b81a9e78372a84eee1ba37ae5a6d3c775df935b9b2358','local TensorFlow.js matches the verified original bundle');
const header=await readFile(new URL('../upstream/cnn-explainer/src/Header.svelte',import.meta.url),'utf8');
assert.match(header,/Arial Black/,'header uses a system font');
const bundle=await readFile(new URL('../upstream/cnn-explainer/public/bundle.js',import.meta.url),'utf8');
for (const label of ['자세히 보기','입력 이미지 추가','색상 범위 변경','합성곱 신경망(CNN)이란?','필터 가중치를 다른 위치에도 공유','행렬 위에 마우스를 올려 필터 위치를 바꿉니다.','ReLU 활성화','최대 풀링','입력 채널 위로 필터를 이동해','모든 곱을 합산','클래스 확률로 변환']) assert.ok(bundle.includes(label),`built bundle contains ${label}`);
const model=JSON.parse(await readFile(new URL('../upstream/cnn-explainer/public/assets/data/model.json',import.meta.url),'utf8'));
const layers=model.modelTopology.model_config.config.layers;
const pools=layers.filter(layer=>layer.class_name==='MaxPooling2D');
assert.equal(pools.length,2);
for(const pool of pools) {
  assert.deepEqual(pool.config.pool_size,[2,2]);
  assert.deepEqual(pool.config.strides,[2,2]);
  assert.equal(pool.config.padding,'valid');
}
const cnnSource=await readFile(new URL('../upstream/cnn-explainer/src/utils/cnn.js',import.meta.url),'utf8');
const {singleMaxPooling}=await import('data:text/javascript;base64,'+Buffer.from(cnnSource).toString('base64'));
const four=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>r*4+c));
const five=Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r===4||c===4?1000:r*4+c));
assert.deepEqual(singleMaxPooling(four),[[5,7],[13,15]]);
assert.deepEqual(singleMaxPooling(five),[[5,7],[13,15]],'valid pooling ignores incomplete last row and column');
for(const phrase of ['풀링만으로 과적합이 방지되는 것은 아닙니다','마지막 행과 열은 사용하지 않습니다','Pooling alone does not prevent overfitting','last row and column unused']) assert.ok(bundle.includes(phrase),`built pooling article contains ${phrase}`);
assert.ok(!bundle.includes('avoids overfitting'),'remove unsupported claim that pooling avoids overfitting');
const flattenIndex=layers.findIndex(layer=>layer.class_name==='Flatten');
const output=layers[flattenIndex+1];
assert.ok(flattenIndex>=0 && output?.class_name==='Dense','shipped CNN has a dense classifier after flatten');
assert.equal(output.config.units,10);
assert.equal(output.config.activation,'softmax');
assert.equal(output.config.use_bias,true);
const outputWeights=model.weightsManifest.flatMap(group=>group.weights);
assert.deepEqual(outputWeights.find(weight=>weight.name==='output/kernel')?.shape,[1690,10]);
assert.deepEqual(outputWeights.find(weight=>weight.name==='output/bias')?.shape,[10]);
for(const phrase of ['평탄화 자체는 점수를 계산하지 않습니다','Flattening alone does not calculate class scores','[0.5, 0.5]']) assert.ok(bundle.includes(phrase),`built article contains ${phrase}`);
for (const phrase of ['비선형 연산이 없는 연속된 아핀 변환', '최대 풀링도 비선형', 'A sequence of affine transformations without any nonlinear operations', 'Max pooling is also nonlinear']) assert.ok(bundle.includes(phrase), `built ReLU article contains ${phrase}`);
assert.ok(!bundle.includes('deep CNN architectures would devolve'), 'remove the unconditional linearity claim');
const reluExample=x=>2*Math.max(0,3*x+1)-1;
assert.deepEqual([-1,0,1].map(reluExample),[-1,1,7]);
const a=[2,0], b=[0,2];
assert.notEqual(Math.max(...a.map((v,i)=>v+b[i])), Math.max(...a)+Math.max(...b), 'max pooling is not additive');
console.log('PASS: CNN language selection and translated labels in built bundle');
