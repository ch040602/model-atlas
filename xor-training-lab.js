// Full-batch SGD with two sigmoid hidden units and a sigmoid output.
export const xorTrainingData=[{x:[0,0],y:0},{x:[0,1],y:1},{x:[1,0],y:1},{x:[1,1],y:0}];
export const xorTrainingInitial=()=>({w:[[2,2],[2,2]],b:[-1,-3],v:[2,-2],c:-1,step:0});
const sigmoid=z=>z>=0?1/(1+Math.exp(-z)):Math.exp(z)/(1+Math.exp(z));
const logLoss=(z,y)=>Math.max(z,0)-y*z+Math.log1p(Math.exp(-Math.abs(z)));
export function xorTrainingCalculate(state){
  const rows=xorTrainingData.map(({x,y})=>{
    const z=state.w.map((w,i)=>w[0]*x[0]+w[1]*x[1]+state.b[i]);
    const h=z.map(sigmoid), score=state.v[0]*h[0]+state.v[1]*h[1]+state.c,p=sigmoid(score);
    const delta=p-y, dh=h.map((a,i)=>delta*state.v[i]*a*(1-a));
    return {x,y,z,h,score,p,loss:logLoss(score,y),delta,dh};
  });
  const mean=fn=>rows.reduce((sum,row)=>sum+fn(row),0)/rows.length;
  const grad={w:[0,1].map(i=>[0,1].map(j=>mean(r=>r.dh[i]*r.x[j]))),b:[0,1].map(i=>mean(r=>r.dh[i])),v:[0,1].map(i=>mean(r=>r.delta*r.h[i])),c:mean(r=>r.delta)};
  return {rows,loss:mean(r=>r.loss),grad};
}
export function xorTrainingStep(state,rate){
  if(!Number.isFinite(rate)||rate<0||rate>1)throw new RangeError('rate must be between 0 and 1');
  const before=xorTrainingCalculate(state),g=before.grad;
  const next={w:state.w.map((row,i)=>row.map((v,j)=>v-rate*g.w[i][j])),b:state.b.map((v,i)=>v-rate*g.b[i]),v:state.v.map((v,i)=>v-rate*g.v[i]),c:state.c-rate*g.c,step:state.step+1};
  return {before,next,rate,after:xorTrainingCalculate(next).loss};
}
const f=n=>(Math.abs(n)<0.00005?0:n).toFixed(4);
export function xorTrainingMarkup(state,rate,selected,lang){
  const ko=lang==='ko';
  return `<section class="metric-lab xor-training-lab" aria-labelledby="xor-training-title">
  <h2 id="xor-training-title">${ko?'XOR MLP를 직접 학습하기':'Train an XOR MLP'}</h2>
  <p>${ko?'앞의 고정 ReLU 예제와 별개인 모델입니다. 여기서는 은닉 뉴런 두 개와 출력에 시그모이드를 사용합니다. 네 XOR 예제의 손실을 평균한 뒤 두 층의 가중치와 편향을 동시에 갱신합니다.':'This model is separate from the fixed ReLU example above. It uses sigmoid for two hidden neurons and the output. Average the losses of the four XOR examples, then update weights and biases in both layers simultaneously.'}</p>
  <p class="sequence-fixed">${ko?'초기 가중치는 수업용으로 정한 값이며 무작위 초기화가 아닙니다. 실제 학습에서는 초기값과 학습률에 따라 결과가 달라질 수 있습니다. 같은 네 점만 훈련하므로 일반화 성능을 평가하지 않습니다.':'The initial weights are chosen for this lesson, not randomly initialized. Actual training can vary with initialization and learning rate. Training on these same four points does not assess generalization.'}</p>
  <div class="xor-controls"><label for="xortrain-sample">${ko?'계산을 자세히 볼 입력':'Input for the detailed calculation'}</label><select id="xortrain-sample" data-xortrain-sample>${xorTrainingData.map((d,i)=>`<option value="${i}" ${selected===i?'selected':''}>(${d.x.join(', ')})</option>`).join('')}</select></div>
  <label class="pca-control" for="xortrain-rate">${ko?'학습률 η':'Learning rate η'} <output id="xortrain-rate-value">${f(rate)}</output></label>
  <input id="xortrain-rate" data-xortrain-rate type="range" min="0" max="1" step="0.1" value="${rate}">
  <div class="sequence-actions"><button type="button" data-xortrain-action="one" ${state.step>=500?'disabled':''}>${ko?'1회 갱신':'Update once'}</button><button type="button" data-xortrain-action="ten" ${state.step>=500?'disabled':''}>${ko?'10회 갱신':'Update 10 times'}</button><button type="button" data-xortrain-action="hundred" ${state.step>=500?'disabled':''}>${ko?'100회 갱신':'Update 100 times'}</button><button type="button" data-xortrain-action="reset">${ko?'초기화':'Reset'}</button></div>
  <div id="xortrain-output" aria-live="polite"></div>
  <p>${ko?'각 갱신은 네 훈련 예제를 한 배치로 사용합니다. 여러 회를 누르면 마지막 갱신만 상세히 표시하며 총 500회로 제한합니다. 표시 숫자만 반올림합니다.':'Each update uses all four training examples as one batch. For multiple updates only the last is detailed; the limit is 500 updates. Only displayed numbers are rounded.'}</p>
  </section>`;
}
export function xorTrainingOutput(state,last,selected,lang){
  const ko=lang==='ko', result=xorTrainingCalculate(state),row=result.rows[selected],g=result.grad;
  const parameterRows=[
    ...[0,1].flatMap(i=>[0,1].map(j=>[`W${i+1}${j+1}`,state.w[i][j],g.w[i][j]])),
    ...[0,1].map(i=>[`b${i+1}`,state.b[i],g.b[i]]),
    ...[0,1].map(i=>[`v${i+1}`,state.v[i],g.v[i]]),['c',state.c,g.c]
  ].map(([name,value,gradient])=>`<tr><th scope="row">${name}</th><td>${f(value)}</td><td>${f(gradient)}</td></tr>`).join('');
  const predictions=result.rows.map(r=>`<tr><td>(${r.x.join(', ')})</td><td>${r.y}</td><td>${f(r.p)}</td><td>${r.p>=0.5?1:0}</td><td>${f(r.loss)}</td></tr>`).join('');
  return `<p>${ko?'갱신 횟수':'Updates'}: <strong data-xortrain-step>${state.step}</strong> · ${ko?'네 예제의 평균 손실':'Mean loss across four examples'}: <strong data-xortrain-loss>${f(result.loss)}</strong></p>
    <ol class="xor-steps"><li><strong>${ko?'선택한 입력을 은닉층으로':'Selected input through the hidden layer'}</strong><p>zᵢ = Wᵢ₁x₁ + Wᵢ₂x₂ + bᵢ; hᵢ = σ(zᵢ); σ(t) = 1 / (1 + exp(−t))<br>x=(${row.x.join(', ')}), y=${row.y}; z=(${row.z.map(f).join(', ')}); h=(${row.h.map(f).join(', ')})</p><p>${ko?'은닉 뉴런은 입력을 각각 다른 특징으로 변환합니다.':'Each hidden neuron transforms the inputs into a feature.'}</p></li>
    <li><strong>${ko?'출력 확률과 손실':'Output probability and loss'}</strong><p>s = v₁h₁ + v₂h₂ + c = ${f(row.score)}; p = σ(s) = ${f(row.p)}<br>ℓ = −[y log(p) + (1−y) log(1−p)] = ${f(row.loss)}</p><p>${ko?'p는 클래스 1의 확률이며 정답에 낮은 확률을 주면 손실이 커집니다.':'p is the probability of class 1; assigning low probability to the target increases loss.'}</p></li>
    <li><strong>${ko?'오차를 은닉층까지 되돌리기':'Propagate the error to the hidden layer'}</strong><p>δ = ∂ℓ/∂s = p − y = ${f(row.delta)}<br>∂ℓ/∂vᵢ = δhᵢ; ∂ℓ/∂c = δ<br>δᵢ = ∂ℓ/∂zᵢ = δvᵢhᵢ(1−hᵢ) = (${row.dh.map(f).join(', ')})<br>∂ℓ/∂Wᵢⱼ = δᵢxⱼ; ∂ℓ/∂bᵢ = δᵢ</p><p>${ko?'이 값들은 선택한 예제 하나의 기울기입니다. hᵢ(1−hᵢ)는 은닉 시그모이드의 미분입니다.':'These are gradients for the selected example. hᵢ(1−hᵢ) is the derivative of the hidden sigmoid.'}</p></li>
    <li><strong>${ko?'네 예제의 기울기를 평균하고 갱신':'Average all four gradients and update'}</strong><p>L = (ℓ₁+ℓ₂+ℓ₃+ℓ₄)/4; ∂L/∂θ = Σ(∂ℓ/∂θ)/4; θ′ = θ − η∂L/∂θ<br>${ko?'모든 기울기는 갱신 전의 같은 가중치에서 계산하고 한꺼번에 적용합니다.':'Every gradient uses the same pre-update weights and is applied simultaneously.'}</p></li></ol>
    <p>${ko?'표가 잘리면 표 영역을 가로로 스크롤하세요. 키보드로 초점을 둔 뒤 방향키로 이동할 수 있습니다.':'If a table is clipped, scroll it horizontally. With a keyboard, focus the table area and use the arrow keys.'}</p>
    <div class="xor-table-wrap" tabindex="0" role="region" aria-label="${ko?'현재 가중치와 평균 기울기':'Current weights and mean gradients'}"><table><thead><tr><th>${ko?'매개변수':'Parameter'}</th><th>${ko?'현재 값':'Current value'}</th><th>${ko?'평균 기울기':'Mean gradient'}</th></tr></thead><tbody>${parameterRows}</tbody></table></div>
    ${last?`<p data-xortrain-last>${ko?'마지막 갱신':'Last update'}: η=${f(last.rate)}; W₁₁ ← ${f(last.next.w[0][0]+last.rate*last.before.grad.w[0][0])} − ${f(last.rate)} × ${f(last.before.grad.w[0][0])} = ${f(last.next.w[0][0])}. ${ko?'평균 손실':'Mean loss'}: ${f(last.before.loss)} → ${f(last.after)}.</p>`:''}
    <p><strong>${ko?'현재 모델의 훈련 예제별 결과':'Current model on each training example'}</strong> ${ko?'(p≥0.5이면 1)':'(1 if p≥0.5)'}</p>
    <div class="xor-table-wrap" tabindex="0" role="region" aria-label="${ko?'훈련 예제 결과':'Training example results'}"><table><thead><tr><th>${ko?'입력':'Input'}</th><th>y</th><th>p</th><th>${ko?'예측':'Prediction'}</th><th>${ko?'손실':'Loss'}</th></tr></thead><tbody>${predictions}</tbody></table></div>`;
}
