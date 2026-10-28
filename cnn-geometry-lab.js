// One-dimensional cross-correlation with zero padding, unit dilation and all-one weights.
export function convolutionGeometry({inputSize, kernelSize, padding, stride}) {
  if (![inputSize,kernelSize,padding,stride].every(Number.isInteger) || inputSize<1 || kernelSize<1 || padding<0 || stride<1) throw new RangeError('Invalid convolution dimensions');
  const input=Array.from({length:inputSize},(_,i)=>i+1);
  const padded=[...Array(padding).fill(0),...input,...Array(padding).fill(0)];
  const windows=[];
  for(let start=0;start+kernelSize<=padded.length;start+=stride) {
    const values=padded.slice(start,start+kernelSize);
    windows.push({start,values,sum:values.reduce((a,b)=>a+b,0)});
  }
  const covered=new Set(windows.flatMap(w=>w.values.map((_,i)=>w.start+i)));
  const uncovered=padded.map((_,i)=>i).filter(i=>!covered.has(i));
  return {input,padded,windows,uncovered};
}

const copy={
 ko:{title:'패딩과 이동 간격이 출력에 미치는 영향',intro:'한 줄의 숫자를 예로 들어 패딩을 붙이고 필터를 이동한 뒤 출력 길이를 계산합니다.',setup:'한 축의 1차원 예제입니다. 입력은 1부터 차례로 정하고 양쪽에 0을 P개씩 붙입니다. 필터의 모든 가중치는 1, 편향은 0, dilation은 1입니다. 따라서 각 출력은 해당 창의 숫자 합입니다. 실제 CNN은 필터 가중치를 학습합니다. 아래 원본 실습의 하이퍼파라미터 그림과 비교할 수 있지만 이 슬라이더는 원본 모델을 바꾸지 않습니다.',inputSize:'입력 길이 I',kernelSize:'필터 길이 K',padding:'한쪽 패딩 P',stride:'이동 간격 S',one:'1. 입력에 0 붙이기',two:'2. 완전히 들어가는 창 계산',three:'3. 출력 길이 확인',input:'원래 입력',padded:'패딩 후 입력',window:'창',start:'시작 인덱스',output:'출력',uncovered:'어떤 창에도 포함되지 않은 패딩 후 인덱스',none:'없음',invalid:'필터가 패딩된 입력보다 길어 완전히 들어가는 창이 없습니다. 이 설정은 많은 프레임워크에서 오류로 처리합니다.',result:'각 창의 합이 출력의 한 칸이 됩니다. 높이와 너비가 있는 이미지에는 같은 원리를 두 축에 각각 적용합니다.',floor:'⌊ ⌋는 소수점 아래를 버리는 바닥 함수입니다. 패딩된 입력에 필터가 완전히 들어가는 경우에 이 식을 적용합니다.',previous:'이전 단계',next:'다음 단계',reset:'처음부터'},
 en:{title:'How padding and stride change output',intro:'Pad a row of numbers, move a filter, and calculate the output length.',setup:'This one-dimensional example uses input values 1, 2, … and adds P zeros on each side. All filter weights are 1, bias is 0, and dilation is 1, so each output is the sum of its window. Real CNNs learn filter weights. Compare the hyperparameter diagram in the original lab below; these sliders do not change its model.',inputSize:'Input length I',kernelSize:'Filter length K',padding:'Padding per side P',stride:'Stride S',one:'1. Add zero padding',two:'2. Calculate complete windows',three:'3. Check the output length',input:'Original input',padded:'Padded input',window:'Window',start:'start index',output:'Output',uncovered:'Padded-input indices in no window',none:'None',invalid:'The filter is longer than the padded input, so no complete window fits. Many frameworks reject this configuration.',result:'Each window sum is one output value. Apply the same principle separately to height and width for an image.',floor:'⌊ ⌋ denotes floor, which rounds down. Apply this formula when the filter fits in the padded input.',previous:'Previous step',next:'Next step',reset:'Start over'}
};
const fields=[['inputSize',3,8],['kernelSize',1,5],['padding',0,2],['stride',1,3]];
export function geometryLabMarkup(values,lang) {
  const t=copy[lang];
  const controls=fields.map(([key,min,max])=>`<div class="sequence-control"><label for="geometry-${key}">${t[key]} <output id="geometry-value-${key}">${values[key]}</output></label><input id="geometry-${key}" data-geometry-input="${key}" type="range" min="${min}" max="${max}" step="1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab geometry-lab" aria-labelledby="geometry-title"><div class="eyebrow">CNN / PADDING &amp; STRIDE</div><h2 id="geometry-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.setup}</p><div class="sequence-controls">${controls}</div><div id="geometry-output" aria-live="polite"></div><div class="sequence-actions"><span id="geometry-status"></span><button type="button" data-geometry-action="previous">${t.previous}</button><button type="button" data-geometry-action="next">${t.next} →</button><button type="button" data-geometry-action="reset">${t.reset}</button></div></section>`;
}
export function geometryLabOutput(values,lang,stage) {
  const t=copy[lang],x=convolutionGeometry(values),{inputSize:I,kernelSize:K,padding:P,stride:S}=values;
  const list=arr=>`[${arr.join(', ')}]`;
  let html=`<ol class="sequence-steps"><li><b>${t.one}</b><code>${t.input} = ${list(x.input)}<br>${t.padded} = ${list(x.padded)}<br>I + 2P = ${I} + 2 × ${P} = ${x.padded.length}</code></li>`;
  if(stage>=2) {
    const rows=x.windows.map((w,i)=>`<code>${t.window} ${i+1} (${t.start} ${w.start}): ${list(w.values)} → ${w.values.map(n=>`${n} × 1`).join(' + ')} = ${w.sum}</code>`).join('');
    html+=`<li><b>${t.two}</b>${rows || `<p>${t.invalid}</p>`}<p>${t.uncovered}: ${x.uncovered.length ? list(x.uncovered) : t.none}</p></li>`;
  }
  if(stage>=3) {
    const formula=x.windows.length ? `<code>O = ⌊(I + 2P − K) / S⌋ + 1<br>= ⌊(${I} + 2 × ${P} − ${K}) / ${S}⌋ + 1 = <strong>${x.windows.length}</strong><br>${t.output} = ${list(x.windows.map(w=>w.sum))}</code><p>${t.floor}</p><p>${t.result}</p>` : `<p>${t.invalid}</p>`;
    html+=`<li><b>${t.three}</b>${formula}</li>`;
  }
  return html+'</ol>';
}
