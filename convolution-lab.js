// A single-channel 3×3 image and a shared 2×2 filter, stride 1, no padding.
export function convolutionExperiment(center, strength, bias) {
  const image = [[0, 0, 1], [0, center, 1], [0, 0, 1]];
  const kernel = [[-strength, strength], [-strength, strength]];
  const positions = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const products = kernel.flatMap((line, y) => line.map((weight, x) => ({ input: image[row + y][col + x], weight, product: image[row + y][col + x] * weight })));
      const rawSum = products.reduce((total, term) => total + term.product, bias);
      // Cancellation at the ReLU boundary can leave a tiny floating-point residue.
      const errorBound = 8 * Number.EPSILON * (Math.abs(bias) + products.reduce((total, term) => total + Math.abs(term.product), 0));
      const sum = Math.abs(rawSum) <= errorBound ? 0 : rawSum;
      positions.push({ row, col, products, sum, activation: Math.max(0, sum) });
    }
  }
  return { image, kernel, positions };
}

// Toy target feature map [0,1;0,1]. Only the shared strength is trained;
// bias and image remain fixed. ReLU's derivative at zero is chosen as zero.
export function convolutionTraining(center, strength, bias, rate=0.1) {
  const target = [0,1,0,1];
  const before = convolutionExperiment(center, strength, bias);
  const contributions = before.positions.map((p,i) => {
    const dzds = p.products[1].input + p.products[3].input - p.products[0].input - p.products[2].input;
    const delta = 2 * (p.activation - target[i]) / 4 * (p.sum > 0 ? 1 : 0);
    return { dzds, delta, gradient: delta * dzds };
  });
  const loss = before.positions.reduce((sum,p,i) => sum + (p.activation-target[i])**2, 0) / 4;
  const gradient = contributions.reduce((sum,c) => sum+c.gradient,0);
  const nextStrength = strength - rate*gradient;
  const after = convolutionExperiment(center, nextStrength, bias);
  const nextLoss = after.positions.reduce((sum,p,i) => sum + (p.activation-target[i])**2, 0) / 4;
  return {target, before, contributions, loss, gradient, nextStrength, after, nextLoss};
}

// A separate class-label exercise using the original feature map. The tiny
// classifier has fixed logits [global average, 0] and target class A.
export function convolutionClassification(center, strength, bias, rate=0.1) {
  const evaluate = s => {
    const map = convolutionExperiment(center, s, bias);
    const pooled = map.positions.reduce((sum, p) => sum + p.activation, 0) / 4;
    const logits = [pooled, 0], maximum = Math.max(...logits);
    const exp = logits.map(z => Math.exp(z - maximum));
    const total = exp[0] + exp[1];
    const probabilities = exp.map(value => value / total);
    const loss = maximum + Math.log(total) - logits[0];
    return {map, pooled, logits, probabilities, loss};
  };
  const before = evaluate(strength);
  const contributions = before.map.positions.map(p => {
    const dzds = p.products[1].input + p.products[3].input - p.products[0].input - p.products[2].input;
    const reluDerivative = p.sum > 0 ? 1 : 0;
    return {dzds, reluDerivative, gradient:(before.probabilities[0] - 1) * 0.25 * reluDerivative * dzds};
  });
  const gradient = contributions.reduce((sum, c) => sum + c.gradient, 0);
  const nextStrength = strength - rate * gradient;
  return {before, contributions, gradient, nextStrength, after:evaluate(nextStrength)};
}

