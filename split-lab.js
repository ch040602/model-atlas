// Small fixed examples demonstrate selection; no model is trained here.
export const splitData = {
  train: [{x:1,y:1},{x:2,y:2}],
  validation: [{x:1,y:1.5},{x:2,y:3}],
  test: [{x:1,y:1.4},{x:2,y:2.8}]
};
export const candidates = [0.5,1,1.5];
export function meanSquaredLoss(samples, weight) {
  return samples.reduce((sum, {x,y}) => sum + (weight*x-y)**2, 0) / samples.length;
}
const n = value => value.toFixed(3);
const copy = {
  ko: {title:'훈련·검증·시험: 모델을 고르는 순서',intro:'고정된 후보 세 개를 비교합니다. 검증 결과로 하나를 고른 뒤 시험 결과를 공개합니다.',fixed:'ŷ=wx, 손실 ℓ=(ŷ−y)². 후보 w는 미리 정해져 있으며 여기서 실제 훈련하지 않습니다. 두 예제뿐인 각 집합은 설명을 위해 정답의 관계도 다르게 만든 가상 예제이므로 일반화 성능을 판단할 수 없습니다.',s1:'1. 데이터의 역할',data:'훈련 데이터는 가중치 학습, 검증 데이터는 후보 선택, 시험 데이터는 선택을 마친 뒤 최종 평가에 사용합니다.',train:'훈련',val:'검증',test:'시험',hidden:'정답과 결과는 선택 전까지 숨김',s2:'2. 훈련 손실 비교',mse:'각 후보에 두 예제를 넣고 제곱 오차를 평균합니다. 훈련 손실만 보면 w=1이 가장 낮습니다.',s3:'3. 검증 결과로 후보 선택',valText:'각 후보의 가중치를 그대로 두고 검증 예제에 적용합니다. 이 예제에서 검증 평균이 가장 낮은 후보는 w=1.5입니다.',choice:'최종 평가할 후보',placeholder:'후보를 선택하세요',selected:'선택한 후보의 검증 평균',best:'검증 평균이 가장 낮은 후보',s4:'4. 선택을 고정하고 시험',testText:'선택한 후보만 시험합니다. 시험 점수로 후보를 다시 선택하면 시험 데이터가 선택에 사용된 것입니다.',repeat:'다시 연습해도 같은 시험 예제입니다. 이미 본 시험 점수로 선택했다면 독립적인 최종 평가를 위해 새 시험 데이터가 필요합니다.',practice:'실제 데이터에서는 목적에 맞게 대표성 있는 분할을 하고, 분할 후 전처리의 통계는 훈련 데이터에서만 학습합니다. 집단·시간 순서와 중복에도 주의하세요.',step:'계산 단계',prev:'이전 계산',next:'다음 계산',reset:'다시 연습',reference:'데이터 분할 참고',leak:'전처리와 데이터 누출 참고'},
  en: {title:'Training, validation, and test: selecting a model',intro:'Compare three fixed candidates. Choose one using validation results before revealing its test result.',fixed:'ŷ=wx, loss ℓ=(ŷ−y)². The candidate weights are fixed in advance; no model is trained here. Each split has just two examples, with deliberately different target relationships, so this toy does not establish generalization.',s1:'1. The role of each split',data:'Training data is used to learn weights, validation data to select a candidate, and test data for final evaluation after the choice.',train:'Training',val:'Validation',test:'Test',hidden:'Targets and results hidden until selection',s2:'2. Compare training losses',mse:'Apply each candidate to both examples and average their squared errors. Training loss alone is lowest for w=1.',s3:'3. Select using validation results',valText:'Keep each candidate weight fixed and apply it to the validation examples. Here, w=1.5 has the lowest validation mean.',choice:'Candidate for final evaluation',placeholder:'Choose a candidate',selected:'Validation mean of selected candidate',best:'Candidate with lowest validation mean',s4:'4. Freeze the choice and test',testText:'Test only the selected candidate. Choosing again based on the test score uses test data for selection.',repeat:'A new practice run reuses the same test examples. If seen test scores guided selection, fresh test data is needed for an independent final evaluation.',practice:'With real data, make splits representative of the intended use and fit preprocessing statistics on training data only after splitting. Consider groups, time order, and duplicates.',step:'Calculation step',prev:'Previous calculation',next:'Next calculation',reset:'Practice again',reference:'Dataset splitting',leak:'Preprocessing and data leakage'}
};
export function splitLabMarkup(choice, lang) {
  const t=copy[lang];
  return `<section class="sequence-lab split-lab" aria-labelledby="split-title"><div class="eyebrow">FOUNDATIONS / DATA SPLITS</div><h2 id="split-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div id="split-output" aria-live="polite"></div><div class="sequence-control" id="split-choice-area" hidden><label for="split-choice">${t.choice}</label><select id="split-choice" data-split-choice><option value="">${t.placeholder}</option>${candidates.map(w=>`<option value="${w}" ${String(w)===choice?'selected':''}>w = ${w}</option>`).join('')}</select></div><div class="sequence-actions"><b>${t.step}</b><span id="split-status"></span><button type="button" data-split-action="previous">${t.prev}</button><button type="button" data-split-action="next">${t.next} →</button><button type="button" data-split-action="reset">${t.reset}</button></div><p>${t.repeat}</p><p>${t.practice}</p><p class="sequence-rounding"><a href="https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets" target="_blank" rel="noopener noreferrer">${t.reference} ↗</a> · <a href="https://scikit-learn.org/stable/common_pitfalls.html#data-leakage" target="_blank" rel="noopener noreferrer">${t.leak} ↗</a></p></section>`;
}
function calculations(samples, weight) {
  const terms=samples.map(({x,y})=>`(${n(weight)} × ${n(x)} − ${n(y)})²`);
  const losses=samples.map(({x,y})=>n((weight*x-y)**2));
  return `w=${weight}: L=(${terms.join(' + ')}) / ${samples.length} = (${losses.join(' + ')}) / ${samples.length} = ${n(meanSquaredLoss(samples,weight))}`;
}
export function splitLabOutput(lang, stage, choice) {
  const t=copy[lang];
  const steps=[`<li><b>${t.s1}</b><p>${t.data}</p><code>${t.train} (x,y): (1,1), (2,2)<br>${t.val} (x,y): (1,1.5), (2,3)<br>${t.test}: ${t.hidden}</code></li>`,
    `<li><b>${t.s2}</b><p>${t.mse}</p>${candidates.map(w=>`<code>${calculations(splitData.train,w)}</code>`).join('')}</li>`,
    `<li><b>${t.s3}</b><p>${t.valText}</p>${candidates.map(w=>`<code>${calculations(splitData.validation,w)}</code>`).join('')}${choice?`<p>${t.selected}: ${n(meanSquaredLoss(splitData.validation,Number(choice)))} · ${t.best}: w=1.5</p>`:''}</li>`];
  if(stage>=4 && choice) steps.push(`<li><b>${t.s4}</b><p>${t.testText}</p><code>${t.test} (x,y): (1,1.4), (2,2.8)<br>${calculations(splitData.test,Number(choice))}</code></li>`);
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
