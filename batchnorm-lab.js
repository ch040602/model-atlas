// Single-feature BatchNorm1d with batch size three. This follows PyTorch's
// biased forward variance and unbiased variance in the running estimate.
const epsilon=0.01, momentum=0.1;
const fmt=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
export function batchNormPreview(third, state) {
  if(!Number.isFinite(third)||third < -2||third > 4 || !Number.isFinite(state.mean)||!Number.isFinite(state.variance)||state.variance<0) throw new RangeError('invalid batch or running statistics');
  const batch=[0,2,third], mean=batch.reduce((a,b)=>a+b,0)/batch.length;
  const variance=batch.reduce((a,x)=>a+(x-mean)**2,0)/batch.length;
  const unbiased=variance*batch.length/(batch.length-1);
  const nextMean=(1-momentum)*state.mean+momentum*mean;
  const nextVariance=(1-momentum)*state.variance+momentum*unbiased;
  return {batch,mean,variance,unbiased,nextMean,nextVariance,
    training:batch.map(x=>(x-mean)/Math.sqrt(variance+epsilon)),
    evaluation:(2-state.mean)/Math.sqrt(state.variance+epsilon)};
}
export function batchNormMarkup(third,lang){
 const ko=lang==='ko';
 return `<section class="metric-lab batchnorm-lab" aria-labelledby="batchnorm-title">
 <h2 id="batchnorm-title">${ko?'배치 통계와 평가 결과 비교':'Compare batch statistics and evaluation'}</h2>
 <p>${ko?'한 특성을 가진 훈련 샘플 세 개 [0, 2, x]를 사용합니다. x를 바꾸고, ① 훈련 계산을 살펴본 뒤 ② 통계 반영을 눌러 ③ 평가값이 어떻게 바뀌는지 확인하세요.':'Use three training samples [0, 2, x] with one feature. Change x, inspect ① training, then ② apply the statistics and see how ③ the evaluation output changes.'}</p>
 <p>${ko?'예제 설정: γ=1, β=0, ε=0.01, 통계 반영 비율 0.1입니다. 처음 누적 평균은 0, 누적 분산은 1입니다. 버튼을 한 번 누를 때마다 현재 배치 하나를 다시 처리하며, 가중치는 학습하지 않습니다.':'Example settings: γ=1, β=0, ε=0.01, running-statistic momentum 0.1. The initial running mean is 0 and variance is 1. Each button press processes the current batch once more; no weights are trained.'}</p>
 <label class="pca-control" for="batchnorm-third">${ko?'세 번째 훈련 샘플 x':'Third training sample x'} <output id="batchnorm-third-value">${fmt(third)}</output></label>
 <input id="batchnorm-third" data-batchnorm-third type="range" min="-2" max="4" step="0.5" value="${third}">
 <div id="batchnorm-output" aria-live="polite"></div>
 <div class="batchnorm-actions"><button type="button" data-batchnorm-apply>${ko?'현재 배치의 통계 반영':'Apply current batch statistics'}</button> <button type="button" data-batchnorm-reset>${ko?'누적 통계 초기화':'Reset running statistics'}</button></div>
 <p>${ko?'훈련 중 정규화는 현재 배치 통계를 사용합니다. 이 예제의 누적 통계는 훈련 배치에서만 갱신하고, 평가에는 저장된 누적 통계를 사용합니다. 평가 데이터를 실수로 훈련 모드로 처리하면 통계가 바뀔 수 있습니다. PyTorch에서는 track_running_stats=False인 경우 평가에도 배치 통계를 사용하는 예외가 있습니다.':'Training normalizes using the current batch. In this example, running statistics are updated only with training batches and are used for evaluation. Accidentally processing evaluation data in training mode can change the statistics. In PyTorch, track_running_stats=False is an exception: evaluation also uses batch statistics.'}</p>
 <p>${ko?'여기서 다룬 것은 특성 하나의 배치 정규화입니다. 층 정규화는 보통 각 샘플의 특성 방향으로 통계를 구하므로 계산 축이 다릅니다. 드롭아웃은 별도의 연산으로, 일반적으로 훈련 시 일부 활성값을 무작위로 제거하고 평가 시 끕니다.':'This shows batch normalization for one feature. Layer normalization usually calculates statistics across features within each sample, so its axis differs. Dropout is a separate operation: it typically drops random activations during training and is disabled for evaluation.'}</p>
 <p><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html" target="_blank" rel="noopener noreferrer">${ko?'PyTorch 배치 정규화 문서':'PyTorch batch normalization documentation'} ↗</a></p>
 </section>`;
}
export function batchNormOutput(third,state,lang){
 const ko=lang==='ko',r=batchNormPreview(third,state), vec=v=>`[${v.map(fmt).join(', ')}]`;
 return `<div class="batchnorm-steps">
 <p><b>${ko?'① 현재 배치의 훈련 계산':'① Training calculation for this batch'}</b><br>
 x = ${vec(r.batch)}<br>μ = (0 + 2 + ${fmt(third)}) / 3 = <strong data-bn="mean">${fmt(r.mean)}</strong><br>
 σ² = Σ(x − μ)² / 3 = <strong data-bn="variance">${fmt(r.variance)}</strong><br>
 y = (x − μ) / √(σ² + 0.01) = <strong data-bn="training">${vec(r.training)}</strong></p>
 <p><b>${ko?'② 저장된 통계와 다음 반영 미리보기':'② Stored statistics and next update preview'}</b><br>
 ${ko?'반영 횟수':'Updates'} = <strong data-bn="count">${state.count}</strong><br>
 ${ko?'현재 평균, 분산':'Current mean, variance'} = <span data-bn="current">[${fmt(state.mean)}, ${fmt(state.variance)}]</span><br>
 ${ko?'갱신에 사용하는 분산':'Variance used for update'} = σ² × 3 / 2 = ${fmt(r.unbiased)}<br>
 ${ko?'다음 평균':'Next mean'} = 0.9 × ${fmt(state.mean)} + 0.1 × ${fmt(r.mean)} = <strong data-bn="next-mean">${fmt(r.nextMean)}</strong><br>
 ${ko?'다음 분산':'Next variance'} = 0.9 × ${fmt(state.variance)} + 0.1 × ${fmt(r.unbiased)} = <strong data-bn="next-variance">${fmt(r.nextVariance)}</strong></p>
 <p>${ko?'PyTorch는 훈련 출력에 3으로 나눈 분산을 쓰지만 누적 분산 갱신에는 2로 나눈 불편 분산을 사용합니다. 아래 평가는 미리보기가 아닌 현재 저장된 통계를 사용합니다.':'PyTorch uses the variance divided by 3 for the training output but the unbiased variance divided by 2 for the running variance update. Evaluation below uses the currently stored statistics, not the preview.'}</p>
 <p><b>${ko?'③ 별도 평가 샘플(값 2)을 현재 통계로 계산':'③ Evaluate a separate sample (value 2) with current statistics'}</b><br>
 y = (2 − ${fmt(state.mean)}) / √(${fmt(state.variance)} + 0.01) = <strong data-bn="evaluation">${fmt(r.evaluation)}</strong><br>
 ${ko?'평가만으로 저장된 통계는 갱신되지 않습니다.':'Evaluation alone does not update the stored statistics.'}</p>
 <p>${ko?'계산에는 반올림 전 값을 사용하고 화면에는 소수 셋째 자리까지 표시합니다.':'Calculations use full precision; displayed values are rounded to three decimals.'}</p>
 </div>`;
}
