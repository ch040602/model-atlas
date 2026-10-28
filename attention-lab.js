// Three toy input representations and three 3×2 projections. The second
// query-projection row is adjustable; the other projection weights are fixed.
export function attentionProjections(qWeights) {
  const inputs = [[1,0,0],[0,1,0],[0,0,1]];
  const queryMatrix = [[1,0],[qWeights[0],qWeights[1]],[0,1]];
  const keyMatrix = [[1,0],[0,1],[1,1]];
  const valueMatrix = [[1,0],[0,2],[2,2]];
  const project = matrix => inputs.map(input => [0,1].map(column =>
    input.reduce((sum,value,row) => sum + value * matrix[row][column], 0)));
  return {inputs, queryMatrix, keyMatrix, valueMatrix,
    queries:project(queryMatrix), keys:project(keyMatrix), values:project(valueMatrix)};
}

// A single query, three keys and values, one head, key dimension 2.
export function attentionExperiment(qWeights, causalMask) {
  const projection = attentionProjections(qWeights);
  const {keys, values} = projection, q = projection.queries[1];
  const scores = keys.map(key => (q[0]*key[0]+q[1]*key[1])/Math.sqrt(2));
  // Position 2 can see positions 1 and 2; position 3 is in its future.
  const allowed = causalMask ? [true,true,false] : [true,true,true];
  const max = Math.max(...scores.filter((_,i)=>allowed[i]));
  const exponentials = scores.map((score,i)=>allowed[i]?Math.exp(score-max):0);
  const total = exponentials.reduce((a,b)=>a+b,0);
  const weights = exponentials.map(value=>value/total);
  const output = [0,1].map(component=>weights.reduce((sum,w,i)=>sum+w*values[i][component],0));
  return { projection, q, keys, values, scores, allowed, max, exponentials, total, weights, output };
}

// Toy output head: two token logits, with one trainable scalar on the first
// coordinate. The attention output is held fixed during this local update.
export function tokenHeadExperiment(output, weight=1, learningRate=0.1) {
  function evaluate(w) {
    const logits = [w * output[0], output[1]];
    const max = Math.max(...logits);
    const exps = logits.map(logit=>Math.exp(logit-max));
    const sum = exps[0]+exps[1];
    const probabilities = exps.map(value=>value/sum);
    // Cross-entropy with target A, computed from log-sum-exp.
    const loss = max + Math.log(sum) - logits[0];
    return { logits, probabilities, loss };
  }
  const before=evaluate(weight);
  const gradient=(before.probabilities[0]-1)*output[0];
  const nextWeight=weight-learningRate*gradient;
  return { before, gradient, nextWeight, after:evaluate(nextWeight), learningRate };
}

// Separate one-example update of the two adjustable query-projection entries.
// The output head is reset to beta=1; keys and values remain fixed.
export function queryTrainingStep(qWeights, causalMask, learningRate=0.1) {
  const before = attentionExperiment(qWeights, causalMask);
  const head = tokenHeadExperiment(before.output);
  const outputGradient = [head.before.probabilities[0] - 1, head.before.probabilities[1]];
  const weightGradient = before.values.map(v => v.reduce((sum, value, i) => sum + value * outputGradient[i], 0));
  const weightedGradient = before.weights.reduce((sum, w, i) => sum + w * weightGradient[i], 0);
  const scoreGradient = before.weights.map((w, i) => before.allowed[i] ? w * (weightGradient[i] - weightedGradient) : 0);
  const queryGradient = [0,1].map(j => scoreGradient.reduce((sum, g, i) => sum + g * before.keys[i][j] / Math.sqrt(2), 0));
  const nextWeights = qWeights.map((w, i) => w - learningRate * queryGradient[i]);
  const after = attentionExperiment(nextWeights, causalMask);
  return {before, head, outputGradient, weightGradient, weightedGradient, scoreGradient, queryGradient, nextWeights, after, afterHead:tokenHeadExperiment(after.output), learningRate};
}

