const number = value => value !== 0 && Math.abs(value) < 0.001 ? value.toExponential(3) : value.toFixed(3);
const sigmoid = x => 1 / (1 + Math.exp(-x));

export function lstmExample(v) {
  const f = sigmoid(v.forgetLogit), i = sigmoid(v.inputLogit), o = sigmoid(v.outputLogit), g = Math.tanh(v.candidateLogit);
  const c = f * v.previous + i * g, h = o * Math.tanh(c);
  let c5 = v.previous;
  for (let step = 0; step < 5; step++) c5 = f * c5 + i * g;
  return { f, i, o, g, c, h, c5, sensitivity: f ** 5 };
}

const copy = {
  ko: { title:'LSTM 게이트와 기억', intro:'슬라이더로 게이트의 입력을 바꾸고, 기억과 출력이 만들어지는 과정을 단계별로 따라가 보세요.', fixed:'하나의 숫자로 줄인 독립 예제입니다. z는 현재 입력과 이전 은닉 상태의 가중합과 편향을 대신해 직접 지정합니다. 앞의 RNN 실습과 연결된 학습 결과는 아닙니다.', previous:'이전 셀 상태 cₜ₋₁', forgetLogit:'망각 게이트 입력 zᶠ', inputLogit:'입력 게이트 입력 zⁱ', outputLogit:'출력 게이트 입력 zᵒ', candidateLogit:'새 기억 후보 입력 zᵍ', prev:'이전 단계', next:'다음 단계', reset:'처음부터', gates:'시그모이드는 각 게이트를 0과 1 사이로 바꿉니다. 망각과 입력 게이트는 각각 독립적이므로 합이 1일 필요는 없습니다. tanh 후보는 음수일 수도 있습니다.', cell:'이전 기억의 일부와 새 후보의 일부를 더합니다. 셀 상태 c는 −1과 1 사이에 제한되지 않습니다.', hidden:'출력 게이트는 셀 상태를 tanh로 변환한 값 중 얼마나 드러낼지 조절합니다. c와 h는 서로 다른 상태이며 다음 시점에 전달됩니다.', gradient:'별도의 가정: 같은 f, i, g를 고정한 채 다섯 번 반복합니다. c₀는 위의 이전 셀 상태와 같습니다. 아래 미분은 이 고정된 직접 경로만의 민감도입니다. 실제 LSTM에서는 게이트가 이전 h에 의존해 추가 경로가 생기므로 전체 미분과 같다고 일반화할 수 없습니다.', rounding:'계산은 전체 정밀도로 수행하고 표시값을 반올림합니다.', reference:'PyTorch LSTM 수식 ↗' },
  en: { title:'LSTM gates and memory', intro:'Change the gate inputs and follow how memory and output are calculated.', fixed:'This is an independent scalar example. Set each z directly as a stand-in for the weighted input and previous hidden state plus bias. These are not learned results from the preceding RNN exercise.', previous:'Previous cell state cₜ₋₁', forgetLogit:'Forget gate input zᶠ', inputLogit:'Input gate input zⁱ', outputLogit:'Output gate input zᵒ', candidateLogit:'Candidate input zᵍ', prev:'Previous step', next:'Next step', reset:'Start over', gates:'Sigmoid maps each gate between 0 and 1. Forget and input gates are independent and do not need to add to 1. The tanh candidate can also be negative.', cell:'Add the retained part of the old memory to the selected part of the new candidate. The cell state c is not restricted to −1 through 1.', hidden:'The output gate controls how much of tanh(c) is exposed. c and h are distinct states passed to the next time step.', gradient:'Separate assumption: repeat five steps with the same f, i and g held fixed. c₀ equals the previous cell state above. This derivative is sensitivity along that fixed direct path only. In an actual LSTM, gates depend on the previous h, creating additional paths, so it is not generally the full derivative.', rounding:'Calculations use full precision; displayed values are rounded.', reference:'PyTorch LSTM equations ↗' }
};

export function lstmMarkup(values, lang) {
  const t = copy[lang];
  const controls = [['previous',-2,2],['forgetLogit',-4,4],['inputLogit',-4,4],['outputLogit',-4,4],['candidateLogit',-2,2]].map(([key,min,max]) => `<div class="sequence-control"><label for="lstm-${key}">${t[key]} <output id="lstm-value-${key}">${number(values[key])}</output></label><input id="lstm-${key}" data-lstm-input="${key}" type="range" min="${min}" max="${max}" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab lstm-lab" aria-labelledby="lstm-title"><div class="eyebrow">RNN / LSTM</div><h2 id="lstm-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="lstm-output" aria-live="polite"></div><div class="sequence-actions"><span id="lstm-status"></span><button type="button" data-lstm-action="previous">${t.prev}</button><button type="button" data-lstm-action="next">${t.next} →</button><button type="button" data-lstm-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.LSTM.html" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function lstmOutput(v, lang, stage) {
  const t = copy[lang], r = lstmExample(v), n = number;
  const sections = [
    `<code>σ(z) = 1 / (1 + e⁻ᶻ)<br>fₜ = σ(${n(v.forgetLogit)}) = ${n(r.f)}<br>iₜ = σ(${n(v.inputLogit)}) = ${n(r.i)}<br>oₜ = σ(${n(v.outputLogit)}) = ${n(r.o)}<br>gₜ = tanh(${n(v.candidateLogit)}) = ${n(r.g)}</code><p>${t.gates}</p>`,
    `<code>cₜ = fₜcₜ₋₁ + iₜgₜ<br>= ${n(r.f)} × ${n(v.previous)} + ${n(r.i)} × ${n(r.g)} = ${n(r.c)}</code><p>${t.cell}</p>`,
    `<code>hₜ = oₜ tanh(cₜ)<br>= ${n(r.o)} × tanh(${n(r.c)}) = ${n(r.h)}</code><p>${t.hidden}</p>`,
    `<code>cₖ = ${n(r.f)}cₖ₋₁ + ${n(r.i)} × ${n(r.g)}<br>c₅ = ${n(r.c5)}<br>∂c₅/∂c₀ = f⁵ = ${n(r.f)}⁵ = ${n(r.sensitivity)}</code><p>${t.gradient}</p>`
  ];
  return `<div class="conv-calc">${sections.slice(0,stage).join('')}</div>`;
}
