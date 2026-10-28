// One image query attends to two illustrative text-token values in one head.
export function crossAttention(query) {
  const scores=[query/Math.sqrt(2),1/Math.sqrt(2)];
  const max=Math.max(...scores), exponentials=scores.map(s=>Math.exp(s-max));
  const total=exponentials[0]+exponentials[1];
  const weights=exponentials.map(x=>x/total);
  return {scores,weights,output:[weights[0],2*weights[1]]};
}

const number=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const text={
  ko:{title:'텍스트 조건이 이미지 특징에 들어가는 과정', intro:'노이즈가 섞인 이미지의 한 위치가 텍스트의 두 토큰을 참고하는 과정을 살펴봅니다. 슬라이더는 이미지 쪽 질의의 첫 번째 값을 바꿉니다.', fixed:'설명용으로 만든 벡터이며 실제 모델이나 CLIP에서 추출한 값이 아닙니다. 한 개의 어텐션 헤드와 두 토큰만 계산합니다.', query:'이미지 질의의 첫 번째 값 q', previous:'이전 단계',next:'다음 단계',reset:'처음부터', rounding:'계산은 전체 정밀도로 수행하고 표시값은 소수 셋째 자리로 반올림합니다.',source:'Stable Diffusion 어텐션 구현 ↗',
    one:'1. 이미지의 질의와 텍스트의 키·값',oneText:'이미지 특징은 질의 Q, 텍스트 인코더의 토큰별 표현은 키 K와 값 V로 각각 투영됩니다. 여기서는 투영 결과를 직접 가정합니다. Q는 무엇을 참고할지 묻고, K는 비교에, V는 전달할 내용에 사용됩니다.',
    two:'2. 점수를 가중치로 바꾸기',twoText:'각 키와 질의의 내적을 차원의 제곱근으로 나눈 뒤 softmax를 적용합니다. 두 가중치의 합은 1입니다. 수치 안정성을 위해 두 점수 중 최대값을 빼고 지수함수를 계산합니다.',
    three:'3. 텍스트 값의 가중합',threeText:'이 벡터는 한 이미지 위치에 전달할 텍스트 정보의 축소 예시입니다. 실제 구현에서는 여러 위치와 헤드, 출력 투영과 잔차 연결 등 후속 계산을 거쳐 U-Net이 노이즈를 예측합니다. 이 가중합 자체는 노이즈 예측이나 최종 이미지가 아닙니다.'},
  en:{title:'How text conditioning reaches image features',intro:'Follow one position of a noisy image as it attends to two text tokens. The slider changes the first component of the image query.',fixed:'These vectors are invented for teaching, not extracted from CLIP or a real model. We calculate one attention head and two tokens.',query:'First image-query component q',previous:'Previous step',next:'Next step',reset:'Start over',rounding:'Calculations use full precision; displayed values are rounded to three decimals.',source:'Stable Diffusion attention implementation ↗',
    one:'1. Image query and text keys and values',oneText:'Image features are projected to query Q; token representations from the text encoder are projected to keys K and values V. Here we directly assume the projection results. Q asks what to look for, K is used for comparison, and V carries the content.',
    two:'2. Turn scores into weights',twoText:'Divide each query–key dot product by the square root of the dimension, then apply softmax. The two weights sum to 1. For numerical stability, subtract the largest score before exponentiation.',
    three:'3. Weighted sum of text values',threeText:'This vector illustrates text information passed to one image position. In the real implementation, multiple positions and heads, output projection, residual connections and subsequent computation contribute to the U-Net’s noise prediction. This weighted sum itself is neither the noise prediction nor the final image.'}
};

export function crossAttentionMarkup(query,lang) {
  const t=text[lang];
  return `<section class="sequence-lab cross-lab" aria-labelledby="cross-title"><div class="eyebrow">DIFFUSION / CROSS-ATTENTION</div><h2 id="cross-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls"><div class="sequence-control"><label for="cross-query">${t.query} <output id="cross-value">${number(query)}</output></label><input id="cross-query" data-cross-input type="range" min="-2" max="2" step="0.25" value="${query}"></div></div><div id="cross-output" aria-live="polite"></div><div class="sequence-actions"><span id="cross-status"></span><button type="button" data-cross-action="previous">${t.previous}</button><button type="button" data-cross-action="next">${t.next} →</button><button type="button" data-cross-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://github.com/CompVis/stable-diffusion/blob/main/ldm/modules/attention.py" target="_blank" rel="noopener noreferrer">${t.source}</a></p></section>`;
}

export function crossAttentionOutput(query,lang,stage) {
  const t=text[lang], r=crossAttention(query), f=number;
  const steps=[
    `<li><b>${t.one}</b><p>${t.oneText}</p><code>Q = [${f(query)}, 1] &nbsp; K₁ = [1, 0], K₂ = [0, 1]<br>V₁ = [1, 0], V₂ = [0, 2] &nbsp; d = 2</code></li>`,
    `<li><b>${t.two}</b><code>s₁ = Q · K₁ / √2 = ${f(r.scores[0])}<br>s₂ = Q · K₂ / √2 = ${f(r.scores[1])}<br>w₁ = exp(s₁ − max(s)) / Σⱼ exp(sⱼ − max(s)) = ${f(r.weights[0])}<br>w₂ = exp(s₂ − max(s)) / Σⱼ exp(sⱼ − max(s)) = ${f(r.weights[1])}</code><p>${t.twoText}</p></li>`,
    `<li><b>${t.three}</b><code>w₁V₁ + w₂V₂ = ${f(r.weights[0])} × [1, 0] + ${f(r.weights[1])} × [0, 2]<br>= [${f(r.output[0])}, ${f(r.output[1])}]</code><p>${t.threeText}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
