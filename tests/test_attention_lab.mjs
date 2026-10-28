import assert from 'node:assert/strict';
import {attentionExperiment, attentionOutput, attentionProjections, tokenHeadExperiment, queryTrainingStep} from '../attention-lab.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`);
const projected=attentionProjections([0.4,-0.7]);
assert.deepEqual(projected.queries[1],[0.4,-0.7]);
assert.deepEqual(projected.keys,[[1,0],[0,1],[1,1]]);
assert.deepEqual(projected.values,[[1,0],[0,2],[2,2]]);
const changed=attentionExperiment([0.4,-0.7],false);
close(changed.scores[0],0.4/Math.sqrt(2));
close(changed.scores[1],-0.7/Math.sqrt(2));
const directDenominator=changed.scores.reduce((sum,score)=>sum+Math.exp(score),0);
for (let i=0;i<changed.scores.length;i++) close(changed.weights[i],Math.exp(changed.scores[i])/directDenominator);
const masked=attentionExperiment([1,1],true);
close(masked.scores[0],1/Math.sqrt(2));
close(masked.scores[2],Math.sqrt(2));
assert.deepEqual(masked.weights,[0.5,0.5,0]);
assert.deepEqual(masked.output,[0.5,1]);
const unmasked=attentionExperiment([1,1],false);
assert.ok(unmasked.weights[2]>unmasked.weights[0]);
close(unmasked.weights.reduce((a,b)=>a+b,0),1);
close(unmasked.output[0],unmasked.weights[0]+2*unmasked.weights[2]);
close(unmasked.output[1],2*unmasked.weights[1]+2*unmasked.weights[2]);
for(const mask of [true,false]) {
  const extreme=attentionExperiment([1000,-1000],mask);
  assert.ok(extreme.weights.every(Number.isFinite));
  close(extreme.weights.reduce((a,b)=>a+b,0),1);
}
const values={q1:1,q2:1,mask:true};
assert.doesNotMatch(attentionOutput(values,'ko',1),/내적과 크기 조절/);
for(const lang of ['ko','en']) {
  const output=attentionOutput({q1:0.4,q2:-0.7,mask:true},lang,2);
  assert.match(output,/q₂ = x₂ WQ/);
  assert.match(output,/1×0\.400/);
  assert.match(output,/s1 = \(0\.400 × 1/);
  assert.match(output,/K = X WK/);
  assert.match(output,/V = X WV/);
}
assert.match(attentionOutput(values,'ko',5),/−∞/);
assert.match(attentionOutput(values,'en',5),/not itself a next-token probability/);
const head=tokenHeadExperiment(masked.output);
close(head.before.probabilities[0],1/(1+Math.exp(.5)));
close(head.before.loss,-Math.log(head.before.probabilities[0]));
close(head.before.probabilities[0]+head.before.probabilities[1],1);
assert.ok(head.after.loss<head.before.loss);
for(const output of [[.5,1],[0,2],[1.2,.4],[-2,3]]) {
  const h=1e-6, actual=tokenHeadExperiment(output);
  const numerical=(tokenHeadExperiment(output,1+h).before.loss-tokenHeadExperiment(output,1-h).before.loss)/(2*h);
  assert.ok(Math.abs(actual.gradient-numerical)<1e-8,'output head gradient matches finite differences');
}
assert.ok(Number.isFinite(tokenHeadExperiment([-1000,1000]).before.loss),'cross-entropy avoids log(0)');
assert.doesNotMatch(attentionOutput(values,'ko',5),/출력 점수를 다음 토큰 확률로/);
assert.match(attentionOutput(values,'ko',6),/출력 점수를 다음 토큰 확률로/);
assert.match(attentionOutput(values,'ko',6),/위치 3의 입력 B를 볼 수 있어 정답이 누출/);
assert.match(attentionOutput(values,'ko',6),/단위행렬이고 정답 A는 따로 지정/);
assert.match(attentionOutput(values,'en',6),/position 3 does not actually contain the target token/);
assert.doesNotMatch(attentionOutput(values,'en',6),/Target token and loss/);
assert.match(attentionOutput(values,'en',7),/Target token and loss/);
assert.match(attentionOutput(values,'en',8),/Update the output weight once/);
console.log('PASS: attention, causal mask, next-token probabilities, cross-entropy and head gradient');

for (const mask of [true,false]) {
  for (const weights of [[1,1],[0.4,-0.7],[-1.8,1.3],[0,0]]) {
    const train=queryTrainingStep(weights,mask);
    for (let i=0;i<2;i++) {
      const h=1e-6, plus=[...weights], minus=[...weights];
      plus[i]+=h; minus[i]-=h;
      const numerical=(queryTrainingStep(plus,mask).head.before.loss-queryTrainingStep(minus,mask).head.before.loss)/(2*h);
      assert.ok(Math.abs(train.queryGradient[i]-numerical)<1e-8,`query ${i}, mask=${mask}: ${train.queryGradient[i]} != ${numerical}`);
    }
    assert.ok(train.afterHead.before.loss <= train.head.before.loss + 1e-12);
    close(train.scoreGradient.reduce((a,b)=>a+b,0),0);
    if(mask) assert.equal(train.scoreGradient[2],0);
  }
}
assert.doesNotMatch(attentionOutput(values,'ko',8),/출력에서 어텐션 가중치로 역전파/);
assert.match(attentionOutput(values,'ko',9),/출력에서 어텐션 가중치로 역전파/);
assert.doesNotMatch(attentionOutput(values,'en',9),/Backpropagate through Softmax to scores/);
assert.match(attentionOutput(values,'en',10),/Backpropagate through Softmax to scores/);
assert.match(attentionOutput(values,'en',11),/Update the query projection weights/);
assert.match(attentionOutput(values,'ko',11),/원래 출력과 β=1로 다시 시작/);
console.log('PASS: query projection backpropagation, finite differences and bilingual step gating');
