// One scalar sample, squared error and ordinary gradient descent with b fixed at 0.
export function trainingStep(x, y, weight, rate) {
  const prediction = weight * x;
  const loss = (prediction - y) ** 2;
  const gradient = 2 * (prediction - y) * x;
  const nextWeight = weight - rate * gradient;
  const nextPrediction = nextWeight * x;
  const nextLoss = (nextPrediction - y) ** 2;
  return {prediction, loss, gradient, nextWeight, nextPrediction, nextLoss};
}

// A separate preview: compute both gradients at the same pre-update parameters.
export function biasTrainingStep(x, y, weight, bias, rate) {
  const prediction=weight*x+bias, error=prediction-y;
  const weightGradient=2*error*x, biasGradient=2*error;
  const nextWeight=weight-rate*weightGradient, nextBias=bias-rate*biasGradient;
  const nextPrediction=nextWeight*x+nextBias;
  return {prediction, loss:error**2, weightGradient, biasGradient, nextWeight, nextBias, nextPrediction, nextLoss:(nextPrediction-y)**2};
}

const fields = [
  ['x', -2, 2, 0.1], ['y', -2, 2, 0.1], ['initialWeight', -2, 2, 0.1], ['rate', 0, 1.5, 0.05], ['evalX', -2, 2, 0.1], ['evalY', -2, 2, 0.1]
];
const labels = {
  ko: {title:'한 예제로 학습 반복하기', intro:'다음 계산을 눌러 순전파, 역전파, 갱신 미리보기와 평가를 차례로 살펴보세요. 미리보기는 가중치를 바꾸지 않습니다. 한 번 갱신을 눌러야 기록에 반영됩니다.', fixed:'편향 b=0으로 고정하고 가중치 w만 학습합니다. 학습 입력·정답, 초기 가중치 또는 학습률을 바꾸면 기록이 초기화됩니다. 평가 예제를 바꾸면 기존 가중치로 평가만 다시 합니다.', x:'입력 x', y:'정답 y', initialWeight:'초기 가중치 w', rate:'학습률 η', evalX:'평가 입력 xᵥ', evalY:'평가 정답 yᵥ', next:'한 번 갱신', reset:'처음부터', previousStage:'이전 계산', nextStage:'다음 계산', stageLabel:'계산 단계', updateLabel:'실제 갱신 횟수', current:'현재 계산', forward:'순전파와 손실', gradient:'역전파: 연쇄법칙', gradientText:'예측이 바뀔 때 손실이 변하는 정도와 가중치가 바뀔 때 예측이 변하는 정도를 곱합니다.', update:'다음 갱신을 미리 계산', updateText:'현재 기울기의 반대 방향으로 이동한 뒤, 같은 데이터로 손실을 다시 계산합니다.', zero:'x=0이면 w를 바꿔도 예측이 바뀌지 않아 기울기가 0입니다.', increased:'이 학습률에서는 이번 갱신으로 손실이 증가합니다. 학습률을 낮춰 비교해 보세요.', history:'실제로 실행한 갱신 기록', iteration:'갱신 횟수', weight:'가중치 w', loss:'학습 손실', evalLoss:'평가 손실', evaluate:'별도 예제로 평가하기', evalText:'현재 가중치와 다음 갱신을 미리 계산한 가중치를 비교합니다. 평가 예제는 가중치를 갱신하는 데 사용하지 않습니다. 평가 예제를 바꾸면 기록의 평가 손실도 새 예제로 다시 계산됩니다. 이 예제 하나만으로 일반화 성능을 판단할 수 없습니다.', evalIncrease:'이번 갱신에서 학습 손실은 줄었지만 평가 손실은 늘었습니다. 학습 예제의 개선이 다른 데이터의 개선을 보장하지 않습니다.', limit:'최대 20회까지 기록합니다. 처음부터 다시 시작할 수 있습니다.', rounding:'계산은 전체 정밀도로 수행하고 표시는 반올림합니다. 이 예제의 손실 변화는 다른 데이터의 성능을 보장하지 않습니다.'},
  en: {title:'Repeat training on one example', intro:'Use Next calculation to reveal the forward pass, backpropagation, update preview and evaluation. The preview does not change the weight; Apply one update records an actual update.', fixed:'Bias b is fixed at 0; only weight w is trained. Changing the training input or target, initial weight, or learning rate resets the history. Changing the evaluation example only re-evaluates the existing weights.', x:'Input x', y:'Target y', initialWeight:'Initial weight w', rate:'Learning rate η', evalX:'Evaluation input xᵥ', evalY:'Evaluation target yᵥ', next:'Apply one update', reset:'Start over', previousStage:'Previous calculation', nextStage:'Next calculation', stageLabel:'Calculation step', updateLabel:'Applied updates', current:'Current calculation', forward:'Forward pass and loss', gradient:'Backpropagation: chain rule', gradientText:'Multiply how prediction affects loss by how weight affects prediction.', update:'Preview the next update', updateText:'Move opposite the current gradient, then recalculate loss on the same data.', zero:'When x=0, changing w cannot change the prediction, so the gradient is 0.', increased:'This update increases the loss at the chosen learning rate. Try a lower rate.', history:'Updates actually applied', iteration:'Updates', weight:'Weight w', loss:'Training loss', evalLoss:'Evaluation loss', evaluate:'Evaluate on a separate example', evalText:'Compare the current weight with the previewed next weight. The evaluation example is not used to update the weight. Changing it recalculates evaluation losses in the history. One example cannot establish generalization performance.', evalIncrease:'This update reduces training loss but increases evaluation loss. Improving the training example does not guarantee improvement on other data.', limit:'The history is limited to 20 updates. You can start over.', rounding:'Calculations use full precision; displayed values are rounded. Improvement on this example does not guarantee performance on other data.'}
};
const number = value => Math.abs(value) >= 10000 ? value.toExponential(3) : (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);

