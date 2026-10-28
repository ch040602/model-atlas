// Fixed synthetic scores, not measurements from a trained classifier.
export const rocSamples = [
  {score:0.9,label:1}, {score:0.8,label:0}, {score:0.6,label:1},
  {score:0.6,label:0}, {score:0.4,label:1}, {score:0.2,label:0}
];

export function rocAt(threshold) {
  const counts={tp:0,fp:0,fn:0,tn:0};
  for (const {score,label} of rocSamples) {
    if (score >= threshold) counts[label?'tp':'fp']++;
    else counts[label?'fn':'tn']++;
  }
  const {tp,fp,fn,tn}=counts;
  return {...counts,tpr:tp/(tp+fn),fpr:fp/(fp+tn),precision:tp+fp?tp/(tp+fp):null};
}

export function rocCurve() {
  const thresholds=[Infinity,...new Set(rocSamples.map(s=>s.score))].sort((a,b)=>b-a);
  const points=thresholds.map(threshold=>({threshold,...rocAt(threshold)}));
  const auc=points.slice(1).reduce((sum,p,i)=>sum+(p.fpr-points[i].fpr)*(p.tpr+points[i].tpr)/2,0);
  return {points,auc};
}

export function rocMarkup(threshold,lang) {
  const ko=lang==='ko';
  return `<section class="metric-lab" aria-labelledby="roc-title">
    <h2 id="roc-title">${ko?'점수에서 ROC 곡선까지':'From scores to the ROC curve'}</h2>
    <p>${ko?'가상 사례 여섯 개의 점수가 임계값 이상이면 양성으로 예측합니다. 임계값을 움직여 개별 예측, 혼동행렬, ROC 좌표를 순서대로 비교하세요. 점수는 확률이라고 가정하지 않습니다.':'Predict positive when a synthetic example’s score is at least the threshold. Move the threshold to follow individual predictions, confusion counts and the ROC point. Scores are not assumed to be probabilities.'}</p>
    <div class="sequence-control"><label for="roc-threshold">${ko?'임계값':'Threshold'} <output id="roc-threshold-value">${threshold.toFixed(2)}</output></label><input id="roc-threshold" data-roc-threshold type="range" min="0" max="1" step="0.05" value="${threshold}"></div>
    <div id="roc-output" aria-live="polite"></div>
    <p>${ko?'이 점수와 정답은 설명용으로 고정되어 있으며 모델을 학습하거나 성능을 평가하지 않습니다. 운영 임계값은 오류 비용을 고려해 검증 데이터로 선택하고, 최종 시험 데이터는 따로 사용하세요.':'These fixed scores and labels are illustrative; no model is trained or evaluated. Choose an operating threshold on validation data with error costs in mind, and keep final test data separate.'} <a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_curve.html" target="_blank" rel="noopener noreferrer">${ko?'ROC 계산 참고 자료':'ROC reference'} ↗</a></p>
  </section>`;
}

