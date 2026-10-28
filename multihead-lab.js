import {attentionExperiment} from './attention-lab.js';

// Head 1 uses the preceding exercise. Head 2 shares its three toy inputs and
// mask, with its own illustrative value projection and a fixed position-2 query.
export function multiHeadExample(values) {
  const first=attentionExperiment([values.q1,values.q2],values.mask);
  const query=[0,1], keys=[[1,0],[0,1],[1,1]], vectors=[[0,1],[2,0],[2,2]];
  const scores=keys.map(k=>(query[0]*k[0]+query[1]*k[1])/Math.sqrt(2));
  const max=Math.max(...scores.filter((_,i)=>first.allowed[i]));
  const exp=scores.map((s,i)=>first.allowed[i]?Math.exp(s-max):0);
  const total=exp.reduce((a,b)=>a+b,0);
  const weights=exp.map(e=>e/total);
  const second=[0,1].map(j=>weights.reduce((sum,w,i)=>sum+w*vectors[i][j],0));
  const joined=[...first.output,...second];
  const output=[joined[0]+0.5*joined[2]-0.5*joined[3],joined[1]+0.5*joined[2]+joined[3]];
  return {first,query,keys,vectors,scores,weights,second,joined,output};
}
const n=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vec=a=>`[${a.map(n).join(', ')}]`;
const words={
 ko:{title:'여러 어텐션 헤드의 결과 합치기',intro:'위 실습의 두 번째 위치를 그대로 사용합니다. 헤드 1은 위 질의 슬라이더와 마스크에 연결되고, 헤드 2의 투영은 고정됩니다. 위 값을 바꾸면 이 계산도 바뀝니다.',note:'설명을 위한 두 개의 2차원 헤드이며 실제 GPT-2 가중치가 아닙니다. 편향과 드롭아웃은 생략합니다. 두 헤드 모두 같은 인과 마스크 설정을 사용합니다.',one:'1. 각 헤드가 값을 모읍니다',oneText:'헤드마다 Q, K, V 투영을 지정할 수 있습니다. 이 예에서는 같은 X의 위치 2로 계산하며 두 헤드의 K는 같게 정하고 V는 다르게 정했습니다. 점수를 √2로 나누고 허용된 위치에 softmax를 적용한 뒤 V의 가중합을 구합니다.',head1:'헤드 1: 위 실습과 동일',head2:'헤드 2: 고정된 투영',maskOn:'미래 위치 3을 가림',maskOff:'위치 3을 포함 (다음 토큰 예측에서는 미래 정보가 드러나는 비교)',two:'2. 출력 벡터를 이어 붙입니다',twoText:'두 헤드의 출력을 더하지 않고 순서대로 이어 붙입니다. 각 헤드가 모은 두 성분이 네 성분의 벡터 안에 보존됩니다.',three:'3. 출력 투영으로 섞습니다',threeText:'이어 붙인 행 벡터에 출력 행렬을 곱해 두 성분으로 바꿉니다. 이 예의 잔차 덧셈은 표시하지 않습니다. 결과는 다음 토큰 확률이 아니라 블록에서 이어서 처리할 표현입니다.',actual:'원본 GPT-2 small은 12개 헤드 × 64성분을 이어 768성분으로 만들고 출력 투영을 적용합니다. 아래 블록 예제는 이 결과를 자동으로 전달받지 않습니다.',round:'계산은 반올림 전 값으로 수행하며 세 자리만 표시합니다.',ref:'Transformer 논문의 다중 헤드 어텐션'},
 en:{title:'Combine multiple attention heads',intro:'Use position 2 from the exercise above. Head 1 follows its query sliders and mask; head 2 uses fixed projections. Changing the controls above updates this calculation.',note:'These are two illustrative two-dimensional heads, not GPT-2 weights. Bias and dropout are omitted. Both heads use the same causal-mask setting.',one:'1. Each head gathers values',oneText:'Each head can have its own Q, K and V projections. Both use position 2 of the same X; in this example their K matrices are equal and their V matrices differ. Divide the scores by √2, apply softmax to allowed positions, and take a weighted sum of V.',head1:'Head 1: same as the exercise above',head2:'Head 2: fixed projections',maskOn:'Future position 3 is masked',maskOff:'Position 3 is included (a future-information comparison for next-token prediction)',two:'2. Concatenate the outputs',twoText:'Place the head outputs side by side rather than adding them. Each head’s two components remain in the four-component vector.',three:'3. Mix them with the output projection',threeText:'Multiply the concatenated row vector by the output matrix to obtain two components. The residual addition is omitted here. This result is a representation for further processing in the block, not a next-token probability.',actual:'The original GPT-2 small concatenates 12 heads × 64 components into 768 components and applies an output projection. The block exercise below does not automatically receive this result.',round:'Calculations use unrounded values and display three decimals.',ref:'Multi-head attention in the Transformer paper'}
};
export function multiHeadMarkup(lang) {
  const t=words[lang];
  return `<section class="sequence-lab multihead-lab" aria-labelledby="multihead-title"><div class="eyebrow">TRANSFORMER / MULTI-HEAD</div><h2 id="multihead-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.note}</p><div id="multihead-output" aria-live="polite"></div><p>${t.actual}</p><p class="sequence-rounding">${t.round} <a href="https://arxiv.org/html/1706.03762#S3.SS2.SSS2" target="_blank" rel="noopener noreferrer">${t.ref} ↗</a></p></section>`;
}
export function multiHeadOutput(values,lang) {
  const t=words[lang],r=multiHeadExample(values),w=r.weights,v=r.vectors;
  return `<ol class="sequence-steps"><li><b>${t.one}</b><p>${t.oneText}</p><code>${values.mask?t.maskOn:t.maskOff}<br>${t.head1}<br>a¹ = <span data-multihead="weights1">${vec(r.first.weights)}</span>; h¹ = <span data-multihead="head1">${vec(r.first.output)}</span><br>${t.head2}<br>q²₂ = [0, 1]; K² = [[1, 0], [0, 1], [1, 1]]<br>V² = [[0, 1], [2, 0], [2, 2]]<br>s² = q²₂ (K²)ᵀ / √2 = <span data-multihead="scores2">${vec(r.scores)}</span> (${lang==='ko'?'마스크 적용 전':'before mask'})<br>a² = <span data-multihead="weights2">${vec(w)}</span><br>h² = ${w.map((x,i)=>`${n(x)} × ${vec(v[i])}`).join(' + ')} = <span data-multihead="head2">${vec(r.second)}</span></code></li><li><b>${t.two}</b><p>${t.twoText}</p><code>concat(h¹, h²) = <span data-multihead="joined">${vec(r.joined)}</span> (1 × 4)</code></li><li><b>${t.three}</b><p>${t.threeText}</p><code>Wᴼ (4 × 2) = [[1, 0], [0, 1], [0.5, 0.5], [−0.5, 1]]<br>concat(h¹, h²) Wᴼ = [h¹₁ + 0.5h²₁ − 0.5h²₂, h¹₂ + 0.5h²₁ + h²₂]<br>= <span data-multihead="output">${vec(r.output)}</span> (1 × 2)</code></li></ol>`;
}