const biasLabels = {
  ko: {title:'편향도 함께 학습하면?', intro:'위 실습의 현재 x, y, w와 학습률을 가져와 별도의 편향 b를 더합니다. 아래는 한 번의 가상 갱신 미리보기이며 실제 학습 기록이나 위 실습의 편향을 바꾸지 않습니다.', bias:'예시 편향 b', forward:'1. 순전파와 손실', gradient:'2. 같은 현재 값에서 두 기울기 계산', role:'가중치는 입력의 영향을 조절하고 편향은 입력과 무관하게 예측의 기준을 이동합니다. 편향의 국소 기울기는 ∂L/∂ŷ에 ∂ŷ/∂b=1을 곱합니다.', update:'3. 동시에 한 번 갱신', simultaneous:'두 기울기를 모두 기존 w와 b에서 구한 뒤 함께 갱신합니다. 결과는 가상의 다음 값입니다.', zero:'입력 x=0이므로 가중치 기울기는 0이지만, 오차가 남아 있다면 편향 기울기는 0이 아닙니다.'},
  en: {title:'What if bias is trained too?', intro:'Use the current x, y, w and learning rate from the exercise above, adding a separate example bias b. This previews one hypothetical update; it does not change the actual training history or the bias in the exercise above.', bias:'Example bias b', forward:'1. Forward pass and loss', gradient:'2. Compute both gradients at the same current values', role:'Weight controls the effect of the input; bias shifts the baseline independently of the input. The local bias gradient multiplies ∂L/∂ŷ by ∂ŷ/∂b=1.', update:'3. Update both together', simultaneous:'Compute both gradients using the old w and b, then update together. The results are hypothetical next values.', zero:'With x=0 the weight gradient is zero, but the bias gradient is nonzero if an error remains.'}
};
export function biasTrainingOutput(values, weight, lang) {
  const t=biasLabels[lang], n=number, b=values.demoBias ?? 0;
  const r=biasTrainingStep(values.x,values.y,weight,b,values.rate);
  return `<ol class="sequence-steps"><li><b>${t.forward}</b><code>ŷ = w × x + b = ${n(weight)} × ${n(values.x)} + ${n(b)} = ${n(r.prediction)}<br>L = (ŷ − y)² = (${n(r.prediction)} − ${n(values.y)})² = ${n(r.loss)}</code></li><li><b>${t.gradient}</b><p>${t.role}</p><code>∂L/∂ŷ = 2(ŷ − y) = ${n(2*(r.prediction-values.y))}<br>∂L/∂w = (∂L/∂ŷ) × x = ${n(2*(r.prediction-values.y))} × ${n(values.x)} = ${n(r.weightGradient)}<br>∂L/∂b = (∂L/∂ŷ) × 1 = ${n(r.biasGradient)}</code>${values.x===0?`<p>${t.zero}</p>`:''}</li><li><b>${t.update}</b><p>${t.simultaneous}</p><code>w_new = ${n(weight)} − ${n(values.rate)} × ${n(r.weightGradient)} = ${n(r.nextWeight)}<br>b_new = ${n(b)} − ${n(values.rate)} × ${n(r.biasGradient)} = ${n(r.nextBias)}<br>ŷ_new = ${n(r.nextWeight)} × ${n(values.x)} + ${n(r.nextBias)} = ${n(r.nextPrediction)}<br>L_new = (${n(r.nextPrediction)} − ${n(values.y)})² = ${n(r.nextLoss)}</code></li></ol>`;
}

