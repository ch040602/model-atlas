import assert from 'node:assert/strict';
import {ganModesExperiment,ganModesOutput} from '../gan-modes-lab.js';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
const balanced=ganModesExperiment(0.5,0.9);
close(balanced.js,0);
close(balanced.loss,0.10536051565782628);
const collapsed=ganModesExperiment(0,0.9);
close(collapsed.js,0.31127812445913283);
close(collapsed.loss,balanced.loss);
assert.deepEqual(collapsed.generated,[0,1]);
close(ganModesExperiment(1,0.9).js,collapsed.js);
close(ganModesExperiment(0,0.5).loss,Math.log(2));
for(let i=0;i<=20;i++) {
  const q=i/20, a=ganModesExperiment(q,0.9), b=ganModesExperiment(1-q,0.9);
  assert.ok(Number.isFinite(a.js) && a.js>=-1e-14 && a.js<=1);
  close(a.js,b.js);
}
for(const bad of [[-0.1,0.5],[1.1,0.5],[0.5,0],[0.5,1],[NaN,0.5]]) assert.throws(()=>ganModesExperiment(...bad),RangeError);
for(const lang of ['ko','en']) {
  const first=ganModesOutput({q:0,score:0.9},lang,1);
  assert.doesNotMatch(first,/JS\(P,Q\)/);
  const final=ganModesOutput({q:0,score:0.9},lang,3);
  assert.match(final,/0\.311/);
  assert.match(final,/0\.105/);
}
console.log('PASS: exact two-mode JS, endpoint behavior, symmetry and independent loss');
