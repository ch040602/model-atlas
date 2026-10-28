// A scalar RNN with a shared recurrent weight and a loss on its last state.
// Values are kept at full precision; only the displayed numbers are rounded.
export function sequenceExperiment(inputs, recurrentWeight, target, learningRate = 0.1, allSteps = false) {
  function forward(weight) {
    const states = [0];
    for (const x of inputs) states.push(Math.tanh(x + weight * states.at(-1)));
    return states;
  }
  const states = forward(recurrentWeight);
  const lossFor = values => allSteps ? values.slice(1).reduce((sum, h) => sum + (h - target) ** 2, 0) : (values.at(-1) - target) ** 2;
  const loss = lossFor(states);
  const deltas = Array(inputs.length);
  for (let i = inputs.length - 1; i >= 0; i--) {
    const direct = (allSteps || i === inputs.length - 1) ? 2 * (states[i + 1] - target) : 0;
    const outputGradient = direct + (i === inputs.length - 1 ? 0 : deltas[i + 1] * recurrentWeight);
    deltas[i] = outputGradient * (1 - states[i + 1] ** 2);
  }
  const contributions = deltas.map((delta, i) => delta * states[i]);
  const gradient = contributions.reduce((sum, value) => sum + value, 0);
  const updatedWeight = recurrentWeight - learningRate * gradient;
  const updatedStates = forward(updatedWeight);
  const updatedLoss = lossFor(updatedStates);
  return { states, loss, deltas, contributions, gradient, updatedWeight, updatedStates, updatedLoss };
}

// Preview training all three shared scalar parameters from the same forward pass.
// The baseline above fixes Wx=1, b=0 and h0=0; this does not mutate that exercise.
export function sequenceAllWeights(inputs, recurrentWeight, target, rate, allSteps=false) {
  const base=sequenceExperiment(inputs,recurrentWeight,target,rate,allSteps);
  const inputContributions=base.deltas.map((delta,i)=>delta*inputs[i]);
  const biasContributions=[...base.deltas];
  const inputGradient=inputContributions.reduce((sum,value)=>sum+value,0);
  const biasGradient=biasContributions.reduce((sum,value)=>sum+value,0);
  const nextInputWeight=1-rate*inputGradient;
  const nextWeight=recurrentWeight-rate*base.gradient;
  const nextBias=-rate*biasGradient;
  const updatedStates=[0];
  for(const input of inputs) updatedStates.push(Math.tanh(nextInputWeight*input+nextWeight*updatedStates.at(-1)+nextBias));
  const updatedLoss=allSteps ? updatedStates.slice(1).reduce((sum,h)=>sum+(h-target)**2,0) : (updatedStates.at(-1)-target)**2;
  return {...base,inputContributions,biasContributions,inputGradient,biasGradient,nextInputWeight,nextWeight,nextBias,updatedStates,updatedLoss};
}

