// Full-batch regression on two deliberately different synthetic splits.
const train = [[1,1],[2,2]];
const validation = [[1,0.6],[2,1.2]];
const mse = (data,w) => data.reduce((sum,[x,y]) => sum+(w*x-y)**2,0)/data.length;
const snapshot = (epoch,w) => ({epoch,w,train:mse(train,w),validation:mse(validation,w)});
export function earlyInitial(patience=2) {
  const first=snapshot(0,0);
  return {patience,history:[first],best:first,bad:0,stopped:false,restored:false};
}
export function earlyNext(state) {
  if(state.stopped) return state;
  const previous=state.history[state.history.length-1];
  const gradient=train.reduce((sum,[x,y])=>sum+2*(previous.w*x-y)*x,0)/train.length;
  const next={...snapshot(previous.epoch+1,previous.w-0.1*gradient),gradient};
  // Equal validation loss is not an improvement; comparisons use unrounded values.
  const improved=next.validation<state.best.validation;
  const best=improved?next:state.best;
  const bad=improved?0:state.bad+1;
  return {...state,history:[...state.history,next],best,bad,stopped:bad>=state.patience};
}
const f=n=>n.toFixed(4);
export function earlyMarkup(state,lang) {
  const ko=lang==='ko';
  return `<section class="sequence-lab early-lab" aria-labelledby="early-title">
    <div class="eyebrow">FOUNDATIONS / EARLY STOPPING</div>
    <h2 id="early-title">${ko?'검증 손실로 학습 시점 고르기':'Choose a training checkpoint using validation loss'}</h2>
    <p>${ko?'다음 에포크를 눌러 가중치를 갱신하고 검증 손실이 더 좋아지지 않는 횟수를 살펴보세요. 기다리는 횟수를 바꿔 종료 시점을 비교하세요.':'Advance one epoch to update the weight and count validation checks without improvement. Change patience to compare stopping times.'}</p>
    <p class="sequence-fixed">${ko?'가상 선형 모델 ŷ=wx, 초기 w=0, 학습률 η=0.1. 훈련 (x,y): (1,1), (2,2); 검증: (1,0.6), (2,1.2). 두 훈련 샘플 전체를 한 번 갱신하는 것을 한 에포크로 정의합니다. 두 집합은 의도적으로 다른 가상 관계이므로 일반화 성능의 증거가 아닙니다.':'Toy linear model ŷ=wx, initial w=0, learning rate η=0.1. Training (x,y): (1,1), (2,2); validation: (1,0.6), (2,1.2). One epoch is one update using both training samples. The splits have deliberately different synthetic relationships and do not establish generalization.'}</p>
    <p>${ko?'평균 제곱 오차 L=Σ(wx−y)²/2를 각각 계산합니다. 훈련 기울기 ∂L/∂w=Σ2(wx−y)x/2로 w←w−η∂L/∂w를 적용하고, 갱신된 w로 검증합니다. 검증값이 지금까지의 최솟값보다 작을 때만 체크포인트를 저장합니다. 초기 모델도 검증하며 같으면 개선이 아닙니다.':'Compute mean squared error L=Σ(wx−y)²/2 on each split. Update w←w−η∂L/∂w using the training gradient ∂L/∂w=Σ2(wx−y)x/2, then validate the updated w. Save a checkpoint only when validation loss is strictly below the previous best. The initial model is also evaluated; a tie is not an improvement.'}</p>
    <div class="sequence-control"><label for="early-patience">${ko?'개선 없이 기다릴 검증 횟수 (patience)':'Validation checks to wait without improvement (patience)'}</label>
    <select id="early-patience" data-early-patience ${state.history.length>1?'disabled':''}>${[1,2,3].map(n=>`<option value="${n}" ${state.patience===n?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="sequence-actions"><button type="button" data-early-action="next" ${state.stopped?'disabled':''}>${ko?'다음 에포크':'Next epoch'}</button><button type="button" data-early-action="restore" ${state.stopped?'':'hidden'} ${state.restored?'disabled':''}>${ko?'최고 가중치 복원':'Restore best weights'}</button><button type="button" data-early-action="reset">${ko?'처음부터':'Start over'}</button></div>
    <div id="early-output" aria-live="polite">${earlyOutput(state,lang)}</div>
    <p>${ko?'종료 후에는 마지막 가중치가 아니라 검증 손실이 가장 낮았을 때 저장한 가중치를 복원합니다. 검증 데이터를 반복해 설정을 고른 뒤에는 사용하지 않은 시험 데이터로 최종 평가합니다. 실제 검증 손실은 요동칠 수 있고 patience나 개선 기준에 따라 결과가 달라집니다.':'After stopping, restore the saved weights from the lowest validation loss rather than the final weights. After tuning choices on validation data, evaluate once on unused test data. Real validation losses can fluctuate, and patience and improvement thresholds affect the result.'}</p>
  </section>`;
}
export function earlyOutput(state,lang) {
  const ko=lang==='ko', last=state.history[state.history.length-1];
  const current=state.restored?state.best:last;
  const rows=state.history.map(s=>`<tr><td>${s.epoch}</td><td>${f(s.w)}</td><td>${f(s.train)}</td><td>${f(s.validation)}</td><td>${s.epoch===state.best.epoch?(ko?'현재 최고':'Current best'):'—'}</td></tr>`).join('');
  return `<p>${last.epoch? `∂L/∂w = ${f(last.gradient)}; w = ${f(state.history[state.history.length-2].w)} − 0.1 × ${f(last.gradient)} = <strong>${f(last.w)}</strong>` : (ko?'초기 가중치를 검증했습니다.':'The initial weight has been validated.')}</p>
    <div class="early-table-wrap" tabindex="0" role="region" aria-label="${ko?'에포크별 손실 표':'Loss table by epoch'}"><table><thead><tr><th>${ko?'에포크':'Epoch'}</th><th>w</th><th>${ko?'훈련 손실':'Train loss'}</th><th>${ko?'검증 손실':'Validation loss'}</th><th>${ko?'저장':'Saved'}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p><strong>${ko?'개선 없는 검증 횟수':'Checks without improvement'}: ${state.bad} / ${state.patience}.</strong> ${state.stopped?(ko?'조기 종료.':'Early stopping triggered.'):(ko?'학습을 계속할 수 있습니다.':'Training can continue.')}</p>
    <p>${ko?'최고 체크포인트':'Best checkpoint'}: ${ko?'에포크':'epoch'} ${state.best.epoch}, w = ${f(state.best.w)}, L<sub>val</sub> = ${f(state.best.validation)}. ${state.stopped?(state.restored?(ko?`복원된 현재 가중치: ${f(current.w)} (종료 당시: ${f(last.w)}). 복원 후 훈련 손실: ${f(current.train)}, 검증 손실: ${f(current.validation)}.`:`Restored current weight: ${f(current.w)} (at stop: ${f(last.w)}). Restored training loss: ${f(current.train)}, validation loss: ${f(current.validation)}.`):(ko?`현재 가중치: ${f(current.w)}. 복원할 가중치: ${f(state.best.w)}.`:`Current weight: ${f(current.w)}. Weight to restore: ${f(state.best.w)}.`)):''}</p>`;
}
