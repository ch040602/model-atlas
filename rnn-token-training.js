// Two-step scalar RNN, trained on a fixed four-example classification task.
export const tokenInitial = () => ({wx:0.6,wh:0.7,b:0,v:0.6,c:0});
export function tokenEvaluate(p) {
 const samples=[],gradient={wx:0,wh:0,b:0,v:0,c:0};
 for(const first of [-1,1]) for(const second of [-1,1]) {
  const h1=Math.tanh(p.wx*first+p.b);
  const h2=Math.tanh(p.wx*second+p.wh*h1+p.b);
  const z=p.v*h2+p.c, y=first===1?1:0;
  const probability=z>=0?1/(1+Math.exp(-z)):Math.exp(z)/(1+Math.exp(z));
  const loss=Math.max(0,z)+Math.log1p(Math.exp(-Math.abs(z)))-y*z;
  const d=probability-y, d2=d*p.v*(1-h2*h2), d1=d2*p.wh*(1-h1*h1);
  gradient.v+=d*h2/4; gradient.c+=d/4;
  gradient.wx+=(d1*first+d2*second)/4; gradient.wh+=d2*h1/4; gradient.b+=(d1+d2)/4;
  samples.push({first,second,h1,h2,z,y,probability,loss,d});
 }
 return {samples,gradient,loss:samples.reduce((sum,s)=>sum+s.loss,0)/4};
}
export function tokenUpdate(parameters,rate) {
 const before=tokenEvaluate(parameters);
 const next=Object.fromEntries(Object.keys(parameters).map(key=>[key,parameters[key]-rate*before.gradient[key]]));
 return {before,next,after:tokenEvaluate(next)};
}
const f=x=>(Math.abs(x)<0.00005?0:x).toFixed(4);
const names=[['wx','Wₓ'],['wh','Wₕ'],['b','b'],['v','V'],['c','c']];
const copy={
 ko:{title:'다음 토큰을 예측하며 학습하기',intro:'두 토큰을 읽고 세 번째 토큰을 예측하는 분류 문제입니다. 데이터의 규칙은 세 번째 토큰이 첫 번째 토큰과 같다는 것입니다. 두 번째 토큰도 읽으므로 첫 토큰의 정보가 순환 상태에 남아야 합니다.',fixed:'고정 훈련 데이터: AA → A, AB → A, BA → B, BB → B. 입력 A는 −1, B는 +1로 인코딩합니다. 네 예제 모두를 한 배치로 학습합니다.',rate:'학습률 η',sample:'살펴볼 입력',one:'1회 학습',ten:'최대 10회 학습',reset:'가중치 초기화',states:'1. 순환 상태와 로짓',stateText:'매 시점에 같은 가중치를 사용합니다. 이해를 위해 A의 로짓은 0으로 고정하고 B의 로짓만 학습합니다.',prob:'2. 확률과 손실',probText:'softmax는 두 로짓을 확률로 바꿉니다. 교차 엔트로피는 정답 토큰에 부여한 확률의 음의 로그입니다.',target:'정답',mean:'네 훈련 예제의 평균 손실',initial:'초기',current:'현재',params:'현재 가중치',count:'전체 배치 갱신 횟수',last:'3. 시간 역전파와 갱신',lastText:'각 예제의 B 로짓 기울기 p(B) − y를 시간 역전파합니다. 네 예제의 기울기를 평균하여 갱신 전 가중치에서 모든 가중치를 동시에 바꿉니다. 여기서 y는 정답이 B면 1, A면 0입니다.',selectedGradient:'선택 예제의 로짓 기울기',gradient:'마지막 갱신 전 배치 평균 기울기',before:'갱신 전 평균 손실',after:'갱신 후 평균 손실',used:'사용한 학습률',none:'아직 갱신하지 않았습니다.',table:'현재 네 훈련 예측',input:'입력',answer:'정답',note:'계산은 반올림 전 숫자를 사용합니다. 학습률 0은 가중치를 바꾸지 않으며, 최대 200회 갱신할 수 있습니다. 고정된 인공 데이터만 사용하므로 자연어 모델이나 일반화 성능을 보여주지는 않습니다.'},
 en:{title:'Learn to predict the next token',intro:'Read two tokens and classify the third. In this artificial dataset, the third token always equals the first. Because the second token is also read, information about the first must survive in the recurrent state.',fixed:'Fixed training data: AA → A, AB → A, BA → B, BB → B. Encode input A as −1 and B as +1. All four examples form one training batch.',rate:'Learning rate η',sample:'Input to inspect',one:'Train 1 step',ten:'Train up to 10 steps',reset:'Reset weights',states:'1. Recurrent states and logits',stateText:'The same weights are used at each step. For simplicity the A logit is fixed at zero; only the B logit is learned.',prob:'2. Probabilities and loss',probText:'Softmax converts the two logits to probabilities. Cross-entropy is the negative log probability assigned to the target token.',target:'Target',mean:'Mean loss over four training examples',initial:'Initial',current:'Current',params:'Current weights',count:'Full-batch updates',last:'3. Backpropagation through time and update',lastText:'Backpropagate each example’s B-logit gradient p(B) − y through time. Average gradients over the four examples and update all weights simultaneously from their old values. Here y is 1 for target B and 0 for target A.',selectedGradient:'Selected example’s logit gradient',gradient:'Mean batch gradient before last update',before:'Mean loss before update',after:'Mean loss after update',used:'Learning rate used',none:'No updates yet.',table:'Current predictions for all four training examples',input:'Input',answer:'Target',note:'Calculations use unrounded values. Learning rate 0 leaves weights unchanged; at most 200 updates are available. This fixed artificial dataset does not demonstrate a natural language model or generalization.'}
};
export function tokenMarkup(state,lang){
 const t=copy[lang];
 return `<section class="sequence-lab token-lab" aria-labelledby="token-title"><div class="eyebrow">RNN / NEXT-TOKEN CLASSIFICATION</div><h2 id="token-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><label for="token-sample">${t.sample} <select id="token-sample" data-token-sample>${['AA','AB','BA','BB'].map((x,i)=>`<option value="${i}" ${state.selected===i?'selected':''}>${x}</option>`).join('')}</select></label> <label for="token-rate">${t.rate} <select id="token-rate" data-token-rate>${[0,0.01,0.1,0.2].map(n=>`<option value="${n}" ${state.rate===n?'selected':''}>${n}</option>`).join('')}</select></label><div class="sequence-actions"><button type="button" data-token-action="one">${t.one}</button><button type="button" data-token-action="ten">${t.ten}</button><button type="button" data-token-action="reset">${t.reset}</button></div><div id="token-output" aria-live="polite"></div><p class="sequence-rounding">${t.note}</p></section>`;
}
export function tokenOutput(state,lang){
 const t=copy[lang],r=tokenEvaluate(state.parameters),s=r.samples[state.selected],initial=tokenEvaluate(tokenInitial());
 const rows=r.samples.map(q=>`<tr><td>${q.first===-1?'A':'B'}${q.second===-1?'A':'B'}</td><td>${q.y?'B':'A'}</td><td>${f(1-q.probability)}</td><td>${f(q.probability)}</td><td>${f(q.loss)}</td></tr>`).join('');
 const last=state.last?`<p>${t.before}: ${f(state.last.before.loss)} → ${t.after}: ${f(state.last.after.loss)}<br>${t.gradient}: ${names.map(([key,label])=>`${label}=${f(state.last.before.gradient[key])}`).join(', ')}<br>${t.used}: ${f(state.last.rate)}</p>`:`<p>${t.none}</p>`;
 return `<div class="conv-calc"><b>${t.states}</b><p>${t.stateText}</p><code>h₀ = 0; hₜ = tanh(Wₓxₜ + Wₕhₜ₋₁ + b); z = [0, Vh₂ + c]</code><p>x₁=${s.first}, x₂=${s.second}; h₁=${f(s.h1)}, h₂=${f(s.h2)}; z=[0, ${f(s.z)}]</p><p><strong>${t.params}:</strong> ${names.map(([key,label])=>`${label}=${f(state.parameters[key])}`).join(', ')}</p><p><strong>${t.count}: <span data-token-count>${state.count}</span> / 200</strong></p></div><div class="conv-calc"><b>${t.prob}</b><p>${t.probText}</p><code>p(i) = exp(zᵢ) / Σⱼ exp(zⱼ); L = −log p(target)</code><p>${t.target}: ${s.y?'B':'A'}; p(A)=${f(1-s.probability)}, p(B)=${f(s.probability)}; L=${f(s.loss)}</p><p>${t.mean}: ${t.initial} ${f(initial.loss)} → ${t.current} <strong data-token-loss>${f(r.loss)}</strong></p></div><div class="conv-calc"><b>${t.last}</b><p>${t.lastText}</p><code>∂L/∂zB = p(B) − y; θ_new = θ − η ∂L̄/∂θ</code><p>${t.selectedGradient}: ${f(s.d)}</p>${last}</div><div class="training-history" role="region" tabindex="0" aria-label="${t.table}"><b>${t.table}</b><table><thead><tr><th scope="col">${t.input}</th><th scope="col">${t.answer}</th><th scope="col">p(A)</th><th scope="col">p(B)</th><th scope="col">L</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