const number = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const fields = [
  ['x1', -1, 1, 0.1], ['x2', -1, 1, 0.1], ['x3', -1, 1, 0.1],
  ['weight', -2, 2, 0.1], ['target', -1, 1, 0.1]
];
const labels = {
  ko: { x1:'입력 x₁', x2:'입력 x₂', x3:'입력 x₃', weight:'순환 가중치 Wₕ', target:'정답 y', title:'RNN의 시간 흐름과 학습', intro:'같은 셀과 가중치를 세 번 사용합니다. 입력을 바꾸고 계산을 한 단계씩 펼쳐 보세요.', fixed:'입력 가중치 Wₓ = 1, 편향 b = 0, 초기 상태 h₀ = 0, 학습률 η = 0.1. 이 실습에서는 Wₕ만 갱신합니다.', next:'다음 단계', previous:'이전 단계', reset:'처음부터', forward:'순전파', loss:'마지막 상태의 손실', back:'시간 역전파', update:'가중치 갱신 후 다시 계산', full:'계산은 전체 정밀도로 수행하고 화면에는 소수 셋째 자리까지 표시합니다.', lossMeaning:'이 예제는 마지막 상태 h₃을 예측값으로 사용합니다. 손실이 작을수록 목표에 가깝습니다.', backwardMeaning:'zₜ = xₜ + Wₕhₜ₋₁, δₜ = ∂L/∂zₜ입니다. 마지막 손실에서 시작해 tanh의 기울기 1 − hₜ²를 곱합니다.', propagate:'뒤 시점의 기울기를 공유 가중치와 현재 시점의 tanh 기울기를 통해 전달합니다. 이 예제의 손실은 마지막 상태에만 직접 걸려 있습니다.', sumMeaning:'Wₕ가 모든 시점에서 재사용되므로 각 시점의 직접 기여 δₜhₜ₋₁을 더합니다. δ에는 이후 시점으로 이어지는 영향이 이미 포함되어 있습니다.', zero:'첫 시점은 h₀ = 0이므로 Wₕ의 직접 기여가 0입니다.', after:'같은 입력과 정답으로 새 가중치의 손실을 다시 계산합니다. 한 번의 갱신이 항상 손실을 줄이는 것은 아닙니다.' },
  en: { x1:'Input x₁', x2:'Input x₂', x3:'Input x₃', weight:'Recurrent weight Wₕ', target:'Target y', title:'RNN through time and learning', intro:'The same cell and weights are used three times. Change the inputs and reveal the calculations one step at a time.', fixed:'Input weight Wₓ = 1, bias b = 0, initial state h₀ = 0, learning rate η = 0.1. This exercise updates only Wₕ.', next:'Next step', previous:'Previous step', reset:'Start over', forward:'Forward pass', loss:'Loss on the final state', back:'Backpropagation through time', update:'After one weight update', full:'Calculations use full precision; displayed values are rounded to three decimal places.', lossMeaning:'This example uses the final state h₃ as its prediction. A smaller loss means it is closer to the target.', backwardMeaning:'zₜ = xₜ + Wₕhₜ₋₁ and δₜ = ∂L/∂zₜ. Start at the final loss and multiply by the tanh derivative 1 − hₜ².', propagate:'Pass the later gradient back through the shared weight and the current tanh derivative. In this example, the loss is applied directly only to the final state.', sumMeaning:'Since Wₕ is reused at every step, add the direct contributions δₜhₜ₋₁. Each δ already includes its influence on later steps.', zero:'The first step has no direct contribution to Wₕ because h₀ = 0.', after:'Recalculate the loss for the same inputs and target using the new weight. A single update does not always reduce the loss.' }
};

const perStepCopy = {
  ko:{toggle:'모든 시점에 손실 적용',hint:'기본은 마지막 시점의 손실만 사용합니다. 선택하면 비교를 위해 같은 정답 y를 세 시점 모두에 적용하고 손실을 합합니다. 실제 작업에서는 각 시점의 정답이 서로 다를 수 있습니다.',loss:'모든 시점의 손실 합',lossMeaning:'각 상태를 예측으로 보고 같은 y와 비교한 세 제곱 오차의 합입니다. 마지막 시점만 비교하는 경우와 손실의 정의가 다르므로 두 숫자를 그대로 성능 비교에 쓰지 않습니다.',propagate:'현재 시점의 직접 손실 기울기와 다음 시점에서 전달된 기울기를 더한 뒤 tanh의 기울기를 곱합니다.',after:'같은 입력과 같은 정답으로 새 가중치의 세 시점 손실을 다시 합합니다. 한 번의 갱신이 항상 손실을 줄이는 것은 아닙니다.'},
  en:{toggle:'Apply loss at every step',hint:'By default, only the final step has a loss. Select this to apply the same target y at all three steps and sum the losses for comparison. Real tasks may use a different target at each step.',loss:'Sum of losses at all steps',lossMeaning:'Each state is treated as a prediction and compared with the same y; the three squared errors are summed. This is a different loss definition from final-step loss, so their raw values are not a direct performance comparison.',propagate:'Add the direct gradient from the current step’s loss and the gradient carried back from the next step, then multiply by the tanh derivative.',after:'Sum the losses again across the same inputs and target after the weight update. A single update does not always reduce the loss.'}
};