const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const vector = arr => `[${arr.map(n).join(', ')}]`;
const compactVector = arr => `[${arr.map(value=>Number.isInteger(value)?String(value):n(value)).join(', ')}]`;
const matrix = rows => `[${rows.map(compactVector).join(', ')}]`;
const words = {
  ko:{title:'한 토큰의 어텐션 계산',intro:'세 위치의 입력 표현에서 질의·키·값을 만든 뒤, 두 번째 위치의 질의가 한 개의 어텐션 헤드로 정보를 모읍니다. 가중치와 마스크를 바꾸며 계산을 따라가세요.',fixed:'계산을 쉽게 보기 위해 입력 표현 X를 3×3 단위행렬로 정하고, 편향 없이 3×2 행렬을 곱합니다. 슬라이더는 WQ의 두 번째 행만 바꿉니다. 실제 입력 표현은 보통 밀집 벡터이며 실제 모델에는 여러 헤드와 추가 층이 있습니다.',q1:'WQ 두 번째 행 · 첫 번째 값',q2:'WQ 두 번째 행 · 두 번째 값',mask:'미래 위치 가리기 (인과 마스크)',on:'켜짐: 위치 3은 미래',off:'꺼짐: 세 위치 모두 허용',next:'다음 단계',previous:'이전 단계',reset:'처음부터',input:'1. 입력에서 질의·키·값 만들기',inputMeaning:'각 행은 한 위치의 입력 표현입니다. 같은 입력 X에 서로 다른 가중치 WQ, WK, WV를 곱해 질의 Q, 키 K, 값 V를 만듭니다. 위치 2의 질의 q₂의 두 원소는 q₂₁, q₂₂이며 키와 비교할 때 사용합니다. 값은 5단계에서 섞습니다. 단위행렬 입력은 행렬 곱을 쉽게 보여 주기 위한 예시입니다.',scores:'2. 내적과 크기 조절',scoresMeaning:'각 내적을 √dₖ = √2로 나눕니다. 점수는 아직 확률이 아니고, 이 질의가 각 키와 얼마나 맞는지 비교하는 값입니다.',maskTitle:'3. 마스크 적용',maskOn:'자기회귀 모델의 위치 2는 미래인 위치 3을 볼 수 없습니다. softmax 전에 점수를 −∞로 처리해 그 가중치를 0으로 만듭니다.',maskOff:'마스크가 꺼져 세 위치가 모두 계산에 참여합니다. 이는 인과 마스크가 없는 어텐션을 비교하기 위한 설정입니다.',softmax:'4. 점수를 가중치로 변환',softmaxMeaning:'각 지수값을 전체 합으로 나누면 가중치의 합이 1이 됩니다. 계산 안정성을 위해 허용된 점수의 최댓값을 빼도 결과는 같습니다.',weighted:'5. 값 벡터를 가중합',weightedMeaning:'출력은 값 벡터를 섞은 새로운 표현입니다. 이는 다음 토큰 확률 자체가 아니며, 이어지는 모델 층과 출력층의 입력이 됩니다.',round:'실제 계산은 전체 정밀도이며 표시만 소수 셋째 자리로 반올림합니다.',reference:'Transformer 논문: scaled dot-product attention ↗'},
  en:{title:'Attention for one token',intro:'Create queries, keys and values from three input representations. The query at position 2 then gathers information with one attention head. Change the weights and mask and follow the calculation.',fixed:'To make the arithmetic visible, input representations X form a 3×3 identity matrix, projected by 3×2 matrices without bias. The sliders change only the second row of WQ. Real representations are usually dense, and models can use multiple heads and further layers.',q1:'WQ second row · first value',q2:'WQ second row · second value',mask:'Hide future positions (causal mask)',on:'On: position 3 is in the future',off:'Off: all three positions allowed',next:'Next step',previous:'Previous step',reset:'Start over',input:'1. Project inputs into queries, keys and values',inputMeaning:'Each row represents one position. Multiply the same inputs X by different weight matrices WQ, WK and WV to obtain queries Q, keys K and values V. The two components q₂₁ and q₂₂ of the query q₂ at position 2 are compared with the keys. The values are mixed in step 5. Identity inputs are chosen to make the matrix multiplication easy to see.',scores:'2. Dot products and scaling',scoresMeaning:'Divide each dot product by √dₖ = √2. These are comparison scores, not probabilities.',maskTitle:'3. Apply the mask',maskOn:'In an autoregressive model, position 2 cannot see future position 3. Setting that score to −∞ before softmax makes its weight zero.',maskOff:'With the mask off, all three positions participate. This compares attention without a causal mask.',softmax:'4. Convert scores into weights',softmaxMeaning:'Divide each exponential by their sum to obtain weights summing to 1. Subtracting the largest allowed score preserves the result and improves numerical stability.',weighted:'5. Weighted sum of value vectors',weightedMeaning:'The output is a new representation mixing the values. It is not itself a next-token probability; it feeds subsequent layers and an output head.',round:'Calculations use full precision; displayed values are rounded to three decimals.',reference:'Transformer paper: scaled dot-product attention ↗'}
};

