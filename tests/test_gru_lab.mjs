import assert from 'node:assert/strict';
import {gruExample,gruMarkup,gruOutput} from '../gru-lab.js';
const v={previous:.6,resetLogit:0,updateLogit:0,inputTerm:.2,recurrentTerm:.8};
const result=gruExample(v);
assert.equal(result.r,.5);assert.equal(result.z,.5);
assert.ok(Math.abs(result.candidate-Math.tanh(.6))<1e-12);
assert.ok(Math.abs(result.next-(Math.tanh(.6)+.6)/2)<1e-12);
assert.ok(gruExample({...v,updateLogit:4}).next>result.next);
assert.ok(gruExample({...v,resetLogit:4}).candidate>result.candidate);
assert.equal(gruExample({...v,recurrentTerm:0,resetLogit:-4}).candidate,gruExample({...v,recurrentTerm:0,resetLogit:4}).candidate);
for(const lang of ['ko','en']){
 assert.match(gruMarkup(v,lang),/data-gru-input="resetLogit"/);
 assert.doesNotMatch(gruOutput(v,lang,1),/hₜ = \(1/);
 assert.match(gruOutput(v,lang,3),/0\.569/);
}
console.log('PASS: scalar GRU gates, candidate, update and bilingual stages');