const allWeightsCopy={
  ko:{title:'입력 가중치와 편향도 함께 학습하면?', intro:'앞 예제의 입력과 현재 가중치, 손실 선택을 사용한 별도의 갱신 미리보기입니다. Wₓ=1, b=0에서 시작하며 위 실습의 값은 바꾸지 않습니다.', rate:'미리보기 학습률 η', deriv:'1. 같은 순전파 결과에서 세 기울기 계산', derivText:'모든 시점이 같은 Wₓ, Wₕ, b를 공유합니다. 각 δₜ=∂L/∂zₜ는 선택한 손실에서 시간 역전파로 구한 값입니다. 각 매개변수의 시점별 기여를 더합니다.', update:'2. 세 매개변수를 동시에 갱신', updateText:'세 기울기를 모두 기존 매개변수에서 구한 뒤 함께 갱신합니다. 바뀐 값으로 같은 입력을 다시 순전파해 손실을 계산합니다. 한 번의 갱신이 손실 감소를 보장하지는 않습니다.', loss:'갱신 전 손실', nextLoss:'갱신 후 손실', fixed:'실제 RNN은 보통 벡터와 행렬, 출력층을 사용합니다. 여기는 스칼라 셀의 설명용 예제입니다.', rounding:'화면에는 반올림한 값을 표시하지만 계산에는 전체 정밀도를 사용합니다.'},
  en:{title:'What if input weight and bias also learn?', intro:'This separate update preview uses the inputs, current recurrent weight and loss selection above. It starts with Wx=1 and b=0 and does not change the exercise above.', rate:'Preview learning rate η', deriv:'1. Calculate all three gradients from the same forward pass', derivText:'Every step shares Wx, Wh and b. Each δₜ=∂L/∂zₜ comes from backpropagation through time for the selected loss. Add each parameter’s contributions across steps.', update:'2. Update the three parameters simultaneously', updateText:'Compute all gradients at the old parameters before updating them together. Run the same inputs forward with the new values to calculate loss again. A single update does not guarantee a lower loss.', loss:'Loss before update', nextLoss:'Loss after update', fixed:'Real RNNs generally use vectors, matrices and an output layer. This is an illustrative scalar cell.', rounding:'Displayed numbers are rounded; calculations use full precision.'}
};
export function sequenceAllWeightsOutput(values,lang) {
  const t=allWeightsCopy[lang], n=number, xs=[values.x1,values.x2,values.x3];
  const r=sequenceAllWeights(xs,values.weight,values.target,values.previewRate,values.allSteps);
  const contributions=a=>a.map(n).join(' + ');
  const newStates=xs.map((x,i)=>`h${i+1},new = tanh(${n(r.nextInputWeight)} × ${n(x)} + ${n(r.nextWeight)} × ${n(r.updatedStates[i])} + ${n(r.nextBias)}) = ${n(r.updatedStates[i+1])}`).join('<br>');
  return `<ol class="sequence-steps"><li><b>${t.deriv}</b><p>${t.derivText}</p><code>δ₁, δ₂, δ₃ = ${r.deltas.map(n).join(', ')}<br>∂L/∂Wₓ = Σ δₜxₜ = ${contributions(r.inputContributions)} = ${n(r.inputGradient)}<br>∂L/∂Wₕ = Σ δₜhₜ₋₁ = ${contributions(r.contributions)} = ${n(r.gradient)}<br>∂L/∂b = Σ δₜ = ${contributions(r.biasContributions)} = ${n(r.biasGradient)}</code></li><li><b>${t.update}</b><p>${t.updateText}</p><code>Wₓ,new = 1 − ${n(values.previewRate)} × ${n(r.inputGradient)} = ${n(r.nextInputWeight)}<br>Wₕ,new = ${n(values.weight)} − ${n(values.previewRate)} × ${n(r.gradient)} = ${n(r.nextWeight)}<br>b_new = 0 − ${n(values.previewRate)} × ${n(r.biasGradient)} = ${n(r.nextBias)}<br>${newStates}<br>${t.loss}: ${n(r.loss)}<br>${t.nextLoss}: ${n(r.updatedLoss)}</code></li></ol><p>${t.fixed} ${t.rounding}</p>`;
}

