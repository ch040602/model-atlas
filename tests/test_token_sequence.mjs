import assert from 'node:assert/strict';
import {tokenSequenceExperiment,tokenSequenceMarkup,tokenSequenceOutput} from '../token-sequence-lab.js';

const b=tokenSequenceExperiment('B'), c=tokenSequenceExperiment('C');
assert.deepEqual(b.targets,[0.8,0.35,0.9]);
assert.ok(Math.abs(b.meanLoss-(-Math.log(0.8*0.35*0.9)/3))<1e-12);
assert.ok(Math.abs(b.sequenceProbability-0.252)<1e-12);
assert.ok(Math.abs(b.perplexity-Math.pow(0.252,-1/3))<1e-12);
assert.equal(b.meanLoss,c.meanLoss,'manual generation choice must not change teacher-forced loss');
assert.deepEqual([b.chosenProbability,b.endProbability],[0.35,0.9]);
assert.deepEqual([c.chosenProbability,c.endProbability],[0.55,0.8]);
assert.throws(()=>tokenSequenceExperiment('EOS'));
assert.throws(()=>tokenSequenceExperiment('B',0),RangeError);
assert.throws(()=>tokenSequenceExperiment('B',NaN),RangeError);
let lastPpl=Infinity;
for(let step=1;step<=16;step++){
  const p=step*0.05, result=tokenSequenceExperiment('C',p);
  assert.ok(Math.abs(Object.values(result.afterA).reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.ok(Math.abs(result.meanLoss+Math.log(0.8*p*0.9)/3)<1e-12);
  assert.ok(Math.abs(result.perplexity-Math.pow(0.8*p*0.9,-1/3))<1e-12);
  assert.ok(result.perplexity<lastPpl);lastPpl=result.perplexity;
  assert.equal(result.chosenProbability,result.afterA.C);
  assert.equal(result.endProbability,0.8);
}
for(const lang of ['ko','en']){
  assert.match(tokenSequenceMarkup('C',lang),/value="C" checked/);
  assert.doesNotMatch(tokenSequenceOutput('C',lang,1),/−log P\(A/);
  assert.match(tokenSequenceOutput('C',lang,2),/0\.459/);
  assert.match(tokenSequenceOutput('C',lang,3),/BOS, A, C\) = 0\.800/);
  assert.match(tokenSequenceOutput('B',lang,3),/BOS, A, B\) = 0\.900/);
}
console.log('PASS: teacher-forced loss and both autoregressive contexts');
