import assert from 'node:assert/strict';
import {batchEpoch, batchLabOutput} from '../minibatch-lab.js';

const samples=[{x:1,y:1},{x:2,y:1},{x:-1,y:-1}];
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
const size2=batchEpoch(samples,0.5,0.1,2);
assert.equal(size2.batches.length,2);
close(size2.batches[0].meanGradient,-0.5);
close(size2.batches[0].endWeight,0.55);
assert.equal(size2.batches[1].examples.length,1);
close(size2.batches[1].meanGradient,-0.9);
close(size2.finalWeight,0.64);
close(size2.lossAfter,(0.36**2+0.28**2+0.36**2)/3);
close(batchEpoch(samples,0.5,0.1,1).finalWeight,0.616);
close(batchEpoch(samples,0.5,0.1,3).finalWeight,0.5+0.1*2/3);
assert.throws(()=>batchEpoch(samples,0,0.1,0),RangeError);
assert.throws(()=>batchEpoch(samples,0,0.1,4),RangeError);
for(const size of [1,2,3]) for(const initial of [-1,0,0.5,1.5]) for(const rate of [0,0.1,0.7]) {
  const result=batchEpoch(samples,initial,rate,size);
  let expectedWeight=initial;
  for(const batch of result.batches) {
    close(batch.startWeight,expectedWeight);
    const loss=w=>batch.examples.reduce((sum,e)=>sum+(w*e.x-e.y)**2,0)/batch.examples.length;
    const h=1e-6;
    close(batch.meanGradient,(loss(batch.startWeight+h)-loss(batch.startWeight-h))/(2*h));
    expectedWeight=batch.endWeight;
  }
  close(result.lossBefore,samples.reduce((sum,e)=>sum+(initial*e.x-e.y)**2,0)/3);
  close(result.lossAfter,samples.reduce((sum,e)=>sum+(result.finalWeight*e.x-e.y)**2,0)/3);
}
const values={batchSize:2,initialWeight:0.5,rate:0.1,target2:1};
for(const lang of ['ko','en']) {
  const output=batchLabOutput(values,lang,4,1);
  assert.match(output,/\(-0\.900\) \/ 1 = -0\.900/);
  assert.match(output,/0\.640/);
  assert.match(output,/0\.113/);
}
console.log('PASS: batch sizes, partial batches, finite-difference gradients and full-dataset loss');
