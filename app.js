import {firstStepsMarkup,firstExperimentOutput} from './first-steps.js';
import {gradientLabMarkup,gradientLabOutput,gradientPresets} from './gradient-direction-lab.js';
import { chapters } from './curriculum.js';
import { studyNotes } from './study-notes.js';
import { labGuides, labConnections } from './lab-guides.js';
import { quizzes, quizHints } from './quizzes.js';
import { sequenceLabMarkup, sequenceLabOutput, sequenceAllWeightsOutput } from './sequence-lab.js';
import { memoryInitial, memoryUpdate, memoryMarkup, memoryOutput } from './rnn-memory-training.js';
import { tokenInitial, tokenUpdate, tokenMarkup, tokenOutput } from './rnn-token-training.js';
import { rnnOutputMarkup, rnnOutputResult } from './rnn-output-lab.js';
import { rnnGradientMarkup, rnnGradientOutput } from './rnn-gradient-lab.js';
import { lstmMarkup, lstmOutput } from './lstm-lab.js';
import { gruMarkup, gruOutput } from './gru-lab.js';
import { convolutionMarkup, convolutionOutput } from './convolution-lab.js';
import { poolingMarkup, poolingOutput } from './pooling-lab.js';
import { cnnChannelsMarkup, cnnChannelsOutput } from './cnn-channels-lab.js';
import { geometryLabMarkup, geometryLabOutput } from './cnn-geometry-lab.js';
import { diffusionMarkup, diffusionOutput } from './diffusion-lab.js';
import { latentMarkup, latentOutput } from './diffusion-latent-lab.js';
import { conditioningMarkup, conditioningOutput } from './diffusion-conditioning-lab.js';
import { crossAttentionMarkup, crossAttentionOutput } from './diffusion-cross-attention.js';
import { clipMarkup, clipOutput } from './clip-contrastive-lab.js';
import { embeddingMarkup, embeddingOutput } from './embedding-lab.js';
import { attentionMarkup, attentionOutput } from './attention-lab.js';
import { multiHeadMarkup, multiHeadOutput } from './multihead-lab.js';
import { transformerBlockMarkup, transformerBlockOutput } from './transformer-block-lab.js';
import { linkedBlockMarkup, linkedBlockOutput } from './linked-transformer-block.js';
import { tokenSequenceMarkup, tokenSequenceOutput } from './token-sequence-lab.js';
import { samplingMarkup, samplingOutput } from './sampling-lab.js';
import { ganTrainingMarkup, ganTrainingOutput } from './gan-training-lab.js';
import { ganModesMarkup, ganModesOutput } from './gan-modes-lab.js';
import { trainingStep, trainingLabMarkup, trainingLabOutput, biasTrainingOutput } from './training-lab.js';
import { batchLabMarkup, batchLabOutput } from './minibatch-lab.js';
import { splitLabMarkup, splitLabOutput } from './split-lab.js';
import { earlyInitial, earlyNext, earlyMarkup, earlyOutput } from './early-stopping-lab.js';
import { architectureMarkup, architectureDiagram, architectureDetail, architectureModel } from './architecture-map.js';
import { formulaWalkthrough } from './formula-model.js';
import { updateFormula, formulaAction, formulaScaleResult } from './formula-walkthrough.js';
import { formulaSidebar } from './sidebar-formulas.js';
import { mountCalculationRail, syncLabCalculation } from './calculation-rail.js';

const ui = {
  ko:{path:'학습 경로',note:'개념을 읽고 숫자를 바꾸며 직접 확인하세요.',progress:'6개 학습 단원',crumb:'학습 경로',goal:'이번 단원의 목표',lesson:'차근차근 이해하기',lessonHint:'단계를 눌러 펼쳐 보세요',where:'어디에 적용하나요?',role:'무슨 역할인가요?',result:'결과는 무엇인가요?',lab:'직접 계산해 보기',labDesc:'슬라이더를 움직이면 계산 과정과 결과가 즉시 바뀝니다.',labNote:'이 예제는 계산 원리를 보여 주기 위한 축소 모델입니다. 실제 모델은 벡터와 행렬을 사용합니다.',source:'원본 시각화 실습',sourceDesc:'원본 프로젝트의 인터랙티브 실습을 별도 창에서 엽니다. 원본 인터페이스는 영문입니다.',open:'실습 열기 ↗',next:'다음 단원',footer:'원본 프로젝트의 라이선스와 출처는',footerLink:'라이선스 안내',footerEnd:'에서 확인할 수 있습니다.',basic:'공통 기초',input:'입력',output:'계산 결과',labels:{x:'입력 x',w:'가중치 w',y:'정답 y',x1:'입력 x₁',x2:'입력 x₂',w1:'필터 w₁',wx:'입력 가중치',wh:'상태 가중치',alpha:'ᾱₜ',noise:'노이즈 ε',q:'질의 q',v1:'값 v₁',v2:'값 v₂',real:'D(진짜)',fake:'D(가짜)'},last:'처음으로'},
  en:{path:'LEARNING PATH',note:'Read the ideas, change the numbers, and see what happens.',progress:'6 learning units',crumb:'LEARNING PATH',goal:'YOUR GOAL',lesson:'Understand it step by step',lessonHint:'Select a step to expand it',where:'Where is it applied?',role:'What does it do?',result:'What does the result mean?',lab:'Try the calculation',labDesc:'Move a slider to update the calculation and result.',labNote:'This is a simplified example to make the calculation visible. Real models use vectors and matrices.',source:'Original interactive visualization',sourceDesc:'Open the original project in a separate tab. Its interface is in English.',open:'Open lab ↗',next:'Next unit',footer:'Find the original projects’ credits and licenses in',footerLink:'licenses',footerEnd:'.',basic:'FOUNDATIONS',input:'INPUT',output:'RESULT',labels:{x:'input x',w:'weight w',y:'target y',x1:'input x₁',x2:'input x₂',w1:'filter w₁',wx:'input weight',wh:'state weight',alpha:'ᾱₜ',noise:'noise ε',q:'query q',v1:'value v₁',v2:'value v₂',real:'D(real)',fake:'D(fake)'},last:'Back to start'}
};

const definitions = {
  foundation:[['x',-2,2,0.1,1],['w',-2,2,0.1,0.5],['y',-2,2,0.1,1]],
  cnn:[['x1',-2,2,0.1,1],['x2',-2,2,0.1,0.5],['w1',-2,2,0.1,0.8]],
  rnn:[['x1',-2,2,0.1,1],['x2',-2,2,0.1,0.5],['wh',-2,2,0.1,0.5]],
  diffusion:[['x',-2,2,0.1,1],['alpha',0,1,0.05,0.5],['noise',-2,2,0.1,-1]],
  transformer:[['q',-3,3,0.1,1],['v1',-2,2,0.1,2],['v2',-2,2,0.1,0]],
  gan:[['real',0.05,0.95,0.05,0.8],['fake',0.05,0.95,0.05,0.3]]
};
const glossary = {
 foundation:{ko:'x: 입력 · w: 가중치 · b: 편향 · ŷ: 예측 · y: 정답 · L: 손실 · η: 학습률 · ∂L/∂w: w에 대한 손실의 기울기',en:'x: input · w: weight · b: bias · ŷ: prediction · y: target · L: loss · η: learning rate · ∂L/∂w: gradient of loss with respect to w'},
 cnn:{ko:'xᵢ: 입력값 · wᵢ: 필터 가중치 · b: 편향 · z: 가중합 · a: 활성값 · Σ: 모두 더하기 · exp: 지수함수 · pᵧ: 정답 클래스의 확률 · log: 자연로그',en:'xᵢ: input · wᵢ: filter weight · b: bias · z: weighted sum · a: activation · Σ: sum over items · exp: exponential · pᵧ: target-class probability · log: natural logarithm'},
 rnn:{ko:'t: 시점 · xₜ: 현재 입력 · hₜ: 현재 은닉 상태 · hₜ₋₁: 이전 상태 · W: 가중치 · b: 편향 · tanh: −1과 1 사이로 바꾸는 함수 · Σ: 모든 시점의 합',en:'t: time step · xₜ: current input · hₜ: current hidden state · hₜ₋₁: previous state · W: weights · b: bias · tanh: function with output between −1 and 1 · Σ: sum across time'},
 diffusion:{ko:'x₀: 원본 · xₜ: t단계에서 노이즈가 섞인 값 · ε: 실제 노이즈 · εθ: 모델의 노이즈 예측 · ᾱₜ: 신호 유지 비율 · c: 조건 · E: 평균 · ‖·‖²: 차이의 제곱합',en:'x₀: clean data · xₜ: noisy data at step t · ε: actual noise · εθ: model noise prediction · ᾱₜ: retained signal fraction · c: condition · E: average · ‖·‖²: sum of squared differences'},
 transformer:{ko:'q: 질의 · k: 키 · v: 값 · i, j: 토큰 위치 · dₖ: 키 벡터 차원 · ·: 내적 · softmax: 점수를 합이 1인 가중치로 바꾸는 함수 · Σ: 가중값의 합',en:'q: query · k: key · v: value · i, j: token positions · dₖ: key dimension · ·: dot product · softmax: converts scores to weights summing to one · Σ: sum of weighted values'},
 gan:{ko:'G: 생성자 · D: 판별자 · z: 랜덤 입력 · x: 실제 샘플 · E: 여러 샘플에 대한 평균 · log: 자연로그 · max/min: 값을 최대/최소로 만드는 방향',en:'G: generator · D: discriminator · z: random input · x: real sample · E: average over samples · log: natural logarithm · max/min: direction that maximizes/minimizes a value'}
};
const params = Object.fromEntries(Object.entries(definitions).map(([id, defs]) => [id,Object.fromEntries(defs.map(([key,,,,value]) => [key,value]))]));
const fmt = n => (Math.abs(n)<0.0005 ? 0 : n).toFixed(3);
function example(id,v,lang) {
  const f=fmt;
  switch(id){
    case 'foundation': {const pred=v.w*v.x, loss=(pred-v.y)**2, grad=2*(pred-v.y)*v.x, next=v.w-0.1*grad; return `ŷ = ${f(v.w)} × ${f(v.x)} + 0 = ${f(pred)}<br>L = (${f(pred)} − ${f(v.y)})² = ${f(loss)}<br>∂L/∂w = 2(ŷ − y)x = ${f(grad)}<br>w_new = ${f(v.w)} − 0.1 × ${f(grad)} = <strong>${f(next)}</strong>`;}
    case 'cnn': {const z=v.x1*v.w1+v.x2*(-0.5);return `w₂ = −0.5, b = 0<br>z = ${f(v.x1)} × ${f(v.w1)} + ${f(v.x2)} × (−0.5) = ${f(z)}<br>ReLU(z) = max(0, ${f(z)}) = <strong>${f(Math.max(0,z))}</strong>`;}
    case 'rnn': {const h1=Math.tanh(v.x1),h2=Math.tanh(v.x2+v.wh*h1);return `Wₓ = 1, b = 0, h₀ = 0<br>h₁ = tanh(${f(v.x1)} + ${f(v.wh)} × 0) = ${f(h1)}<br>h₂ = tanh(${f(v.x2)} + ${f(v.wh)} × ${f(h1)}) = <strong>${f(h2)}</strong>`;}
    case 'diffusion': {const signal=Math.sqrt(v.alpha)*v.x,noise=Math.sqrt(1-v.alpha)*v.noise;return `x₀ = ${f(v.x)}, ε = ${f(v.noise)}, ᾱₜ = ${f(v.alpha)}<br>xₜ = √${f(v.alpha)} × ${f(v.x)} + √(1 − ${f(v.alpha)}) × ${f(v.noise)}<br> = ${f(signal)} + ${f(noise)} = <strong>${f(signal+noise)}</strong>`;}
    case 'transformer': {const s1=v.q,s2=-v.q, max=Math.max(s1,s2),a=Math.exp(s1-max)/(Math.exp(s1-max)+Math.exp(s2-max));return `k₁ = 1, k₂ = −1, dₖ = 1<br>score₁ = ${f(s1)}, score₂ = ${f(s2)}<br>softmax = [${f(a)}, ${f(1-a)}]<br>o = ${f(a)} × ${f(v.v1)} + ${f(1-a)} × ${f(v.v2)} = <strong>${f(a*v.v1+(1-a)*v.v2)}</strong>`;}
    case 'gan': {const d=-Math.log(v.real)-Math.log(1-v.fake),g=-Math.log(v.fake);return `D(real) = ${f(v.real)}, D(fake) = ${f(v.fake)}<br>${lang==='ko'?'판별자 손실':'Discriminator loss'} = −log D(real) − log(1 − D(fake)) = <strong>${f(d)}</strong><br>${lang==='ko'?'생성자 비포화 손실':'Non-saturating generator loss'} = −log D(fake) = <strong>${f(g)}</strong>`;}
  }
}