Object.assign(words.ko,{
  head:'6. 출력 점수를 다음 토큰 확률로',
  headMeaning:'설명을 위한 두 후보 A, B만 있는 출력층입니다. 위 어텐션 출력 o₂를 그대로 사용하고 A 점수에는 가중치 β=1, B에는 두 번째 값을 사용합니다. 실제 Transformer는 여러 층을 거쳐 훨씬 많은 토큰의 점수를 계산합니다. 이 softmax는 4단계의 어텐션 가중치와 다른 분포입니다. 실제 teacher forcing 학습에서 입력이 [BOS, A, B]라면 위치 2는 B를 예측합니다. 마스크를 끄면 위치 3의 입력 B를 볼 수 있어 정답이 누출됩니다. 이 계산의 X는 단위행렬이고 정답 A는 따로 지정했으므로, 여기서는 위치 3에 실제 정답 토큰이 들어 있지는 않습니다. 이어지는 다음 토큰 학습 실습에서 입력과 정답의 정렬을 확인할 수 있습니다.',
  target:'7. 정답 토큰과 손실',
  targetMeaning:'학습 예제의 다음 정답을 A라고 정합니다. 교차 엔트로피는 정답 토큰의 확률이 낮을수록 커집니다. 생성할 때는 아직 정답을 모르므로 이 손실을 계산하지 않습니다.',
  train:'8. 출력 가중치를 한 번 갱신',
  trainMeaning:'이 축소 예제에서는 어텐션 출력과 B 점수를 고정하고 β만 학습률 0.1로 갱신합니다. 실제 학습에서는 손실의 기울기가 출력층과 이전 Transformer 층에도 전달됩니다. 갱신 결과는 같은 학습 예제에 대한 비교이며 일반화 성능을 보장하지 않습니다.'
});
Object.assign(words.en,{
  head:'6. Output logits to next-token probabilities',
  headMeaning:'This illustrative output head has only two candidate tokens, A and B. It uses the attention output o₂ directly, with weight β=1 for the A score and the second coordinate for B. Real Transformers use further layers and score many more tokens. This softmax is a different distribution from the attention weights in step 4. In teacher-forced training with inputs [BOS, A, B], position 2 predicts B. Without a mask it can see the input B at position 3, leaking the target. In this calculation X is an identity matrix and target A is assigned separately, so position 3 does not actually contain the target token. The later next-token exercise shows how inputs and targets align.',
  target:'7. Target token and loss',
  targetMeaning:'Set the next target token to A for this training example. Cross-entropy increases as the target token probability decreases. During generation the next target is unknown, so this loss cannot be computed.',
  train:'8. Update the output weight once',
  trainMeaning:'In this toy example, hold the attention output and B score fixed and update only β with learning rate 0.1. Real training propagates loss gradients through the output head and earlier Transformer layers. The result compares the same training example and does not establish generalization.'
});

