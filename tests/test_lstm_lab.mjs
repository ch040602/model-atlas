import assert from 'node:assert/strict';
import { lstmExample, lstmMarkup, lstmOutput } from '../lstm-lab.js';

const values={previous:1,forgetLogit:0,inputLogit:0,outputLogit:0,candidateLogit:0.5};
const result=lstmExample(values);
const close=(actual,expected,tolerance=1e-12)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
close(result.f,0.5); close(result.i,0.5); close(result.o,0.5);
close(result.g,Math.tanh(0.5));
close(result.c,0.5+0.5*Math.tanh(0.5));
close(result.h,0.5*Math.tanh(result.c));
close(result.sensitivity,0.03125);
const epsilon=1e-6;
const finite=(lstmExample({...values,previous:values.previous+epsilon}).c5-lstmExample({...values,previous:values.previous-epsilon}).c5)/(2*epsilon);
close(finite,result.sensitivity,1e-9);
assert.ok(lstmExample({...values,candidateLogit:-1}).g<0);
assert.ok(lstmExample({...values,previous:2,forgetLogit:4,inputLogit:4,candidateLogit:2}).c>1);
assert.match(lstmOutput({...values,forgetLogit:-4},'en',4),/e-9/);
for(const lang of ['ko','en']) {
  assert.match(lstmMarkup(values,lang),/data-lstm-input="forgetLogit"/);
  assert.doesNotMatch(lstmOutput(values,lang,1),/∂c₅/);
  assert.match(lstmOutput(values,lang,4),/∂c₅\/∂c₀/);
}
console.log('PASS: LSTM gates, state, fixed-path derivative and translations');
