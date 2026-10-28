import assert from 'node:assert/strict';
import {poolingExperiment,poolingOutput} from '../pooling-lab.js';
const conv={center:0,strength:1,bias:0};
const values={source:'conv',example:1.5,gradient:1};
let r=poolingExperiment(conv,values);
assert.deepEqual(r.map,[0,2,0,2]);
assert.equal(r.ties,2);
assert.equal(r.winner,1);
assert.deepEqual(r.gradient,[0,1,0,0]);
r=poolingExperiment({...conv,center:1},values);
assert.deepEqual(r.map,[1,1,1,1]);
assert.equal(r.ties,4);
assert.equal(r.winner,0);
r=poolingExperiment(conv,{...values,source:'example',example:0.5,gradient:-0.7});
assert.deepEqual(r.gradient,[0,0,-0.7,0]);
assert.equal(r.max,1);
// Compare the selected input's analytical gradient to a central difference away from ties.
for (const example of [0.5, 1.5]) {
  const base={...values,source:'example',example,gradient:-0.7}, eps=1e-5;
  const plus=poolingExperiment(conv,{...base,example:example+eps}).max;
  const minus=poolingExperiment(conv,{...base,example:example-eps}).max;
  const numerical=base.gradient*(plus-minus)/(2*eps);
  assert.ok(Math.abs(numerical-poolingExperiment(conv,base).gradient[0])<1e-9);
}
r=poolingExperiment(conv,{...values,source:'example',example:1});
assert.equal(r.ties,2);
assert.equal(r.winner,0);
for(const lang of ['ko','en']) {
  assert.doesNotMatch(poolingOutput(conv,values,lang,1),/∂L\/∂A/);
  assert.match(poolingOutput(conv,values,lang,3),/∂L\/∂A/);
}
console.log('PASS: pooling map, unique and tied maxima, negative gradient and stages');
