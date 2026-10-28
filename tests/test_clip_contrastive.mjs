import assert from 'node:assert/strict';
import {clipContrastive,clipOutput} from '../clip-contrastive-lab.js';

const close=(actual,expected,tol=1e-10)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
const ideal=clipContrastive(0,2), expected=1/(1+Math.exp(-2));
for(const p of [ideal.p11,ideal.p22,ideal.q11,ideal.q22]) close(p,expected);
close(ideal.loss,-Math.log(expected));
for(let c=-1.5;c<=1.50001;c+=0.1) for(let scale=0.5;scale<=4;scale+=0.5) {
  const result=clipContrastive(c,scale), h=1e-6;
  const z=[[scale,scale*c/Math.hypot(c,1)],[0,scale/Math.hypot(c,1)]];
  const row=i=>Math.exp(z[i][i])/(Math.exp(z[i][0])+Math.exp(z[i][1]));
  const col=i=>Math.exp(z[i][i])/(Math.exp(z[0][i])+Math.exp(z[1][i]));
  close(result.loss,-(Math.log(row(0))+Math.log(row(1))+Math.log(col(0))+Math.log(col(1)))/4);
  const numerical=(clipContrastive(c+h,scale).loss-clipContrastive(c-h,scale).loss)/(2*h);
  close(result.gradient,numerical,1e-8);
  assert.ok(clipContrastive(c-0.3*result.gradient,scale).loss<=result.loss+1e-12);
}
assert.doesNotMatch(clipOutput({component:0,scale:2},'ko',1),/Lᵢ/);
assert.match(clipOutput({component:0,scale:2},'ko',5),/L = \(Lᵢ \+ Lₜ\) \/ 2 = 0\.127/);
assert.match(clipOutput({component:0,scale:2},'en',5),/token-level hidden states/);
console.log('PASS: CLIP symmetric loss, finite-difference gradients, updates, and translations');