let lang = localStorage.getItem('model-atlas-language') === 'en' ? 'en' : 'ko';
let current = location.hash.slice(1) || 'foundation';
if(!chapters.some(c=>c.id===current)) current='foundation';
const quizSelections = Object.create(null);
function quizFeedback(id, language, index, selected) {
  if (selected === undefined) return {text:'', className:''};
  const question = quizzes[id][language][index];
  const correct = selected === question[2];
  const prefix = language === 'ko' ? (correct ? '정답입니다. ' : '다시 생각해 보세요. ') : (correct ? 'Correct. ' : 'Try again. ');
  return {text:prefix + (correct ? question[3] : quizHints[id][language][index][selected]), className:correct ? 'correct' : 'retry'};
}
let expanded=0;
let calculationStep=1;
const trainingValues={x:1,y:1,initialWeight:0.5,rate:0.1,evalX:2,evalY:0.5,demoBias:0};
let trainingWeight=trainingValues.initialWeight;
let trainingHistory=[{weight:trainingWeight,loss:(trainingWeight*trainingValues.x-trainingValues.y)**2}];
let trainingStage=1;
const batchValues={batchSize:2,initialWeight:0.5,rate:0.1,target2:1};
let batchStage=1,batchIndex=0;
let splitStage=1,splitChoice='';
let earlyState=earlyInitial();
const sequenceValues={x1:1,x2:0,x3:0,weight:0.5,target:0.8,allSteps:false,previewRate:0.1};
let sequenceStage=1;
const memoryState={parameters:memoryInitial(),rate:0.1,maxNorm:null,count:0,last:null};
const tokenState={parameters:tokenInitial(),rate:0.1,count:0,last:null,selected:0};
const rnnOutputValues={u:0.5,v:1,b:0};
let rnnOutputStage=1;
const rnnFlowValues={initial:0.1,weight:0.8};
let rnnFlowStage=0;
const lstmValues={previous:1,forgetLogit:1,inputLogit:0,outputLogit:0,candidateLogit:0.5};
let lstmStage=1;
const gruValues={previous:0.6,resetLogit:0,updateLogit:0,inputTerm:0.2,recurrentTerm:0.8};
let gruStage=1;
const convolutionValues={center:0,strength:1,bias:0};
let convolutionStage=1;
const poolingValues={source:'conv',example:1.5,gradient:1};
let poolingStage=1;
const geometryValues={inputSize:5,kernelSize:3,padding:1,stride:2};
let geometryStage=1;
const channelValues={red:0.2,green:0.5,blue:0.8};
let channelStage=1;
const diffusionValues={clean:1,noise:-1,prediction:-0.8,unconditional:-0.2,guidance:1,nextPrediction:-0.8};
let diffusionStage=1;
const latentValues={size:512,encoded:1,noise:-1};
let latentStage=1;
const conditioningValues={p:0.2,draw:0.1,scale:2};
let conditioningStage=1;
let crossQuery=1, crossStage=1;
const clipValues={component:0.5,scale:2};
let clipStage=1;
let embeddingOrder='AB', embeddingStage=1;
const attentionValues={q1:1,q2:1,mask:true};
let attentionStage=1;
const blockValues={x1:1,x2:0,attention:0.2,gamma:1,beta:0,activation:'gelu'};
let blockStage=1;
const architectureStages={cnn:0,rnn:0,transformer:0};
const formulaStages={cnn:0,rnn:0,transformer:0};
let tokenChoice='C', tokenTargetProbability=0.35, tokenSequenceStage=1;
const sampleValues={temperature:1,mode:'top-k',k:2,p:0.8,draw:0.5};
let sampleStage=1;
const ganTrainingValues={real:1,generator:0,weight:1,bias:0};
let ganTrainingStage=1;
const ganModesValues={q:0.5,score:0.9};
let ganModesStage=1;
const gradientValues={...gradientPresets.positive};
let gradientStage=1;
const main=document.querySelector('#main');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// A short, task-oriented route through the much longer unit; other examples remain optional.
const firstValues={};
const beginnerRoutes={
 foundation:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['math-basics-title','기호와 미분 등 필요한 수학 기초를 먼저 확인합니다.','Review the mathematical symbols and derivatives you need.'],
  ['concept-title','핵심 개념에서 예측·손실·갱신의 역할을 읽습니다.','Read how prediction, loss and updates fit together.'],
  ['split-title','데이터 분할에서 검증 결과로 후보를 선택한 뒤 시험 결과를 확인합니다.','Select a candidate using validation results, then inspect the test result.'],
  ['gradient-direction-title','기울기를 빼고 더한 결과를 비교하고 큰 학습률로 최솟값을 넘어가 봅니다.','Compare subtracting and adding gradients, then overshoot with a large learning rate.'],
  ['training-title','한 예제의 학습에서 다음 단계를 눌러 기울기와 갱신을 따라가고 학습률을 바꿉니다.','Step through the single-example gradient and update, then change the learning rate.'],
  ['batch-title','미니배치의 예제별 기울기를 모아 평균 기울기로 갱신합니다.','Combine per-example gradients into a mini-batch mean update.'],
  ['early-title','검증 손실을 보며 학습을 멈추고 최적 시점의 가중치를 확인합니다.','Stop training using validation loss and inspect the best checkpoint.'],
  ['quiz-title','문제를 풀고 이해가 어려운 단계로 돌아갑니다.','Answer the questions and revisit any unclear step.']
 ],
 cnn:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['concept-title','필터, 활성화와 분류 손실의 역할을 읽습니다.','Read the roles of filters, activation and classification loss.'],
  ['architecture-title','구조 그림의 각 층을 선택하며 값과 수식을 따라갑니다.','Select each layer in the diagram and follow its values and equations.'],
  ['formula-title','수식 여정에서 원소별 곱, 합성곱, 평균 풀링과 학습을 이어 계산합니다.','Follow elementwise products, convolution, average pooling and learning in the formula journey.'],
  ['conv-title','필터를 이동하며 특징 맵과 공유 가중치의 갱신을 따라갑니다.','Move through the filter positions, feature map and shared-weight update.'],
  ['pool-title','최대 풀링에서 선택되는 값과 되돌아가는 기울기를 확인합니다.','Inspect the selected maximum and the gradient passed back by max pooling.'],
  ['resource-title','원본 실습으로 이동해 제목을 펼친 뒤 특징 맵, 입력 채널과 출력 확률을 비교합니다.','Go to the original lab, expand its heading and compare feature maps, input channels and output probabilities.'],
  ['quiz-title','문제로 필터 공유와 출력의 의미를 확인합니다.','Use the questions to check weight sharing and output meaning.']
 ],
 rnn:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['concept-title','현재 입력과 이전 상태가 결합되는 방식을 읽습니다.','Read how the current input combines with the previous state.'],
  ['architecture-title','펼쳐진 셀에서 상태가 다음 시점으로 전달되는 과정을 따라갑니다.','Follow the state through the unfolded cells.'],
  ['formula-title','입력부터 상태, 예측, 손실과 시간 역전파까지 하나의 식으로 따라갑니다.','Follow one connected calculation from inputs to states, prediction, loss and backpropagation through time.'],
  ['sequence-title','세 시점의 상태와 시간 역전파를 단계별로 따라갑니다.','Follow three states and backpropagation through time step by step.'],
  ['rnn-output-title','마지막 상태를 출력층에서 예측으로 바꾸고 손실과 역전파를 따라갑니다.','Turn the final state into a prediction with an output layer, then follow the loss and backpropagation.'],
  ['memory-title','여러 순서를 반복 학습하고 훈련과 별도 평가 손실을 비교합니다.','Train on multiple sequences and compare training and held-out losses.'],
  ['rnn-flow-title','시점과 순환 가중치를 바꾸며 기울기 흐름을 관찰합니다.','Change the length and recurrent weight to inspect gradient flow.'],
  ['lstm-title','LSTM의 게이트가 셀 상태를 어떻게 바꾸는지 비교합니다.','Compare how LSTM gates change the cell state.'],
  ['quiz-title','문제로 상태와 기울기의 역할을 확인합니다.','Check the roles of state and gradients with the questions.']
 ],
 diffusion:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['concept-title','노이즈 추가, 예측 학습, 생성의 차이를 읽습니다.','Distinguish noise addition, prediction training and generation.'],
  ['diff-title','노이즈 예측 손실과 역방향 단계를 숫자로 따라갑니다.','Follow the noise-prediction loss and reverse steps numerically.'],
  ['latent-title','잠재표현과 이미지 디코딩의 역할을 확인합니다.','Inspect latent representations and image decoding.'],
  ['clip-title','이미지와 글의 짝을 학습하는 CLIP과 생성에 쓰는 텍스트 표현을 구분합니다.','Distinguish CLIP image–text pretraining from the text representation used for generation.'],
  ['cross-title','교차 어텐션으로 텍스트 정보가 이미지 특징에 전달되는 과정을 계산합니다.','Calculate how cross-attention passes text information to image features.'],
  ['cfg-title','조건을 없애는 학습과 가이던스 조합을 비교합니다.','Compare condition dropout in training and guidance at sampling.'],
  ['resource-title','원본 실습으로 이동해 제목을 펼친 뒤 시간 단계와 가이던스를 바꾸어 봅니다.','Go to the original lab, expand its heading and change display steps and guidance.'],
  ['quiz-title','문제로 학습과 생성 단계를 구분합니다.','Check the distinction between training and generation.']
 ],
 transformer:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['concept-title','토큰, 점수와 어텐션 가중합의 역할을 읽습니다.','Read the roles of tokens, scores and attention-weighted sums.'],
  ['architecture-title','구조 그림에서 입력부터 어텐션과 출력까지 따라갑니다.','Follow the diagram from inputs through attention to output.'],
  ['formula-title','토큰 입력부터 정규화, √dₖ, 어텐션과 다음 토큰 손실까지 연결합니다.','Connect token inputs, normalization, √dₖ, attention and next-token loss.'],
  ['embedding-title','토큰과 위치 임베딩을 합치는 과정을 확인합니다.','Inspect how token and positional embeddings combine.'],
  ['attn-title','Q·K·V, 마스킹과 어텐션 가중치를 계산합니다.','Calculate Q, K, V, masking and attention weights.'],
  ['linked-block-title','연결된 블록에서 어텐션, 잔차와 MLP의 결과를 따라갑니다.','Follow attention, residuals and the MLP in the connected block.'],
  ['token-sequence-title','입력과 다음 정답의 정렬을 보고 학습과 생성의 문맥을 비교합니다.','Inspect input and target alignment, then compare training and generation contexts.'],
  ['sample-title','온도와 후보 필터링이 다음 토큰의 분포에 주는 영향을 비교합니다.','Compare how temperature and candidate filtering change the next-token distribution.'],
  ['resource-title','원본 실습으로 이동해 제목을 펼친 뒤 토큰의 어텐션과 출력 확률을 구별합니다.','Go to the original lab, expand its heading and distinguish token attention from output probabilities.'],
  ['quiz-title','문제로 어텐션과 출력 확률의 차이를 확인합니다.','Use the questions to check attention versus output probabilities.']
 ],
 gan:[
  ['first-steps-title','작은 숫자 예제로 시작해 하나씩 바꾸며 이유를 확인합니다.','Start with small numbers and change one value to understand why.'],
  ['concept-title','생성자와 판별자의 역할과 손실을 읽습니다.','Read the generator and discriminator roles and losses.'],
  ['gantrain-title','판별자와 생성자의 갱신을 번갈아 계산합니다.','Calculate alternating discriminator and generator updates.'],
  ['ganmodes-title','분포가 한 유형에 몰릴 때 손실과 다양성을 비교합니다.','Compare loss and diversity when a distribution concentrates on one mode.'],
  ['resource-title','원본 실습으로 이동해 제목을 펼친 뒤 사전 학습 모델을 끄고 두 모델을 단계별로 갱신합니다.','Go to the original lab, expand its heading, disable the pretrained model and step through both updates.'],
  ['quiz-title','문제로 두 모델의 목적과 학습의 한계를 확인합니다.','Check the objectives and limitations with the questions.']
 ]
};
const relatedConcepts={
 foundation:[['learning','머신러닝과 딥러닝','Machine learning and deep learning'],['splits','데이터 분할','Data splits'],['metrics','평가지표','Metrics'],['gradient','경사 하강법','Gradient descent'],['optimizers','미니배치와 최적화','Mini-batches and optimization']],
 cnn:[['activation','활성화 함수','Activations'],['loss','출력층과 손실','Output and loss'],['mnist','MNIST 실습 설계','MNIST practice']],
 rnn:[['markov','마르코프 연쇄','Markov chains'],['gradient','역전파','Backpropagation'],['gradient-clipping','기울기 클리핑','Gradient clipping'],['overfit','일반화','Generalization']],
 diffusion:[['features','특징과 문제 정의','Features and tasks'],['loss','손실 함수','Loss functions'],['optimizers','최적화','Optimization']],
 transformer:[['features','특징 벡터','Feature vectors'],['activation','비선형성','Nonlinearity'],['perplexity','퍼플렉시티','Perplexity'],['gpu','GPU와 메모리','GPU and memory']],
 gan:[['batchnorm','배치 정규화','Batch normalization'],['loss','손실 함수','Loss functions'],['overfit','일반화','Generalization']]
};
function navigate(id){if(location.search){const url=new URL(location.href);if(url.searchParams.has('section')){url.searchParams.delete('section');history.replaceState(history.state,'',url);}}current=id;expanded=0;calculationStep=1;trainingStage=1;batchStage=1;batchIndex=0;splitStage=1;splitChoice='';sequenceStage=1;rnnOutputStage=1;rnnFlowStage=0;lstmStage=1;gruStage=1;convolutionStage=1;poolingStage=1;channelStage=1;diffusionStage=1;latentStage=1;conditioningStage=1;crossStage=1;clipStage=1;embeddingStage=1;attentionStage=1;blockStage=1;tokenSequenceStage=1;sampleStage=1;ganTrainingStage=1;ganModesStage=1;location.hash=id;render();main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});}
function updateTokenTraining(){
 const output=document.querySelector('#token-output');
 if(output){
  output.innerHTML=tokenOutput(tokenState,lang);
  document.querySelector('[data-token-action="one"]').disabled=tokenState.count>=200;
  document.querySelector('[data-token-action="ten"]').disabled=tokenState.count>=200;
 }
}
function updateMemory(){
  const output=document.querySelector('#memory-output');
  if(!output || current!=='rnn')return;
  output.innerHTML=memoryOutput(memoryState,lang);
  document.querySelector('[data-memory-action="one"]').disabled=memoryState.count>=200;
  document.querySelector('[data-memory-action="ten"]').disabled=memoryState.count>=200;
}
function updateGradientLab(){
  const output=document.querySelector('#gradient-direction-output');
  if(!output || current!=='foundation')return;
  output.innerHTML=gradientLabOutput(gradientValues,lang,gradientStage);
  document.querySelector('#gradient-stage-status').textContent=`${gradientStage} / 5`;
  document.querySelector('[data-gradient-stage="previous"]').disabled=gradientStage===1;
  document.querySelector('[data-gradient-stage="next"]').disabled=gradientStage===5;
  for(const key of ['w','y','rate']){
    document.querySelector(`#gradient-${key}`).value=gradientValues[key];
    document.querySelector(`#gradient-value-${key}`).textContent=gradientValues[key].toFixed(3);
  }
}
function resetTrainingLab(){
  trainingWeight=trainingValues.initialWeight;
  trainingHistory=[{weight:trainingWeight,loss:(trainingWeight*trainingValues.x-trainingValues.y)**2}];
}
function updateTrainingLab(){
  const output=document.querySelector('#training-output');
  if(!output || current!=='foundation') return;
  output.innerHTML=trainingLabOutput(trainingValues,trainingWeight,trainingHistory,lang,trainingStage);
  document.querySelector('#training-bias-output').innerHTML=biasTrainingOutput(trainingValues,trainingWeight,lang);
  document.querySelector('#training-stage-status').textContent=`${trainingStage} / 4`;
  document.querySelector('[data-training-stage="previous"]').disabled=trainingStage<=1;
  document.querySelector('[data-training-stage="next"]').disabled=trainingStage>=4;
  document.querySelector('#training-status').textContent=`${trainingHistory.length-1} / 20`;
  document.querySelector('[data-training-action="next"]').disabled=trainingHistory.length>20;
}
function updateBatchLab(){
  const output=document.querySelector('#batch-output');
  if(!output || current!=='foundation') return;
  const count=Math.ceil(3/batchValues.batchSize);
  batchIndex=Math.min(batchIndex,count-1);
  output.innerHTML=batchLabOutput(batchValues,lang,batchStage,batchIndex);
  document.querySelector('#batch-index-status').textContent=`${batchIndex+1} / ${count}`;
  document.querySelector('#batch-stage-status').textContent=`${batchStage} / 4`;
  document.querySelector('[data-batch-select="previous"]').disabled=batchIndex===0;
  document.querySelector('[data-batch-select="next"]').disabled=batchIndex===count-1;
  document.querySelector('[data-batch-stage="previous"]').disabled=batchStage===1;
  document.querySelector('[data-batch-stage="next"]').disabled=batchStage===4;
}
function updateSplitLab(){
  const output=document.querySelector('#split-output');
  if(!output || current!=='foundation') return;
  output.innerHTML=splitLabOutput(lang,splitStage,splitChoice);
  document.querySelector('#split-status').textContent=`${splitStage} / 4`;
  document.querySelector('#split-choice-area').hidden=splitStage<3;
  document.querySelector('#split-choice').disabled=splitStage===4;
  document.querySelector('[data-split-action="previous"]').disabled=splitStage===1 || splitStage===4;
  document.querySelector('[data-split-action="next"]').disabled=splitStage===4 || (splitStage===3 && !splitChoice);
}
function updateEarlyLab(){
  const output=document.querySelector('#early-output');
  if(!output) return;
  output.innerHTML=earlyOutput(earlyState,lang);
  document.querySelector('[data-early-action="next"]').disabled=earlyState.stopped;
  const restore=document.querySelector('[data-early-action="restore"]');
  restore.hidden=!earlyState.stopped;
  restore.disabled=earlyState.restored;
  document.querySelector('#early-patience').disabled=earlyState.history.length>1;
}
function updateClipLab(){
  const output=document.querySelector('#clip-output');
  if(!output || current!=='diffusion') return;
  output.innerHTML=clipOutput(clipValues,lang,clipStage);
  syncLabCalculation(output);
  document.querySelector('#clip-status').textContent=`${clipStage} / 5`;
  document.querySelector('[data-clip-action="previous"]').disabled=clipStage<=1;
  document.querySelector('[data-clip-action="next"]').disabled=clipStage>=5;
}
function updateCrossAttention(){
  const output=document.querySelector('#cross-output');
  if(!output || current!=='diffusion') return;
  output.innerHTML=crossAttentionOutput(crossQuery,lang,crossStage);
  syncLabCalculation(output);
  document.querySelector('#cross-status').textContent=`${crossStage} / 3`;
  document.querySelector('[data-cross-action="next"]').disabled=crossStage>=3;
  document.querySelector('[data-cross-action="previous"]').disabled=crossStage<=1;
}
function updateDiffusionLab(){
  const output=document.querySelector('#diff-output');
  if(!output || current!=='diffusion') return;
  output.innerHTML=diffusionOutput(diffusionValues,lang,diffusionStage);
  syncLabCalculation(output);
  document.querySelector('#diff-status').textContent=`${diffusionStage} / 7`;
  document.querySelector('[data-diff-action="next"]').disabled=diffusionStage>=7;
  document.querySelector('[data-diff-action="previous"]').disabled=diffusionStage<=1;
}
function updateLatentLab(){
  const output=document.querySelector('#latent-output');
  if(!output || current!=='diffusion') return;
  output.innerHTML=latentOutput(latentValues,lang,latentStage);
  syncLabCalculation(output);
  document.querySelector('#latent-status').textContent=`${latentStage} / 5`;
  document.querySelector('[data-latent-action="next"]').disabled=latentStage>=5;
  document.querySelector('[data-latent-action="previous"]').disabled=latentStage<=1;
}
function updateConditioningLab(){
  const output=document.querySelector('#cfg-output');
  if(!output || current!=='diffusion') return;
  output.innerHTML=conditioningOutput(conditioningValues,lang,conditioningStage);
  syncLabCalculation(output);
  document.querySelector('#cfg-status').textContent=`${conditioningStage} / 4`;
  document.querySelector('[data-cfg-action="previous"]').disabled=conditioningStage<=1;
  document.querySelector('[data-cfg-action="next"]').disabled=conditioningStage>=4;
}
function updateConvolutionLab(){
  const output=document.querySelector('#conv-output');
  if(!output || current!=='cnn') return;
  output.innerHTML=convolutionOutput(convolutionValues,lang,convolutionStage);
  document.querySelector('#conv-status').textContent=`${convolutionStage} / 10`;
  document.querySelector('[data-conv-action="next"]').disabled=convolutionStage>=10;
  document.querySelector('[data-conv-action="previous"]').disabled=convolutionStage<=1;
  updateArchitecture();
}
function updatePoolingLab(){
  const output=document.querySelector('#pool-output');
  if(!output || current!=='cnn') return;
  output.innerHTML=poolingOutput(convolutionValues,poolingValues,lang,poolingStage);
  document.querySelector('#pool-status').textContent=`${poolingStage} / 3`;
  document.querySelector('[data-pool-action="previous"]').disabled=poolingStage<=1;
  document.querySelector('[data-pool-action="next"]').disabled=poolingStage>=3;
  document.querySelector('#pool-example').disabled=poolingValues.source!=='example';
}
function updateGeometryLab(){
  const output=document.querySelector('#geometry-output');
  if(!output || current!=='cnn') return;
  output.innerHTML=geometryLabOutput(geometryValues,lang,geometryStage);
  document.querySelector('#geometry-status').textContent=`${geometryStage} / 3`;
  document.querySelector('[data-geometry-action=previous]').disabled=geometryStage===1;
  document.querySelector('[data-geometry-action=next]').disabled=geometryStage===3;
}
function updateCnnChannels(){
  const output=document.querySelector('#channel-output');
  if(!output || current!=='cnn') return;
  output.innerHTML=cnnChannelsOutput(channelValues,lang,channelStage);
  document.querySelector('#channel-status').textContent=`${channelStage} / 3`;
  document.querySelector('[data-channel-action="next"]').disabled=channelStage>=3;
  document.querySelector('[data-channel-action="previous"]').disabled=channelStage<=1;
}
function updateSequenceLab(){
  const output=document.querySelector('#sequence-output');
  if(!output || current!=='rnn') return;
  output.innerHTML=sequenceLabOutput(sequenceValues,lang,sequenceStage);
  document.querySelector('#sequence-all-output').innerHTML=sequenceAllWeightsOutput(sequenceValues,lang);
  document.querySelector('#sequence-status').textContent=`${sequenceStage} / 8`;
  document.querySelector('[data-sequence-action="next"]').disabled=sequenceStage>=8;
  document.querySelector('[data-sequence-action="previous"]').disabled=sequenceStage<=1;
  updateArchitecture();
}
function updateRnnOutput(){
  const output=document.querySelector('#rnn-output-result');
  if(!output || current!=='rnn') return;
  output.innerHTML=rnnOutputResult(rnnOutputValues,lang,rnnOutputStage);
  document.querySelector('#rnn-output-status').textContent=`${rnnOutputStage} / 5`;
  document.querySelector('[data-rnn-output-action="next"]').disabled=rnnOutputStage>=5;
  document.querySelector('[data-rnn-output-action="previous"]').disabled=rnnOutputStage<=1;
}
function updateRnnFlow(){
  const output=document.querySelector('#rnn-flow-output');
  if(!output || current!=='rnn') return;
  output.innerHTML=rnnGradientOutput(rnnFlowValues,lang,rnnFlowStage);
  document.querySelector('#rnn-flow-status').textContent=`${rnnFlowStage} / 20`;
  document.querySelector('[data-rnn-flow-action="previous"]').disabled=rnnFlowStage<=0;
  document.querySelector('[data-rnn-flow-action="next"]').disabled=rnnFlowStage>=20;
}
function updateLstm(){
  const output=document.querySelector('#lstm-output');
  if(!output || current!=='rnn') return;
  output.innerHTML=lstmOutput(lstmValues,lang,lstmStage);
  document.querySelector('#lstm-status').textContent=`${lstmStage} / 4`;
  document.querySelector('[data-lstm-action="previous"]').disabled=lstmStage<=1;
  document.querySelector('[data-lstm-action="next"]').disabled=lstmStage>=4;
}
function updateGru(){
  const output=document.querySelector('#gru-output');
  if(!output || current!=='rnn') return;
  output.innerHTML=gruOutput(gruValues,lang,gruStage);
  document.querySelector('#gru-status').textContent=`${gruStage} / 3`;
  document.querySelector('[data-gru-action="previous"]').disabled=gruStage<=1;
  document.querySelector('[data-gru-action="next"]').disabled=gruStage>=3;
}
function updateCalculation(){
  const lines=example(current,params[current],lang).split('<br>');
  document.querySelector('#result').innerHTML=lines.slice(0,calculationStep).join('<br>');
  const status=document.querySelector('#calculation-status');
  status.textContent=`${Math.min(calculationStep,lines.length)} / ${lines.length}`;
  const button=document.querySelector('#calculation-next');
  button.disabled=calculationStep>=lines.length;
}

