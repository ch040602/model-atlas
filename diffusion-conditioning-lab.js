// A deliberately tiny shared model: x and epsilon are fixed at 1.
// One sample update is used only to explain the connection to guidance.
export function conditioningExample(p, draw, scale) {
  const x=1, target=1, a=0.25, b=0.5, rate=0.1;
  const condition=draw<p ? 0 : 1;
  const prediction=a*x+b*condition;
  const error=prediction-target;
  const gradA=2*error*x, gradB=2*error*condition;
  const nextA=a-rate*gradA, nextB=b-rate*gradB;
  const empty=nextA*x, conditioned=nextA*x+nextB;
  return {x,target,a,b,rate,condition,prediction,loss:error**2,gradA,gradB,nextA,nextB,empty,conditioned,guided:empty+scale*(conditioned-empty)};
}

const n=value=>(Math.abs(value)<0.0005?0:value).toFixed(3);
const copy={
  ko:{title:'조건 생략 학습에서 가이던스까지',intro:'하나의 축소 모델을 조건이 있는 예제와 조건을 생략한 예제로 학습하는 원리를 살펴봅니다. 아래는 선택한 한 예제의 가중치 갱신을 미리 보고, 그 결과로 두 예측을 조합하는 계산입니다.',fixed:'노이즈가 섞인 입력 xₜ=1, 실제 노이즈 ε=1, 초기 가중치 a=0.25, b=0.5, 학습률 η=0.1로 고정합니다. c=0은 조건 없음, c=1은 조건 있음을 뜻하는 축소 기호입니다. 실제 텍스트 임베딩은 이 숫자가 아니며, 실제 신경망 학습이나 이미지 생성도 아닙니다. 앞 실습과 값이나 학습 상태를 공유하지 않습니다.',p:'조건 생략 확률 p',draw:'이번 예제의 선택값 u',scale:'가이던스 강도 g',previous:'이전 단계',next:'다음 단계',reset:'처음부터',one:'1. 이번 학습 예제의 조건 결정',oneText:'학습 예제마다 0 이상 1 미만의 균일 난수 u를 뽑아 u<p이면 조건을 생략합니다. 이 실습에서는 선택값을 직접 조절하므로 버튼을 누를 때마다 무작위로 바뀌지 않습니다. p는 여러 예제에 적용할 확률이지 한 예제가 부분적으로 생략되는 비율이 아닙니다.',dropped:'조건 생략',kept:'조건 유지',two:'2. 같은 모델로 노이즈 예측과 손실 계산',twoText:'학습 때는 입력에 섞은 노이즈 ε가 정답입니다. 이 예제는 시점 t를 고정하고, 편향 없이 a와 b만 학습하는 단순한 모델을 가정합니다.',three:'3. 두 가중치의 기울기와 한 번의 갱신',threeText:'조건이 없는 c=0에서는 이 예제의 b 기울기가 0이지만, a는 갱신될 수 있습니다. 조건을 유지한 예제에서는 b도 갱신될 수 있습니다. 한 번의 갱신만으로 모델이 충분히 학습되는 것은 아닙니다.',four:'4. 갱신된 같은 모델로 두 예측을 조합',fourText:'생성 중 같은 xₜ와 시점에 대해 c=0과 c=1을 각각 넣어 두 예측을 구합니다. g=0이면 조건 없는 예측, g=1이면 조건부 예측이며, g>1은 차이를 강조합니다. 실제 생성은 보통 많은 예제로 학습한 뒤 여러 노이즈 단계에서 이 과정을 반복합니다.',rounding:'계산은 전체 정밀도로 수행하고 화면에는 소수 셋째 자리까지 표시합니다.',reference:'조건 생략과 가이던스 원 논문 ↗'},
  en:{title:'From condition dropout to guidance',intro:'See how one toy model can learn from both conditioned and condition-dropped examples. Preview one weight update for the selected example, then combine the resulting predictions.',fixed:'We fix noisy input xₜ=1, actual noise ε=1, initial weights a=0.25 and b=0.5, and learning rate η=0.1. The toy indicator c=0 means no condition and c=1 means a condition. Actual text embeddings are not these numbers, and this does not train a real network or generate images. Values and training state are not shared with the previous exercise.',p:'Condition-drop probability p',draw:'Selection value u for this example',scale:'Guidance scale g',previous:'Previous step',next:'Next step',reset:'Start over',one:'1. Select the condition for this training example',oneText:'For each training example, draw u uniformly from 0 inclusive to 1 exclusive and drop the condition if u<p. Here you control the selection value, so it does not change randomly on each click. p is a probability across examples, not the fraction of one example that is dropped.',dropped:'condition dropped',kept:'condition kept',two:'2. Predict noise and calculate loss with the same model',twoText:'During training the noise ε added to the input is the target. This toy model holds the time step t fixed and learns only a and b, without a bias.',three:'3. Gradients and one update of both weights',threeText:'With c=0, this example gives b a zero gradient, while a can still update. With a condition present, b can also update. One update is not enough to train a model adequately.',four:'4. Combine two predictions from the same updated model',fourText:'At generation time, evaluate c=0 and c=1 for the same xₜ and time step. g=0 gives the unconditioned prediction, g=1 the conditioned prediction, and g>1 emphasizes their difference. Real generation usually follows training on many examples and repeats this across many noise steps.',rounding:'Calculations use full precision; displayed values are rounded to three decimals.',reference:'Original condition-dropout and guidance paper ↗'}
};

