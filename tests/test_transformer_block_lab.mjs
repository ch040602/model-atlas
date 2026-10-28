import assert from 'node:assert/strict';
import {transformerBlockExperiment,transformerBlockMarkup,transformerBlockOutput,geluApprox} from '../transformer-block-lab.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
const values={x1:1,x2:0,attention:0.2,activation:'relu'};
const result=transformerBlockExperiment(values);
close(result.ln1.mean,0.5); close(result.ln1.variance,0.25);
close(result.ln1.output[0],0.5/Math.sqrt(0.26));
close(result.residual[0],1.2); close(result.residual[1],-0.2);
close(result.ln2.mean,0.5); close(result.ln2.variance,0.49);
close(result.mlp[0],0.35/Math.sqrt(0.5)); close(result.mlp[1],0);
close(result.output[0],1.2+0.35/Math.sqrt(0.5)); close(result.output[1],-0.2);
// Independent exact-GELU references: x * (1 + erf(x / sqrt(2))) / 2.
for (const [x,exact] of [[-2,-0.045500263896],[-1,-0.158655253931],[0,0],[1,0.841344746069],[2,1.954499736104]]) {
 assert.ok(Math.abs(geluApprox(x)-exact)<0.0005,`GELU approximation at ${x}`);
}
const gelu=transformerBlockExperiment({...values,activation:'gelu'});
assert.ok(Math.abs(gelu.output[0]-1.61516)<1e-5);
assert.ok(Math.abs(gelu.output[1]-(-0.279815))<1e-5);
assert.ok(gelu.hidden[1]<0,'GELU keeps a small negative activation');
const equal=transformerBlockExperiment({x1:1,x2:1,attention:0});
assert.deepEqual(equal.ln1.output,[0,0]); assert.deepEqual(equal.ln2.output,[0,0]);
assert.deepEqual(equal.output,[1,1]);
// Scaling and shifting must apply after standardization, including zero variance.
for (const gamma of [-2,0,0.5,1,2]) for (const beta of [-1,0,1]) {
 const r=transformerBlockExperiment({...values,gamma,beta});
 for (const stat of [r.ln1,r.ln2]) for(let i=0;i<2;i++) close(stat.output[i],gamma*stat.standardized[i]+beta);
 const constant=transformerBlockExperiment({...values,x1:1,x2:1,attention:0,gamma,beta});
 close(constant.ln1.output[0],beta);close(constant.ln1.output[1],beta);
}
for (const lang of ['ko','en']) {
 assert.match(transformerBlockMarkup(values,lang),/data-block-input="attention"/);
 assert.match(transformerBlockMarkup(values,lang),/data-block-activation/);
 assert.match(transformerBlockMarkup(values,lang),/data-block-input="gamma"/);
 assert.match(transformerBlockOutput({...values,gamma:2,beta:1},lang,1),/LN = γ × x̂ \+ β = 2\.000/);
 assert.match(transformerBlockOutput({...values,activation:'gelu'},lang,4),/GELU\(z\).*0\.044715/s);
 assert.match(transformerBlockOutput({...values,activation:'gelu'},lang,4),/\[1\.615, -0\.280\]/);
 assert.doesNotMatch(transformerBlockOutput(values,lang,1),/Attention\(LN₁\(x\)\)/);
 assert.match(transformerBlockOutput(values,lang,2),/Attention\(LN₁\(x\)\)/);
 assert.doesNotMatch(transformerBlockOutput(values,lang,3),/0\.5I × h/);
 assert.match(transformerBlockOutput(values,lang,4),/\[1\.695, -0\.200\]/);
}
console.log('PASS: Transformer layer norm, residual paths, toy MLP, zero variance and bilingual stages');
