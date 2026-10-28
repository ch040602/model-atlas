// Scalar many-to-one regression: one sequence, one final output and one loss.
export function rnnOutputExperiment(u, v, b, target = 0.7, rate = 0.1) {
  const inputs = [0.5, -0.2, 0.8];
  const forward = (weight, head, bias) => {
    const states = [0];
    for (const x of inputs) states.push(Math.tanh(x + weight * states.at(-1)));
    const prediction = head * states[3] + bias;
    return {states, prediction, loss: (prediction - target) ** 2};
  };
  const initial = forward(u, v, b);
  const {states, prediction} = initial;
  const outputGradient = 2 * (prediction - target);
  const dv = outputGradient * states[3], db = outputGradient;
  const delta = Array(3);
  delta[2] = outputGradient * v * (1 - states[3] ** 2);
  for (let i = 1; i >= 0; i--) delta[i] = delta[i + 1] * u * (1 - states[i + 1] ** 2);
  const contributions = delta.map((d, i) => d * states[i]);
  const du = contributions.reduce((a, c) => a + c, 0);
  const updated = {u: u - rate * du, v: v - rate * dv, b: b - rate * db};
  return {inputs, ...initial, outputGradient, dv, db, delta, contributions, du, updated, after: forward(updated.u, updated.v, updated.b)};
}

const n = x => (Math.abs(x) < 0.0005 ? 0 : x).toFixed(3);
const copy = {
  ko: {title:'RNN의 출력층과 역전파',intro:'세 입력을 읽은 뒤 마지막 상태로 숫자 하나를 예측하는 회귀 예제입니다. ‘RNN의 시간 흐름과 학습’ 실습에서는 기본 설정으로 h₃을 그대로 예측에 사용했습니다. 여기서는 출력층을 거칩니다. 두 실습은 값을 공유하지 않습니다.',fixed:'입력 [0.5, −0.2, 0.8], h₀ = 0, 입력 가중치 1, 셀 편향 0, 정답 y = 0.7, 학습률 0.1.',u:'순환 가중치 U',v:'출력 가중치 V',b:'출력 편향 b',previous:'이전 단계',next:'다음 단계',reset:'처음부터',round:'계산은 전체 정밀도로 수행하고 표시만 소수 셋째 자리에서 반올림합니다.',s1:'1. 시퀀스를 은닉 상태로 변환',s1p:'같은 U를 세 시점에 사용합니다. h₃은 앞 입력들의 영향이 반영된 상태입니다.',s2:'2. 출력층과 손실',s2p:'V와 b는 마지막 상태를 예측 숫자로 바꿉니다. 이 값은 확률이 아닙니다. 분류라면 로짓과 적절한 활성화·손실을 사용할 수 있습니다.',s3:'3. 출력층의 기울기',s3p:'예측 오차에서 출력 가중치, 편향 및 마지막 상태로 기울기를 보냅니다.',s4:'4. 시간 역전파',s4p:'δₜ는 tanh 직전 값에 대한 손실의 기울기입니다. U를 시점마다 공유하므로 각 시점의 기여를 더합니다.',s5:'5. 동시 갱신 미리보기',s5p:'세 기울기를 모두 기존 가중치에서 구한 뒤 동시에 갱신하고 같은 예제의 손실을 다시 계산합니다. 미리보기는 슬라이더 값을 바꾸지 않으며, 한 번의 갱신이 손실 감소를 보장하지는 않습니다.'},
  en: {title:'RNN output layer and backpropagation',intro:'This regression example reads three inputs and predicts one number from the final state. In “RNN through time and learning”, the default setting uses h₃ directly as its prediction. Here it passes through an output layer. The two exercises use independent values.',fixed:'Inputs [0.5, −0.2, 0.8], h₀ = 0, input weight 1, cell bias 0, target y = 0.7, learning rate 0.1.',u:'Recurrent weight U',v:'Output weight V',b:'Output bias b',previous:'Previous step',next:'Next step',reset:'Start over',round:'Calculations use full precision; only displayed values are rounded to three decimal places.',s1:'1. Turn the sequence into hidden states',s1p:'The same U is used at all three time steps. The final state h₃ reflects the earlier inputs.',s2:'2. Output layer and loss',s2p:'V and b turn the final state into a numerical prediction. This value is not a probability. A classification task can use logits with an appropriate activation and loss.',s3:'3. Output-layer gradients',s3p:'Send the prediction error to the output weight, bias, and final state.',s4:'4. Backpropagation through time',s4p:'δₜ is the loss gradient with respect to the value before tanh. U is shared across time, so we add the contribution from each step.',s5:'5. Preview one simultaneous update',s5p:'All three gradients are calculated at the original weights, then updated together. The loss is recalculated on the same example. This preview does not change the sliders, and one update does not guarantee a lower loss.'}
};