function updateEmbeddingLab(){
  const output=document.querySelector('#embedding-output');
  if(!output || current!=='transformer') return;
  output.innerHTML=embeddingOutput(embeddingOrder,lang,embeddingStage);
  document.querySelector('#embedding-status').textContent=`${embeddingStage} / 3`;
  document.querySelector('[data-embedding-action="previous"]').disabled=embeddingStage<=1;
  document.querySelector('[data-embedding-action="next"]').disabled=embeddingStage>=3;
}
function updateAttentionLab(){
  const output=document.querySelector('#attn-output');
  if(!output || current!=='transformer') return;
  output.innerHTML=attentionOutput(attentionValues,lang,attentionStage);
  document.querySelector('#multihead-output').innerHTML=multiHeadOutput(attentionValues,lang);
  document.querySelector('#attn-status').textContent=`${attentionStage} / 11`;
  document.querySelector('[data-attn-action="next"]').disabled=attentionStage>=11;
  document.querySelector('[data-attn-action="previous"]').disabled=attentionStage<=1;
}
function updateTransformerBlock(){
  const output=document.querySelector('#block-output');
  if(!output || current!=='transformer') return;
  output.innerHTML=transformerBlockOutput(blockValues,lang,blockStage);
  document.querySelector('#linked-block-output').innerHTML=linkedBlockOutput(blockValues,lang);
  document.querySelector('#block-status').textContent=`${blockStage} / 4`;
  document.querySelector('[data-block-action="next"]').disabled=blockStage>=4;
  document.querySelector('[data-block-action="previous"]').disabled=blockStage<=1;
  updateArchitecture();
}
function updateGanTrainingLab(){
  const output=document.querySelector('#gantrain-output');
  if(!output || current!=='gan') return;
  output.innerHTML=ganTrainingOutput(ganTrainingValues,lang,ganTrainingStage);
  syncLabCalculation(output);
  document.querySelector('#gantrain-status').textContent=`${ganTrainingStage} / 5`;
  document.querySelector('[data-gantrain-action="next"]').disabled=ganTrainingStage>=5;
  document.querySelector('[data-gantrain-action="previous"]').disabled=ganTrainingStage<=1;
}
function updateGanModesLab(){
  const output=document.querySelector('#ganmodes-output');
  if(!output || current!=='gan') return;
  output.innerHTML=ganModesOutput(ganModesValues,lang,ganModesStage);
  syncLabCalculation(output);
  document.querySelector('#ganmodes-status').textContent=`${ganModesStage} / 3`;
  document.querySelector('[data-ganmodes-action="next"]').disabled=ganModesStage>=3;
  document.querySelector('[data-ganmodes-action="previous"]').disabled=ganModesStage<=1;
}

