import assert from 'node:assert/strict';
import {diffusionExperiment,diffusionOutput,diffusionTrainingStep,diffusionSecondStep} from '../diffusion-lab.js';
import {crossAttention,crossAttentionOutput} from '../diffusion-cross-attention.js';
import {conditioningExample,conditioningOutput} from '../diffusion-conditioning-lab.js';
import {latentExample,latentOutput} from '../diffusion-latent-lab.js';

const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`);
const latent=latentExample(512,1,-1);
assert.equal(latent.latentSize,64);
assert.equal(latent.pixels,786432);
assert.equal(latent.latents,16384);
close(latent.clean,0.18215);
close(latent.noisy,0.091075-Math.sqrt(0.75));
close(latent.estimate,0.18215);
close(latent.decoderInput,1);
for(const size of [256,512,768]) for(const encoded of [-2,0,1.2]) for(const noise of [-2,0,2]) {
  const result=latentExample(size,encoded,noise);
  assert.equal(result.pixels/result.latents,48);
  close(result.estimate,encoded*0.18215);
  close(result.decoderInput,encoded);
}
const latentValues={size:512,encoded:1,noise:-1};
assert.doesNotMatch(latentOutput(latentValues,'ko',1),/노이즈 예측으로 깨끗한/);
assert.match(latentOutput(latentValues,'ko',5),/디코더의 픽셀 출력은 계산하지 않습니다/);
assert.match(latentOutput(latentValues,'en',5),/not the decoder’s pixel output/);
const dropped=conditioningExample(0.2,0.1,2);
assert.equal(dropped.condition,0);
close(dropped.prediction,0.25);
close(dropped.loss,0.5625);
close(dropped.gradA,-1.5);
close(dropped.gradB,0);
close(dropped.nextA,0.4);
close(dropped.nextB,0.5);
close(dropped.guided,1.4);
const kept=conditioningExample(0.2,0.2,1);
assert.equal(kept.condition,1,'u equal to p keeps the condition');
close(kept.gradA,-0.5);
close(kept.gradB,-0.5);
close(kept.nextA,0.3);
close(kept.nextB,0.55);
close(kept.guided,kept.conditioned);
close(conditioningExample(0,0,0).guided,conditioningExample(0,0,0).empty);
assert.equal(conditioningExample(0,0,1).condition,1);
assert.equal(conditioningExample(1,0.95,1).condition,0);
for(const sample of [dropped,kept]) {
  const loss=(a,b)=>(a*sample.x+b*sample.condition-sample.target)**2, h=1e-6;
  assert.ok(Math.abs(sample.gradA-(loss(sample.a+h,sample.b)-loss(sample.a-h,sample.b))/(2*h))<1e-8);
  assert.ok(Math.abs(sample.gradB-(loss(sample.a,sample.b+h)-loss(sample.a,sample.b-h))/(2*h))<1e-8);
}
assert.doesNotMatch(conditioningOutput({p:0.2,draw:0.1,scale:2},'ko',1),/가중치의 기울기/);
assert.match(conditioningOutput({p:0.2,draw:0.1,scale:2},'ko',4),/0\.400 \+ 2\.000 × \(0\.900 − 0\.400\) = 1\.400/);
assert.match(conditioningOutput({p:0.2,draw:0.2,scale:1},'en',4),/condition kept/);
const balanced=crossAttention(1);
close(balanced.weights[0],0.5);
close(balanced.weights[1],0.5);
close(balanced.output[0],0.5);
close(balanced.output[1],1);
for(const q of [-2,0,1,2]) {
  const result=crossAttention(q);
  close(result.weights[0]+result.weights[1],1);
  close(result.weights[0]/result.weights[1],Math.exp((q-1)/Math.sqrt(2)));
  close(result.output[0],result.weights[0]);
  close(result.output[1],2*result.weights[1]);
}
assert.ok(crossAttention(2).weights[0]>balanced.weights[0]);
assert.doesNotMatch(crossAttentionOutput(1,'ko',1),/텍스트 값의 가중합/);
assert.match(crossAttentionOutput(1,'ko',3),/\[0\.500, 1\.000\]/);
assert.match(crossAttentionOutput(1,'en',3),/neither the noise prediction nor the final image/);
const example=diffusionExperiment(1,-1,-0.8);
close(example.noisy,0.5-Math.sqrt(0.75));
close(example.loss,0.04);
close(example.estimatedClean,1-0.4*Math.sqrt(0.75));
close(example.previous,0.9*example.estimatedClean-0.8*Math.sqrt(0.19));
for(const [clean,noise] of [[1,-1],[-2,0.5],[0,0],[0.7,1.9]]) {
  const perfect=diffusionExperiment(clean,noise,noise);
  close(perfect.loss,0);
  close(perfect.estimatedClean,clean);
  close(perfect.previous,0.9*clean+Math.sqrt(0.19)*noise);
  const second=diffusionSecondStep(perfect.previous,noise);
  close(second.estimatedClean,clean);
  close(second.next,Math.sqrt(.96)*clean+Math.sqrt(.04)*noise);
}
close(diffusionSecondStep(.9,0).estimatedClean,1);
close(diffusionSecondStep(.9,0).next,Math.sqrt(.96));
assert.notEqual(diffusionSecondStep(.9,0).next,diffusionSecondStep(.9,1).next);
const uncond=0.4, cond=0.1;
close(diffusionExperiment(1,-1,cond,uncond,0).guided,uncond);
close(diffusionExperiment(1,-1,cond,uncond,1).guided,cond);
const guided=diffusionExperiment(1,-1,cond,uncond,2);
close(guided.guided,-0.2);
close(guided.loss,diffusionExperiment(1,-1,cond,uncond,0).loss);
close(guided.estimatedClean,(guided.noisy-Math.sqrt(.75)*guided.guided)/.5);
close(guided.previous,.9*guided.estimatedClean+Math.sqrt(.19)*guided.guided);
for(const [noisy,noise,prediction] of [[example.noisy,-1,-0.8],[0,1,-1],[2,-1,1],[-1,0.5,0.5]]) {
  const step=diffusionTrainingStep(noisy,noise,prediction), h=1e-6;
  const loss=w=>(noise-(prediction+w*noisy))**2;
  assert.ok(Math.abs(step.gradient-(loss(h)-loss(-h))/(2*h))<1e-8,'gradient matches finite differences');
  close(step.nextLoss,loss(step.nextWeight));
  assert.ok(step.nextLoss<=loss(0)+1e-12);
}
close(diffusionTrainingStep(0,1,-1).gradient,0);
close(diffusionTrainingStep(0,1,-1).nextLoss,4);
const v={clean:1,noise:-1,prediction:-0.8,unconditional:-0.2,guidance:2};
assert.doesNotMatch(diffusionOutput(v,'ko',1),/학습 때 예측 오차/);
assert.doesNotMatch(diffusionOutput(v,'ko',2),/예측 가중치 한 번 갱신/);
assert.match(diffusionOutput(v,'ko',3),/예측 가중치 한 번 갱신/);
assert.match(diffusionOutput(v,'ko',3),/w_new = 0 − 0\.100 × -0\.146 = 0\.015/);
assert.doesNotMatch(diffusionOutput(v,'ko',3),/생성 때 조건의 영향 조절/);
assert.match(diffusionOutput(v,'ko',4),/생성 때 조건의 영향 조절/);
assert.match(diffusionOutput(v,'en',3),/Update a prediction weight once/);
assert.match(diffusionOutput(v,'ko',6),/실제 노이즈를 모르므로/);
assert.match(diffusionOutput(v,'en',6),/actual noise is unknown/);
assert.match(diffusionOutput(v,'en',6),/next model input, not the final image/);
assert.doesNotMatch(diffusionOutput(v,'ko',6),/새 예측으로 한 단계 더/);
assert.match(diffusionOutput(v,'ko',7),/새 예측으로 한 단계 더/);
assert.match(diffusionOutput(v,'en',7),/Take another step with a new prediction/);
assert.match(diffusionOutput(v,'en',7),/you supply that combined result/);
console.log('PASS: forward corruption, training weight gradient, guidance, two DDIM steps and bilingual explanations');
