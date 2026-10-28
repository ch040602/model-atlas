import assert from 'node:assert/strict';
import {sequenceAllWeights} from '../sequence-lab.js';
function independent(xs,wx,wh,b,y,all) {
  let h=0, loss=0;
  for(const x of xs){h=Math.tanh(wx*x+wh*h+b);if(all)loss+=(h-y)**2;}
  return all?loss:(h-y)**2;
}
let cases=0;
for(const all of [false,true]) for(const x1 of [-1,0,0.7]) for(const x2 of [-0.8,0,1]) for(const x3 of [-1,0.3,1]) for(const wh of [-1.5,0,0.8]) for(const y of [-0.8,0.6]) {
  const xs=[x1,x2,x3],rate=0.2,r=sequenceAllWeights(xs,wh,y,rate,all), eps=1e-6;
  const numerical=(v,index)=>{const p=[1,wh,0];p[index]+=v;return independent(xs,...p,y,all)};
  for(const [i,actual] of [r.inputGradient,r.gradient,r.biasGradient].entries()) {
    const grad=(numerical(eps,i)-numerical(-eps,i))/(2*eps);
    assert.ok(Math.abs(grad-actual)<1e-8,`gradient ${i} ${JSON.stringify({xs,wh,y,all,grad,actual})}`);
  }
  assert.ok(Math.abs(r.loss-independent(xs,1,wh,0,y,all))<1e-12);
  assert.ok(Math.abs(r.updatedLoss-independent(xs,r.nextInputWeight,r.nextWeight,r.nextBias,y,all))<1e-12);
  const zero=sequenceAllWeights(xs,wh,y,0,all);
  assert.equal(zero.nextInputWeight,1);assert.equal(zero.nextWeight,wh);assert.ok(zero.nextBias===0);
  assert.ok(Math.abs(zero.updatedLoss-zero.loss)<1e-12);
  cases++;
}
console.log(`PASS: ${cases} cases, independent finite-difference gradients for all shared parameters, simultaneous update and loss modes`);