function updateTokenSequence(){
  const output=document.querySelector('#token-sequence-output');
  if(!output || current!=='transformer') return;
  output.innerHTML=tokenSequenceOutput(tokenChoice,lang,tokenSequenceStage,tokenTargetProbability);
  document.querySelector('#token-sequence-status').textContent=`${tokenSequenceStage} / 3`;
  document.querySelector('[data-token-sequence-action="next"]').disabled=tokenSequenceStage>=3;
  document.querySelector('[data-token-sequence-action="previous"]').disabled=tokenSequenceStage<=1;
}
function updateSampling(){
  const output=document.querySelector('#sample-output');
  if(!output || current!=='transformer') return;
  output.innerHTML=samplingOutput(sampleValues,lang,sampleStage);
  document.querySelector('#sample-status').textContent=`${sampleStage} / 4`;
  document.querySelector('[data-sample-action="previous"]').disabled=sampleStage<=1;
  document.querySelector('[data-sample-action="next"]').disabled=sampleStage>=4;
}
function architectureValues(){
  return current==='cnn'?convolutionValues:current==='rnn'?sequenceValues:blockValues;
}
function updateArchitecture(){
  if(!Object.hasOwn(architectureStages,current)) return;
  const diagram=document.querySelector('#architecture-diagram');
  if(!diagram) return;
  const values=architectureValues(),stage=architectureStages[current];
  const focusStep=diagram.contains?.(document.activeElement)?document.activeElement?.dataset?.architectureStep:null;
  diagram.innerHTML=architectureDiagram(current,lang,values,stage);
  document.querySelector('#architecture-detail').innerHTML=architectureDetail(current,lang,values,stage);
  const count=architectureModel(current,values,lang).names.length;
  document.querySelector('#architecture-status').textContent=`${stage+1} / ${count}`;
  document.querySelector('[data-architecture-action="previous"]').disabled=stage===0;
  document.querySelector('[data-architecture-action="next"]').disabled=stage===count-1;
  const value=current==='cnn'?values.strength:current==='rnn'?values.x2:values.x1;
  document.querySelector('#architecture-input').value=value;
  document.querySelector('#architecture-value').textContent=fmt(value);
  updateFormula(document,current,values,lang,formulaStages[current]);
  if(focusStep!==null && focusStep!==undefined) diagram.querySelector(`[data-architecture-step="${focusStep}"]`)?.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-early-action]');
  if(!button)return;
  const action=button.dataset.earlyAction;
  if(action==='reset')earlyState=earlyInitial(earlyState.patience);
  else if(action==='restore' && earlyState.stopped)earlyState={...earlyState,restored:true};
  else if(action==='next')earlyState=earlyNext(earlyState);
  updateEarlyLab();
});
document.addEventListener('input',e=>{
  const input=e.target.closest('[data-early-patience]');
  if(!input || earlyState.history.length>1)return;
  earlyState=earlyInitial(Number(input.value));
  updateEarlyLab();
});