export function rocOutput(threshold,lang) {
  const ko=lang==='ko', result=rocAt(threshold), {points,auc}=rocCurve();
  const f=x=>x.toFixed(3), x=p=>30+200*p.fpr, y=p=>220-200*p.tpr;
  const path=points.map(p=>`${x(p)},${y(p)}`).join(' ');
  const rows=rocSamples.map((s,i)=>`<tr><th scope="row">${i+1}</th><td>${s.score.toFixed(1)}</td><td>${s.label? (ko?'양성':'Positive'):(ko?'음성':'Negative')}</td><td>${s.score>=threshold?(ko?'양성':'Positive'):(ko?'음성':'Negative')}</td></tr>`).join('');
  return `<div class="tree-results">
    <h3>${ko?'① 점수에 임계값 적용':'① Apply the threshold'}</h3>
    <div class="roc-table-wrap"><table><thead><tr><th scope="col">#</th><th scope="col">${ko?'점수':'Score'}</th><th scope="col">${ko?'정답':'Label'}</th><th scope="col">${ko?'예측':'Prediction'}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <h3>${ko?'② 정답과 비교':'② Compare with labels'}</h3>
    <p>TP = ${result.tp} · FP = ${result.fp} · FN = ${result.fn} · TN = ${result.tn}<br>${ko?'TP와 TN은 맞힌 양성과 음성이고, FP는 잘못 알린 양성, FN은 놓친 양성입니다.':'TP and TN are correctly predicted positives and negatives; FP is a false alarm and FN a missed positive.'}<br>${ko?'참 양성률 (재현율)':'True positive rate (recall)'} = TP / (TP + FN) = ${result.tp} / 3 = <strong data-roc-tpr>${f(result.tpr)}</strong><br>${ko?'거짓 양성률':'False positive rate'} = FP / (FP + TN) = ${result.fp} / 3 = <strong data-roc-fpr>${f(result.fpr)}</strong><br>${ko?'정밀도':'Precision'} = TP / (TP + FP) = ${result.tp} / ${result.tp+result.fp} = <strong data-roc-precision>${result.precision===null?(ko?'정의되지 않음':'undefined'):f(result.precision)}</strong></p>
    <h3>${ko?'③ 모든 임계값의 ROC':'③ ROC over all thresholds'}</h3>
    <svg class="roc-plot" viewBox="0 0 250 250" role="img" aria-label="${ko?`ROC 곡선. 현재 거짓 양성률 ${f(result.fpr)}, 참 양성률 ${f(result.tpr)}. AUC ${f(auc)}.`:`ROC curve. Current false positive rate ${f(result.fpr)}, true positive rate ${f(result.tpr)}. AUC ${f(auc)}.`}"><line x1="30" y1="220" x2="230" y2="220" stroke="currentColor"/><line x1="30" y1="220" x2="30" y2="20" stroke="currentColor"/><line x1="30" y1="220" x2="230" y2="20" stroke="#aaa" stroke-dasharray="4 4"/><polyline points="${path}" fill="none" stroke="#346f8e" stroke-width="3"/><circle cx="${x(result)}" cy="${y(result)}" r="5" fill="#bc4c39"/><text x="130" y="245" text-anchor="middle">FPR →</text><text x="8" y="17">TPR ↑</text><text x="25" y="235">0</text><text x="226" y="235">1</text><text x="14" y="24">1</text></svg>
    <p>${ko?'빨간 점은 현재 임계값, 선은 서로 다른 점수에서 계산한 ROC입니다. 같은 점수 0.6의 양성과 음성은 함께 이동합니다. 점선은 무작위 순위의 기준입니다.':'The red dot is the current threshold; the line uses all distinct scores. The positive and negative examples tied at 0.6 move together. The dashed diagonal is the random-ranking reference.'}</p>
    <p>ROC AUC = <strong data-roc-auc>${f(auc)}</strong>. ${ko?'인접 좌표 사이의 사다리꼴 넓이를 더한 값으로, 이 데이터에서는 양성·음성 9쌍 중 양성 점수가 더 높은 5쌍과 동률 1쌍의 절반을 합한 (5 + 0.5) / 9입니다. 임계값만 바꾸면 점은 움직이지만 점수 순위와 AUC는 바뀌지 않습니다.':'This is the sum of trapezoid areas between adjacent points. Of the nine positive–negative pairs, the positive scores higher in five and ties in one, giving (5 + 0.5) / 9. Changing only the threshold moves the point, but not the score ranking or AUC.'}</p>
    <p>${ko?'양성 예측이 없으면 정밀도의 분모가 0이므로 여기서는 정의되지 않음으로 표시합니다. 라이브러리는 이 경우 설정에 따라 다른 값을 반환할 수 있습니다.':'When there are no positive predictions, precision has a zero denominator and is shown as undefined here. Libraries may return another value depending on their settings.'}</p>
  </div>`;
}