export function sequenceLabMarkup(values, lang) {
  const t = labels[lang];
  const p = perStepCopy[lang];
  const controls = fields.map(([key,min,max,step]) => `<div class="sequence-control"><label for="sequence-${key}">${t[key]} <output id="sequence-value-${key}">${number(values[key])}</output></label><input id="sequence-${key}" data-sequence-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab" aria-labelledby="sequence-title"><div class="eyebrow">RNN / LEARNING THROUGH TIME</div><h2 id="sequence-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><label class="sequence-mode"><input type="checkbox" data-sequence-all-steps ${values.allSteps?'checked':''}> ${p.toggle}</label><p>${p.hint}</p><div id="sequence-output" aria-live="polite"></div><div class="sequence-actions"><span id="sequence-status"></span><button type="button" data-sequence-action="previous">${t.previous}</button><button type="button" data-sequence-action="next">${t.next} →</button><button type="button" data-sequence-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.full}</p><details class="training-bias"><summary>${allWeightsCopy[lang].title}</summary><p>${allWeightsCopy[lang].intro}</p><div class="sequence-control"><label for="sequence-preview-rate">${allWeightsCopy[lang].rate} <output id="sequence-preview-rate-value">${number(values.previewRate)}</output></label><input id="sequence-preview-rate" data-sequence-preview-rate type="range" min="0" max="0.5" step="0.05" value="${values.previewRate}"></div><div id="sequence-all-output" aria-live="polite"></div></details></section>`;
}

export function sequenceLabOutput(values, lang, stage) {
  const t = labels[lang];
  const p = perStepCopy[lang];
  const inputs = [values.x1, values.x2, values.x3];
  const r = sequenceExperiment(inputs, values.weight, values.target, 0.1, values.allSteps);
  const n = number;
  const steps = inputs.map((x,i) => `<li><b>${t.forward} · t=${i+1}</b><code>h${i+1} = tanh(${n(x)} + ${n(values.weight)} × ${n(r.states[i])}) = ${n(r.states[i+1])}</code></li>`);
  const errorTerms = states => states.slice(1).map(h=>`(${n(h)} − ${n(values.target)})²`).join(' + ');
  steps.push(values.allSteps
    ? `<li><b>${p.loss}</b><code>L = Σₜ₌₁³ (hₜ − y)²<br>= ${errorTerms(r.states)} = ${n(r.loss)}</code><p>${p.lossMeaning}</p></li>`
    : `<li><b>${t.loss}</b><code>L = (h₃ − y)² = (${n(r.states[3])} − ${n(values.target)})² = ${n(r.loss)}</code><p>${t.lossMeaning}</p></li>`);
  const terms = r.contributions.map(v => `(${n(v)})`).join(' + ');
  steps.push(`<li><b>${t.back} · t=3</b><p>${t.backwardMeaning}</p><code>δ₃ = 2(h₃ − y)(1 − h₃²)<br>= 2(${n(r.states[3])} − ${n(values.target)})(1 − ${n(r.states[3])}²) = ${n(r.deltas[2])}<br>δ₃h₂ = ${n(r.deltas[2])} × ${n(r.states[2])} = ${n(r.contributions[2])}</code></li>`);
  const deltaLine = (i,next) => values.allSteps
    ? `δ${i} = [2(h${i} − y) + δ${next}Wₕ](1 − h${i}²)<br>= [2(${n(r.states[i])} − ${n(values.target)}) + ${n(r.deltas[next-1])} × ${n(values.weight)}] × (1 − ${n(r.states[i])}²) = ${n(r.deltas[i-1])}`
    : `δ${i} = δ${next}Wₕ(1 − h${i}²)<br>= ${n(r.deltas[next-1])} × ${n(values.weight)} × (1 − ${n(r.states[i])}²) = ${n(r.deltas[i-1])}`;
  steps.push(`<li><b>${t.back} · t=2</b><p>${values.allSteps?p.propagate:t.propagate}</p><code>${deltaLine(2,3)}<br>δ₂h₁ = ${n(r.deltas[1])} × ${n(r.states[1])} = ${n(r.contributions[1])}</code></li>`);
  steps.push(`<li><b>${t.back} · t=1</b><code>${deltaLine(1,2)}<br>δ₁h₀ = ${n(r.deltas[0])} × ${n(r.states[0])} = ${n(r.contributions[0])}<br>∂L/∂Wₕ = δ₁h₀ + δ₂h₁ + δ₃h₂<br>= ${terms} = ${n(r.gradient)}</code><p>${t.sumMeaning} ${t.zero}</p></li>`);
  const updatedLoss = values.allSteps ? `L_new = Σₜ₌₁³ (hₜ,new − y)²<br>= ${errorTerms(r.updatedStates)} = ${n(r.updatedLoss)}` : `h₃,new = ${n(r.updatedStates[3])}<br>L_new = (${n(r.updatedStates[3])} − ${n(values.target)})² = ${n(r.updatedLoss)}`;
  steps.push(`<li><b>${t.update}</b><code>Wₕ,new = ${n(values.weight)} − 0.1 × ${n(r.gradient)} = ${n(r.updatedWeight)}<br>${updatedLoss}</code><p>${values.allSteps?p.after:t.after}</p></li>`);
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
