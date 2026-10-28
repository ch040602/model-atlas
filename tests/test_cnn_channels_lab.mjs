import assert from 'node:assert/strict';
import { channelExperiment, cnnChannelsMarkup, cnnChannelsOutput } from '../cnn-channels-lab.js';

const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
const defaults={red:0.2,green:0.5,blue:0.8};
const example=channelExperiment(defaults);
assert.deepEqual(example.input,[0.2,0.5,0.8]);
close(example.outputs[0].sum,0.2);
close(example.outputs[1].sum,0.8);
const redOnly=channelExperiment({red:1,green:0,blue:0});
close(redOnly.outputs[0].activation,1.1);
close(redOnly.outputs[1].sum,-0.9);
assert.equal(redOnly.outputs[1].activation,0);
for(const lang of ['ko','en']) {
  assert.match(cnnChannelsMarkup(defaults,lang),/data-channel-input="red"/);
  assert.doesNotMatch(cnnChannelsOutput(defaults,lang,1),/z<sub>A<\/sub>/);
  assert.match(cnnChannelsOutput(defaults,lang,2),/z<sub>A<\/sub>/);
  assert.doesNotMatch(cnnChannelsOutput(defaults,lang,2),/z<sub>B<\/sub>/);
  assert.match(cnnChannelsOutput(defaults,lang,3),/\[0\.20, 0\.80\]/);
  assert.match(cnnChannelsOutput({red:1,green:0,blue:0},lang,3),/max\(0, -0\.90\).*0\.00/);
}
console.log('PASS: multichannel convolution sums, ReLU, stages and both languages');
