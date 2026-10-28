import assert from 'node:assert/strict';
import {trainingStep, trainingLabOutput} from '../training-lab.js';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
let step=trainingStep(1,1,0.5,0.1);
close(step.prediction,0.5); close(step.loss,0.25); close(step.gradient,-1);
close(step.nextWeight,0.6); close(step.nextPrediction,0.6); close(step.nextLoss,0.16);
step=trainingStep(1,1,step.nextWeight,0.1);
close(step.nextWeight,0.68); close(step.nextLoss,0.1024);
assert.ok(trainingStep(1,1,0.5,1.5).nextLoss>0.25);
close(trainingStep(0,1,0.5,0.1).gradient,0);
for (const [x,y,w] of [[2,-1,0.7],[-1.2,0.5,-0.8],[0,1,1]]) {
  const h=1e-6, loss=weight=>(weight*x-y)**2;
  assert.ok(Math.abs(trainingStep(x,y,w,0.1).gradient-(loss(w+h)-loss(w-h))/(2*h))<1e-8);
}
const values={x:1,y:1,initialWeight:0.5,rate:1.5,evalX:2,evalY:0.5};
assert.match(trainingLabOutput(values,0.5,[{weight:0.5,loss:0.25}],'ko'),/손실이 증가/);
assert.match(trainingLabOutput(values,0.5,[{weight:0.5,loss:0.25}],'en'),/increases the loss/);
const example={...values,rate:0.1};
for(const lang of ['ko','en']) {
  const output=trainingLabOutput(example,0.5,[{weight:0.5,loss:0.25}],lang);
  assert.match(output,/Lᵥ = \(1\.000 − 0\.500\)² = 0\.250/);
  assert.match(output,/Lᵥ,new = \(0\.600 × 2\.000 − 0\.500\)² = 0\.490/);
  assert.match(output,lang==='ko'?/학습 손실은 줄었지만 평가 손실은 늘었습니다/:/reduces training loss but increases evaluation loss/);
  const forward=trainingLabOutput(example,0.5,[{weight:0.5,loss:0.25}],lang,1);
  assert.match(forward,/ŷ = w × x/);
  assert.doesNotMatch(forward,/∂L\/∂ŷ/);
  const backward=trainingLabOutput(example,0.5,[{weight:0.5,loss:0.25}],lang,2);
  assert.match(backward,/∂L\/∂ŷ = 2\(ŷ − y\).* = -1\.000/);
  assert.match(backward,/∂ŷ\/∂w = x = 1\.000/);
  assert.doesNotMatch(backward,/w_new =/);
  const preview=trainingLabOutput(example,0.5,[{weight:0.5,loss:0.25}],lang,3);
  assert.match(preview,/w_new = 0\.500 − 0\.100 × -1\.000 = 0\.600/);
  assert.doesNotMatch(preview,/Lᵥ,new/);
  assert.match(trainingLabOutput(example,0.5,[{weight:0.5,loss:0.25}],lang,4),/Lᵥ,new/);
}
console.log('PASS: scalar gradient, updates, increased loss and zero-input behavior');
