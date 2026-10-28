import {gradientLabMarkup,gradientLabOutput,gradientPresets} from '../gradient-direction-lab.js';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {chapters} from '../curriculum.js';
import {studyNotes} from '../study-notes.js';
import {labGuides,labConnections} from '../lab-guides.js';
import {quizzes,quizHints} from '../quizzes.js';
import {prerequisites} from '../prerequisites.js';
import {architectureMarkup,architectureDiagram,architectureDetail,architectureModel} from '../architecture-map.js';
import {formulaWalkthrough} from '../formula-model.js';
import {formulaSidebar} from '../sidebar-formulas.js';
import {updateFormula,formulaAction,formulaScaleResult} from '../formula-walkthrough.js';
import {sequenceLabMarkup,sequenceLabOutput,sequenceAllWeightsOutput} from '../sequence-lab.js';
import {memoryInitial,memoryUpdate,memoryMarkup,memoryOutput} from '../rnn-memory-training.js';
import {tokenInitial,tokenUpdate,tokenMarkup,tokenOutput} from '../rnn-token-training.js';
import {rnnGradientMarkup,rnnGradientOutput} from '../rnn-gradient-lab.js';
import {lstmMarkup,lstmOutput} from '../lstm-lab.js';
import {gruMarkup,gruOutput} from '../gru-lab.js';
import {convolutionMarkup,convolutionOutput} from '../convolution-lab.js';
import {poolingMarkup,poolingOutput} from '../pooling-lab.js';
import {cnnChannelsMarkup,cnnChannelsOutput} from '../cnn-channels-lab.js';
import {geometryLabMarkup,geometryLabOutput} from '../cnn-geometry-lab.js';
import {diffusionMarkup,diffusionOutput} from '../diffusion-lab.js';
import {latentMarkup,latentOutput} from '../diffusion-latent-lab.js';
import {conditioningMarkup,conditioningOutput} from '../diffusion-conditioning-lab.js';
import {crossAttentionMarkup,crossAttentionOutput} from '../diffusion-cross-attention.js';
import {embeddingMarkup,embeddingOutput,embeddingExample} from '../embedding-lab.js';
import {attentionMarkup,attentionOutput} from '../attention-lab.js';
import {multiHeadMarkup,multiHeadOutput} from '../multihead-lab.js';
import {transformerBlockMarkup,transformerBlockOutput} from '../transformer-block-lab.js';
import {linkedBlockMarkup,linkedBlockOutput} from '../linked-transformer-block.js';
import {tokenSequenceMarkup,tokenSequenceOutput} from '../token-sequence-lab.js';
import {samplingMarkup,samplingOutput} from '../sampling-lab.js';
import {ganTrainingMarkup,ganTrainingOutput} from '../gan-training-lab.js';
import {ganModesMarkup,ganModesOutput} from '../gan-modes-lab.js';
import {trainingStep,trainingLabMarkup,trainingLabOutput,biasTrainingOutput} from '../training-lab.js';
import {batchLabMarkup,batchLabOutput} from '../minibatch-lab.js';
import {rnnOutputMarkup,rnnOutputResult} from '../rnn-output-lab.js';
import {clipMarkup,clipOutput} from '../clip-contrastive-lab.js';
import {splitLabMarkup,splitLabOutput} from '../split-lab.js';
import {earlyInitial,earlyNext,earlyMarkup,earlyOutput} from '../early-stopping-lab.js';
assert.deepEqual(embeddingExample('AB').map(x=>x.sum),[[1.1,0.3],[-0.2,1.4]]);
assert.deepEqual(embeddingExample('BA').map(x=>x.sum),[[0.1,1.3],[0.8,0.4]]);
assert.throws(()=>embeddingExample('AA'));
assert.equal(prerequisites.ko.length,prerequisites.en.length);
assert.ok(prerequisites.ko.length>=9);