document.addEventListener('click',e=>{
  const jump=e.target.closest('[data-architecture-jump]');
  if(jump){
    const target=document.getElementById(jump.dataset.architectureJump);
    if(target){target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});}
    return;
  }
  const node=e.target.closest('[data-architecture-step]');
  const action=e.target.closest('[data-architecture-action]');
  if(!node && !action) return;
  const max=architectureModel(current,architectureValues(),lang).names.length-1;
  architectureStages[current]=node?Number(node.dataset.architectureStep):Math.max(0,Math.min(max,architectureStages[current]+(action.dataset.architectureAction==='next'?1:-1)));
  formulaStages[current]=formulaWalkthrough(current,architectureValues(),lang).steps.findIndex(step=>step.group===architectureStages[current]);
  updateArchitecture();
  const selected=document.querySelector(`[data-architecture-step="${architectureStages[current]}"]`);
  if(node) selected?.focus({preventScroll:true});
  const viewport=document.querySelector('#architecture-viewport');
  if(selected && viewport){
    const box=selected.getBoundingClientRect(),view=viewport.getBoundingClientRect();
    if(box.right>view.right) viewport.scrollLeft+=box.right-view.right+12;
    if(box.left<view.left) viewport.scrollLeft-=view.left-box.left+12;
  }
});
document.addEventListener('input',e=>{
  const input=e.target.closest('[data-architecture-input]');
  if(!input) return;
  const value=Number(input.value);
  if(current==='cnn'){
    convolutionValues.strength=value;
    document.querySelector('#conv-strength').value=value;
    document.querySelector('#conv-value-strength').textContent=value.toFixed(2);
    updateConvolutionLab(); updatePoolingLab();
  }else if(current==='rnn'){
    sequenceValues.x2=value;
    document.querySelector('#sequence-x2').value=value;
    document.querySelector('#sequence-value-x2').textContent=fmt(value);
    updateSequenceLab();
  }else if(current==='transformer'){
    blockValues.x1=value;
    document.querySelector('#block-x1').value=value;
    document.querySelector('#block-value-x1').textContent=fmt(value);
    updateTransformerBlock();
  }
});
document.addEventListener('click',e=>{
  if(!Object.hasOwn(formulaStages,current))return;
  const next=formulaAction(e,formulaStages[current],formulaWalkthrough(current,architectureValues(),lang).steps.length);
  if(next===null)return;
  const jumped=Boolean(e.target.closest('[data-formula-jump]'));
  formulaStages[current]=next;
  architectureStages[current]=formulaWalkthrough(current,architectureValues(),lang).steps[next].group;
  updateArchitecture();
  if(jumped){const title=document.querySelector('#formula-current-title');title.focus({preventScroll:true});title.scrollIntoView({block:'start'});}
});
document.addEventListener('change',e=>{
  const select=e.target.closest('[data-formula-select]');
  if(!select||!Object.hasOwn(formulaStages,current))return;
  formulaStages[current]=Number(select.value);
  architectureStages[current]=formulaWalkthrough(current,architectureValues(),lang).steps[formulaStages[current]].group;
  updateArchitecture();
});
document.addEventListener('input',e=>{
  const input=e.target.closest('[data-formula-dimension]');
  if(!input)return;
  const d=Number(input.value);
  document.querySelector('#formula-dimension-value').textContent=d;
  document.querySelector('#formula-scale-result').innerHTML=formulaScaleResult(d,lang);
});
function render(){
  const tocOpen=Boolean(document.querySelector('#unit-contents')?.open);
  const t=ui[lang], index=chapters.findIndex(c=>c.id===current), chapter=chapters[index], content=chapter[lang];
  document.documentElement.lang=lang;
  document.title=`${content.name} — Model Atlas`;
  document.querySelector('#language').textContent=lang==='ko'?'EN':'한국어';
  document.querySelector('#language').setAttribute('aria-label',lang==='ko'?'영어로 전환':'Switch to Korean');
  document.querySelector('#skip-to-content').textContent=lang==='ko'?'본문으로 건너뛰기':'Skip to content';
  document.querySelector('#navigation').setAttribute('aria-label',lang==='ko'?'단원 탐색':'Course navigation');
  document.querySelector('#concept-library-link').textContent=lang==='ko'?'개념 찾아보기 →':'Concept library →';
  document.querySelector('#extended-path-link').textContent=lang==='ko'?'데이터·언어·영상 확장 경로 →':'Extended path: data, language and vision →';
  document.querySelector('#path-label').textContent=t.path;
  document.querySelector('#side-note').textContent=t.note;
  document.querySelector('#progress-label').textContent=t.progress;
  document.querySelector('#navigation').innerHTML=chapters.map((c,i)=>`<button class="nav-item ${c.id===current?'active':''}" data-nav="${c.id}" ${c.id===current?'aria-current="page"':''}><span class="num">${String(i).padStart(2,'0')}</span><span>${esc(c[lang].name)}</span></button>`).join('');
  document.querySelector('#formula-navigation').innerHTML=formulaSidebar(lang,{current});
  const related=`<div class="concept-related">${lang==='ko'?'이 단원과 연결되는 개념:':'Related concepts:'} ${relatedConcepts[current].map(([id,ko,en])=>`<a href="concepts.html#${id}">${esc(lang==='ko'?ko:en)}</a>`).join('')}</div>`;
  const route=`<section class="beginner-route" aria-labelledby="route-title"><h2 id="route-title">${lang==='ko'?'처음이라면 이 순서로':'A suggested first pass'}</h2><p>${lang==='ko'?'항목을 선택해 해당 위치로 이동하세요. 나머지 계산은 단원 목차에서 이어 볼 수 있습니다.':'Select an item to go to that section. Find the remaining calculations in the unit contents.'}</p><ol role="list">${beginnerRoutes[current].map(([id,ko,en])=>`<li><button type="button" data-route-jump="${esc(id)}">${esc(lang==='ko'?ko:en)}</button></li>`).join('')}</ol></section>`;

  const cards=content.steps.map((s,i)=>`<article class="step"><button class="step-head" data-step="${i}" aria-expanded="${expanded===i}" aria-controls="step-${i}"><span class="step-number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s[0])}</strong><small>${esc(s[1])}</small></span><span class="chevron">${expanded===i?'−':'+'}</span></button><div class="step-body" id="step-${i}" ${expanded===i?'':'hidden'}><p>${esc(s[2])}</p><div class="formula">${esc(s[3])}</div><div class="explain-grid">${[t.where,t.role,t.result].map((label,j)=>`<div><b>${label}</b><span>${esc(s[4+j])}</span></div>`).join('')}</div></div></article>`).join('');
  const controls=definitions[current].map(([key,min,max,step])=>`<div class="control"><label for="input-${key}"><span>${esc(t.labels[key])}</span><output id="value-${key}">${fmt(params[current][key])}</output></label><input type="range" id="input-${key}" data-param="${key}" min="${min}" max="${max}" step="${step}" value="${params[current][key]}"></div>`).join('');
  const deep=studyNotes[current];
  const notes=deep[lang].map(note=>`<details class="worked-note"><summary>${esc(note[0])}</summary><div class="formula">${esc(note[1])}</div><p><b>${lang==='ko'?'언제·왜 사용하나요?':'Where and why?'}</b> ${esc(note[2])}</p><p><b>${lang==='ko'?'숫자를 대입하면':'Worked example'}</b> ${esc(note[3])}</p><p><b>${lang==='ko'?'결과의 의미':'What the result means'}</b> ${esc(note[4])}</p>${note[5]?`<p><a href="${esc(note[5])}" target="_blank" rel="noopener noreferrer">${lang==='ko'?'이 예제의 참고 자료':'Reference for this example'} ↗</a></p>`:''}</details>`).join('');
  const questions=quizzes[current][lang].map((q,i)=>{
    const selected=quizSelections[current]?.[i], feedback=quizFeedback(current,lang,i,selected);
    return `<fieldset class="question"><legend>${i+1}. ${esc(q[0])}</legend><div class="answers">${q[1].map((answer,j)=>`<button type="button" data-quiz="${i}" data-choice="${j}" aria-pressed="${selected===j}" aria-describedby="quiz-result-${i}">${esc(answer)}</button>`).join('')}</div><p id="quiz-result-${i}" class="${feedback.className}" aria-live="polite">${esc(feedback.text)}</p></fieldset>`;
  }).join('');
  const resourceUrl=chapter.resource && ['cnn','diffusion','transformer','gan'].includes(current) ? `${chapter.resource}?lang=${lang}` : chapter.resource;
  const connection=chapter.resource?`<div class="lab-connection"><h3>${lang==='ko'?'계산 예제와 원본 연결하기':'Connect the calculation to the original'}</h3>${labConnections[current][lang].map(item=>`<p>${esc(item)}</p>`).join('')}</div>`:'';
  const resource=chapter.resource?`<details class="resource-panel" data-resource><summary id="resource-title"><span>${t.source}</span><span aria-hidden="true">＋</span></summary><p>${['cnn','diffusion','transformer','gan'].includes(current) ? (lang==='ko'?'주요 조작 문구는 한글로 표시됩니다. 원본의 긴 설명 일부는 영문이며, 인터넷 연결이 필요할 수 있습니다.':'The main controls are available in Korean or English. Some original explanations remain in English; an internet connection may be needed.') : (lang==='ko'?'원본 실습은 영문입니다. 아래 한글 안내를 따라 실습할 수 있으며, 일부 기능은 인터넷 연결이 필요합니다.':'The original tool is in English. Follow the guide below; some features require an internet connection.')}</p><ol class="lab-guide">${labGuides[current][lang].map(item=>`<li>${esc(item)}</li>`).join('')}</ol>${connection}<a href="${resourceUrl}" target="_blank" rel="noopener noreferrer">${t.open}</a>${current==='gan'?`<p>${lang==='ko'?'작은 화면에서는 위 링크로 원본을 열어 설명 글을 화면 폭에 맞게 읽을 수 있습니다.':'On a small screen, open the original using the link above to read its article at the screen width.'}</p>`:''}${current==='transformer'?`<p><a data-transformer-article href="${resourceUrl}&amp;view=article" target="_blank" rel="noopener noreferrer">${lang==='ko'?'Transformer 설명 글만 읽기 (작은 화면에 맞춤)':'Read the Transformer article (fits small screens)'} ↗</a></p>`:''}<div class="lab-diagnostic" data-lab-diagnostic role="status" hidden><p>${lang==='ko'?'마지막 확인에서 원본 실습 페이지를 찾지 못했습니다. 로컬에서 실행 중이라면 프로젝트 폴더에서 아래 명령을 실행한 후 다시 확인하세요. 서버에 배포했다면 원본 파일과 경로를 확인하세요.':'The last check could not find the original lab page. For a local setup, run the command below in the project directory and retry. On a hosted site, check the deployed files and path.'}</p><code>python scripts/bootstrap.py --build</code><p>${lang==='ko'?'이 확인은 실습의 진입 페이지만 검사합니다. 모델과 다른 파일의 정상 작동까지 보장하지는 않습니다.':'This checks only the lab entry page; it does not verify models or other assets.'}</p><button type="button" data-lab-retry>${lang==='ko'?'다시 확인':'Retry'}</button></div><p class="lab-scroll-help" id="lab-scroll-help">${lang==='ko'?'원본은 넓은 화면용입니다. 좌우로 밀거나 버튼을 눌러 숨은 부분을 보세요. 일부 조작은 마우스가 필요할 수 있습니다.':'The original uses a wide layout. Swipe horizontally or use the buttons to see the rest. Some interactions may require a mouse.'}</p><div class="lab-scroll-controls" aria-label="${lang==='ko'?'실습 화면 가로 이동':'Move the lab horizontally'}"><button type="button" data-lab-scroll="left" aria-controls="lab-viewport">← ${lang==='ko'?'왼쪽':'Left'}</button><button type="button" data-lab-scroll="right" aria-controls="lab-viewport">${lang==='ko'?'오른쪽':'Right'} →</button></div><div id="lab-viewport" class="lab-viewport" role="region" tabindex="0" aria-label="${lang==='ko'?'좌우로 이동하는 실습 화면':'Horizontally scrollable lab'}" aria-describedby="lab-scroll-help"><iframe class="lab-frame lab-frame-${current}" title="${esc(content.name)} ${lang==='ko'?'인터랙티브 실습':'interactive visualization'}" data-src="${resourceUrl}" loading="lazy"></iframe></div></details>`:'';
  const next=chapters[(index+1)%chapters.length];
  main.innerHTML=`<div class="breadcrumb">${t.crumb} / <span>${esc(content.name)}</span></div><section class="hero"><div><span class="chapter-tag">${esc(content.kicker)}</span><h1>${esc(content.name)}</h1><p>${esc(content.summary)}</p></div><div class="hero-index" aria-hidden="true">${String(index).padStart(2,'0')}</div></section><div class="overview"><strong>${t.goal}</strong><p>${esc(content.goal)}</p></div>${route}<details class="unit-contents" id="unit-contents" ${tocOpen?'open':''}><summary>${lang==='ko'?'이 단원의 목차':'In this unit'}</summary><div role="navigation" aria-label="${lang==='ko'?'단원 내 이동':'Navigate this unit'}" id="unit-contents-list"></div></details>${firstStepsMarkup(current,lang,firstValues[current])}<div class="section-heading"><div><span class="eyebrow">${lang==='ko'?'핵심 개념':'THE CONCEPT'}</span><h2 id="concept-title">${t.lesson}</h2></div><p>${t.lessonHint}</p></div><div class="steps">${cards}</div><details class="glossary"><summary id="symbols-title">${lang==='ko'?'수식 기호 살펴보기':'Understand the symbols'}</summary><p>${esc(glossary[current][lang])}</p></details>${architectureMarkup(current,lang,architectureValues(),chapter.resource)}<div class="section-heading"><div><span class="eyebrow">${lang==='ko'?'계산 예제':'WORKED EXAMPLES'}</span><h2 id="worked-title">${lang==='ko'?'수식을 조금 더 깊이':'Go deeper with the math'}</h2></div></div><div class="worked-list">${notes}</div><p class="source-note"><a href="${deep.source}" target="_blank" rel="noopener noreferrer">${lang==='ko'?'원리 참고 자료':'Reference for these concepts'} ↗</a></p><section class="lab"><div class="lab-top"><div><span class="eyebrow">${lang==='ko'?'직접 계산':'INTERACTIVE'} / ${t.input}</span><h2 id="main-lab-title">${t.lab}</h2><p>${t.labDesc}</p></div><span aria-hidden="true">↗</span></div><div class="controls">${controls}</div><div class="eyebrow">${t.output}</div><div class="result" id="result" aria-live="polite"></div><div class="lab-actions"><span id="calculation-status"></span><button id="calculation-next" data-calculate="next">${lang==='ko'?'다음 계산 보기':'Show next calculation'} →</button><button data-calculate="reset">${lang==='ko'?'처음부터':'Start over'}</button></div><p class="lab-note">${t.labNote}</p></section>${current==='foundation'?splitLabMarkup(splitChoice,lang)+gradientLabMarkup(gradientValues,lang,gradientStage)+trainingLabMarkup(trainingValues,lang)+batchLabMarkup(batchValues,lang)+earlyMarkup(earlyState,lang):''}${current==='rnn'?sequenceLabMarkup(sequenceValues,lang)+rnnOutputMarkup(rnnOutputValues,lang)+memoryMarkup(memoryState,lang)+tokenMarkup(tokenState,lang)+rnnGradientMarkup(rnnFlowValues,lang)+lstmMarkup(lstmValues,lang)+gruMarkup(gruValues,lang):''}${current==='cnn'?convolutionMarkup(convolutionValues,lang)+geometryLabMarkup(geometryValues,lang)+poolingMarkup(poolingValues,lang)+cnnChannelsMarkup(channelValues,lang):''}${current==='diffusion'?diffusionMarkup(diffusionValues,lang)+latentMarkup(latentValues,lang)+clipMarkup(clipValues,lang)+crossAttentionMarkup(crossQuery,lang)+conditioningMarkup(conditioningValues,lang):''}${current==='transformer'?embeddingMarkup(embeddingOrder,lang)+attentionMarkup(attentionValues,lang)+multiHeadMarkup(lang)+transformerBlockMarkup(blockValues,lang)+linkedBlockMarkup(lang)+tokenSequenceMarkup(tokenChoice,lang,tokenTargetProbability)+samplingMarkup(sampleValues,lang):''}${current==='gan'?ganTrainingMarkup(ganTrainingValues,lang)+ganModesMarkup(ganModesValues,lang):''}${resource}${related}<section class="quiz-section"><div class="section-heading"><div><span class="eyebrow">${lang==='ko'?'학습 확인':'CHECK YOUR UNDERSTANDING'}</span><h2 id="quiz-title">${lang==='ko'?'이해했는지 확인하기':'Check your understanding'}</h2></div><p>${lang==='ko'?'선택한 답은 이 페이지를 열어둔 동안 유지됩니다.':'Your choices stay while this page remains open.'}</p></div>${questions}</section><div class="next-row"><button class="next" data-nav="${next.id}">${index===chapters.length-1?t.last:t.next+': '+esc(next[lang].name)} →</button></div><footer>${t.footer} <a href="credits.html">${t.footerLink}</a>${t.footerEnd}</footer>`;
  mountCalculationRail(current,lang);
  const destinations=[...main.querySelectorAll('#first-steps-title, #architecture-title, #formula-title, #concept-title, #math-basics-title, #symbols-title, #worked-title, #main-lab-title, .sequence-lab > h2, #quiz-title, #resource-title')];
  destinations.forEach(target=>{if(target.tagName !== 'SUMMARY') target.setAttribute('tabindex','-1');});
  document.querySelector('#unit-contents-list').innerHTML=`<ol>${destinations.map(target=>`<li><button type="button" data-unit-jump="${esc(target.id)}">${esc((target.id==='resource-title'?target.firstElementChild.textContent:target.textContent).trim())}</button></li>`).join('')}</ol>`;
  updateCalculation();
  updateSequenceLab();
  updateMemory();
  updateTokenTraining();
  updateRnnOutput();
  updateRnnFlow();
  updateLstm();
  updateGru();
  updateConvolutionLab();
  updatePoolingLab();
  updateCnnChannels();
  updateGeometryLab();
  updateDiffusionLab();
  updateLatentLab();
  updateConditioningLab();
  updateCrossAttention();
  updateClipLab();
  updateEmbeddingLab();
  updateAttentionLab();
  updateTransformerBlock();
  updateTokenSequence();
  updateSampling();
  updateGanTrainingLab();
  updateGanModesLab();
  updateTrainingLab();
  updateBatchLab();
  updateSplitLab();
}
document.addEventListener('click',e=>{const tokenTrain=e.target.closest('[data-token-action]');if(tokenTrain){const action=tokenTrain.dataset.tokenAction;if(action==='reset'){tokenState.parameters=tokenInitial();tokenState.count=0;tokenState.last=null;}else {const count=Math.min(action==='ten'?10:1,200-tokenState.count);for(let i=0;i<count;i++){const result=tokenUpdate(tokenState.parameters,tokenState.rate);tokenState.parameters=result.next;tokenState.last={...result,rate:tokenState.rate};tokenState.count++;}}updateTokenTraining();return;}const memory=e.target.closest('[data-memory-action]');if(memory){const action=memory.dataset.memoryAction;if(action==='reset'){memoryState.parameters=memoryInitial();memoryState.count=0;memoryState.last=null;}else {const count=Math.min(action==='ten'?10:1,200-memoryState.count);for(let i=0;i<count;i++){const result=memoryUpdate(memoryState.parameters,memoryState.rate,memoryState.maxNorm);memoryState.parameters=result.next;memoryState.last={...result,rate:memoryState.rate};memoryState.count++;}}updateMemory();return;}const split=e.target.closest('[data-split-action]');if(split){const action=split.dataset.splitAction;if(action==='reset'){splitStage=1;splitChoice='';document.querySelector('#split-choice').value='';}else if(action==='previous' && splitStage>1 && splitStage<4)splitStage--;else if(action==='next' && splitStage<4 && (splitStage!==3 || splitChoice))splitStage++;updateSplitLab();return;}const rnnOutput=e.target.closest('[data-rnn-output-action]');if(rnnOutput){rnnOutputStage=rnnOutput.dataset.rnnOutputAction==='reset'?1:rnnOutput.dataset.rnnOutputAction==='previous'?Math.max(1,rnnOutputStage-1):Math.min(5,rnnOutputStage+1);updateRnnOutput();return;}const clip=e.target.closest('[data-clip-action]');if(clip){clipStage=clip.dataset.clipAction==='reset'?1:clip.dataset.clipAction==='previous'?Math.max(1,clipStage-1):Math.min(5,clipStage+1);updateClipLab();return;}const jump=e.target.closest('[data-unit-jump], [data-route-jump]');if(jump){const target=document.getElementById(jump.dataset.unitJump || jump.dataset.routeJump);if(target){target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});}return;}const geometry=e.target.closest('[data-geometry-action]');if(geometry){geometryStage=geometry.dataset.geometryAction==='reset'?1:geometry.dataset.geometryAction==='previous'?Math.max(1,geometryStage-1):Math.min(3,geometryStage+1);updateGeometryLab();return;}const batchSelect=e.target.closest('[data-batch-select]');if(batchSelect){batchIndex=batchSelect.dataset.batchSelect==='previous'?Math.max(0,batchIndex-1):Math.min(Math.ceil(3/batchValues.batchSize)-1,batchIndex+1);updateBatchLab();return;}const batchStep=e.target.closest('[data-batch-stage]');if(batchStep){batchStage=batchStep.dataset.batchStage==='previous'?Math.max(1,batchStage-1):Math.min(4,batchStage+1);updateBatchLab();return;}const pool=e.target.closest('[data-pool-action]');if(pool){poolingStage=pool.dataset.poolAction==='reset'?1:pool.dataset.poolAction==='previous'?Math.max(1,poolingStage-1):Math.min(3,poolingStage+1);updatePoolingLab();return;}const embedding=e.target.closest('[data-embedding-action]');if(embedding){embeddingStage=embedding.dataset.embeddingAction==='reset'?1:embedding.dataset.embeddingAction==='previous'?Math.max(1,embeddingStage-1):Math.min(3,embeddingStage+1);updateEmbeddingLab();return;}const latent=e.target.closest('[data-latent-action]');if(latent){latentStage=latent.dataset.latentAction==='reset'?1:latent.dataset.latentAction==='previous'?Math.max(1,latentStage-1):Math.min(5,latentStage+1);updateLatentLab();return;}const cfg=e.target.closest('[data-cfg-action]');if(cfg){conditioningStage=cfg.dataset.cfgAction==='reset'?1:cfg.dataset.cfgAction==='previous'?Math.max(1,conditioningStage-1):Math.min(4,conditioningStage+1);updateConditioningLab();return;}const sample=e.target.closest('[data-sample-action]');if(sample){sampleStage=sample.dataset.sampleAction==='reset'?1:sample.dataset.sampleAction==='previous'?Math.max(1,sampleStage-1):Math.min(4,sampleStage+1);updateSampling();return;}const gru=e.target.closest('[data-gru-action]');if(gru){gruStage=gru.dataset.gruAction==='reset'?1:gru.dataset.gruAction==='previous'?Math.max(1,gruStage-1):Math.min(3,gruStage+1);updateGru();return;}const lstm=e.target.closest('[data-lstm-action]');if(lstm){lstmStage=lstm.dataset.lstmAction==='reset'?1:lstm.dataset.lstmAction==='previous'?Math.max(1,lstmStage-1):Math.min(4,lstmStage+1);updateLstm();return;}const tokenAction=e.target.closest('[data-token-sequence-action]');if(tokenAction){tokenSequenceStage=tokenAction.dataset.tokenSequenceAction==='reset'?1:tokenAction.dataset.tokenSequenceAction==='previous'?Math.max(1,tokenSequenceStage-1):Math.min(3,tokenSequenceStage+1);updateTokenSequence();return;}const modes=e.target.closest('[data-ganmodes-action]');if(modes){ganModesStage=modes.dataset.ganmodesAction==='reset'?1:modes.dataset.ganmodesAction==='previous'?Math.max(1,ganModesStage-1):Math.min(3,ganModesStage+1);updateGanModesLab();return;}const cross=e.target.closest('[data-cross-action]');if(cross){crossStage=cross.dataset.crossAction==='reset'?1:cross.dataset.crossAction==='previous'?Math.max(1,crossStage-1):Math.min(3,crossStage+1);updateCrossAttention();return;}const block=e.target.closest('[data-block-action]');if(block){blockStage=block.dataset.blockAction==='reset'?1:block.dataset.blockAction==='previous'?Math.max(1,blockStage-1):Math.min(4,blockStage+1);updateTransformerBlock();return;}const channel=e.target.closest('[data-channel-action]');if(channel){channelStage=channel.dataset.channelAction==='reset'?1:channel.dataset.channelAction==='previous'?Math.max(1,channelStage-1):Math.min(3,channelStage+1);updateCnnChannels();return;}const flow=e.target.closest('[data-rnn-flow-action]');if(flow){rnnFlowStage=flow.dataset.rnnFlowAction==='reset'?0:flow.dataset.rnnFlowAction==='previous'?Math.max(0,rnnFlowStage-1):Math.min(20,rnnFlowStage+1);updateRnnFlow();return;}const stage=e.target.closest('[data-training-stage]');if(stage){trainingStage=stage.dataset.trainingStage==='previous'?Math.max(1,trainingStage-1):Math.min(4,trainingStage+1);updateTrainingLab();return;}const train=e.target.closest('[data-training-action]');if(train){if(train.dataset.trainingAction==='reset'){resetTrainingLab();trainingStage=1;}else if(trainingHistory.length<=20){const step=trainingStep(trainingValues.x,trainingValues.y,trainingWeight,trainingValues.rate);trainingWeight=step.nextWeight;trainingHistory.push({weight:trainingWeight,loss:step.nextLoss});}updateTrainingLab();return;}const scroll=e.target.closest('[data-lab-scroll]');if(scroll){const viewport=document.getElementById('lab-viewport');viewport.scrollBy({left:(scroll.dataset.labScroll==='right'?1:-1)*viewport.clientWidth*.8,behavior:'auto'});return;}const nav=e.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return;}const ganAction=e.target.closest('[data-gantrain-action]');if(ganAction){ganTrainingStage=ganAction.dataset.gantrainAction==='reset'?1:ganAction.dataset.gantrainAction==='previous'?Math.max(1,ganTrainingStage-1):Math.min(5,ganTrainingStage+1);updateGanTrainingLab();return;}const attnAction=e.target.closest('[data-attn-action]');if(attnAction){attentionStage=attnAction.dataset.attnAction==='reset'?1:attnAction.dataset.attnAction==='previous'?Math.max(1,attentionStage-1):Math.min(11,attentionStage+1);updateAttentionLab();return;}const diffAction=e.target.closest('[data-diff-action]');if(diffAction){diffusionStage=diffAction.dataset.diffAction==='reset'?1:diffAction.dataset.diffAction==='previous'?Math.max(1,diffusionStage-1):Math.min(7,diffusionStage+1);updateDiffusionLab();return;}const convAction=e.target.closest('[data-conv-action]');if(convAction){convolutionStage=convAction.dataset.convAction==='reset'?1:convAction.dataset.convAction==='previous'?Math.max(1,convolutionStage-1):Math.min(10,convolutionStage+1);updateConvolutionLab();return;}const sequenceAction=e.target.closest('[data-sequence-action]');if(sequenceAction){sequenceStage=sequenceAction.dataset.sequenceAction==='reset'?1:sequenceAction.dataset.sequenceAction==='previous'?Math.max(1,sequenceStage-1):Math.min(8,sequenceStage+1);updateSequenceLab();return;}const action=e.target.closest('[data-calculate]');if(action){calculationStep=action.dataset.calculate==='reset'?1:calculationStep+1;updateCalculation();return;}const answer=e.target.closest('[data-quiz]');if(answer){const i=Number(answer.dataset.quiz),selected=Number(answer.dataset.choice);(quizSelections[current] ||= [])[i]=selected;const feedback=quizFeedback(current,lang,i,selected),result=document.querySelector(`#quiz-result-${i}`);result.textContent=feedback.text;result.className=feedback.className;document.querySelectorAll(`[data-quiz="${i}"]`).forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.choice)===selected)));return;}const step=e.target.closest('[data-step]');if(step){const i=Number(step.dataset.step);expanded=expanded===i?-1:i;document.querySelectorAll('[data-step]').forEach(button=>{const open=Number(button.dataset.step)===expanded;button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;button.querySelector('.chevron').textContent=open?'−':'+';});}});
document.addEventListener('input',e=>{const tokenSample=e.target.closest('[data-token-sample]');if(tokenSample){tokenState.selected=Number(tokenSample.value);updateTokenTraining();return;}const tokenRate=e.target.closest('[data-token-rate]');if(tokenRate){tokenState.rate=Number(tokenRate.value);updateTokenTraining();return;}const memoryClip=e.target.closest('[data-memory-clip]');if(memoryClip){memoryState.maxNorm=memoryClip.value==='off'?null:Number(memoryClip.value);updateMemory();return;}const memoryRate=e.target.closest('[data-memory-rate]');if(memoryRate){memoryState.rate=Number(memoryRate.value);updateMemory();return;}const sequenceRate=e.target.closest('[data-sequence-preview-rate]');if(sequenceRate){sequenceValues.previewRate=Number(sequenceRate.value);document.querySelector('#sequence-preview-rate-value').textContent=fmt(sequenceValues.previewRate);updateSequenceLab();return;}const bias=e.target.closest('[data-training-bias]');if(bias){trainingValues.demoBias=Number(bias.value);document.querySelector('#training-bias-value').textContent=fmt(trainingValues.demoBias);updateTrainingLab();return;}const split=e.target.closest('[data-split-choice]');if(split && splitStage===3){splitChoice=split.value;updateSplitLab();return;}const rnnOutput=e.target.closest('[data-rnn-output-input]');if(rnnOutput){const key=rnnOutput.dataset.rnnOutputInput;rnnOutputValues[key]=Number(rnnOutput.value);document.querySelector(`#rnn-output-value-${key}`).textContent=fmt(rnnOutputValues[key]);updateRnnOutput();return;}const clip=e.target.closest('[data-clip-input]');if(clip){const key=clip.dataset.clipInput;clipValues[key]=Number(clip.value);document.querySelector(`#clip-value-${key}`).textContent=clipValues[key].toFixed(3);updateClipLab();return;}const geometry=e.target.closest('[data-geometry-input]');if(geometry){const key=geometry.dataset.geometryInput;geometryValues[key]=Number(geometry.value);document.querySelector(`#geometry-value-${key}`).textContent=geometry.value;updateGeometryLab();return;}const batchInput=e.target.closest('[data-batch-input]');if(batchInput){const key=batchInput.dataset.batchInput;batchValues[key]=Number(batchInput.value);if(key!=='batchSize')document.querySelector(`#batch-value-${key}`).textContent=batchValues[key].toFixed(3);updateBatchLab();return;}const poolSource=e.target.closest('[data-pool-source]');if(poolSource){poolingValues.source=poolSource.value;updatePoolingLab();return;}const poolExample=e.target.closest('[data-pool-example]');if(poolExample){poolingValues.example=Number(poolExample.value);document.querySelector('#pool-example-value').textContent=poolingValues.example.toFixed(2);updatePoolingLab();return;}const poolGradient=e.target.closest('[data-pool-gradient]');if(poolGradient){poolingValues.gradient=Number(poolGradient.value);document.querySelector('#pool-gradient-value').textContent=poolingValues.gradient.toFixed(2);updatePoolingLab();return;}const embedding=e.target.closest('[data-embedding-order]');if(embedding){embeddingOrder=embedding.value;updateEmbeddingLab();return;}const latent=e.target.closest('[data-latent-input]');if(latent){const key=latent.dataset.latentInput;latentValues[key]=Number(latent.value);document.querySelector(`#latent-value-${key}`).textContent=key==='size'?String(Number(latent.value)):Number(latent.value).toFixed(5);updateLatentLab();return;}const cfg=e.target.closest('[data-cfg-input]');if(cfg){conditioningValues[cfg.dataset.cfgInput]=Number(cfg.value);document.querySelector(`#cfg-value-${cfg.dataset.cfgInput}`).textContent=fmt(Number(cfg.value));updateConditioningLab();return;}const sampleMode=e.target.closest('[data-sample-mode]');if(sampleMode){sampleValues.mode=sampleMode.value;updateSampling();return;}const sample=e.target.closest('[data-sample-input]');if(sample){sampleValues[sample.dataset.sampleInput]=Number(sample.value);document.querySelector(`#sample-value-${sample.dataset.sampleInput}`).textContent=Number(sample.value).toFixed(3);updateSampling();return;}const gru=e.target.closest('[data-gru-input]');if(gru){gruValues[gru.dataset.gruInput]=Number(gru.value);document.querySelector(`#gru-value-${gru.dataset.gruInput}`).textContent=Number(gru.value).toFixed(3);updateGru();return;}const lstm=e.target.closest('[data-lstm-input]');if(lstm){lstmValues[lstm.dataset.lstmInput]=Number(lstm.value);document.querySelector(`#lstm-value-${lstm.dataset.lstmInput}`).textContent=Number(lstm.value).toFixed(3);updateLstm();return;}const tokenTarget=e.target.closest('[data-token-target-probability]');if(tokenTarget){tokenTargetProbability=Number(tokenTarget.value);document.querySelector('#token-target-value').textContent=tokenTargetProbability.toFixed(3);updateTokenSequence();return;}const token=e.target.closest('[data-token-choice]');if(token){tokenChoice=token.value;updateTokenSequence();return;}const modes=e.target.closest('[data-ganmodes-input]');if(modes){ganModesValues[modes.dataset.ganmodesInput]=Number(modes.value);document.querySelector(`#ganmodes-value-${modes.dataset.ganmodesInput}`).textContent=fmt(Number(modes.value));updateGanModesLab();return;}const cross=e.target.closest('[data-cross-input]');if(cross){crossQuery=Number(cross.value);document.querySelector('#cross-value').textContent=fmt(crossQuery);updateCrossAttention();return;}const blockActivation=e.target.closest('[data-block-activation]');if(blockActivation){blockValues.activation=blockActivation.value;updateTransformerBlock();return;}const block=e.target.closest('[data-block-input]');if(block){blockValues[block.dataset.blockInput]=Number(block.value);document.querySelector(`#block-value-${block.dataset.blockInput}`).textContent=fmt(Number(block.value));updateTransformerBlock();return;}const channel=e.target.closest('[data-channel-input]');if(channel){channelValues[channel.dataset.channelInput]=Number(channel.value);document.querySelector(`#channel-value-${channel.dataset.channelInput}`).textContent=Number(channel.value).toFixed(2);updateCnnChannels();return;}const flow=e.target.closest('[data-rnn-flow-input]');if(flow){rnnFlowValues[flow.dataset.rnnFlowInput]=Number(flow.value);document.querySelector(`#rnn-flow-value-${flow.dataset.rnnFlowInput}`).textContent=fmt(Number(flow.value));updateRnnFlow();return;}const training=e.target.closest('[data-training-input]');if(training){trainingValues[training.dataset.trainingInput]=Number(training.value);document.querySelector(`#training-value-${training.dataset.trainingInput}`).textContent=fmt(Number(training.value));if(!['evalX','evalY'].includes(training.dataset.trainingInput))resetTrainingLab();updateTrainingLab();return;}const ganInput=e.target.closest('[data-gantrain-input]');if(ganInput){ganTrainingValues[ganInput.dataset.gantrainInput]=Number(ganInput.value);document.querySelector(`#gantrain-value-${ganInput.dataset.gantrainInput}`).textContent=fmt(Number(ganInput.value));updateGanTrainingLab();return;}const mask=e.target.closest('[data-attn-mask]');if(mask){attentionValues.mask=mask.checked;updateAttentionLab();return;}const attn=e.target.closest('[data-attn-input]');if(attn){attentionValues[attn.dataset.attnInput]=Number(attn.value);document.querySelector(`#attn-value-${attn.dataset.attnInput}`).textContent=fmt(Number(attn.value));updateAttentionLab();return;}const diff=e.target.closest('[data-diff-input]');if(diff){diffusionValues[diff.dataset.diffInput]=Number(diff.value);document.querySelector(`#diff-value-${diff.dataset.diffInput}`).textContent=fmt(Number(diff.value));updateDiffusionLab();return;}const conv=e.target.closest('[data-conv-input]');if(conv){convolutionValues[conv.dataset.convInput]=Number(conv.value);document.querySelector(`#conv-value-${conv.dataset.convInput}`).textContent=Number(conv.value).toFixed(2);updateConvolutionLab();updatePoolingLab();return;}const allSteps=e.target.closest('[data-sequence-all-steps]');if(allSteps){sequenceValues.allSteps=allSteps.checked;updateSequenceLab();return;}const sequence=e.target.closest('[data-sequence-input]');if(sequence){sequenceValues[sequence.dataset.sequenceInput]=Number(sequence.value);document.querySelector(`#sequence-value-${sequence.dataset.sequenceInput}`).textContent=fmt(Number(sequence.value));updateSequenceLab();return;}const input=e.target.closest('[data-param]');if(!input)return;params[current][input.dataset.param]=Number(input.value);document.querySelector(`#value-${input.dataset.param}`).textContent=fmt(Number(input.value));updateCalculation();});
// A HEAD request can identify a missing entry page, but says nothing about its assets.
// Unsupported HEAD requests and network failures leave the original embed untouched.
async function checkLabEntry(panel) {
  const frame=panel.querySelector('iframe'), diagnostic=panel.querySelector('[data-lab-diagnostic]');
  const request=String(Number(panel.dataset.checkRequest || 0)+1);
  panel.dataset.checkRequest=request;
  try {
    const response=await fetch(frame.dataset.src,{method:'HEAD',cache:'no-store'});
    if(!panel.isConnected || panel.dataset.checkRequest!==request) return;
    if(response.status===404 || response.status===410) diagnostic.hidden=false;
    else if(response.ok) diagnostic.hidden=true;
  } catch {
    // Keep the last confirmed status when the new request cannot be checked.
  }
}
document.addEventListener('click',e=>{
  const retry=e.target.closest('[data-lab-retry]');
  if(!retry) return;
  const panel=retry.closest('[data-resource]'), frame=panel.querySelector('iframe');
  frame.src=frame.dataset.src;
  checkLabEntry(panel);
});
document.addEventListener('toggle',e=>{if(e.target.matches('[data-resource]')&&e.target.open){const frame=e.target.querySelector('iframe');if(!frame.getAttribute('src')){frame.src=frame.dataset.src;checkLabEntry(e.target);}}},true);
document.querySelector('#skip-to-content').addEventListener('click',e=>{e.preventDefault();main.focus();});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();navigate('foundation');});
document.addEventListener('click',e=>{
  const link=e.target.closest('[data-formula-start]');
  if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button>0)return;
  const kind=link.dataset.formulaStart;if(!Object.hasOwn(formulaStages,kind))return;
  e.preventDefault();formulaStages[kind]=0;architectureStages[kind]=0;
  if(current!==kind)navigate(kind);else updateArchitecture();
  const title=document.querySelector('#formula-title');title.focus({preventScroll:true});title.scrollIntoView({block:'start',behavior:'auto'});
});
document.querySelector('#language').addEventListener('click',()=>{lang=lang==='ko'?'en':'ko';localStorage.setItem('model-atlas-language',lang);render();});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(chapters.some(c=>c.id===id)&&id!==current){current=id;expanded=0;calculationStep=1;trainingStage=1;batchStage=1;batchIndex=0;splitStage=1;splitChoice='';sequenceStage=1;rnnOutputStage=1;rnnFlowStage=0;lstmStage=1;gruStage=1;convolutionStage=1;poolingStage=1;channelStage=1;diffusionStage=1;latentStage=1;conditioningStage=1;crossStage=1;clipStage=1;embeddingStage=1;attentionStage=1;blockStage=1;tokenSequenceStage=1;sampleStage=1;ganTrainingStage=1;ganModesStage=1;render();}});
render();
// Accept section links only for exercise headings or the active unit's formula journey.
// Ignore unknown or cross-unit targets rather than scrolling to an unrelated node.
if(location.search){
  const section=new URLSearchParams(location.search).get('section');
  const target=[...main.querySelectorAll('.sequence-lab > h2, #formula-title')].find(heading=>heading.id===section);
  if(target) requestAnimationFrame(()=>{target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});});
}



// Keep the direction experiment independent from the other training exercises.
document.addEventListener('input',e=>{
  const input=e.target.closest('[data-gradient-input]');
  if(!input)return;
  gradientValues[input.dataset.gradientInput]=Number(input.value);updateGradientLab();
});
document.addEventListener('click',e=>{
  const preset=e.target.closest('[data-gradient-preset]');
  if(preset){Object.assign(gradientValues,gradientPresets[preset.dataset.gradientPreset]);updateGradientLab();return;}
  const button=e.target.closest('[data-gradient-stage]');
  if(button){gradientStage=Math.max(1,Math.min(5,gradientStage+(button.dataset.gradientStage==='next'?1:-1)));updateGradientLab();}
});

document.addEventListener('input',e=>{
 const input=e.target.closest('[data-first-value]');if(!input)return;
 firstValues[input.dataset.firstValue]=Number(input.value);
 document.querySelector('#first-value-label').textContent=input.value;
 document.querySelector('#first-result').innerHTML=firstExperimentOutput(input.dataset.firstValue,Number(input.value),lang);
});
