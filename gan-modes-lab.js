// A two-category probability example, not a trained GAN or sampled estimate.
export function ganModesExperiment(q, score) {
  if (!Number.isFinite(q) || q < 0 || q > 1 || !Number.isFinite(score) || score <= 0 || score >= 1) throw new RangeError('q must be in [0, 1] and score in (0, 1)');
  const p=[0.5,0.5], generated=[q,1-q];
  const average=p.map((value,i)=>(value+generated[i])/2);
  const kl=(a,b)=>a.reduce((sum,value,i)=>sum+(value===0?0:value*Math.log2(value/b[i])),0);
  const klReal=kl(p,average), klGenerated=kl(generated,average);
  return {p,generated,average,klReal,klGenerated,js:(klReal+klGenerated)/2,loss:-Math.log(score)};
}


// Replicate GAN Lab's 30×30 smoothing on idealized two-cell probabilities.
// These values do not read the running lab's finite samples.
export function ganGridExample(q) {
  if (!Number.isFinite(q) || q < 0 || q > 1) throw new RangeError('q must be in [0, 1]');
  const eps=0.0001, cells=900, total=1+cells*eps;
  const real=[0.5+eps,0.5+eps], generated=[q+eps,1-q+eps];
  const average=real.map((v,i)=>(v+generated[i])/2);
  const kl=real.reduce((sum,v,i)=>sum+v*Math.log2(v/generated[i]),0);
  const js=real.reduce((sum,v,i)=>sum+0.5*(v*Math.log2(v/average[i])+generated[i]*Math.log2(generated[i]/average[i])),0);
  // The other 898 cells have equal nonzero values and contribute zero.
  return {eps,cells,total,real,generated,average,kl,js,normalizedJs:js/total};
}

const n=value=>(Math.abs(value)<0.0005?0:value).toFixed(3);
const copy={
  ko:{title:'생성 다양성과 손실 비교',intro:'실제 데이터에 유형 A와 B가 각각 절반 있다고 가정합니다. 생성 분포와 판별자 점수를 따로 바꾸어 보고, 손실 하나로 다양성을 판단할 수 있는지 확인하세요.',fixed:'이산 확률을 직접 정한 설명용 예제입니다. 신경망을 학습하거나 GAN Lab의 샘플과 점수를 읽지는 않습니다.',q:'생성 분포의 A 확률 q',score:'가짜에 대한 고정 판별자 점수 s',distribution:'1. 실제와 생성 분포',table:'두 유형의 확률',type:'유형',real:'실제 P',generated:'생성 Q',distMeaning:'Q의 A 확률이 0 또는 1이면 실제로 존재하는 다른 유형을 생성하지 않습니다. 이것은 두 유형 예제의 극단적인 모드 붕괴입니다.',divergence:'2. 분포 차이 계산',jsMeaning:'JS가 0이면 이 두 유형의 확률이 같습니다. 큰 값은 여기서 비교한 분포의 차이가 큽니다. 이 예는 정확한 확률을 사용하며 GAN Lab의 유한 샘플·평활화 격자 값과 다릅니다.',loss:'3. 판별자 점수와 생성자 손실',lossMeaning:'여기서는 두 유형 모두 D가 항상 같은 점수 s를 준다고 가정합니다. q를 바꿔도 이 손실은 그대로이므로, 낮은 손실만으로 누락된 유형이 없다고 할 수 없습니다. 실제 학습에서는 D와 G가 함께 변하며 점수도 샘플에 따라 달라집니다.',next:'다음 단계',previous:'이전 단계',reset:'처음부터',note:'JS는 밑이 2인 로그, 생성자 손실은 자연로그를 사용합니다. 0 × log₂(0/m)은 0으로 계산하며, 표시값만 소수 셋째 자리로 반올림합니다.',reference:'원 논문: 분포 비교와 이상적 판별자 ↗'},
  en:{title:'Compare diversity and loss',intro:'Suppose real data has two types, A and B, each with probability one half. Change the generator distribution and discriminator score separately to see whether one loss proves diversity.',fixed:'This toy specifies probabilities directly. It does not train a network or read GAN Lab samples or scores.',q:'Generated probability q of A',score:'Fixed discriminator score s for fakes',distribution:'1. Real and generated distributions',table:'Probabilities of the two types',type:'Type',real:'Real P',generated:'Generated Q',distMeaning:'If Q assigns A probability 0 or 1, it never produces the other type that exists in the real data. This is an extreme mode collapse in the two-type example.',divergence:'2. Calculate distribution difference',jsMeaning:'JS is zero when the probabilities of these two types match. A larger value means a larger difference between the distributions compared here. This uses exact probabilities, unlike GAN Lab’s finite-sample, smoothed grid values.',loss:'3. Discriminator score and generator loss',lossMeaning:'Here D is assumed to give both types the same fixed score s. Changing q leaves this loss unchanged, so a low loss alone cannot rule out missing types. In actual training D and G both change, and scores vary between samples.',next:'Next step',previous:'Previous step',reset:'Start over',note:'JS uses base-2 logarithms; generator loss uses natural logarithms. We define 0 × log₂(0/m) as 0. Only displayed values are rounded to three decimals.',reference:'Original paper: distribution comparison and optimal discriminator ↗'}
};

