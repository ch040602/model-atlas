import {conceptAnswerMarkup,interviewMarkup} from './learning-checks.js';
import {mountPracticeAnswers} from './practice-answers.js';
import {conceptFirstMarkup} from './concept-first-steps.js';
import {concepts} from './concepts-data.js';
import {formulaSidebar} from './sidebar-formulas.js';
import {pcaLabMarkup,pcaLabOutput} from './pca-lab.js';
import {batchNormPreview,batchNormMarkup,batchNormOutput} from './batchnorm-lab.js';
import {dropoutMarkup,dropoutOutput} from './dropout-lab.js';
import {treeLabMarkup,treeLabOutput} from './tree-lab.js';
import {bayesMarkup,bayesOutput} from './bayes-lab.js';
import {rocMarkup,rocOutput} from './roc-lab.js';
import {tfidfMarkup,tfidfOutput} from './tfidf-lab.js';
import {ragMarkup,ragOutput} from './rag-retrieval-lab.js';
import {iouMarkup,iouOutput} from './iou-lab.js';
import {skipgramInitial,skipgramStep,skipgramMarkup,skipgramOutput} from './skipgram-lab.js';
import {fgsmMarkup,fgsmOutput} from './fgsm-lab.js';
import {camMarkup,camOutput} from './cam-lab.js';
import {styleTransferMarkup,styleTransferOutput} from './style-transfer-lab.js';
import {optimizerInitial,optimizerStep,optimizerMarkup,optimizerOutput} from './optimizer-lab.js';
import {logisticInitial,logisticStep,logisticMarkup,logisticOutput} from './logistic-lab.js';
import {xorMarkup,xorOutput} from './xor-lab.js';
import {xorTrainingInitial,xorTrainingStep,xorTrainingMarkup,xorTrainingOutput} from './xor-training-lab.js';
import {vitInitial,vitCalculate,vitFirstPixel,vitMarkup,vitOutput} from './vit-patches-lab.js';