assert.deepEqual(chapters.map(c => c.id), ['foundation','cnn','rnn','diffusion','transformer','gan']);
assert.match(labGuides.transformer.ko.join(' '),/임의 예시/);
assert.match(labGuides.transformer.en.join(' '),/random illustrations/);
for (const chapter of chapters) for (const language of ['ko','en']) {
  const text=chapter[language];
  assert.ok(text.name && text.summary && text.goal, `${chapter.id}/${language}: chapter text`);
  assert.equal(text.steps.length,3);
  for (const step of text.steps) assert.ok(step.length===7 && step.every(Boolean), `${chapter.id}/${language}: complete explanations`);
  assert.ok(studyNotes[chapter.id][language].length>=3);
  for (const note of studyNotes[chapter.id][language]) assert.ok((note.length===5 || note.length===6) && note.every(Boolean), `${chapter.id}/${language}: worked explanation`);
  if (chapter.resource) {
    assert.ok(labGuides[chapter.id][language].length>=3);
    assert.equal(labGuides[chapter.id].ko.length,labGuides[chapter.id].en.length);
    assert.ok(labGuides[chapter.id][language].every(Boolean));
    assert.ok(labConnections[chapter.id][language].length>=2);
    assert.equal(labConnections[chapter.id].ko.length,labConnections[chapter.id].en.length);
    assert.ok(labConnections[chapter.id][language].every(Boolean));
  }
  assert.equal(quizzes[chapter.id][language].length,2);
  for (const [index,[question,choices,correct,explanation]] of quizzes[chapter.id][language].entries()) {
    assert.ok(question && choices.length===3 && correct>=0 && correct<choices.length && explanation);
    assert.equal(quizzes[chapter.id].ko[index][2],quizzes[chapter.id].en[index][2]);
    const hints=quizHints[chapter.id][language][index];
    assert.equal(hints.length,choices.length);
    for (const [i,hint] of hints.entries()) assert.ok(i===correct ? hint===null : typeof hint==='string' && hint.length>0,`${chapter.id}/${language}/${index}/${i}: answer hint`);
  }
}