const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(2);
const n3 = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const words = {
  ko: { title:'필터가 움직이며 특징 맵 만들기', intro:'3×3 이미지에서 2×2 필터를 한 칸씩 움직입니다. 네 위치의 특징을 계산한 뒤 공유 필터가 어떻게 학습되는지 살펴봅니다.', setup:'단일 채널, 이동 간격 1, 패딩 0. 입력값은 음수를 포함할 수 있는 정규화된 값입니다. 필터 값은 모든 위치에서 공유합니다. 여기서는 필터를 뒤집지 않는 딥러닝의 합성곱(상호상관)을 사용합니다.', center:'가운데 픽셀', strength:'필터 강도 s', bias:'편향 b', image:'입력 이미지', kernel:'공유 필터', map:'ReLU 후 특징 맵', position:'현재 위치', sum:'가중합과 활성화', previous:'이전 단계', next:'다음 단계', reset:'처음부터', meaning:'각 결과는 필터가 놓였던 위치의 활성값입니다. 양의 강도에서는 왼쪽보다 오른쪽이 밝은 변화에 반응하며, ReLU는 음수 반응을 0으로 바꿉니다.', full:'계산은 전체 정밀도로 수행합니다. 특징 맵 연습은 소수 둘째 자리, 분류 연습은 셋째 자리로 표시합니다.', pending:'아직 계산하지 않음', done:'네 위치의 계산을 모두 보여 줍니다.', lossTitle:'5. 목표 특징 맵과 손실', lossMeaning:'실제 CNN의 목표는 보통 클래스 정답이며 손실이 다음 층을 거쳐 전달됩니다. 여기서는 원리를 보기 위해 목표 특징 맵을 직접 정했습니다. 네 칸의 제곱 오차 평균이 이 예제의 손실입니다.', gradTitle:'6. 공유 필터의 기울기와 갱신', gradMeaning:'같은 강도 s가 네 위치에서 사용되므로 각 위치의 기여를 모두 더합니다. x₁부터 x₄는 현재 2×2 입력에서 왼쪽 위부터 행 순서대로 읽습니다. δ는 z에 대한 손실의 기울기입니다. ReLU는 z=0에서 미분 가능하지 않아 이 예제는 기울기를 0으로 선택합니다. 계산 오차 수준의 0 근처 값도 0으로 처리합니다. 학습률은 0.1이며 s만 갱신하고 편향은 고정합니다.', afterMeaning:'새 강도로 네 위치를 다시 계산합니다. 한 번의 갱신이 항상 손실을 줄이는 것은 아닙니다. 이것은 강도 하나를 묶어 학습하는 예제로, 일반 CNN에서는 필터 원소를 각각 학습합니다.' },
  en: { title:'Move a filter to build a feature map', intro:'Move a 2×2 filter across a 3×3 image. After calculating four positions, see how the shared filter learns.', setup:'One channel, stride 1, no padding. Input values are normalized and can be negative. The same filter is shared at every position. This is the deep-learning convention of convolution (cross-correlation, without flipping the filter).', center:'Center pixel', strength:'Filter strength s', bias:'Bias b', image:'Input image', kernel:'Shared filter', map:'Feature map after ReLU', position:'Current position', sum:'Weighted sum and activation', previous:'Previous step', next:'Next step', reset:'Start over', meaning:'Each result is the activation at one filter position. With positive strength the filter responds to a brighter right side; ReLU changes negative responses to zero.', full:'Calculations use full precision; the feature-map exercise displays two decimal places and the classification exercise displays three.', pending:'Not calculated yet', done:'All four positions have been calculated.', lossTitle:'5. Target feature map and loss', lossMeaning:'A real CNN usually uses a class target, with loss propagated back through later layers. To expose the principle, this exercise specifies a target feature map directly. The loss is the mean squared error across its four cells.', gradTitle:'6. Shared filter gradient and update', gradMeaning:'The same strength s is used at all four positions, so add their contributions. x₁ through x₄ are the current 2×2 input values in row order, starting at the top left. δ is the gradient of loss with respect to z. ReLU is not differentiable at z=0; this example chooses a gradient of zero there and treats values within floating-point cancellation error of zero as zero. The learning rate is 0.1; only s changes, while bias is fixed.', afterMeaning:'Recompute all four positions with the new strength. One update does not always reduce loss. This example ties the filter entries to a single strength; ordinary CNNs learn each filter entry separately.' }
};

