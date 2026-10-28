import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const require=createRequire(new URL('../upstream/transformer-explainer/package.json',import.meta.url));
const ts=require('typescript');
const source=await readFile(new URL('../upstream/transformer-explainer/src/utils/data.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const math=Object.create(Math);
math.random=()=>0.95;
const fakeRequire=name=>{
  if(name==='~/store') return {modelMetaMap:{gpt2:{layer_num:0,attention_head_num:0}}};
  return {};
};
const context={exports:{},require:fakeRequire,Math:math};
vm.runInNewContext(code,context);
const getProbabilities=context.exports.getProbabilities;
const tokenizer={decode:ids=>String(ids[0])};
const logits=Array(100).fill(0);

// The textbook's illustrative top-p example also matches the real implementation.
const cardExample=getProbabilities({tokenizer,logits:[.6,.25,.15].map(Math.log),sampling:{type:'top-p',value:.8},temperature:1});
assert.equal(cardExample.sampled.cutoffIndex,1);
assert.ok(Math.abs(cardExample.probabilities[0].probability-.6/.85)<1e-12);
assert.ok(Math.abs(cardExample.probabilities[1].probability-.25/.85)<1e-12);
assert.equal(cardExample.probabilities[2].probability,0);

// Full vocabulary, not the displayed first 50, determines the nucleus.
const topP=getProbabilities({tokenizer,logits,sampling:{type:'top-p',value:.75},temperature:1});
assert.equal(topP.sampled.rank,71);
assert.equal(topP.sampled.tokenId,71);
assert.equal(topP.sampled.cutoffIndex,74);
assert.equal(topP.probabilities.length,51);
assert.equal(topP.probabilities[10].tokenId,71);
assert.equal(topP.probabilities[11].rank,10);
assert.ok(Math.abs(topP.sampled.topPProbability-.01)<1e-12);
assert.ok(Math.abs(topP.sampled.probability-1/75)<1e-12);
assert.ok(topP.probabilities.reduce((sum,item)=>sum+item.probability,0)<1);

// The token that first reaches or crosses p is included.
math.random=()=>.99;
const small=getProbabilities({tokenizer,logits:[Math.log(.6),Math.log(.3),Math.log(.1)],sampling:{type:'top-p',value:.7},temperature:1});
assert.equal(small.sampled.rank,1);
assert.equal(small.sampled.cutoffIndex,1);
assert.ok(Math.abs(small.probabilities[1].probability-1/3)<1e-12);
assert.equal(small.probabilities[2].probability,0);

const topK=getProbabilities({tokenizer,logits,sampling:{type:'top-k',value:5},temperature:1});
assert.equal(topK.probabilities.length,50);
assert.equal(topK.sampled.rank,4);
assert.ok(Math.abs(topK.sampled.probability-.2)<1e-12);
assert.equal(topK.probabilities[5].probability,0);
const fullVocabulary=getProbabilities({tokenizer,logits:Array(50257).fill(0),sampling:{type:'top-p',value:.9},temperature:1});
assert.ok(fullVocabulary.sampled.rank>50);
assert.equal(fullVocabulary.probabilities[10].rank,fullVocabulary.sampled.rank);
assert.equal(fullVocabulary.sampled.cutoffIndex,Math.ceil(.9*50257)-1);
assert.ok(Math.abs(fullVocabulary.sampled.probability-1/(fullVocabulary.sampled.cutoffIndex+1))<1e-12);
console.log('PASS: full-vocabulary top-p, threshold crossing, off-list sample and top-k');
