// Each row is one labeled message. Features record presence, not word counts.
export const bayesSamples=[
  {label:'spam',features:[1,1,1]}, {label:'spam',features:[1,0,0]},
  {label:'spam',features:[1,1,1]}, {label:'spam',features:[0,1,0]},
  {label:'ham',features:[0,0,0]}, {label:'ham',features:[0,1,0]},
  {label:'ham',features:[1,0,0]}, {label:'ham',features:[0,0,0]}
];
export function bayesCalculate(features,alpha){
  if(!Array.isArray(features)||features.length!==3||features.some(x=>x!==0&&x!==1)||![0,1].includes(alpha))throw new RangeError('Expected three binary features and alpha 0 or 1');
  const classes=['spam','ham'].map(label=>{
    const rows=bayesSamples.filter(row=>row.label===label),counts=features.map((_,i)=>rows.reduce((n,row)=>n+row.features[i],0));
    const theta=counts.map(n=>(n+alpha)/(rows.length+2*alpha));
    const factors=theta.map((p,i)=>features[i]?p:1-p),prior=rows.length/bayesSamples.length;
    return {label,counts,theta,factors,prior,score:prior*factors.reduce((a,b)=>a*b,1)};
  });
  const total=classes.reduce((sum,c)=>sum+c.score,0);
  return {classes,total,probabilities:total?classes.map(c=>c.score/total):null};
}
const f=n=>n.toFixed(4);
export function bayesMarkup(settings,lang){
  const ko=lang==='ko';
  const words=['sale','link','prize'];
  return `<section class="metric-lab bayes-lab" aria-labelledby="bayes-title">
    <h2 id="bayes-title">${ko?'단어 유무로 나이브 베이즈 계산하기':'Calculate naive Bayes from word presence'}</h2>
    <p>${ko?'가상의 메시지 8개로 분류기를 맞춥니다. 1은 단어가 등장함, 0은 등장하지 않음을 뜻합니다. 새 메시지의 단어와 평활화를 바꿔 각 단계의 숫자를 비교하세요.':'Fit a classifier to eight toy messages. 1 means a word appears and 0 means it does not. Change the words in the new message and smoothing to compare each calculation.'}</p>
    <p class="sequence-fixed"><b>${ko?'훈련 표본: (sale, link, prize)':'Training samples: (sale, link, prize)'}</b><br>Spam: (1,1,1), (1,0,0), (1,1,1), (0,1,0)<br>${ko?'정상':'Ham'}: (0,0,0), (0,1,0), (1,0,0), (0,0,0)</p>
    <fieldset><legend>${ko?'새 메시지에 있는 단어':'Words present in the new message'}</legend>${words.map((word,i)=>`<label class="bayes-word"><input type="checkbox" data-bayes-word="${i}" ${settings.features[i]?'checked':''}> ${word}</label>`).join('')}</fieldset>
    <label for="bayes-alpha">${ko?'평활화 α':'Smoothing α'}</label> <select id="bayes-alpha" data-bayes-alpha><option value="0" ${settings.alpha===0?'selected':''}>0 (${ko?'없음':'none'})</option><option value="1" ${settings.alpha===1?'selected':''}>1 (Laplace)</option></select>
    <div id="bayes-output" aria-live="polite"></div>
    <p>${ko?'베르누이 나이브 베이즈는 등장하지 않은 단어도 1−θ로 반영합니다. 단어가 클래스에 조건부로 독립이라는 가정은 실제 메시지에서 자주 깨지며, 결과 확률의 보정과 별도 시험 데이터의 성능을 확인해야 합니다. 이 작은 예시는 실제 스팸 필터가 아닙니다.':'Bernoulli naive Bayes includes absent words through 1−θ. Its conditional-independence assumption often fails for real messages; check probability calibration and performance on separate test data. This small example is not a real spam filter.'} <a href="https://scikit-learn.org/stable/modules/naive_bayes.html#bernoulli-naive-bayes" target="_blank" rel="noopener noreferrer">${ko?'베르누이 모델 참고 자료':'Bernoulli model reference'} ↗</a></p>
  </section>`;
}
export function bayesOutput(settings,lang){
  const ko=lang==='ko',r=bayesCalculate(settings.features,settings.alpha),words=['sale','link','prize'];
  const rows=r.classes.map(c=>{
    const title=c.label==='spam'?'Spam':(ko?'정상':'Ham');
    const likelihood=c.factors.map((v,i)=>`${words[i]}: ${settings.features[i]?'θ':'1−θ'} = ${f(v)}`).join(' · ');
    return `<p><b>${title}</b><br>${ko?'등장 문서 수':'Documents containing each word'}: [${c.counts.join(', ')}] / 4<br>θ = (count + α) / (4 + 2α) = [${c.theta.map(f).join(', ')}]<br>${likelihood}<br>${ko?'점수':'Score'} = ${f(c.prior)} × ${c.factors.map(f).join(' × ')} = <strong data-bayes-score="${c.label}">${f(c.score)}</strong></p>`;
  }).join('');
  const outcome=r.probabilities?`<p>${ko?'③ 두 점수를 더한 값으로 나눕니다':'③ Divide each score by the sum of the two scores'} (${f(r.total)}).<br> P(Spam | x) = <strong data-bayes-prob="spam">${f(r.probabilities[0])}</strong> · P(${ko?'정상':'Ham'} | x) = <strong data-bayes-prob="ham">${f(r.probabilities[1])}</strong><br>${ko?'더 큰 확률의 클래스':'Class with higher probability'}: <strong data-bayes-prediction>${r.probabilities[0]===r.probabilities[1]?(ko?'동률':'tie'):r.probabilities[0]>r.probabilities[1]?'Spam':(ko?'정상':'Ham')}</strong></p>`:`<p data-bayes-undefined>${ko?'두 점수가 모두 0이므로 정규화할 수 없습니다. 평활화를 적용해 보세요.':'Both scores are zero, so normalization is undefined. Try smoothing.'}</p>`;
  return `<div class="tree-results"><p><b>${ko?'① 클래스 사전확률':'① Class priors'}</b><br>P(Spam) = 4/8 = 0.5 · P(${ko?'정상':'Ham'}) = 4/8 = 0.5<br>${ko?'훈련 표본의 클래스 비율로 추정합니다.':'Estimate these from the training class proportions.'}</p><p><b>${ko?'② 클래스별 단어 확률과 점수':'② Word probabilities and class scores'}</b><br>${ko?'θ는 해당 클래스 메시지에서 단어가 등장할 확률입니다. 0과 1 두 경우에 각각 α를 더하고, 선택한 단어가 없으면 1−θ를 곱합니다.':'θ is the probability that the word appears in a message of that class. Add α to each of the two outcomes; for an absent word multiply by 1−θ.'}</p>${rows}${outcome}<p>${ko?'계산은 반올림 전 값으로 진행하며 표시만 소수 넷째 자리까지 합니다. 평활화 없이 정상 메시지에서 한 번도 나타나지 않은 prize를 선택하면 정상 점수가 0이 됩니다.':'Calculations use unrounded values; only the display rounds to four decimals. Without smoothing, selecting prize gives Ham a zero score because it never appeared in Ham training messages.'}</p></div>`;
}
