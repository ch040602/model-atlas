import assert from 'node:assert/strict';
import {sequenceExperiment, sequenceLabOutput} from '../sequence-lab.js';
import {rnnGradientFlow,rnnGradientOutput} from '../rnn-gradient-lab.js';

const cases = [
  {inputs:[1,0,0], weight:0.5, target:0.8},
  {inputs:[0.5,-0.7,0.2], weight:-1.2, target:-0.6},
  {inputs:[-1,1,1], weight:2, target:1},
  {inputs:[0,0,0], weight:0, target:0}
];
for (const {inputs,weight,target} of cases) {
  const result=sequenceExperiment(inputs,weight,target);
  const epsilon=1e-6;
  const numerical=(sequenceExperiment(inputs,weight+epsilon,target).loss-sequenceExperiment(inputs,weight-epsilon,target).loss)/(2*epsilon);
  assert.ok(Math.abs(result.gradient-numerical)<1e-7,`gradient mismatch: ${result.gradient} vs ${numerical}`);
  for (let t=0;t<inputs.length;t++) {
    const perturbedLoss=offset=>{
      let h=0;
      inputs.forEach((x,i)=>{h=Math.tanh(x+weight*h+(i===t?offset:0));});
      return (h-target)**2;
    };
    const delta=(perturbedLoss(epsilon)-perturbedLoss(-epsilon))/(2*epsilon);
    assert.ok(Math.abs(result.deltas[t]-delta)<1e-7,`time ${t+1} pre-activation gradient mismatch`);
  }
  assert.equal(Math.abs(result.contributions[0]),0,'initial state gives no direct recurrent-weight gradient');
  assert.ok(Math.abs(result.updatedWeight-(weight-0.1*result.gradient))<1e-12);
  assert.ok(Math.abs(result.updatedLoss-(result.updatedStates.at(-1)-target)**2)<1e-12);
  const all=sequenceExperiment(inputs,weight,target,0.1,true);
  const allNumerical=(sequenceExperiment(inputs,weight+epsilon,target,0.1,true).loss-sequenceExperiment(inputs,weight-epsilon,target,0.1,true).loss)/(2*epsilon);
  assert.ok(Math.abs(all.gradient-allNumerical)<1e-7,`all-step gradient mismatch: ${all.gradient} vs ${allNumerical}`);
  const directLoss=states=>states.slice(1).reduce((sum,h)=>sum+(h-target)**2,0);
  assert.ok(Math.abs(all.loss-directLoss(all.states))<1e-12);
  assert.ok(Math.abs(all.updatedLoss-directLoss(all.updatedStates))<1e-12);
  for (let t=0;t<inputs.length;t++) {
    const perturbedLoss=offset=>{
      let h=0, loss=0;
      inputs.forEach((x,i)=>{h=Math.tanh(x+weight*h+(i===t?offset:0));loss+=(h-target)**2;});
      return loss;
    };
    const delta=(perturbedLoss(epsilon)-perturbedLoss(-epsilon))/(2*epsilon);
    assert.ok(Math.abs(all.deltas[t]-delta)<1e-7,`all-step time ${t+1} gradient mismatch`);
  }
}
const values={x1:1,x2:0,x3:0,weight:0.5,target:0.8};
assert.match(sequenceLabOutput(values,'ko',1),/순전파/);
assert.doesNotMatch(sequenceLabOutput(values,'ko',1),/시간 역전파/);
assert.match(sequenceLabOutput(values,'ko',5),/시간 역전파 · t=3/);
assert.doesNotMatch(sequenceLabOutput(values,'ko',5),/시간 역전파 · t=2/);
assert.match(sequenceLabOutput(values,'ko',6),/시간 역전파 · t=2/);
assert.doesNotMatch(sequenceLabOutput(values,'ko',6),/시간 역전파 · t=1/);
assert.match(sequenceLabOutput(values,'en',7),/Backpropagation through time · t=1/);
assert.doesNotMatch(sequenceLabOutput(values,'en',7),/After one weight update/);
assert.match(sequenceLabOutput(values,'en',8),/After one weight update/);
for (const lang of ['ko','en']) {
  const output=sequenceLabOutput({...values,allSteps:true},lang,8);
  assert.match(output,/L = Σₜ₌₁³/);
  assert.match(output,/δ2 = \[2\(h2 − y\) \+ δ3Wₕ\]/);
  assert.match(output,/L_new = Σₜ₌₁³/);
  assert.match(output,lang==='ko'?/같은 y와 비교/:/same y/);
}
console.log('PASS: RNN forward pass, shared-weight gradients, update and bilingual step reveal');

for(const [initial,weight,steps] of [[0.1,0.8,10],[0.2,-1.2,6],[0,2,8],[-0.5,1.5,7]]) {
  const result=rnnGradientFlow(initial,weight,steps);
  const epsilon=1e-6;
  const numerical=(rnnGradientFlow(initial+epsilon,weight,steps).at(-1).state-rnnGradientFlow(initial-epsilon,weight,steps).at(-1).state)/(2*epsilon);
  assert.ok(Math.abs(result.at(-1).sensitivity-numerical)<1e-5,`initial-state sensitivity mismatch: ${result.at(-1).sensitivity} vs ${numerical}`);
  assert.equal(result.length,steps+1);
}
assert.equal(rnnGradientFlow(0,2,20).at(-1).sensitivity,2**20);
assert.equal(rnnGradientFlow(0,0,20).at(-1).sensitivity,0);
assert.ok(rnnGradientFlow(0,0.5,20).at(-1).sensitivity<1e-5);
for(const lang of ['ko','en']) {
  const initial=rnnGradientOutput({initial:0,weight:2},lang,0);
  assert.match(initial,/∂h₀\/∂h₀ = 1/);
  assert.equal((initial.match(/<tr>/g)||[]).length,2);
  const many=rnnGradientOutput({initial:0,weight:2},lang,20);
  assert.match(many,/1\.049e\+6/);
  assert.match(many,lang==='ko'?/전체 손실 기울기와는 다릅니다/:/not the complete loss gradient/);
  assert.equal((many.match(/<tr>/g)||[]).length,22);
}
console.log('PASS: scalar RNN state sensitivities, finite differences, vanishing and amplification');
