// A deterministic one-epoch preview for scalar squared-error regression.
export function batchEpoch(samples, initialWeight, rate, batchSize) {
  if (!samples.length || !Number.isInteger(batchSize) || batchSize < 1 || batchSize > samples.length) throw new RangeError('Invalid batch size');
  const datasetLoss = weight => samples.reduce((sum, sample) => sum + (weight * sample.x - sample.y) ** 2, 0) / samples.length;
  const batches = [];
  let weight = initialWeight;
  for (let offset = 0; offset < samples.length; offset += batchSize) {
    const startWeight = weight;
    const examples = samples.slice(offset, offset + batchSize).map((sample, i) => {
      const prediction = startWeight * sample.x;
      return {...sample, id: offset + i + 1, prediction, loss: (prediction - sample.y) ** 2, gradient: 2 * (prediction - sample.y) * sample.x};
    });
    const meanLoss = examples.reduce((sum, example) => sum + example.loss, 0) / examples.length;
    const meanGradient = examples.reduce((sum, example) => sum + example.gradient, 0) / examples.length;
    weight = startWeight - rate * meanGradient;
    batches.push({startWeight, examples, meanLoss, meanGradient, endWeight: weight});
  }
  return {batches, finalWeight: weight, lossBefore: datasetLoss(initialWeight), lossAfter: datasetLoss(weight)};
}

const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const copy = {
  ko: {title:'미니배치와 에포크를 따라가기', intro:'세 예제를 순서대로 한 번 사용하는 1 에포크를 미리 계산합니다. 배치를 선택하고 계산 단계를 펼쳐 보세요.', fixed:'별도의 단순 선형 예제입니다: ŷ=wx, b=0, 예제별 손실 ℓ=(ŷ−y)². 순서는 고정하며 섞거나 마지막 배치를 버리지 않습니다. 다른 실습의 가중치는 바뀌지 않습니다.', size:'배치 크기', initialWeight:'초기 가중치 w', rate:'학습률 η', target2:'두 번째 정답 y₂', batch:'살펴볼 배치', previousBatch:'이전 배치', nextBatch:'다음 배치', stage:'계산 단계', previous:'이전 계산', next:'다음 계산', split:'1. 데이터와 배치 분할', splitText:'한 에포크는 전체 데이터 한 번입니다. 배치마다 가중치를 한 번 갱신합니다.', common:'선택한 배치의 시작 가중치', examples:'2. 같은 시작 가중치로 예제별 계산', individual:'각 예제의 기울기는 이 배치의 동일한 시작 가중치에서 계산합니다.', mean:'3. 배치 평균과 한 번의 갱신', meanText:'마지막 배치가 작으면 실제 예제 수로 나눕니다. 평균 기울기를 구한 뒤에 한 번 갱신합니다.', epoch:'4. 전체 에포크의 갱신 순서', epochText:'다음 배치는 직전 갱신 후의 가중치에서 시작합니다. 다른 시점의 기울기를 한꺼번에 평균하지 않습니다.', before:'전체 데이터 평균 손실: 시작 가중치', after:'전체 데이터 평균 손실: 마지막 가중치', lossText:'각 값은 세 예제 모두에 동일한 가중치를 적용해 계산합니다. 학습률에 따라 손실은 증가할 수도 있습니다.', batches:'배치 (예제 번호)', start:'시작 w', gradient:'평균 기울기', end:'갱신 후 w', rounding:'계산은 전체 정밀도로 수행하고 표시만 반올림합니다.', references:'참고: 에포크와 배치', mse:'MSE의 평균 방식'},
  en: {title:'Follow mini-batches through an epoch', intro:'Preview one epoch using three examples once in a fixed order. Select a batch and reveal each calculation.', fixed:'This separate linear toy uses ŷ=wx, b=0 and per-example loss ℓ=(ŷ−y)². The order is fixed; no shuffling or dropping the last batch. Weights in other labs are unaffected.', size:'Batch size', initialWeight:'Initial weight w', rate:'Learning rate η', target2:'Second target y₂', batch:'Batch to inspect', previousBatch:'Previous batch', nextBatch:'Next batch', stage:'Calculation step', previous:'Previous calculation', next:'Next calculation', split:'1. Dataset and batches', splitText:'One epoch is one pass through the dataset. Each batch produces one weight update.', common:'Starting weight of selected batch', examples:'2. Compute each example at the same starting weight', individual:'Each example gradient uses the same weight at the start of this batch.', mean:'3. Batch mean and one update', meanText:'A smaller final batch is divided by its actual number of examples. Update once after averaging its gradients.', epoch:'4. Updates over the full epoch', epochText:'The next batch starts from the just-updated weight. Do not average gradients computed at different times as if they shared one weight.', before:'Mean loss over the dataset: starting weight', after:'Mean loss over the dataset: final weight', lossText:'Each value applies one shared weight to all three examples. Depending on the learning rate, loss can increase.', batches:'Batch (example IDs)', start:'Start w', gradient:'Mean gradient', end:'Updated w', rounding:'Calculations use full precision; displayed values are rounded.', references:'Reference: epochs and batches', mse:'MSE reduction'}
};