export function attentionMarkup(values,lang) {
  const t=words[lang];
  const controls=['q1','q2'].map(key=>`<div class="sequence-control"><label for="attn-${key}">${t[key]} <output id="attn-value-${key}">${n(values[key])}</output></label><input id="attn-${key}" data-attn-input="${key}" type="range" min="-2" max="2" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab attention-lab" aria-labelledby="attn-title"><div class="eyebrow">TRANSFORMER / ATTENTION</div><h2 id="attn-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><label class="attn-mask"><input type="checkbox" data-attn-mask ${values.mask?'checked':''}> ${t.mask}</label><div id="attn-output" aria-live="polite"></div><div class="sequence-actions"><span id="attn-status"></span><button type="button" data-attn-action="previous">${t.previous}</button><button type="button" data-attn-action="next">${t.next} →</button><button type="button" data-attn-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://arxiv.org/html/1706.03762#S3.SS2.SSS1" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function attentionOutput(values,lang,stage) {
  const t=words[lang],r=attentionExperiment([values.q1,values.q2],values.mask),q=r.q,p=r.projection;
  const head=tokenHeadExperiment(r.output);
  const queryTrain=queryTrainingStep([values.q1,values.q2],values.mask);
  const scoreLines=r.keys.map((key,i)=>`s${i+1} = (${n(q[0])} × ${key[0]} + ${n(q[1])} × ${key[1]}) / √2 = ${n(r.scores[i])}`).join('<br>');
  const masked=r.scores.map((s,i)=>r.allowed[i]?n(s):'−∞').join(', ');
  const weighted=r.values.map((value,i)=>`${n(r.weights[i])} × ${vector(value)}`).join(' + ');
  const backprop = lang==='ko' ? {
    outputTitle:'9. 별도 예제: 출력에서 어텐션 가중치로 역전파',
    outputMeaning:'8단계에서 β를 갱신한 결과와는 별개의 연습입니다. 원래 출력과 β=1로 다시 시작하고, 목표 토큰 A에 대한 손실을 역전파합니다. p는 6단계의 토큰 확률이며 a는 4단계의 어텐션 가중치입니다. ∂L/∂o는 출력 각 성분이 손실에 미치는 영향을, ∂L/∂aᵢ는 각 값 벡터가 그 영향에 기여하는 정도를 나타냅니다.',
    scoreTitle:'10. Softmax를 지나 점수로 역전파',
    scoreMeaning:'Softmax의 각 입력은 모든 가중치에 영향을 줍니다. 따라서 각 ∂L/∂aᵢ에서 가중 평균을 뺀 뒤 해당 어텐션 가중치를 곱합니다. 가려진 위치는 가중치와 점수 기울기가 0입니다.',
    updateTitle:'11. 질의 투영 가중치 갱신',
    updateMeaning:'각 점수는 q₂와 kᵢ의 내적을 √2로 나눈 값이므로, 점수 기울기에 kᵢ/√2를 곱해 모두 더하면 질의의 기울기가 됩니다. x₂=[0,1,0]이어서 이 예에서는 q₂가 WQ의 두 번째 행과 같고, 그 행의 기울기도 같습니다. 학습률 0.1로 이 두 값만 바꾸고 키·값과 출력층은 고정합니다. 실제 모델은 다른 가중치들도 함께 학습할 수 있습니다.',
    result:'갱신한 WQ로 어텐션부터 확률과 손실까지 다시 계산한 결과입니다. 같은 학습 예제의 손실이며 갱신이 항상 감소를 보장하지는 않습니다.'
  } : {
    outputTitle:'9. Separate example: backpropagate to attention weights',
    outputMeaning:'This is separate from the β update in step 8. Start again from the original output and β=1, then backpropagate the loss for target token A. p is the token probability from step 6 and a is the attention weight from step 4. ∂L/∂o measures the loss sensitivity to each output component; ∂L/∂aᵢ combines that sensitivity with each value vector.',
    scoreTitle:'10. Backpropagate through Softmax to scores',
    scoreMeaning:'Each Softmax input influences every weight. Subtract the weighted mean of ∂L/∂a from each ∂L/∂aᵢ, then multiply by its attention weight. A masked position has zero weight and zero score gradient.',
    updateTitle:'11. Update the query projection weights',
    updateMeaning:'Each score is the dot product of q₂ and kᵢ divided by √2. Sum the score gradients multiplied by kᵢ/√2 to obtain the query gradient. Since x₂=[0,1,0], q₂ equals the second row of WQ in this example, as does its gradient. Update only those two entries with learning rate 0.1; keep keys, values and the output head fixed. Real models can train the other weights too.',
    result:'Recompute attention, probabilities and loss with the updated WQ. This is loss on the same training example; an update does not always guarantee a decrease.'
  };
  const steps=[
    `<li><b>${t.input}</b><p>${t.inputMeaning}</p><code>X (3×3) = ${matrix(p.inputs)}<br>WQ (3×2) = ${matrix(p.queryMatrix)}<br>WK (3×2) = ${matrix(p.keyMatrix)}<br>WV (3×2) = ${matrix(p.valueMatrix)}<br>q₂ = x₂ WQ = [0, 1, 0] WQ<br>q₂₁ = 0×1 + 1×${n(p.queryMatrix[1][0])} + 0×0 = ${n(q[0])}<br>q₂₂ = 0×0 + 1×${n(p.queryMatrix[1][1])} + 0×1 = ${n(q[1])}<br>K = X WK = ${matrix(p.keys)}<br>V = X WV = ${matrix(p.values)}<br>${r.keys.map((key,i)=>`k${i+1} = ${compactVector(key)}, v${i+1} = ${compactVector(r.values[i])}`).join('<br>')}</code></li>`,
    `<li><b>${t.scores}</b><code>${scoreLines}</code><p>${t.scoresMeaning}</p></li>`,
    `<li><b>${t.maskTitle}</b><code>${values.mask?t.on:t.off}<br>[${masked}]</code><p>${values.mask?t.maskOn:t.maskOff}</p></li>`,
    `<li><b>${t.softmax}</b><code>max = ${n(r.max)}<br>exp(s − max) = ${vector(r.exponentials)}<br>Σ exp(s − max) = ${n(r.total)}<br>softmax = ${vector(r.weights)}</code><p>${t.softmaxMeaning}</p></li>`,
    `<li><b>${t.weighted}</b><code>o₂ = ${weighted}<br>= ${vector(r.output)}</code><p>${t.weightedMeaning}</p></li>`,
    `<li><b>${t.head}</b><code>o₂ = [o₂₁, o₂₂] = ${vector(r.output)}; β = 1<br>logits [A, B] = [β × o₂₁, o₂₂]<br>= [1 × ${n(r.output[0])}, ${n(r.output[1])}] = ${vector(head.before.logits)}<br>p = softmax(logits) = ${vector(head.before.probabilities)}</code><p>${t.headMeaning}</p></li>`,
    `<li><b>${t.target}</b><code>target = A<br>L = −log p(A) = −log(${n(head.before.probabilities[0])}) = ${n(head.before.loss)}</code><p>${t.targetMeaning}</p></li>`,
    `<li><b>${t.train}</b><code>∂L/∂β = (p(A) − 1) × o₂₁<br>= (${n(head.before.probabilities[0])} − 1) × ${n(r.output[0])} = ${n(head.gradient)}<br>β_new = 1 − ${n(head.learningRate)} × ${n(head.gradient)} = ${n(head.nextWeight)}<br>p_new = ${vector(head.after.probabilities)}<br>L_new = ${n(head.after.loss)}</code><p>${t.trainMeaning}</p></li>`,
    `<li><b>${backprop.outputTitle}</b><p>${backprop.outputMeaning}</p><code>∂L/∂o₂ = [p(A) − 1, p(B)] = ${vector(queryTrain.outputGradient)}<br>o₂ = Σᵢ aᵢvᵢ<br>∂L/∂aᵢ = (∂L/∂o₂) · vᵢ<br>${r.values.map((v,i)=>`∂L/∂a${i+1} = ${vector(queryTrain.outputGradient)} · ${vector(v)} = ${n(queryTrain.weightGradient[i])}`).join('<br>')}</code></li>`,
    `<li><b>${backprop.scoreTitle}</b><p>${backprop.scoreMeaning}</p><code>mean = Σⱼ aⱼ × ∂L/∂aⱼ = ${n(queryTrain.weightedGradient)}<br>∂L/∂sᵢ = aᵢ × (∂L/∂aᵢ − mean)<br>${queryTrain.scoreGradient.map((g,i)=>`∂L/∂s${i+1} = ${n(r.weights[i])} × (${n(queryTrain.weightGradient[i])} − ${n(queryTrain.weightedGradient)}) = ${n(g)}`).join('<br>')}</code></li>`,
    `<li><b>${backprop.updateTitle}</b><p>${backprop.updateMeaning}</p><code>∂L/∂q₂ = Σᵢ (∂L/∂sᵢ) × kᵢ / √2<br>= (${queryTrain.scoreGradient.map((g,i)=>`${n(g)} × ${compactVector(r.keys[i])}`).join(' + ')}) / √2<br>= ${vector(queryTrain.queryGradient)}<br>∂L/∂WQ[2,:] = ∂L/∂q₂<br>WQ_new[2,:] = ${vector(q)} − ${n(queryTrain.learningRate)} × ${vector(queryTrain.queryGradient)}<br>= ${vector(queryTrain.nextWeights)}<br>a_new = ${vector(queryTrain.after.weights)}<br>o₂_new = ${vector(queryTrain.after.output)}<br>p_new = ${vector(queryTrain.afterHead.before.probabilities)}<br>L_new = ${n(queryTrain.afterHead.before.loss)}</code><p>${backprop.result}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