export function rnnOutputMarkup(values, lang) {
  const t = copy[lang];
  const controls = [['u',-1.5,1.5],['v',-2,2],['b',-1,1]].map(([key,min,max]) => `<div class="sequence-control"><label for="rnn-output-${key}">${t[key]} <output id="rnn-output-value-${key}">${n(values[key])}</output></label><input id="rnn-output-${key}" data-rnn-output-input="${key}" type="range" min="${min}" max="${max}" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab" aria-labelledby="rnn-output-title"><div class="eyebrow">RNN / OUTPUT LAYER</div><h2 id="rnn-output-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="rnn-output-result" aria-live="polite"></div><div class="sequence-actions"><span id="rnn-output-status"></span><button type="button" data-rnn-output-action="previous">${t.previous}</button><button type="button" data-rnn-output-action="next">${t.next} →</button><button type="button" data-rnn-output-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p></section>`;
}

export function rnnOutputResult(values, lang, stage) {
  const t=copy[lang], {u,v,b}=values, r=rnnOutputExperiment(u,v,b), h=r.states;
  const items = [
    `<li><b>${t.s1}</b><p>${t.s1p}</p><code>${r.inputs.map((x,i)=>`h${i+1} = tanh(${n(x)} + ${n(u)} × ${n(h[i])}) = ${n(h[i+1])}`).join('<br>')}</code></li>`,
    `<li><b>${t.s2}</b><p>${t.s2p}</p><code>ŷ = Vh₃ + b = ${n(v)} × ${n(h[3])} + ${n(b)} = ${n(r.prediction)}<br>L = (ŷ − y)² = (${n(r.prediction)} − 0.700)² = ${n(r.loss)}</code></li>`,
    `<li><b>${t.s3}</b><p>${t.s3p}</p><code>∂L/∂ŷ = 2(ŷ − y) = ${n(r.outputGradient)}<br>∂L/∂V = (∂L/∂ŷ)h₃ = ${n(r.outputGradient)} × ${n(h[3])} = ${n(r.dv)}<br>∂L/∂b = ∂L/∂ŷ = ${n(r.db)}<br>∂L/∂h₃ = (∂L/∂ŷ)V = ${n(r.outputGradient)} × ${n(v)} = ${n(r.outputGradient*v)}</code></li>`,
    `<li><b>${t.s4}</b><p>${t.s4p}</p><code>δ₃ = (∂L/∂h₃)(1 − h₃²) = ${n(r.delta[2])}<br>δ₂ = δ₃U(1 − h₂²) = ${n(r.delta[1])}<br>δ₁ = δ₂U(1 − h₁²) = ${n(r.delta[0])}<br>∂L/∂U = δ₁h₀ + δ₂h₁ + δ₃h₂<br>= ${r.contributions.map(x=>`(${n(x)})`).join(' + ')} = ${n(r.du)}</code></li>`,
    `<li><b>${t.s5}</b><p>${t.s5p}</p><code>U_new = ${n(u)} − 0.1 × ${n(r.du)} = ${n(r.updated.u)}<br>V_new = ${n(v)} − 0.1 × ${n(r.dv)} = ${n(r.updated.v)}<br>b_new = ${n(b)} − 0.1 × ${n(r.db)} = ${n(r.updated.b)}<br>ŷ_new = ${n(r.after.prediction)}<br>L_new = (${n(r.after.prediction)} − 0.700)² = ${n(r.after.loss)}</code></li>`
  ];
  return `<ol class="sequence-steps">${items.slice(0,stage).join('')}</ol>`;
}