export function batchLabMarkup(values, lang) {
  const t=copy[lang];
  const fields=[['initialWeight',-2,2,0.1],['rate',0,1.5,0.05],['target2',-2,2,0.1]];
  const controls=fields.map(([key,min,max,step])=>`<div class="sequence-control"><label for="batch-${key}">${t[key]} <output id="batch-value-${key}">${n(values[key])}</output></label><input id="batch-${key}" data-batch-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab training-lab batch-lab" aria-labelledby="batch-title"><div class="eyebrow">FOUNDATIONS / MINI-BATCHES</div><h2 id="batch-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls"><div class="sequence-control"><label for="batch-size">${t.size}</label><select id="batch-size" data-batch-input="batchSize">${[1,2,3].map(size=>`<option value="${size}" ${size===values.batchSize?'selected':''}>${size}</option>`).join('')}</select></div>${controls}</div><div class="sequence-actions"><b>${t.batch}</b><span id="batch-index-status"></span><button type="button" data-batch-select="previous">${t.previousBatch}</button><button type="button" data-batch-select="next">${t.nextBatch} →</button></div><div id="batch-output" aria-live="polite"></div><div class="sequence-actions"><b>${t.stage}</b><span id="batch-stage-status"></span><button type="button" data-batch-stage="previous">${t.previous}</button><button type="button" data-batch-stage="next">${t.next} →</button></div><p class="sequence-rounding">${t.rounding} <a href="https://developers.google.com/machine-learning/crash-course/linear-regression/hyperparameters" target="_blank" rel="noopener noreferrer">${t.references} ↗</a> · <a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.MSELoss.html" target="_blank" rel="noopener noreferrer">${t.mse} ↗</a></p></section>`;
}

export function batchLabOutput(values, lang, stage, index) {
  const t=copy[lang];
  const samples=[{x:1,y:1},{x:2,y:values.target2},{x:-1,y:-1}];
  const epoch=batchEpoch(samples,values.initialWeight,values.rate,values.batchSize), batch=epoch.batches[index];
  const partitions=epoch.batches.map((b,i)=>`${i+1}: [${b.examples.map(e=>e.id).join(', ')}]`).join(' · ');
  const examples=batch.examples.map(e=>`<code>#${e.id}: ŷ=${n(batch.startWeight)} × ${n(e.x)} = ${n(e.prediction)}<br>ℓ=(${n(e.prediction)} − ${n(e.y)})² = ${n(e.loss)}<br>∂ℓ/∂w=2 × (${n(e.prediction)} − ${n(e.y)}) × ${n(e.x)} = ${n(e.gradient)}</code>`).join('');
  const rows=epoch.batches.map((b,i)=>`<tr><td>${i+1} (${b.examples.map(e=>e.id).join(', ')})</td><td>${n(b.startWeight)}</td><td>${n(b.meanGradient)}</td><td>${n(b.endWeight)}</td></tr>`).join('');
  const steps=[
    `<li><b>${t.split}</b><p>${t.splitText}</p><code>(x, y): #1 (1, 1) · #2 (2, ${n(values.target2)}) · #3 (−1, −1)<br>${partitions}<br>${t.common}: ${n(batch.startWeight)}</code></li>`,
    `<li><b>${t.examples}</b><p>${t.individual}</p>${examples}</li>`,
    `<li><b>${t.mean}</b><p>${t.meanText}</p><code>L=(${batch.examples.map(e=>n(e.loss)).join(' + ')}) / ${batch.examples.length} = ${n(batch.meanLoss)}<br>∂L/∂w=(${batch.examples.map(e=>n(e.gradient)).join(' + ')}) / ${batch.examples.length} = ${n(batch.meanGradient)}<br>w_new=${n(batch.startWeight)} − ${n(values.rate)} × ${n(batch.meanGradient)} = ${n(batch.endWeight)}</code></li>`,
    `<li><b>${t.epoch}</b><p>${t.epochText}</p><div class="training-history"><table><thead><tr><th scope="col">${t.batches}</th><th scope="col">${t.start}</th><th scope="col">${t.gradient}</th><th scope="col">${t.end}</th></tr></thead><tbody>${rows}</tbody></table></div><p>${t.lossText}</p><code>${t.before}: ${n(epoch.lossBefore)}<br>${t.after}: ${n(epoch.lossAfter)}</code></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