const groups={
  start:{ko:'학습의 출발점',en:'Getting started'},
  data:{ko:'데이터 준비',en:'Preparing data'},
  evaluation:{ko:'평가와 일반화',en:'Evaluation and generalization'},
  models:{ko:'전통적 머신러닝',en:'Classical machine learning'},
  network:{ko:'신경망의 구성',en:'Neural network components'},
  training:{ko:'학습과 최적화',en:'Training and optimization'},
  practice:{ko:'구현과 실습',en:'Implementation and practice'},
  extended:{ko:'확장 경로: 데이터·언어·영상',en:'Extended path: data, language and vision'}
};
const source='https://github.com/boost-devs/ai-tech-interview/blob/ee05fc3166a871cf2d4f749ce7bca2d6a9762305/answers/';
const main=document.querySelector('#main');
const search=document.querySelector('#concept-search');
if(window.matchMedia('(max-width: 820px)').matches) document.querySelector('#library-navigation').open=false;
let lang=localStorage.getItem('model-atlas-language')==='en'?'en':'ko';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected=()=>{
  let id;
  try{id=decodeURIComponent(location.hash.slice(1));}catch{id='';}
  return concepts.find(c=>c.id===id)||concepts[0];
};
const metricValues={tp:8,fp:2,fn:4,tn:6};
const clusterValues={a:0,b:8};
let pcaAngle=0;
let fgsmEpsilon=0.1;
const treeSettings={threshold:3,x:5};
const bayesSettings={features:[1,1,1],alpha:0};
let rocThreshold=0.6;
const tfidfSettings={addBird:false,documentIndex:0};
let ragChoice=0;
const iouSettings={x:2,threshold:0.5};
const camSettings={weight1:0.5,weight2:-1,bias:0.25};
const styleSettings={weight:1,rate:0.2,swap:false};
const skipgramSettings={vectors:skipgramInitial(),includeNegative:true,rate:0.1,last:null};
let optimizerState=optimizerInitial(), optimizerRate=0.1, optimizerLast=null;
let logisticState=logisticInitial(), logisticRate=0.5, logisticLast=null;
const xorSettings={input:0,activation:'relu'};
let xorTrainState=xorTrainingInitial(), xorTrainRate=1, xorTrainSelected=0, xorTrainLast=null;
const vitState=vitInitial();
let batchNormThird=1;
let batchNormState={mean:0,variance:1,count:0};
const dropoutSettings={p:0.5,mask:[1,0,1],mode:'train'};
// Link only to exercises that demonstrate this concept. Other topics retain a
// general course link instead of suggesting that a dedicated lab exists.
const conceptExercises={
  learning:['training-title','한 예제의 학습 과정','Training on one example'],
  splits:['split-title','데이터 분할과 모델 선택','Data splits and model selection'],
  metrics:['split-title','회귀 손실 비교','Comparing regression losses'],
  overfit:['early-title','검증 손실과 조기 종료','Validation loss and early stopping'],
  gradient:['training-title','예측부터 가중치 갱신까지','Prediction through weight update'],
  perplexity:['token-sequence-title','다음 토큰 손실과 퍼플렉시티','Next-token loss and perplexity'],
  'gradient-clipping':['memory-title','RNN 학습에서 기울기 클리핑','Gradient clipping during RNN training'],
  optimizers:['batch-title','미니배치와 가중치 갱신','Mini-batches and weight updates'],
  initialization:['training-title','초기 가중치와 학습률','Initial weight and learning rate'],
  activation:['conv-title','합성곱과 ReLU 계산','Convolution and ReLU'],
  loss:['conv-title','특징 맵에서 분류 손실까지','Feature map to classification loss'],
  'vision-transformer':['embedding-title','토큰과 위치 임베딩 계산','Token and position embedding calculation']
};
function metricsLab(){
  const ko=lang==='ko';
  const fields=[['tp',ko?'참 양성':'True positive'],['fp',ko?'거짓 양성':'False positive'],['fn',ko?'거짓 음성':'False negative'],['tn',ko?'참 음성':'True negative']];
  return '<section class="metric-lab"><h2 id="metrics-title">'+(ko?'분류 결과를 바꿔 보기':'Change the classification results')+'</h2><p>'+(ko?'먼저 기본 결과를 확인한 뒤 FP를 2에서 0으로 바꿔 보세요. 정밀도는 오르고 재현율은 그대로입니다. 이어서 FN을 바꾸어 재현율을 비교하세요. 양성 정답을 놓친 수는 거짓 음성입니다.':'First inspect the defaults, then change FP from 2 to 0: precision rises while recall stays the same. Next change FN and compare recall. A missed positive is a false negative.')+'</p><div class="metric-inputs">'+fields.map(([key,label])=>'<label>'+esc(label)+' ('+key.toUpperCase()+')<input data-metric="'+key+'" type="number" min="0" max="1000000" step="1" value="'+metricValues[key]+'"></label>').join('')+'</div><p id="metric-result" class="metric-result" aria-live="polite"></p><p>'+(ko?'분모가 0이면 해당 지표는 정의되지 않습니다. 실제 데이터에 맞는 오류 비용과 클래스 비율도 고려하세요.':'A metric is undefined if its denominator is zero. Also consider error costs and class prevalence.')+'</p><p><a href="#roc">'+(ko?'점수와 임계값에서 ROC까지 따라가기':'Follow scores and thresholds to ROC')+' →</a></p></section>';
}
function updateMetrics(){
  const out=document.querySelector('#metric-result');
  if(!out)return;
  const {tp,fp,fn,tn}=metricValues;
  if(Object.values(metricValues).some(v=>!Number.isInteger(v)||v<0||v>1000000)){
    out.textContent=lang==='ko'?'각 칸에 0부터 1,000,000까지의 정수를 입력하세요.':'Enter integers from 0 to 1,000,000 in each field.';
    return;
  }
  const ratio=(a,b)=>b?((a/b)*100).toFixed(1)+'%':(lang==='ko'?'정의되지 않음':'undefined');
  out.textContent=(lang==='ko'?'정밀도':'Precision')+' = TP / (TP + FP) = '+ratio(tp,tp+fp)+' · '+(lang==='ko'?'재현율':'Recall')+' = TP / (TP + FN) = '+ratio(tp,tp+fn)+' · '+(lang==='ko'?'정확도':'Accuracy')+' = (TP + TN) / '+(lang==='ko'?'전체':'total')+' = '+ratio(tp+tn,tp+fp+fn+tn);
}
function clusterLab(){
  const ko=lang==='ko';
  return '<section class="metric-lab"><h2 id="cluster-title">'+(ko?'K-means 한 번 따라가기':'One K-means iteration')+'</h2><p>'+(ko?'점은 0, 2, 8, 10으로 고정합니다. 중심 A와 B를 바꾸면 ① 가까운 중심에 할당하고 ② 각 군집의 평균으로 중심을 옮깁니다. 거리가 같으면 A에 할당합니다.':'The points are fixed at 0, 2, 8, 10. Change centers A and B: ① assign each point to the nearest center, then ② move each center to its cluster mean. Ties go to A.')+'</p><div class="metric-inputs">'+['a','b'].map(key=>'<label>'+(ko?'중심 ':'Center ')+key.toUpperCase()+'<input data-cluster="'+key+'" type="number" min="-20" max="20" step="any" value="'+clusterValues[key]+'"></label>').join('')+'</div><p id="cluster-result" class="metric-result" aria-live="polite"></p><p>'+(ko?'빈 군집의 중심은 이 예제에서 그대로 둡니다. 이동 후 할당이 바뀔 수 있으므로 실제 알고리즘은 할당과 이동을 반복합니다.':'This example leaves an empty cluster’s center unchanged. Assignments may change after moving centers, so the algorithm repeats assignment and updates.')+'</p></section>';
}
function updateClusters(){
  const out=document.querySelector('#cluster-result');
  if(!out)return;
  const {a,b}=clusterValues, ko=lang==='ko';
  if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>20||Math.abs(b)>20){
    out.textContent=ko?'−20부터 20까지의 숫자를 입력하세요.':'Enter numbers from −20 to 20.';
    return;
  }
  const groups=[[],[]];
  for(const x of [0,2,8,10]) groups[Math.abs(x-a)<=Math.abs(x-b)?0:1].push(x);
  const centers=groups.map((g,i)=>g.length?g.reduce((sum,x)=>sum+x,0)/g.length:[a,b][i]);
  const sse=(cs)=>groups.reduce((sum,g,i)=>sum+g.reduce((s,x)=>s+(x-cs[i])**2,0),0);
  const show=n=>Number(n.toFixed(3)).toString();
  out.textContent=(ko?'① 할당: ':'① Assignment: ')+'A ['+groups[0].join(', ')+'], B ['+groups[1].join(', ')+'] · '+(ko?'② 새 중심: ':'② New centers: ')+'A='+show(centers[0])+', B='+show(centers[1])+' · '+(ko?'같은 할당에서 제곱거리 합: ':'Squared-distance sum with these assignments: ')+show(sse([a,b]))+' → '+show(sse(centers));
}
function renderList(){
  const q=search.value.trim().toLocaleLowerCase();
  const filtered=concepts.filter(c=>[c.ko,c.en,c.exKo,c.exEn,c.tryKo,c.tryEn].some(s=>s.toLocaleLowerCase().includes(q)));
  const active=selected().id;
  document.querySelector('#library-list').innerHTML=Object.entries(groups).map(([id,name])=>{
    const entries=filtered.filter(c=>c.group===id);
    return entries.length?'<div class="library-group">'+esc(name[lang])+'</div>'+entries.map(c=>'<a href="#'+esc(c.id)+'" '+(c.id===active?'aria-current="page"':'')+'>'+esc(c[lang])+'</a>').join(''):'';
  }).join('')||'<p class="library-empty">'+(lang==='ko'?'검색 결과가 없습니다.':'No concepts found.')+'</p>';
}
function render(){
  document.querySelector('#formula-navigation').innerHTML=formulaSidebar(lang);
  const c=selected(), ko=lang==='ko';
  document.documentElement.lang=lang;
  document.title=c[lang]+' — Model Atlas';
  document.querySelector('#language').textContent=ko?'EN':'한국어';
  document.querySelector('#language').setAttribute('aria-label',ko?'영어로 전환':'Switch to Korean');
  document.querySelector('#skip-to-content').textContent=ko?'본문으로 건너뛰기':'Skip to content';
  document.querySelector('#back-course').textContent=ko?'← 학습 경로':'← Learning path';
  document.querySelector('#library-summary').textContent=ko?'개념 찾아보기':'Concept library';
  document.querySelector('#search-label').textContent=ko?'개념 검색':'Search concepts';
  document.querySelector('#library-list').setAttribute('aria-label',ko?'개념 탐색':'Concept navigation');
  search.placeholder=ko?'예: 정규화, PCA':'e.g. normalization, PCA';
  const refs=[];
  if(c.ml.length)refs.push('<a href="'+source+'2-machine-learning.md" target="_blank" rel="noopener noreferrer">Machine learning: '+c.ml.map(n=>'#'+n).join(', ')+' ↗</a>');
  if(c.dl.length)refs.push('<a href="'+source+'3-deep-learning.md" target="_blank" rel="noopener noreferrer">Deep learning: '+c.dl.map(n=>'#'+n).join(', ')+' ↗</a>');
  if(c.reference)refs.push('<a href="'+esc(c.reference)+'" target="_blank" rel="noopener noreferrer">'+(ko?'주제별 참고 자료':'Topic reference')+' ↗</a>');
  if(c.id==='gradient-clipping')refs.push('<a href="https://proceedings.mlr.press/v28/pascanu13.html" target="_blank" rel="noopener noreferrer">Gradient clipping research ↗</a>');
  if(c.id==='perplexity')refs.push('<a href="https://huggingface.co/docs/transformers/perplexity" target="_blank" rel="noopener noreferrer">Perplexity guide ↗</a>');
  if(c.id==='pose-tracking')refs.push('<a href="https://arxiv.org/abs/1812.08008" target="_blank" rel="noopener noreferrer">OpenPose ↗</a>');
  if(c.id==='scene-reconstruction')refs.push('<a href="https://arxiv.org/abs/2308.04079" target="_blank" rel="noopener noreferrer">3D Gaussian Splatting ↗</a>');
  const index=concepts.indexOf(c), previous=concepts[index-1], next=concepts[index+1];
  const sequence='<div class="concept-sequence">'+(previous?'<a href="#'+esc(previous.id)+'">← '+esc(ko?'이전 개념: ':'Previous: ')+esc(previous[lang])+'</a>':'')+(next?'<a href="#'+esc(next.id)+'">'+esc(ko?'다음 개념: ':'Next: ')+esc(next[lang])+' →</a>':'')+'</div>';
  const exercise=conceptExercises[c.id];
  const courseLink=exercise
    ? '<h2>'+(ko?'관련 계산 실습':'Related worked exercise')+'</h2><p>'+(ko?'이 개념과 연결되는 계산을 단원에서 직접 따라가 보세요.':'Follow a related calculation in the course.')+'</p><a class="next" href="index.html?section='+esc(exercise[0])+'#'+esc(c.chapter)+'">'+esc(ko?exercise[1]:exercise[2])+' →</a>'
    : '<h2>'+(ko?'학습 경로로 돌아가기':'Return to the learning path')+'</h2><p>'+(ko?'이 개념은 위 설명과 예제로 소개합니다. 학습 경로에서 모델별 계산도 살펴볼 수 있습니다.':'This concept is introduced in the explanation and example above. You can also explore model calculations in the course.')+'</p><a class="next" href="index.html#'+esc(c.chapter)+'">'+(ko?'단원 열기':'Open unit')+' →</a>';
  const extra=c.id==='big-data-context'?'<p class="sequence-fixed">'+(ko?'추천 순서: 데이터 → MLP → 단어 표현 → 문맥·언어 모델 → 검색 → 영상 과제. 각 페이지의 다음 개념을 누르세요. 기존 모델 단원은 언제든 연결됩니다.':'Suggested order: data → MLP → word representations → context and language models → retrieval → vision tasks. Use Next on each page; model chapters remain available throughout.')+'</p>'
    :c.id==='nonlinear-mlp'?'<p class="sequence-fixed">'+(ko?'직접 체험: Playground에서 분류와 XOR 모양 데이터를 선택하고 은닉층·활성화를 바꾸어 재생해 보세요. 결과는 초기화와 설정에 따라 달라집니다.':'Try it: choose classification and the XOR-shaped data in Playground; change hidden layers and activation, then press play. Results vary with initialization and settings.')+' <a href="https://playground.tensorflow.org/" target="_blank" rel="noopener noreferrer">TensorFlow Playground ↗</a> · <a href="https://github.com/tensorflow/playground" target="_blank" rel="noopener noreferrer">GitHub ↗</a></p>'
    :c.id==='word-vectors'?'<p class="sequence-fixed">'+(ko?'직접 체험: Projector에서 제공되는 데이터를 선택하고 단어와 이웃을 검색해 보세요. 2차원 투영 거리는 원래 고차원 관계와 다를 수 있습니다.':'Try it: select a supplied dataset in Projector and search for a word and its neighbors. Two-dimensional projected distances may differ from the original high-dimensional relationships.')+' <a href="https://projector.tensorflow.org/" target="_blank" rel="noopener noreferrer">Embedding Projector ↗</a> · <a href="https://github.com/tensorflow/embedding-projector-standalone" target="_blank" rel="noopener noreferrer">GitHub ↗</a></p>'
    :c.id==='detection-models'?'<p class="sequence-fixed">'+(ko?'직접 체험: 공식 DETR 저장소의 Notebooks에서 추론 Colab을 열어 객체 상자와 어텐션을 확인할 수 있습니다. 외부 서비스와 모델 다운로드가 필요하며 실행 환경에 따라 수정이 필요할 수 있습니다.':'Try it: open the inference Colab under Notebooks in the official DETR repository to inspect boxes and attention. It requires an external service and model downloads; environment changes may require adjustments.')+' <a href="https://github.com/facebookresearch/detr#notebooks" target="_blank" rel="noopener noreferrer">DETR GitHub / Notebooks ↗</a></p>':'';
  main.innerHTML='<div class="breadcrumb">'+esc(ko?'개념 찾아보기':'CONCEPT LIBRARY')+' / '+esc(groups[c.group][lang])+'</div><h1>'+esc(c[lang])+'</h1>'+conceptFirstMarkup(c,lang)+extra+'<h2>'+(ko?'어떤 개념인가요?':'What is it?')+'</h2><p>'+esc(ko?c.exKo:c.exEn)+'</p><div class="example-card"><h2>'+(ko?'직접 생각해 보기':'Work through an example')+'</h2><p>'+esc(ko?c.tryKo:c.tryEn)+'</p>'+conceptAnswerMarkup(c.id,lang)+'</div>'+(c.id==='metrics'?metricsLab():c.id==='kmeans'?clusterLab():c.id==='pca'?pcaLabMarkup(pcaAngle,lang):c.id==='trees'?treeLabMarkup(treeSettings,lang):c.id==='text-counts'?tfidfMarkup(tfidfSettings,lang):c.id==='batchnorm'?batchNormMarkup(batchNormThird,lang)+dropoutMarkup(dropoutSettings,lang):'')+interviewMarkup(c.id,lang)+courseLink+sequence+'<h2>'+(ko?'더 살펴보기':'References')+'</h2><p class="source-note">'+(ko?'참고 자료: ':'References: ')+refs.join(' · ')+'</p><p class="source-note"><a href="https://scikit-learn.org/stable/user_guide.html" target="_blank" rel="noopener noreferrer">scikit-learn user guide ↗</a> · <a href="https://docs.pytorch.org/docs/stable/index.html" target="_blank" rel="noopener noreferrer">PyTorch documentation ↗</a> · <a href="credits.html">'+(ko?'출처 및 라이선스':'Credits and licenses')+'</a></p>';
  updateMetrics();
  updateClusters();
  if(c.id==='svm-bayes'){main.querySelector('.example-card').insertAdjacentHTML('afterend',bayesMarkup(bayesSettings,lang));updateBayes();}
  if(c.id==='roc'){main.querySelector('.example-card').insertAdjacentHTML('afterend',rocMarkup(rocThreshold,lang));updateRoc();}
  if(c.id==='detection-models'){main.querySelector('.example-card').insertAdjacentHTML('afterend',iouMarkup(iouSettings,lang));updateIoU();}
  if(c.id==='vision-cam'){main.querySelector('.example-card').insertAdjacentHTML('afterend',camMarkup(camSettings,lang));updateCam();}
  if(c.id==='style-transfer'){main.querySelector('.example-card').insertAdjacentHTML('afterend',styleTransferMarkup(styleSettings,lang));updateStyleTransfer();}
  if(c.id==='vision-transformer')main.querySelector('.example-card').insertAdjacentHTML('afterend',vitMarkup(vitState,lang));
  if(c.id==='nonlinear-mlp'){
    main.querySelector('.example-card').insertAdjacentHTML('afterend',xorMarkup(xorSettings,lang)+xorTrainingMarkup(xorTrainState,xorTrainRate,xorTrainSelected,lang));
    updateXorTraining();
  }
  if(c.id==='optimizers'){main.querySelector('.example-card').insertAdjacentHTML('afterend',optimizerMarkup(optimizerState,optimizerRate,lang));updateOptimizer();}
  if(c.id==='linear-models'){main.querySelector('.example-card').insertAdjacentHTML('afterend',logisticMarkup(logisticState,logisticRate,lang));updateLogistic();}
  if(c.id==='word-vectors'){main.querySelector('.example-card').insertAdjacentHTML('afterend',skipgramMarkup(skipgramSettings,lang));updateSkipgram();}
  if(c.id==='adversarial-examples'){main.querySelector('.example-card').insertAdjacentHTML('afterend',fgsmMarkup(fgsmEpsilon,lang));updateFgsm();}
  if(c.id==='pca')document.querySelector('#pca-output').innerHTML=pcaLabOutput(pcaAngle,lang);
  if(c.id==='trees')updateTree();
  if(c.id==='text-counts')updateTfidf();
  if(c.id==='retrieval-generation'){main.querySelector('.example-card').insertAdjacentHTML('afterend',ragMarkup(ragChoice,lang));updateRag();}
  if(c.id==='batchnorm'){updateBatchNorm();updateDropout();}
  mountPracticeAnswers(main,lang);
  renderList();
}
function updateFgsm(){document.querySelector('#fgsm-output').innerHTML=fgsmOutput(fgsmEpsilon,lang);}
function updateVit(){
  for(const p of vitCalculate(vitState.pixels)){
    const button=main.querySelector(`[data-vit-patch="${p.patch}"]`);
    button.setAttribute('aria-pressed',String(p.patch===vitState.patch));
    p.flat.forEach((value,i)=>button.querySelector(`[data-vit-pixel="${p.patch}-${i}"]`).textContent=value);
  }
  const value=vitState.pixels[vitFirstPixel(vitState.patch)];
  main.querySelector('#vit-pixel').value=value;
  main.querySelector('#vit-pixel-value').textContent=value;
  main.querySelector('#vit-output').innerHTML=vitOutput(vitState,lang);
}
main.addEventListener('input',e=>{
  if(e.target.matches('[data-vit-pixel-control]')){vitState.pixels[vitFirstPixel(vitState.patch)]=Number(e.target.value);updateVit();}
});
main.addEventListener('click',e=>{
  const button=e.target.closest('[data-vit-patch]');
  if(button){vitState.patch=Number(button.dataset.vitPatch);updateVit();}
});
function updateXorTraining(){
  document.querySelector('#xortrain-output').innerHTML=xorTrainingOutput(xorTrainState,xorTrainLast,xorTrainSelected,lang);
  document.querySelectorAll('[data-xortrain-action="one"], [data-xortrain-action="ten"], [data-xortrain-action="hundred"]').forEach(button=>button.disabled=xorTrainState.step>=500);
}
function updateLogistic(){
  document.querySelector('#logistic-output').innerHTML=logisticOutput(logisticState,logisticLast,lang);
  document.querySelectorAll('[data-logistic-action="one"], [data-logistic-action="ten"]').forEach(button=>button.disabled=logisticState.step>=100);
}
function updateOptimizer(){
  document.querySelector('#optimizer-output').innerHTML=optimizerOutput(optimizerState,optimizerLast,lang);
  document.querySelectorAll('[data-optimizer-action="one"], [data-optimizer-action="ten"]').forEach(button=>button.disabled=optimizerState.step>=200);
}
function updateBayes(){document.querySelector('#bayes-output').innerHTML=bayesOutput(bayesSettings,lang);}
function updateRoc(){document.querySelector('#roc-threshold-value').textContent=rocThreshold.toFixed(2);document.querySelector('#roc-output').innerHTML=rocOutput(rocThreshold,lang);}
main.addEventListener('input',e=>{if(e.target.matches('[data-roc-threshold]')){rocThreshold=Number(e.target.value);updateRoc();}});
main.addEventListener('change',e=>{
  if(e.target.matches('[data-bayes-word]')){bayesSettings.features[Number(e.target.dataset.bayesWord)]=e.target.checked?1:0;updateBayes();}
  else if(e.target.matches('[data-bayes-alpha]')){bayesSettings.alpha=Number(e.target.value);updateBayes();}
});
function updateTree(){document.querySelector('#tree-output').innerHTML=treeLabOutput(treeSettings,lang);}
function updateRag(){document.querySelector('#rag-output').innerHTML=ragOutput(ragChoice,lang);}
function updateTfidf(){document.querySelector('#tfidf-output').innerHTML=tfidfOutput(tfidfSettings,lang);}
function updateIoU(){document.querySelector('#iou-output').innerHTML=iouOutput(iouSettings,lang);}
function updateCam(){document.querySelector('#cam-output').innerHTML=camOutput(camSettings,lang);}
function updateStyleTransfer(){document.querySelector('#style-transfer-output').innerHTML=styleTransferOutput(styleSettings,lang);}
function updateSkipgram(){document.querySelector('#skipgram-output').innerHTML=skipgramOutput(skipgramSettings,lang);}
function updateDropout(){
  document.querySelector('#dropout-output').innerHTML=dropoutOutput(dropoutSettings,lang);
}
function updateBatchNorm(){
  document.querySelector('#batchnorm-output').innerHTML=batchNormOutput(batchNormThird,batchNormState,lang);
}
search.addEventListener('input',renderList);
main.addEventListener('input',e=>{
  if(e.target.matches('[data-xor-input]'))xorSettings.input=Number(e.target.value);
  else if(e.target.matches('[data-xor-activation]'))xorSettings.activation=e.target.value;
  else return;
  document.querySelector('#xor-output').innerHTML=xorOutput(xorSettings,lang);
});
main.addEventListener('input',e=>{
  if(e.target.matches('[data-xortrain-rate]')){xorTrainRate=Number(e.target.value);document.querySelector('#xortrain-rate-value').textContent=xorTrainRate.toFixed(4);}
  else if(e.target.matches('[data-xortrain-sample]')){xorTrainSelected=Number(e.target.value);updateXorTraining();}
  else if(e.target.matches('[data-logistic-rate]')){logisticRate=Number(e.target.value);document.querySelector('#logistic-rate-value').textContent=logisticRate.toFixed(3);}
  else if(e.target.matches('[data-optimizer-rate]')){optimizerRate=Number(e.target.value);}
  else if(e.target.matches('[data-cam-input]')){const key=e.target.dataset.camInput;camSettings[key]=Number(e.target.value);document.querySelector(`#cam-${key}-value`).textContent=camSettings[key].toFixed(3);updateCam();}
  else if(e.target.matches('[data-style-weight]')){styleSettings.weight=Number(e.target.value);document.querySelector('#style-weight-value').textContent=styleSettings.weight.toFixed(4);updateStyleTransfer();}
  else if(e.target.matches('[data-style-rate]')){styleSettings.rate=Number(e.target.value);document.querySelector('#style-rate-value').textContent=styleSettings.rate.toFixed(4);updateStyleTransfer();}
  else if(e.target.matches('[data-style-swap]')){styleSettings.swap=e.target.checked;updateStyleTransfer();}
  else if(e.target.matches('[data-rag-query]')){ragChoice=Number(e.target.value);updateRag();}
  else if(e.target.matches('[data-fgsm-epsilon]')){fgsmEpsilon=Number(e.target.value);document.querySelector('#fgsm-epsilon-value').textContent=fgsmEpsilon.toFixed(3);updateFgsm();}
  else if(e.target.matches('[data-skipgram-negative]')){skipgramSettings.includeNegative=e.target.checked;skipgramSettings.last=null;updateSkipgram();}
  else if(e.target.matches('[data-skipgram-rate]')){skipgramSettings.rate=Number(e.target.value);skipgramSettings.last=null;updateSkipgram();}
  else if(e.target.matches('[data-iou-x]')){iouSettings.x=Number(e.target.value);document.querySelector('#iou-x-value').textContent=iouSettings.x;updateIoU();}
  else if(e.target.matches('[data-iou-threshold]')){iouSettings.threshold=Number(e.target.value);document.querySelector('#iou-threshold-value').textContent=iouSettings.threshold.toFixed(3);updateIoU();}
});
main.addEventListener('click',e=>{
  const xorTrainAction=e.target.closest('[data-xortrain-action]');
  if(xorTrainAction){
    const action=xorTrainAction.dataset.xortrainAction;
    if(action==='reset'){xorTrainState=xorTrainingInitial();xorTrainLast=null;}
    else {const count=Math.min(action==='hundred'?100:action==='ten'?10:1,500-xorTrainState.step);
      for(let i=0;i<count;i++){xorTrainLast=xorTrainingStep(xorTrainState,xorTrainRate);xorTrainState=xorTrainLast.next;}
    }
    updateXorTraining();return;
  }
  const logisticAction=e.target.closest('[data-logistic-action]');
  if(logisticAction){
    const action=logisticAction.dataset.logisticAction;
    if(action==='reset'){logisticState=logisticInitial();logisticLast=null;}
    else {const count=Math.min(action==='ten'?10:1,100-logisticState.step);
      for(let i=0;i<count;i++){logisticLast=logisticStep(logisticState,logisticRate);logisticState=logisticLast.next;}
    }
    updateLogistic();return;
  }
  const optimizerAction=e.target.closest('[data-optimizer-action]');
  if(optimizerAction){
    const action=optimizerAction.dataset.optimizerAction;
    if(action==='reset'){optimizerState=optimizerInitial();optimizerLast=null;}
    else {const count=Math.min(action==='ten'?10:1,200-optimizerState.step);
      for(let i=0;i<count;i++){optimizerLast=optimizerStep(optimizerState,optimizerRate);optimizerState=optimizerLast.next;}
    }
    updateOptimizer();return;
  }
  if(e.target.closest('[data-skipgram-step]')){
    const r=skipgramStep(skipgramSettings.vectors,skipgramSettings.includeNegative,skipgramSettings.rate);
    skipgramSettings.vectors=r.next;
    skipgramSettings.last={before:r.loss,after:skipgramStep(r.next,skipgramSettings.includeNegative,0).loss,rate:skipgramSettings.rate};
    updateSkipgram();
  }else if(e.target.closest('[data-skipgram-reset]')){
    skipgramSettings.vectors=skipgramInitial();skipgramSettings.last=null;updateSkipgram();
  }
  if(e.target.closest('[data-batchnorm-apply]')){
    const result=batchNormPreview(batchNormThird,batchNormState);
    batchNormState={mean:result.nextMean,variance:result.nextVariance,count:batchNormState.count+1};
    updateBatchNorm();
  }else if(e.target.closest('[data-batchnorm-reset]')){
    batchNormState={mean:0,variance:1,count:0};
    updateBatchNorm();
  }
});
main.addEventListener('input',e=>{if(e.target.matches('[data-tfidf-bird]')){tfidfSettings.addBird=e.target.checked;updateTfidf();}else if(e.target.matches('[data-tfidf-doc]')){tfidfSettings.documentIndex=Number(e.target.value);updateTfidf();}else if(e.target.matches('[data-tree-threshold]')){treeSettings.threshold=Number(e.target.value);document.querySelector('#tree-threshold-value').textContent=treeSettings.threshold;updateTree();}else if(e.target.matches('[data-tree-input]')){treeSettings.x=Number(e.target.value);document.querySelector('#tree-input-value').textContent=treeSettings.x;updateTree();}else if(e.target.matches('[data-metric]')){metricValues[e.target.dataset.metric]=e.target.value===''?NaN:Number(e.target.value);updateMetrics();}else if(e.target.matches('[data-cluster]')){clusterValues[e.target.dataset.cluster]=e.target.value===''?NaN:Number(e.target.value);updateClusters();}else if(e.target.matches('[data-dropout-p]')){dropoutSettings.p=Number(e.target.value);document.querySelector('#dropout-p-value').textContent=dropoutSettings.p.toFixed(3);updateDropout();}else if(e.target.matches('[data-dropout-mask]')){dropoutSettings.mask[Number(e.target.dataset.dropoutMask)]=e.target.checked?1:0;updateDropout();}else if(e.target.matches('[data-dropout-mode]')){dropoutSettings.mode=e.target.value;updateDropout();}else if(e.target.matches('[data-batchnorm-third]')){batchNormThird=Number(e.target.value);document.querySelector('#batchnorm-third-value').textContent=batchNormThird.toFixed(3);updateBatchNorm();}else if(e.target.matches('[data-pca-angle]')){pcaAngle=Number(e.target.value);document.querySelector('#pca-angle-value').textContent=pcaAngle+'°';document.querySelector('#pca-output').innerHTML=pcaLabOutput(pcaAngle,lang);}});
document.querySelector('#language').addEventListener('click',()=>{lang=lang==='ko'?'en':'ko';localStorage.setItem('model-atlas-language',lang);render();});
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});});
render();
