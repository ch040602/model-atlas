import assert from 'node:assert/strict';
import { samplingExample,samplingOutput } from '../sampling-lab.js';
const v={temperature:1,mode:'top-k',k:2,p:0.8,draw:0.5};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
let r=samplingExample(v);
assert.equal(r.count,2); close(r.rows[0].final,Math.E/(Math.E+1));
close(r.rows.reduce((a,x)=>a+x.final,0),1);
assert.equal(r.selected.index,0); assert.equal(r.rows[2].final,0);
r=samplingExample({...v,mode:'top-p',p:0.9,draw:0.95});
assert.equal(r.count,3); assert.equal(r.selected.index,2);
close(r.rows.reduce((a,x)=>a+x.final,0),1);
r=samplingExample({...v,mode:'top-p',p:0.5,draw:0.5},[0,0,0,0]);
assert.equal(r.count,2); assert.equal(r.selected.index,1); // threshold and sampling boundaries
assert.equal(samplingExample({...v,mode:'top-p',p:1}).count,4);
assert.ok(samplingExample({...v,temperature:0.2}).rows[0].probability>samplingExample({...v,temperature:2}).rows[0].probability);
for(const lang of ['ko','en']) {
 assert.doesNotMatch(samplingOutput(v,lang,1),/Σ exp/);
 assert.match(samplingOutput(v,lang,4),/0\.731/);
}
console.log('PASS: temperature, top-k, top-p, boundary selection and renormalization');
