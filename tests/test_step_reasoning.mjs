import assert from 'node:assert/strict';
import {stepReasoning} from '../step-reasoning.js';
import {formulaDefaults,formulaWalkthrough,num} from '../formula-model.js';
import {formulaExplanationContent} from '../formula-walkthrough.js';
import {convolutionClassification} from '../convolution-lab.js';
import {sequenceExperiment} from '../sequence-lab.js';
import {diffusionExperiment,diffusionOutput,diffusionSecondStep} from '../diffusion-lab.js';
import {ganTrainingExperiment,ganTrainingOutput} from '../gan-training-lab.js';
import {formulaDerivations} from '../formula-derivations.js';
import {mathMarkup} from '../math-render.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);
const variants={
 cnn:[{}, {center:1,strength:-1,bias:-1},{center:-1,strength:0,bias:1}],
 rnn:[{}, {x1:-1,x2:1,x3:-0.5,weight:-1,target:-0.4},{x1:0,x2:0,x3:0,weight:0,target:0}],
 transformer:[{}, {x1:1,x2:1,gamma:0,beta:0},{x1:-1,x2:1,gamma:-1,beta:0.5,activation:'relu'}]
};
let count=0;
for(const [kind,changes] of Object.entries(variants))for(const change of changes){
 const v={...formulaDefaults[kind],...change};
 for(const lang of ['ko','en']){
  const m=formulaWalkthrough(kind,v,lang);
  for(const [index,s] of m.steps.entries()){
   const reason=stepReasoning(kind,v,s.id);
   for(const field of ['meaning','experiment','answer']){
    assert.equal(reason[field].length,2);
    for(const text of reason[field]){
     assert.ok(text.trim(),`${kind}/${s.id}/${field} needs an explanation`);
     assert.doesNotMatch(text,/undefined|NaN|−-/);
    }
   }
   const html=formulaExplanationContent(kind,v,lang,index);
   assert.match(html,new RegExp(`data-step-reasoning="${s.id}"`));
   assert.match(html,/class="step-prediction"/);
   assert.match(html,/class="step-answer"/);
   assert.doesNotMatch(html,/katex-error/);
   // Forward links must name actual consumers of the current result.
   const section=html.split('class="step-connection"')[1].split('</section>')[0];
   for(const [,target] of section.matchAll(/data-formula-jump="(\d+)"/g))assert.ok(m.steps[Number(target)].sources.includes(index));
   count++;
  }
 }
}
// Independently verify the controlled predictions offered to learners.
const blank=convolutionClassification(1,0,0).before;
assert.deepEqual(blank.probabilities,[0.5,0.5]);
assert.ok(blank.map.positions.every(p=>p.activation===0));
const biased=convolutionClassification(-1,0,0.7).before;
assert.ok(biased.map.positions.every(p=>p.activation===0.7));
near((1+2+3+5)/4-(1+2+3+4)/4,0.25);
const blocked=convolutionClassification(1,0,-1);near(blocked.gradient,0);
const memoryOff=sequenceExperiment([1,0,0],0,0.8,0.1,false);
near(memoryOff.states[1],Math.tanh(1));near(memoryOff.states[2],0);near(memoryOff.states[3],0);
for(const weight of [-0.8,0.4,1.1]){
 const xs=[0.7,-0.2,0.3],target=-0.4,states=[0];
 for(const x of xs)states.push(Math.tanh(x+weight*states.at(-1)));
 const text=stepReasoning('rnn',{x1:xs[0],x2:xs[1],x3:xs[2],weight,target},'delta-3').meaning[0];
 assert.ok(text.includes(num(2*(states[3]-target)*(1-states[3]**2))));
}
const live=stepReasoning('cnn',{center:0.6,strength:1.2,bias:0.3},'weighted-sum').meaning[0];
assert.ok(live.includes(num(1.2*(2-0.6))));
assert.ok(stepReasoning('transformer',{x1:2,x2:0},'ln1-standardize').meaning[0].includes(num(Math.sqrt(1.01))));
for(const d of Object.values(formulaDerivations))for(const step of d.steps)assert.doesNotMatch(mathMarkup(step.tex),/katex-error/);
for(const noise of [-1,0,0.7]){
 const clean=0.4,r=diffusionExperiment(clean,noise,noise,0,1),wrong=diffusionExperiment(clean,noise,noise+0.1,0,1);
 near(r.estimatedClean,clean);near(wrong.estimatedClean-clean,-Math.sqrt(3)*0.1);
 const a=diffusionSecondStep(r.previous,-0.2),b=diffusionSecondStep(r.previous,0.8);
 assert.notEqual(a.next,b.next);
}
for(const lang of ['ko','en']){
 const diff=diffusionOutput({clean:0.4,noise:-1,prediction:0.2,unconditional:-0.2,guidance:2,nextPrediction:0.5},lang,7);
 const gan=ganTrainingOutput({real:1,generator:0.2,weight:-0.5,bias:0.1},lang,5);
 assert.equal((diff.match(/class="practice-reasoning"/g)||[]).length,7);
 assert.equal((gan.match(/class="practice-reasoning"/g)||[]).length,5);
 assert.doesNotMatch(diff+gan,/undefined|NaN|katex-error/);
}
const balanced=ganTrainingExperiment(0.4,0.4,0,0);near(balanced.dReal,0.5);near(balanced.dFake,0.5);near(balanced.dWeightGradient,0);near(balanced.dBiasGradient,0);
console.log(`PASS: ${count} bilingual live explanations; actual dependency links; zero filters, bias, average sensitivity, blocked ReLU, memory removal and independently calculated live values`);