export function trainingLabMarkup(values, lang) {
  const t=labels[lang];
  const controls=fields.map(([key,min,max,step])=>`<div class="sequence-control"><label for="training-${key}">${t[key]} <output id="training-value-${key}">${number(values[key])}</output></label><input id="training-${key}" data-training-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab training-lab" aria-labelledby="training-title"><div class="eyebrow">FOUNDATIONS / GRADIENT DESCENT</div><h2 id="training-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="training-output" aria-live="polite"></div><div class="sequence-actions"><b>${t.stageLabel}</b><span id="training-stage-status"></span><button type="button" data-training-stage="previous">${t.previousStage}</button><button type="button" data-training-stage="next">${t.nextStage} →</button></div><div class="sequence-actions"><b>${t.updateLabel}</b><span id="training-status"></span><button type="button" data-training-action="next">${t.next}</button><button type="button" data-training-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.limit} ${t.rounding}</p><details class="training-bias" id="training-bias"><summary>${biasLabels[lang].title}</summary><p>${biasLabels[lang].intro}</p><div class="sequence-control"><label for="training-bias-input">${biasLabels[lang].bias} <output id="training-bias-value">${number(values.demoBias ?? 0)}</output></label><input id="training-bias-input" data-training-bias type="range" min="-2" max="2" step="0.1" value="${values.demoBias ?? 0}"></div><div id="training-bias-output" aria-live="polite"></div></details></section>`;
}

export function trainingLabOutput(values, weight, history, lang, stage=4) {
  const t=labels[lang], n=number, r=trainingStep(values.x,values.y,weight,values.rate);
  const evalLoss=w=>(w*values.evalX-values.evalY)**2;
  const currentEval=evalLoss(weight), nextEval=evalLoss(r.nextWeight);
  const rows=history.map((row,i)=>`<tr><td>${i}</td><td>${n(row.weight)}</td><td>${n(row.loss)}</td><td>${n(evalLoss(row.weight))}</td></tr>`).join('');
  const note=values.x===0?t.zero:r.nextLoss>r.loss+1e-12?t.increased:'';
  const evalNote=r.nextLoss<r.loss-1e-12 && nextEval>currentEval+1e-12?t.evalIncrease:'';
  const steps=[
    `<li><b>${t.current} · ${t.forward}</b><code>ŷ = w × x = ${n(weight)} × ${n(values.x)} = ${n(r.prediction)}<br>L = (ŷ − y)² = (${n(r.prediction)} − ${n(values.y)})² = ${n(r.loss)}</code></li>`,
    `<li><b>${t.gradient}</b><p>${t.gradientText}</p><code>∂L/∂ŷ = 2(ŷ − y) = 2 × (${n(r.prediction)} − ${n(values.y)}) = ${n(2*(r.prediction-values.y))}<br>∂ŷ/∂w = x = ${n(values.x)}<br>∂L/∂w = (∂L/∂ŷ)(∂ŷ/∂w)<br>= ${n(2*(r.prediction-values.y))} × ${n(values.x)} = ${n(r.gradient)}</code></li>`,
    `<li><b>${t.update}</b><code>w_new = ${n(weight)} − ${n(values.rate)} × ${n(r.gradient)} = ${n(r.nextWeight)}<br>ŷ_new = ${n(r.nextWeight)} × ${n(values.x)} = ${n(r.nextPrediction)}<br>L_new = (${n(r.nextPrediction)} − ${n(values.y)})² = ${n(r.nextLoss)}</code><p>${t.updateText}</p>${note?`<p>${note}</p>`:''}</li>`,
    `<li><b>${t.evaluate}</b><p>${t.evalText}</p><code>ŷᵥ = ${n(weight)} × ${n(values.evalX)} = ${n(weight*values.evalX)}<br>Lᵥ = (${n(weight*values.evalX)} − ${n(values.evalY)})² = ${n(currentEval)}<br>Lᵥ,new = (${n(r.nextWeight)} × ${n(values.evalX)} − ${n(values.evalY)})² = ${n(nextEval)}</code>${evalNote?`<p>${evalNote}</p>`:''}</li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol><div class="training-history"><b>${t.history}</b><table><thead><tr><th scope="col">${t.iteration}</th><th scope="col">${t.weight}</th><th scope="col">${t.loss}</th><th scope="col">${t.evalLoss}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
