// One unweighted feature and six labelled training observations.
export const treeSamples=[{x:1,label:'A'},{x:2,label:'B'},{x:3,label:'A'},{x:4,label:'B'},{x:5,label:'B'},{x:6,label:'A'}];
const summary=items=>{
  const a=items.filter(s=>s.label==='A').length,b=items.length-a;
  return {items,a,b,gini:items.length ? 1-(a/items.length)**2-(b/items.length)**2 : null};
};
export function treeSplit(threshold){
  if(!Number.isInteger(threshold)||threshold<0||threshold>6)throw new RangeError('threshold must be an integer from 0 to 6');
  const parent=summary(treeSamples),left=summary(treeSamples.filter(s=>s.x<=threshold)),right=summary(treeSamples.filter(s=>s.x>threshold));
  if(!left.items.length||!right.items.length)return {threshold,parent,left,right,valid:false};
  const weighted=(left.items.length*left.gini+right.items.length*right.gini)/treeSamples.length;
  return {threshold,parent,left,right,weighted,gain:parent.gini-weighted,valid:true};
}
export function treePrediction(split,x){
  if(!split.valid)throw new RangeError('a valid split is required');
  if(!Number.isFinite(x))throw new RangeError('x must be finite');
  const side=x<=split.threshold?'left':'right',leaf=split[side];
  return {side,label:leaf.a>=leaf.b?'A':'B',tie:leaf.a===leaf.b};
}
const f=n=>n.toFixed(3);
export function treeLabMarkup(settings,lang){
  const ko=lang==='ko';
  return `<section class="metric-lab tree-lab" aria-labelledby="tree-title">
    <h2 id="tree-title">${ko?'결정 트리의 첫 분할 직접 만들기':'Build the first decision-tree split'}</h2>
    <p>${ko?'특징 x 하나와 정답 A·B가 있는 훈련 표본 여섯 개입니다. 분할 기준을 바꿔 두 집단의 불순도와 예측을 살펴보세요.':'Six training samples have one feature x and labels A or B. Change the split to compare impurity and predictions.'}</p>
    <p class="sequence-fixed"><b>${ko?'훈련 표본 (x, 정답)':'Training samples (x, label)'}</b>: (1, A), (2, B), (3, A), (4, B), (5, B), (6, A)</p>
    <label class="pca-control" for="tree-threshold">${ko?'분할 기준 t: 왼쪽 x ≤ t':'Split threshold t: left x ≤ t'} <output id="tree-threshold-value">${settings.threshold}</output></label>
    <input id="tree-threshold" data-tree-threshold type="range" min="0" max="6" step="1" value="${settings.threshold}">
    <label class="pca-control" for="tree-input">${ko?'새 입력 x (정답은 모른다고 가정)':'New input x (label assumed unknown)'} <output id="tree-input-value">${settings.x}</output></label>
    <input id="tree-input" data-tree-input type="range" min="0" max="7" step="1" value="${settings.x}">
    <div id="tree-output" aria-live="polite"></div>
    <p>${ko?'여기서는 첫 노드 하나만 분할합니다. 전체 트리는 자식 노드를 반복해 분할하며 깊이 등 중단 조건을 사용합니다. 훈련 불순도가 낮아도 새 데이터 성능이 보장되지는 않으므로 별도 검증이 필요합니다.':'This exercise splits only the root node. A full tree recursively splits children and uses stopping rules such as maximum depth. Low training impurity does not guarantee performance on new data; evaluate separately.'}</p>
    <p>${ko?'Gini 외에 엔트로피도 분류 분할 기준으로 사용할 수 있습니다. 랜덤 포레스트와 부스팅은 여러 트리를 서로 다른 방식으로 결합합니다.':'Entropy is another classification split criterion. Random forests and boosting combine multiple trees in different ways.'} <a href="https://scikit-learn.org/stable/modules/tree.html#classification-criteria" target="_blank" rel="noopener noreferrer">${ko?'분할 기준 참고 자료':'Split criteria reference'} ↗</a></p>
  </section>`;
}
export function treeLabOutput(settings,lang){
  const ko=lang==='ko',r=treeSplit(settings.threshold),candidates=[1,2,3,4,5].map(treeSplit);
  const minimum=Math.min(...candidates.map(c=>c.weighted)),best=candidates.filter(c=>Math.abs(c.weighted-minimum)<1e-12);
  const group=g=>g.items.map(s=>`${s.x}:${s.label}`).join(', ')||'∅';
  const calculation=r.valid?`<p><b>${ko?'② 선택한 분할의 불순도':'② Impurity of the chosen split'}</b><br>
    ${ko?'왼쪽':'Left'} (${group(r.left)}): A=${r.left.a}, B=${r.left.b}, Gini=${f(r.left.gini)}<br>
    ${ko?'오른쪽':'Right'} (${group(r.right)}): A=${r.right.a}, B=${r.right.b}, Gini=${f(r.right.gini)}<br>
    ${ko?'가중 평균':'Weighted average'} = ${r.left.items.length}/6 × ${f(r.left.gini)} + ${r.right.items.length}/6 × ${f(r.right.gini)} = <strong data-tree-result="weighted">${f(r.weighted)}</strong><br>
    ${ko?'불순도 감소':'Impurity decrease'} = ${f(r.parent.gini)} − ${f(r.weighted)} = <strong data-tree-result="gain">${f(r.gain)}</strong></p>`:
    `<p data-tree-invalid><b>${ko?'② 유효하지 않은 분할':'② Invalid split'}</b><br>${ko?'한쪽 집단이 비어 있으므로 Gini 평균과 예측을 계산하지 않습니다. 기준을 1~5로 바꿔 보세요.':'One group is empty, so the weighted impurity and prediction are undefined here. Choose a threshold from 1 to 5.'}</p>`;
  let prediction='';
  if(r.valid){const p=treePrediction(r,settings.x),leaf=r[p.side];prediction=`<p><b>${ko?'④ 선택한 분할로 새 입력 예측':'④ Predict the new input using the chosen split'}</b><br>x=${settings.x} → ${p.side==='left'?(ko?'왼쪽':'left'):(ko?'오른쪽':'right')} (A=${leaf.a}, B=${leaf.b}) → <strong data-tree-result="prediction">${p.label}</strong>. ${p.tie?(ko?'동수이므로 이 예제의 규칙에 따라 A를 선택합니다.':'The counts tie, so this example chooses A.'):''}</p>`;}
  return `<div class="tree-results"><p><b>${ko?'① 부모 노드':'① Parent node'}</b><br>A=3, B=3; Gini = 1 − (3/6)² − (3/6)² = ${f(r.parent.gini)}<br>${ko?'Gini는 한 노드의 클래스가 섞인 정도입니다. 0이면 한 클래스만 있습니다.':'Gini measures class mixing in a node; zero means only one class is present.'}</p>
    ${calculation}
    <p><b>${ko?'③ 후보 비교':'③ Compare candidates'}</b><br>${candidates.map(c=>`t=${c.threshold}: ${f(c.weighted)}`).join(' · ')}<br>${ko?'가중 평균이 가장 작은 기준':'Lowest weighted impurity'}: <strong data-tree-result="best">${best.map(c=>c.threshold).join(', ')}</strong> (${f(minimum)}). ${ko?'동률이면 이 예제는 작은 기준을 선택합니다':'For a tie this example chooses the smaller threshold'}: ${best[0].threshold}.</p>
    ${prediction}<p>${ko?'후보는 훈련 데이터 사이의 서로 다른 분할만 비교합니다. 예를 들어 t=1과 t=1.5는 이 표본에서 같은 분할입니다. 선택 기준의 예측과 자동으로 고른 최적 기준은 다를 수 있습니다. 표시 값만 반올림합니다.':'Candidates compare distinct partitions of the training data. For example, t=1 and t=1.5 produce the same partition here. Prediction uses the selected threshold, which may differ from the automatically selected best threshold. Values are rounded only for display.'}</p></div>`;
}
