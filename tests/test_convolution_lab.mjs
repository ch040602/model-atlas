import assert from 'node:assert/strict';
import {convolutionExperiment, convolutionTraining, convolutionClassification, convolutionOutput} from '../convolution-lab.js';

const result=convolutionExperiment(0,1,0);
assert.deepEqual(result.positions.map(p=>p.sum),[0,2,0,2]);
assert.deepEqual(result.positions.map(p=>p.activation),[0,2,0,2]);
assert.deepEqual(convolutionExperiment(1,1,0).positions.map(p=>p.sum),[1,1,1,1]);
assert.deepEqual(convolutionExperiment(-1,1,-0.5).positions.map(p=>p.activation),[0,2.5,0,2.5]);
const values={center:0,strength:1,bias:0};
assert.equal((convolutionOutput(values,'ko',1).match(/아직 계산하지 않음/g)||[]).length,3);
assert.match(convolutionOutput(values,'ko',4),/네 위치의 계산을 모두/);
assert.match(convolutionOutput(values,'en',4),/All four positions/);
const training=convolutionTraining(0,1,0);
assert.equal(training.loss,.5);
assert.equal(training.gradient,2);
assert.equal(training.nextStrength,.8);
assert.ok(Math.abs(training.nextLoss-.18)<1e-12);
assert.deepEqual(training.contributions.map(c=>c.gradient),[0,1,0,1]);
for (const [center,strength,bias] of [[.3,.8,.2],[-.4,.7,-.2],[.9,.4,.3]]) {
  const h=1e-6;
  const actual=convolutionTraining(center,strength,bias);
  const numeric=(convolutionTraining(center,strength+h,bias).loss-convolutionTraining(center,strength-h,bias).loss)/(2*h);
  assert.ok(Math.abs(actual.gradient-numeric)<1e-8,'shared-strength gradient matches finite differences');
}
assert.equal(convolutionTraining(0,0,0).gradient,0,'ReLU derivative at zero is chosen as zero');
const largeUpdate=convolutionTraining(-1,.2,0,2);
assert.ok(largeUpdate.nextLoss>largeUpdate.loss,'large update can increase loss');
assert.match(convolutionOutput(values,'ko',5),/목표 특징 맵과 손실/);
assert.doesNotMatch(convolutionOutput(values,'ko',5),/공유 필터의 기울기와 갱신/);
assert.match(convolutionOutput(values,'ko',6),/L_new = 0\.18/);
assert.match(convolutionOutput(values,'en',6),/Shared filter gradient and update/);
console.log('PASS: CNN forward positions, shared gradient, update, finite differences and bilingual steps');

const classification = convolutionClassification(0,1,0);
assert.equal(classification.before.pooled,1);
assert.ok(Math.abs(classification.before.probabilities[0] - 0.7310585786)<1e-9);
assert.ok(Math.abs(classification.before.loss - 0.3132616875)<1e-9);
assert.ok(Math.abs(classification.gradient + 0.2689414214)<1e-9);
assert.ok(classification.after.loss < classification.before.loss);
for (const [center,strength,bias] of [[0.2,1,0.3],[-0.4,0.8,-0.2],[0.7,1.4,0.1]]) {
  const h=1e-6, actual=convolutionClassification(center,strength,bias);
  const numeric=(convolutionClassification(center,strength+h,bias).before.loss-convolutionClassification(center,strength-h,bias).before.loss)/(2*h);
  assert.ok(Math.abs(actual.gradient-numeric)<1e-8, `class gradient ${actual.gradient} vs ${numeric}`);
}
assert.equal(convolutionClassification(0,0,0).gradient,0,'classification chooses zero ReLU derivative at zero');
assert.doesNotMatch(convolutionOutput(values,'ko',6),/별도 예제: 특징 맵/);
assert.match(convolutionOutput(values,'ko',7),/별도 예제: 특징 맵/);
assert.doesNotMatch(convolutionOutput(values,'ko',7),/분류 점수와 확률/);
assert.match(convolutionOutput(values,'ko',10),/분류 손실을 필터까지 역전파/);
assert.match(convolutionOutput(values,'en',10),/Backpropagate class loss to the filter/);
assert.match(convolutionOutput(values,'en',10),/L_new = 0\.306/);