export function conditioningMarkup(values, lang) {
  const t=copy[lang];
  const fields=[['p',0,1,0.05],['draw',0,0.95,0.05],['scale',0,5,0.1]];
  const controls=fields.map(([key,min,max,step])=>`<div class="sequence-control"><label for="cfg-${key}">${t[key]} <output id="cfg-value-${key}">${n(values[key])}</output></label><input id="cfg-${key}" data-cfg-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab conditioning-lab" aria-labelledby="cfg-title"><div class="eyebrow">DIFFUSION / CONDITIONING</div><h2 id="cfg-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="cfg-output" aria-live="polite"></div><div class="sequence-actions"><span id="cfg-status"></span><button type="button" data-cfg-action="previous">${t.previous}</button><button type="button" data-cfg-action="next">${t.next} →</button><button type="button" data-cfg-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://arxiv.org/abs/2207.12598" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function conditioningOutput(values, lang, stage) {
  const t=copy[lang], r=conditioningExample(values.p,values.draw,values.scale);
  const steps=[
    `<li><b>${t.one}</b><p>${t.oneText}</p><code>u = ${n(values.draw)} ${r.condition===0?'&lt;':'≥'} p = ${n(values.p)} → c = ${r.condition} (${r.condition===0?t.dropped:t.kept})</code></li>`,
    `<li><b>${t.two}</b><p>${t.twoText}</p><code>εθ = a × xₜ + b × c = ${n(r.a)} × ${n(r.x)} + ${n(r.b)} × ${r.condition} = ${n(r.prediction)}<br>L = (εθ − ε)² = (${n(r.prediction)} − ${n(r.target)})² = ${n(r.loss)}</code></li>`,
    `<li><b>${t.three}</b><p>${t.threeText}</p><code>∂L/∂a = 2(εθ − ε)xₜ = ${n(r.gradA)}<br>∂L/∂b = 2(εθ − ε)c = ${n(r.gradB)}<br>a_new = ${n(r.a)} − ${n(r.rate)} × ${n(r.gradA)} = ${n(r.nextA)}<br>b_new = ${n(r.b)} − ${n(r.rate)} × ${n(r.gradB)} = ${n(r.nextB)}</code></li>`,
    `<li><b>${t.four}</b><p>${t.fourText}</p><code>εuncond = ${n(r.nextA)} × ${n(r.x)} + ${n(r.nextB)} × 0 = ${n(r.empty)}<br>εcond = ${n(r.nextA)} × ${n(r.x)} + ${n(r.nextB)} × 1 = ${n(r.conditioned)}<br>εguided = εuncond + g(εcond − εuncond)<br>= ${n(r.empty)} + ${n(values.scale)} × (${n(r.conditioned)} − ${n(r.empty)}) = ${n(r.guided)}</code></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