// Execute the actual browser code with a small DOM stub, so calculations and
// language/navigation events are exercised without coupling to presentation markup.
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{innerHTML:'',textContent:'',querySelectorAll(){return []},setAttribute(){},addEventListener(type,callback){this[type]=callback},focus(){}});
  return elements.get(selector);
}
const events={};
const stepButtons=Array.from({length:3},(_,i)=>({dataset:{step:String(i)},attrs:{'aria-controls':`step-${i}`},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},querySelector(){return this.chevron ||= {textContent:''}}}));
const document={documentElement:{},querySelector:element,querySelectorAll(selector){return selector==='[data-step]'?stepButtons:[]},getElementById(id){return element(`#${id}`)},addEventListener(type,callback){const previous=events[type];events[type]=(...args)=>{if(previous) previous(...args);callback(...args)}}};
const storage={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
const location={hash:''};
const window={addEventListener(){},scrollTo(){}};
const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .* from '[^']+';\s*$/gm,'');
const context=vm.createContext({gradientLabMarkup,gradientLabOutput,gradientPresets,mountCalculationRail(){},syncLabCalculation(){},formulaSidebar,formulaWalkthrough,updateFormula,formulaAction,formulaScaleResult,architectureMarkup,architectureDiagram,architectureDetail,architectureModel,chapters,studyNotes,labGuides,labConnections,quizzes,quizHints,prerequisites,sequenceLabMarkup,sequenceLabOutput,sequenceAllWeightsOutput,memoryInitial,memoryUpdate,memoryMarkup,memoryOutput,tokenInitial,tokenUpdate,tokenMarkup,tokenOutput,rnnGradientMarkup,rnnGradientOutput,lstmMarkup,lstmOutput,gruMarkup,gruOutput,convolutionMarkup,convolutionOutput,poolingMarkup,poolingOutput,cnnChannelsMarkup,cnnChannelsOutput,geometryLabMarkup,geometryLabOutput,diffusionMarkup,diffusionOutput,latentMarkup,latentOutput,conditioningMarkup,conditioningOutput,crossAttentionMarkup,crossAttentionOutput,embeddingMarkup,embeddingOutput,attentionMarkup,attentionOutput,multiHeadMarkup,multiHeadOutput,transformerBlockMarkup,transformerBlockOutput,linkedBlockMarkup,linkedBlockOutput,tokenSequenceMarkup,tokenSequenceOutput,samplingMarkup,samplingOutput,ganTrainingMarkup,ganTrainingOutput,ganModesMarkup,ganModesOutput,trainingStep,trainingLabMarkup,trainingLabOutput,biasTrainingOutput,batchLabMarkup,batchLabOutput,rnnOutputMarkup,rnnOutputResult,clipMarkup,clipOutput,splitLabMarkup,splitLabOutput,earlyInitial,earlyNext,earlyMarkup,earlyOutput,document,localStorage:storage,location,window,Math,console});
vm.runInContext(source,context);
assert.match(element('#main').innerHTML,/학습의 기초/);
for (const [id,path] of [['cnn','cnn-explainer/public/'],['diffusion','diffusion-explainer/'],['transformer','transformer-explainer/build/'],['gan','ganlab/demo/']]) {
  events.click({target:{closest(selector){return selector==='[data-nav]'?{dataset:{nav:id}}:null}}});
  assert.ok(element('#main').innerHTML.includes(`${path}?lang=ko`),`${id} receives Korean locale`);
}
events.click({target:{closest(selector){return selector==='[data-nav]'?{dataset:{nav:'foundation'}}:null}}});
element('#language').click();
assert.match(element('#main').innerHTML,/Learning basics/);
const mainBeforeStep=element('#main').innerHTML;
events.click({target:{closest(selector){return selector==='[data-step]'?stepButtons[1]:null}}});
assert.equal(element('#main').innerHTML,mainBeforeStep,'opening a lesson does not replace the embedded lab');
assert.equal(stepButtons[1].attrs['aria-expanded'],'true');
assert.equal(element('#step-1').hidden,false);
assert.equal(element('#step-0').hidden,true);
events.input({target:{closest(selector){return selector==='[data-param]'?{dataset:{param:'x'},value:'2'}:null}}});
assert.match(element('#value-x').textContent,/2\.000/);
assert.doesNotMatch(element('#result').innerHTML,/L =/);
events.click({target:{closest(selector){return selector==='[data-calculate]'?{dataset:{calculate:'next'}}:null}}});
assert.match(element('#result').innerHTML,/L =/);
events.click({target:{closest(selector){return selector==='[data-quiz]'?{dataset:{quiz:'0',choice:'1'}}:null}}});
assert.match(element('#quiz-result-0').textContent,/Try again/);
events.click({target:{closest(selector){return selector==='[data-quiz]'?{dataset:{quiz:'0',choice:'0'}}:null}}});
assert.match(element('#quiz-result-0').textContent,/Correct/);
for (const chapter of chapters) {
  events.click({target:{closest(selector){return selector==='[data-nav]'?{dataset:{nav:chapter.id}}:null}}});
  assert.match(element('#main').innerHTML,new RegExp(chapter.en.name));
  if(chapter.id==='diffusion') assert.match(element('#main').innerHTML,/diffusion-explainer\/\?lang=en/);
  if(chapter.id==='cnn') assert.match(element('#main').innerHTML,/cnn-explainer\/public\/\?lang=en/);
  if(chapter.id==='transformer') assert.match(element('#main').innerHTML,/transformer-explainer\/build\/\?lang=en/);
  if(chapter.id==='gan') assert.match(element('#main').innerHTML,/ganlab\/demo\/\?lang=en/);
  assert.ok(!/NaN|Infinity/.test(element('#main').innerHTML),`${chapter.id}: finite default result`);
}
const calc=(id,v)=>vm.runInContext(`example(${JSON.stringify(id)},${JSON.stringify(v)},'en')`,context);
assert.match(calc('foundation',{x:1,w:0.5,y:1}),/w_new.*0\.600/);
assert.match(calc('cnn',{x1:1,x2:0.5,w1:0.8}),/0\.550/);
assert.match(calc('rnn',{x1:0,x2:0,wh:1}),/0\.000/);
assert.match(calc('diffusion',{x:1,alpha:1,noise:-1}),/<strong>1\.000/);
assert.match(calc('transformer',{q:0,v1:2,v2:0}),/<strong>1\.000/);
assert.match(calc('gan',{real:0.8,fake:0.3}),/0\.580.*1\.204/);
console.log('PASS: bilingual lessons, guides and quizzes; navigation, language, lesson expansion, calculations and slider');