export function ganModesMarkup(values,lang) {
  const t=copy[lang];
  return `<section class="sequence-lab gan-modes-lab" aria-labelledby="ganmodes-title"><div class="eyebrow">GAN / DISTRIBUTIONS</div><h2 id="ganmodes-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls"><div class="sequence-control"><label for="ganmodes-q">${t.q} <output id="ganmodes-value-q">${n(values.q)}</output></label><input id="ganmodes-q" data-ganmodes-input="q" type="range" min="0" max="1" step="0.05" value="${values.q}"></div><div class="sequence-control"><label for="ganmodes-score">${t.score} <output id="ganmodes-value-score">${n(values.score)}</output></label><input id="ganmodes-score" data-ganmodes-input="score" type="range" min="0.05" max="0.95" step="0.05" value="${values.score}"></div></div><div id="ganmodes-output" aria-live="polite"></div><div class="sequence-actions"><span id="ganmodes-status"></span><button type="button" data-ganmodes-action="previous">${t.previous}</button><button type="button" data-ganmodes-action="next">${t.next} →</button><button type="button" data-ganmodes-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.note}</p><p><a href="https://arxiv.org/html/1406.2661#S4" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function ganModesOutput(values,lang,stage) {
  const t=copy[lang], r=ganModesExperiment(values.q,values.score), grid=ganGridExample(values.q);
  const six=value=>value.toFixed(6);
  const ko=lang==='ko';
  const steps=[
    `<li><b>${t.distribution}</b><div class="training-history"><table><caption>${t.table}</caption><thead><tr><th scope="col">${t.type}</th><th scope="col">${t.real}</th><th scope="col">${t.generated}</th></tr></thead><tbody><tr><th scope="row">A</th><td>${n(r.p[0])}</td><td>${n(r.generated[0])}</td></tr><tr><th scope="row">B</th><td>${n(r.p[1])}</td><td>${n(r.generated[1])}</td></tr></tbody></table></div><p>${t.distMeaning}</p></li>`,
    `<li><b>${t.divergence}</b><code>M = (P + Q)/2 = [${r.average.map(n).join(', ')}]<br>KL(P‖M) = Σ Pᵢ log₂(Pᵢ/Mᵢ) = ${n(r.klReal)}<br>KL(Q‖M) = Σ Qᵢ log₂(Qᵢ/Mᵢ) = ${n(r.klGenerated)}<br>JS(P,Q) = ½ KL(P‖M) + ½ KL(Q‖M) = ${n(r.js)}</code><p>${t.jsMeaning}</p><div class="sequence-fixed" data-ganmodes-grid>
    <b>${ko?'GAN Lab의 격자 값과 비교하기':'Compare with the GAN Lab grid'}</b>
    <p>${ko?'같은 비율이 30×30 격자의 두 칸에만 들어 있고 나머지 898칸은 비었다고 가정합니다. 실제 그래프의 샘플을 읽는 것은 아닙니다.':'Suppose these same proportions occupy two cells of the 30×30 grid and the other 898 cells are empty. This does not read samples from the running chart.'}</p>
    <code>${ko?'각 칸에':'Each cell gets'} ε = 0.0001<br>P* = [${grid.real.map(six).join(', ')}; ${ko?'빈 칸':'empty cells'}: 0.000100 × 898]<br>Q* = [${grid.generated.map(six).join(', ')}; ${ko?'빈 칸':'empty cells'}: 0.000100 × 898]<br>ΣP* = ΣQ* = 1 + 900 × 0.0001 = ${n(grid.total)}<br>M* = (P* + Q*) / 2<br>${ko?'원본 그래프의 JS 합':'Original chart JS sum'} = ½Σ[P*ᵢ log₂(P*ᵢ/M*ᵢ) + Q*ᵢ log₂(Q*ᵢ/M*ᵢ)] = <strong data-ganmodes-grid-result="raw">${six(grid.js)}</strong><br>${ko?'정규화한 JS':'Normalized JS'} = ${six(grid.js)} / ${n(grid.total)} = <strong data-ganmodes-grid-result="normalized">${six(grid.normalizedJs)}</strong></code>
    <p>${ko?'별표는 평활화한 값입니다. 예를 들어 Q에서 A가 0이어도 ε를 더하면 로그의 분모가 0이 되지 않습니다. 898개의 빈 칸은 양쪽 값이 같아 위 합에 0을 더합니다. 원본은 합이 1.09인 값을 그대로 쓰므로 확률분포로 다시 정규화한 JS의 1.09배가 됩니다. 이론적 JS와도 값이 다를 수 있습니다. 실제 그래프는 유한한 샘플을 사용하므로 매 실행 값은 이 가정과 다릅니다.':'Stars mark smoothed values. For example, adding ε keeps the logarithm denominator nonzero even when Q assigns A probability zero. The 898 empty cells have equal values on both sides and add zero to the sum. The original uses values summing to 1.09, so its result is 1.09 times the JS after normalization into probability distributions. It can also differ from the unsmoothed theoretical JS. The actual chart uses finite samples, so each run can differ from this assumption.'}</p></div></li>`,
    `<li><b>${t.loss}</b><code>D(A) = D(B) = s = ${n(values.score)}<br>L_G = −E<sub>x∼Q</sub>[ln D(x)] = −ln(${n(values.score)}) = ${n(r.loss)}</code><p>${t.lossMeaning}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
