const number = value => value.toFixed(3);
const sigmoid = value => 1 / (1 + Math.exp(-value));

// Scalar form of the PyTorch GRUCell equations; a and b are precomputed affine terms.
export function gruExample(v) {
  const r = sigmoid(v.resetLogit), z = sigmoid(v.updateLogit);
  const candidate = Math.tanh(v.inputTerm + r * v.recurrentTerm);
  return {r, z, candidate, next: (1 - z) * candidate + z * v.previous};
}

const copy = {
  ko: {
    title:'GRU: 두 게이트로 상태 갱신',
    intro:'리셋 게이트와 갱신 게이트를 바꾸어 한 시점의 새로운 은닉 상태를 계산합니다.',
    fixed:'독립적인 스칼라 예제입니다. 게이트 입력과 후보의 두 항은 현재 입력·이전 상태·가중치·편향으로 계산되었다고 가정하고 직접 지정합니다. 위 RNN이나 LSTM 실습의 학습 결과와 연결되지 않습니다.',
    previous:'이전 은닉 상태 hₜ₋₁', resetLogit:'리셋 게이트 입력 qʳ', updateLogit:'갱신 게이트 입력 qᶻ', inputTerm:'후보의 입력 항 a', recurrentTerm:'후보의 이전 상태 항 b',
    gates:'시그모이드는 두 입력을 0과 1 사이의 게이트 값으로 바꿉니다. r은 후보를 만들 때 이전 상태 항의 크기를 조절하고, z는 마지막에 이전 상태를 보존할 비율을 정합니다.',
    candidate:'이 예제에서 a는 Wᵢₙxₜ+bᵢₙ, b는 Wₕₙhₜ₋₁+bₕₙ을 대신합니다. r이 작으면 후보에 들어가는 이전 상태 항이 줄어듭니다. 실제 모델에서는 a와 b도 입력·상태와 학습된 매개변수로 계산합니다.',
    mix:'z가 1에 가까우면 이전 상태를 더 많이 보존하고, 0에 가까우면 새 후보를 더 많이 반영합니다. 여기서는 PyTorch의 관례에 따라 z가 이전 상태의 비율입니다. hₜ는 다음 시점으로 전달됩니다.',
    compare:'LSTM은 별도 셀 상태 c와 은닉 상태 h, 망각·입력·출력 게이트를 사용합니다. 이 GRU에는 별도 셀 상태가 없고, z와 1−z가 이전 상태와 후보를 섞습니다. 게이트가 장기 정보를 항상 보존한다는 뜻은 아닙니다.',
    rounding:'전체 정밀도로 계산하며 표시만 반올림합니다.', prev:'이전 계산', next:'다음 계산', reset:'처음부터', reference:'PyTorch GRUCell 수식 ↗'
  },
  en: {
    title:'GRU: update a state with two gates',
    intro:'Change the reset and update gates to calculate a new hidden state for one time step.',
    fixed:'This is an independent scalar example. Gate inputs and the two candidate terms stand in for calculations from the current input, previous state, weights and biases; set them directly here. They do not share learned results with the RNN or LSTM exercises above.',
    previous:'Previous hidden state hₜ₋₁', resetLogit:'Reset gate input qʳ', updateLogit:'Update gate input qᶻ', inputTerm:'Candidate input term a', recurrentTerm:'Candidate recurrent term b',
    gates:'Sigmoid maps each input to a gate between 0 and 1. r controls the recurrent contribution to the candidate; z controls how much previous state is retained in the final mix.',
    candidate:'Here a stands for Wᵢₙxₜ+bᵢₙ and b for Wₕₙhₜ₋₁+bₕₙ. A smaller r reduces the recurrent contribution to the candidate. In a real model, a and b are also computed from the input, state and learned parameters.',
    mix:'When z is near 1, more of the old state is retained; near 0, more of the candidate is used. In the PyTorch convention used here, z is the old-state weight. hₜ is passed to the next time step.',
    compare:'An LSTM uses separate cell c and hidden h states, with forget, input and output gates. This GRU has no separate cell state; z and 1−z mix the old state and candidate. Gates do not guarantee that long-term information will always be retained.',
    rounding:'Calculations use full precision; displayed values are rounded.', prev:'Previous calculation', next:'Next calculation', reset:'Start over', reference:'PyTorch GRUCell equations ↗'
  }
};

export function gruMarkup(values, lang) {
  const t=copy[lang];
  const controls=[['previous',-1,1],['resetLogit',-4,4],['updateLogit',-4,4],['inputTerm',-2,2],['recurrentTerm',-2,2]].map(([key,min,max])=>`<div class="sequence-control"><label for="gru-${key}">${t[key]} <output id="gru-value-${key}">${number(values[key])}</output></label><input id="gru-${key}" data-gru-input="${key}" type="range" min="${min}" max="${max}" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab gru-lab" aria-labelledby="gru-title"><div class="eyebrow">RNN / GRU</div><h2 id="gru-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="gru-output" aria-live="polite"></div><div class="sequence-actions"><span id="gru-status"></span><button type="button" data-gru-action="previous">${t.prev}</button><button type="button" data-gru-action="next">${t.next} →</button><button type="button" data-gru-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.GRUCell.html" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function gruOutput(v, lang, stage) {
  const t=copy[lang], r=gruExample(v), n=number;
  const steps=[
    `<code>qʳ = Wᵢᵣxₜ + bᵢᵣ + Wₕᵣhₜ₋₁ + bₕᵣ<br>qᶻ = Wᵢᶻxₜ + bᵢᶻ + Wₕᶻhₜ₋₁ + bₕᶻ<br>σ(q) = 1 / (1 + e⁻ᑫ)<br>rₜ = σ(${n(v.resetLogit)}) = ${n(r.r)}<br>zₜ = σ(${n(v.updateLogit)}) = ${n(r.z)}</code><p>${t.gates}</p>`,
    `<code>nₜ = tanh(a + rₜb)<br>= tanh(${n(v.inputTerm)} + ${n(r.r)} × ${n(v.recurrentTerm)}) = ${n(r.candidate)}</code><p>${t.candidate}</p>`,
    `<code>hₜ = (1 − zₜ)nₜ + zₜhₜ₋₁<br>= (1 − ${n(r.z)}) × ${n(r.candidate)} + ${n(r.z)} × ${n(v.previous)} = ${n(r.next)}</code><p>${t.mix}</p><p>${t.compare}</p>`
  ];
  return `<div class="conv-calc">${steps.slice(0,stage).join('')}</div>`;
}
