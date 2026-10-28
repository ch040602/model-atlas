// A tiny, unregularized binary classifier trained by full-batch gradient descent.
export const logisticTraining = [{x:0,y:0},{x:1,y:0},{x:2,y:1},{x:3,y:1}];
export const logisticEvaluation = [{x:0.5,y:0},{x:2.5,y:1}];
export const logisticInitial = () => ({w:0,b:0,step:0});
const sigmoid = z => z >= 0 ? 1/(1+Math.exp(-z)) : Math.exp(z)/(1+Math.exp(z));
const logLoss = (z,y) => Math.max(z,0)-y*z+Math.log1p(Math.exp(-Math.abs(z)));

export function logisticCalculate(state, samples=logisticTraining) {
  const rows=samples.map(({x,y})=>{const z=state.w*x+state.b,p=sigmoid(z);return {x,y,z,p,loss:logLoss(z,y),dw:(p-y)*x,db:p-y};});
  const mean=key=>rows.reduce((sum,row)=>sum+row[key],0)/rows.length;
  return {rows,loss:mean('loss'),dw:mean('dw'),db:mean('db')};
}
export function logisticStep(state,rate) {
  if(!Number.isFinite(rate)||rate<0||rate>1)throw new RangeError('learning rate must be between 0 and 1');
  const before=logisticCalculate(state);
  const next={w:state.w-rate*before.dw,b:state.b-rate*before.db,step:state.step+1};
  return {before,next,rate,after:logisticCalculate(next).loss};
}
const f=n=>n.toFixed(3);
export function logisticMarkup(state,rate,lang) {
  const ko=lang==='ko';
  return `<section class="metric-lab tree-lab" aria-labelledby="logistic-title">
    <h2 id="logistic-title">${ko?'로지스틱 회귀를 직접 학습하기':'Train logistic regression'}</h2>
    <p>${ko?'숫자 x 하나로 두 클래스 0과 1을 구분합니다. 아래 네 훈련 예제의 손실을 평균해 가중치 w와 편향 b를 함께 갱신하세요.':'Classify two classes, 0 and 1, from one numeric feature x. Average the loss on the four training examples and update weight w and bias b together.'}</p>
    <p class="sequence-fixed">${ko?'훈련 (x, 정답 y)':'Training (x, target y)'}: (0, 0), (1, 0), (2, 1), (3, 1)<br>${ko?'별도 평가':'Separate evaluation'}: (0.5, 0), (2.5, 1)</p>
    <label class="pca-control" for="logistic-rate">${ko?'학습률 η':'Learning rate η'} <output id="logistic-rate-value">${f(rate)}</output></label>
    <input id="logistic-rate" data-logistic-rate type="range" min="0" max="1" step="0.05" value="${rate}">
    <div id="logistic-output" aria-live="polite"></div>
    <div class="sequence-actions"><button type="button" data-logistic-action="one">${ko?'1회 갱신':'Update once'}</button><button type="button" data-logistic-action="ten">${ko?'10회 갱신':'Update 10 times'}</button><button type="button" data-logistic-action="reset">${ko?'초기화':'Reset'}</button></div>
    <p>${ko?'정답을 아는 가상의 예제이며 실제 데이터나 정규화는 사용하지 않습니다. 두 평가 점은 갱신에 쓰지 않지만, 이 작은 평가만으로 일반화 성능을 판단할 수 없습니다. 0.5 이상은 클래스 1로 정합니다.':'These labelled examples are synthetic; there is no regularization. The two evaluation points are excluded from updates, but this tiny evaluation cannot establish generalization. A probability of at least 0.5 predicts class 1.'}</p>
    <p><a href="https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression" target="_blank" rel="noopener noreferrer">${ko?'로지스틱 회귀 참고 자료':'Logistic regression reference'} ↗</a></p>
  </section>`;
}
export function logisticOutput(state,last,lang) {
  const ko=lang==='ko',r=logisticCalculate(state),evaluation=logisticCalculate(state,logisticEvaluation);
  const rows=r.rows.map(({x,y,z,p,loss})=>`<tr><td>${x}</td><td>${y}</td><td>${f(z)}</td><td>${f(p)}</td><td>${f(loss)}</td></tr>`).join('');
  const previous=last?`<p data-logistic-last>${ko?'마지막 갱신':'Last update'} (η=${f(last.rate)}): w ← ${f(last.next.w+last.rate*last.before.dw)} − ${f(last.rate)} × ${f(last.before.dw)} = ${f(last.next.w)}; b ← ${f(last.next.b+last.rate*last.before.db)} − ${f(last.rate)} × ${f(last.before.db)} = ${f(last.next.b)}.<br>${ko?'훈련 평균 손실':'Mean training loss'}: ${f(last.before.loss)} → ${f(last.after)}.</p>`:'';
  return `<div class="tree-results"><p><b>${ko?'① 현재 모델과 확률':'① Current model and probabilities'}</b><br>${ko?'갱신 횟수':'Updates'}: <strong data-logistic-step>${state.step}</strong>; w = <strong data-logistic-weight>${f(state.w)}</strong>; b = <strong data-logistic-bias>${f(state.b)}</strong><br>z = wx + b; p = σ(z) = 1 / (1 + exp(−z))</p>
    <p>${ko?'z는 선형 점수, p는 클래스 1의 확률입니다. 예를 들어 p=0.8이면 클래스 0의 확률은 0.2입니다.':'z is a linear score and p is the probability of class 1. For example, p=0.8 gives class 0 probability 0.2.'}</p>
    <div class="training-history"><table><thead><tr><th scope="col">x</th><th scope="col">y</th><th scope="col">z</th><th scope="col">p</th><th scope="col">${ko?'손실':'Loss'}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p><b>${ko?'② 정답과 확률로 손실':'② Loss from target and probability'}</b><br>ℓ = −[y log(p) + (1−y) log(1−p)]<br>${ko?'훈련 평균':'Training mean'} L = <strong data-logistic-loss>${f(r.loss)}</strong>. ${ko?'정답에 낮은 확률을 주면 손실이 커집니다.':'Assigning low probability to the target gives a larger loss.'}</p>
    <p><b>${ko?'③ 기울기를 평균하고 동시에 갱신':'③ Average gradients and update simultaneously'}</b><br>${ko?'각 예제의 점수 기울기':'Each example’s score gradient'}: ∂ℓ/∂z = p − y<br>∂L/∂w = mean((p−y)x) = (${r.rows.map(row=>f(row.dw)).join(' + ')}) / 4 = <strong data-logistic-dw>${f(r.dw)}</strong><br>∂L/∂b = mean(p−y) = (${r.rows.map(row=>f(row.db)).join(' + ')}) / 4 = <strong data-logistic-db>${f(r.db)}</strong><br>w′ = w − η ∂L/∂w; b′ = b − η ∂L/∂b<br>${ko?'두 기울기는 갱신 전의 같은 w, b에서 계산합니다.':'Both gradients use the same pre-update w and b.'}</p>
    ${previous}<p><b>${ko?'④ 평가 예제':'④ Evaluation examples'}</b><br>${evaluation.rows.map(row=>`x=${row.x}, y=${row.y}: p=${f(row.p)} → ${row.p>=0.5?1:0}`).join('<br>')}<br>${ko?'평가 평균 손실':'Evaluation mean loss'} = <strong data-logistic-eval>${f(evaluation.loss)}</strong></p>
    <p>${ko?'자연로그를 사용하며 표시할 때만 반올림합니다. 10회 갱신의 마지막 계산만 표시하고 최대 100회까지 갱신합니다.':'Natural logarithms are used; values are rounded only for display. For 10 updates only the last calculation is shown, with at most 100 updates.'}</p></div>`;
}