export function convolutionMarkup(values, lang) {
  const t = words[lang];
  const fields = [['center',-1,1,0.1], ['strength',0,2,0.1], ['bias',-1,1,0.1]];
  const controls = fields.map(([key,min,max,step]) => `<div class="sequence-control"><label for="conv-${key}">${t[key]} <output id="conv-value-${key}">${n(values[key])}</output></label><input id="conv-${key}" data-conv-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab convolution-lab" aria-labelledby="conv-title"><div class="eyebrow">CNN / FILTER IN MOTION</div><h2 id="conv-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.setup}</p><div class="sequence-controls">${controls}</div><div id="conv-output" aria-live="polite"></div><div class="sequence-actions"><span id="conv-status"></span><button type="button" data-conv-action="previous">${t.previous}</button><button type="button" data-conv-action="next">${t.next} →</button><button type="button" data-conv-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.full}</p></section>`;
}

export function convolutionOutput(values, lang, stage) {
  const t = words[lang], r = convolutionExperiment(values.center, values.strength, values.bias);
  const active = r.positions[Math.min(stage, 4) - 1];
  const imageCells = r.image.flatMap((row,y) => row.map((value,x) => `<span class="conv-cell ${y>=active.row && y<active.row+2 && x>=active.col && x<active.col+2?'selected':''}">${n(value)}</span>`)).join('');
  const kernelCells = r.kernel.flat().map(value => `<span class="conv-cell">${n(value)}</span>`).join('');
  const mapCells = r.positions.map((p,i) => `<span class="conv-cell ${i===Math.min(stage,4)-1?'selected':''}" aria-label="${i<stage?n(p.activation):t.pending}">${i<stage?n(p.activation):'?'}</span>`).join('');
  const productText = active.products.map(term => `(${n(term.input)} × ${n(term.weight)})`).join(' + ');
  const training = convolutionTraining(values.center, values.strength, values.bias);
  const lossTerms = training.before.positions.map((p,i)=>`(${n(p.activation)} − ${n(training.target[i])})²`).join(' + ');
  const contributionLines = training.contributions.map((c,i)=>`δ${i+1} = ${n(c.delta)}, ∂z${i+1}/∂s = ${n(c.dzds)}, δ${i+1} × ∂z${i+1}/∂s = ${n(c.gradient)}`).join('<br>');
  const after = training.after.positions.map(p=>n(p.activation));
  const classification = convolutionClassification(values.center, values.strength, values.bias);
  const c = classification.before;
  const classText = lang === 'ko' ? {
    poolTitle:'7. 별도 예제: 특징 맵을 평균으로 요약',
    poolMeaning:'5~6단계의 목표 맵 학습과는 별개의 분류 예제입니다. 위의 원래 특징 맵과 선택한 원래 s에서 다시 시작합니다. 전역 평균 풀링은 네 위치를 하나의 숫자로 요약하므로 위치 정보는 사라집니다.',
    softTitle:'8. 분류 점수와 확률',
    softMeaning:'간단한 예제를 위해 A의 점수는 u, B의 점수는 0으로 고정했습니다. Softmax는 두 점수를 합이 1인 확률로 바꿉니다. 실제 CNN은 여러 채널과 학습 가능한 분류층을 쓸 수 있습니다.',
    lossTitle:'9. 정답으로 교차 엔트로피 계산',
    lossMeaning:'정답을 A로 정합니다. 정답의 예측 확률이 클수록 손실이 작아집니다. ln은 자연로그입니다.',
    gradTitle:'10. 분류 손실을 필터까지 역전파',
    gradMeaning:'정답 A의 교차 엔트로피를 Softmax, 평균 풀링, ReLU를 거쳐 공유 강도 s까지 미분합니다. x₁~x₄는 각 위치의 2×2 입력을 행 순서로 읽은 값입니다. ReLU는 0에서 미분 가능하지 않아 이 예제는 기울기를 0으로 선택하고, 계산 오차 수준의 0 근처 값도 0으로 처리합니다. 학습률은 0.1이며 분류층과 편향은 고정합니다.',
    after:'갱신 후 특징 맵부터 확률과 손실을 다시 계산합니다. 한 번의 갱신이 항상 손실을 줄이지는 않습니다.'
  } : {
    poolTitle:'7. Separate example: average the feature map',
    poolMeaning:'This classification example is separate from the target-map training in steps 5–6. It starts again from the original feature map and selected s above. Global average pooling summarizes four positions as one number, losing their spatial locations.',
    softTitle:'8. Class scores and probabilities',
    softMeaning:'For this toy example, the score for A is u and the score for B is fixed at 0. Softmax converts the scores into probabilities summing to 1. A real CNN can use multiple channels and a learnable classification head.',
    lossTitle:'9. Cross-entropy with the class label',
    lossMeaning:'The target is class A. A higher predicted probability for the correct class gives a lower loss. ln is the natural logarithm.',
    gradTitle:'10. Backpropagate class loss to the filter',
    gradMeaning:'Differentiate cross-entropy for class A through Softmax, average pooling and ReLU to the shared strength s. x₁–x₄ are each 2×2 input in row order. ReLU is not differentiable at zero; this example chooses a zero gradient there and treats values within floating-point cancellation error of zero as zero. The learning rate is 0.1, and the classifier and bias stay fixed.',
    after:'Recompute the feature map, probabilities and loss after the update. An update does not always reduce loss.'
  };
  const classContributions = classification.contributions.map((v,i)=>`i=${i+1}: ReLU′(zᵢ)=${v.reluDerivative}, ∂zᵢ/∂s=${n3(v.dzds)}, ${n3(v.gradient)}`).join('<br>');
  const classMarkup = (stage>=7 ? `<div class="conv-calc"><b>${classText.poolTitle}</b><p>${classText.poolMeaning}</p><code>u = (a₁ + a₂ + a₃ + a₄) / 4<br>= (${c.map.positions.map(p=>n3(p.activation)).join(' + ')}) / 4 = ${n3(c.pooled)}</code></div>` : '') +
    (stage>=8 ? `<div class="conv-calc"><b>${classText.softTitle}</b><p>${classText.softMeaning}</p><code>z_A = u = ${n3(c.logits[0])}, z_B = 0<br>p_A = exp(z_A) / [exp(z_A) + exp(z_B)] = ${n3(c.probabilities[0])}<br>p_B = exp(z_B) / [exp(z_A) + exp(z_B)] = ${n3(c.probabilities[1])}</code></div>` : '') +
    (stage>=9 ? `<div class="conv-calc"><b>${classText.lossTitle}</b><p>${classText.lossMeaning}</p><code>target = A<br>L = −ln(p_A) = −ln(${n3(c.probabilities[0])}) ≈ ${n3(c.loss)}</code></div>` : '') +
    (stage>=10 ? `<div class="conv-calc"><b>${classText.gradTitle}</b><p>${classText.gradMeaning}</p><code>∂L/∂u = p_A − 1 = ${n3(c.probabilities[0]-1)}<br>∂u/∂aᵢ = ¼, ∂zᵢ/∂s = −x₁ + x₂ − x₃ + x₄<br>∂L/∂s = Σᵢ [(p_A − 1) × ¼ × ReLU′(zᵢ) × ∂zᵢ/∂s]<br>${classContributions}<br>∂L/∂s = ${n3(classification.gradient)}<br>s_new = ${n3(values.strength)} − 0.1 × ${n3(classification.gradient)} = ${n3(classification.nextStrength)}<br>new map = [${classification.after.map.positions.map(p=>n3(p.activation)).join(', ')}]<br>u_new = ${n3(classification.after.pooled)}, p_A_new = ${n3(classification.after.probabilities[0])}<br>L_new = ${n3(classification.after.loss)}</code><p>${classText.after}</p></div>` : '');
  const trainingMarkup = (stage>=5 ? `<div class="conv-calc"><b>${t.lossTitle}</b><code>target = [0, 1; 0, 1]<br>L = ¼ Σᵢ(aᵢ − targetᵢ)²<br>= ¼ [${lossTerms}] = ${n(training.loss)}</code><p>${t.lossMeaning}</p></div>` : '') + (stage>=6 ? `<div class="conv-calc"><b>${t.gradTitle}</b><p>${t.gradMeaning}</p><code>K = [−s, s; −s, s]<br>∂zᵢ/∂s = −x₁ + x₂ − x₃ + x₄<br>ReLU′(z) = 1 (z &gt; 0), 0 (z &lt; 0); z = 0 → 0<br>δᵢ = ½(aᵢ − targetᵢ) × ReLU′(zᵢ)<br>${contributionLines}<br>∂L/∂s = Σᵢ δᵢ × ∂zᵢ/∂s = ${n(training.gradient)}<br>s_new = ${n(values.strength)} − 0.10 × ${n(training.gradient)} = ${n(training.nextStrength)}<br>new map = [${after[0]}, ${after[1]}; ${after[2]}, ${after[3]}]<br>L_new = ${n(training.nextLoss)}</code><p>${t.afterMeaning}</p></div>` : '');
  return `<div class="conv-grids"><div><b>${t.image}</b><div class="conv-grid three">${imageCells}</div></div><div><b>${t.kernel}</b><div class="conv-grid two">${kernelCells}</div></div><div><b>${t.map}</b><div class="conv-grid two">${mapCells}</div></div></div><div class="conv-calc"><b>${t.position}: (${active.row+1}, ${active.col+1})</b><p>${t.sum}</p><code>z = ${productText} + ${n(values.bias)} = ${n(active.sum)}<br>ReLU(z) = max(0, ${n(active.sum)}) = ${n(active.activation)}</code><p>${t.meaning}${stage>=4?' '+t.done:''}</p></div>${trainingMarkup}${classMarkup}`;
}
