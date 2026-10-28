// One scalar hidden state, zero input and bias, shared recurrent weight.
// The product measures sensitivity to h0, not the recurrent-weight gradient.
export function rnnGradientFlow(initial, weight, steps) {
  const rows=[{step:0, state:initial, factor:null, sensitivity:1}];
  for(let t=1;t<=steps;t++) {
    const previous=rows[t-1];
    const state=Math.tanh(weight*previous.state);
    const factor=weight*(1-state*state);
    rows.push({step:t,state,factor,sensitivity:previous.sensitivity*factor});
  }
  return rows;
}

const number=value=>value!==0&&(Math.abs(value)<0.001||Math.abs(value)>=10000)
  ? value.toExponential(3) : (Math.abs(value)<0.0000005?0:value).toFixed(3);
const text={
  ko:{title:'시간을 지나는 기울기',intro:'같은 셀을 반복할 때 초기 상태의 영향이 어떻게 변하는지 살펴봅니다. 가중치와 초기 상태를 바꾼 뒤 시간을 한 단계씩 늘려 보세요.',fixed:'축소 예제: 매 시점 입력 xₜ=0, 편향 b=0, hₜ=tanh(whₜ₋₁). w는 시점마다 공유합니다. 이 실습은 가중치를 학습하지 않습니다.',initial:'초기 상태 h₀',weight:'순환 가중치 w',previous:'이전 시점',next:'다음 시점',reset:'처음부터',step:'시점',state:'상태 hₜ',factor:'한 단계 미분',product:'누적 미분',baseline:'아직 반복 전이므로 h₀에 대한 h₀의 미분은 1입니다.',local:'각 시점의 미분은 이전 상태가 현재 상태를 얼마나 바꾸는지 나타냅니다. 누적 미분은 지금까지의 미분을 곱한 값입니다.',meaning:'마지막 상태에서 전달된 기울기를 ∂L/∂hₜ=1로 가정하면 ∂L/∂h₀는 이 누적 미분과 같습니다. 값이 작으면 이 경로를 통한 초기 상태의 영향이 약해지고, 크면 증폭됩니다. 이는 w에 대한 전체 손실 기울기와는 다릅니다.',limit:'이 예는 하나의 상태와 한 경로만 보여 줍니다. 실제 RNN의 벡터·행렬과 여러 손실에서는 기울기 기여를 함께 고려해야 합니다. 값이 커졌다가 tanh 포화로 다시 작아질 수도 있습니다.',round:'계산은 전체 정밀도로 수행하며 작은 값은 지수 표기로 표시합니다.',reference:'RNN 기울기 소실·폭주 연구 ↗'},
  en:{title:'Gradients across time',intro:'See how the influence of the initial state changes as one cell repeats. Change the weight or initial state, then advance one time step at a time.',fixed:'Toy example: input xₜ=0 and bias b=0 at every step, with hₜ=tanh(whₜ₋₁). The same w is shared across time. This exercise does not train the weight.',initial:'Initial state h₀',weight:'Recurrent weight w',previous:'Previous step',next:'Next step',reset:'Start over',step:'Step',state:'State hₜ',factor:'Local derivative',product:'Cumulative derivative',baseline:'Before any transition, the derivative of h₀ with respect to itself is 1.',local:'The local derivative measures how the previous state affects the current state. The cumulative derivative multiplies the local derivatives so far.',meaning:'If the gradient arriving at the last state is ∂L/∂hₜ=1, then ∂L/∂h₀ equals this cumulative derivative. A small value weakens the influence of the initial state along this path; a large value amplifies it. This is not the complete loss gradient with respect to w.',limit:'This example shows one scalar state and one path. Real RNNs use vectors, matrices and potentially multiple losses, whose gradient contributions must be considered together. A value can grow and later shrink as tanh saturates.',round:'Calculations use full precision; small values use scientific notation.',reference:'Research on vanishing and exploding RNN gradients ↗'}
};

export function rnnGradientMarkup(values,lang) {
  const t=text[lang];
  const controls=[['initial',-1,1,0.05],['weight',-2,2,0.1]].map(([key,min,max,step])=>
    `<div class="sequence-control"><label for="rnn-flow-${key}">${t[key]} <output id="rnn-flow-value-${key}">${number(values[key])}</output></label><input id="rnn-flow-${key}" data-rnn-flow-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab rnn-flow-lab" aria-labelledby="rnn-flow-title"><div class="eyebrow">${lang==='ko'?'RNN / 기울기 흐름':'RNN / GRADIENT FLOW'}</div><h2 id="rnn-flow-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="rnn-flow-output" aria-live="polite"></div><div class="sequence-actions"><span id="rnn-flow-status"></span><button type="button" data-rnn-flow-action="previous">${t.previous}</button><button type="button" data-rnn-flow-action="next">${t.next} →</button><button type="button" data-rnn-flow-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://proceedings.mlr.press/v28/pascanu13.html" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function rnnGradientOutput(values,lang,step) {
  const t=text[lang], rows=rnnGradientFlow(values.initial,values.weight,step), current=rows.at(-1);
  const table=rows.map(r=>`<tr><td>${r.step}</td><td>${number(r.state)}</td><td>${r.factor===null?'—':number(r.factor)}</td><td>${number(r.sensitivity)}</td></tr>`).join('');
  const calculation=step===0?`<p>${t.baseline}</p><code>∂h₀/∂h₀ = 1</code>`:
    `<code>h${step} = tanh(${number(values.weight)} × ${number(rows.at(-2).state)}) = ${number(current.state)}<br>∂h${step}/∂h${step-1} = ${number(values.weight)} × (1 − ${number(current.state)}²) = ${number(current.factor)}<br>∂h${step}/∂h₀ = ${number(rows.at(-2).sensitivity)} × ${number(current.factor)} = ${number(current.sensitivity)}</code><p>${t.local}</p>`;
  return `<div class="conv-calc">${calculation}<p>${t.meaning}</p><p>${t.limit}</p></div><div class="training-history"><table><thead><tr><th scope="col">${t.step}</th><th scope="col">${t.state}</th><th scope="col">${t.factor}</th><th scope="col">${t.product}</th></tr></thead><tbody>${table}</tbody></table></div>`;
}
