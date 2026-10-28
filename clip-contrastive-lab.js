// A two-pair teaching example, not embeddings from a trained CLIP model.
export function clipContrastive(c, scale) {
  const norm=Math.hypot(c,1), b=scale*c/norm, d=scale/norm;
  const sigmoid=x=>1/(1+Math.exp(-x));
  const p11=sigmoid(scale-b), p22=sigmoid(d);
  const q11=sigmoid(scale), q22=sigmoid(d-b);
  const imageLoss=-(Math.log(p11)+Math.log(p22))/2;
  const textLoss=-(Math.log(q11)+Math.log(q22))/2;
  const db=scale/(norm**3), dd=-scale*c/(norm**3);
  const gradient=((1-p11+1-q22)*db+(p22+q22-2)*dd)/4;
  return {norm,b,d,p11,p22,q11,q22,imageLoss,textLoss,loss:(imageLoss+textLoss)/2,db,dd,gradient};
}

const n=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const copy={
  ko:{title:'CLIP은 이미지와 글을 어떻게 연결할까?',intro:'CLIP의 사전학습을 이미지와 설명 두 쌍으로 축소해 계산합니다. 1번 이미지와 1번 글, 2번 이미지와 2번 글이 짝입니다.',fixed:'벡터는 학습용 가상 값이며 실제 CLIP 출력이 아닙니다. 슬라이더는 두 번째 글 벡터의 값과 점수 배율을 직접 바꿉니다.',component:'두 번째 글 벡터의 첫 번째 값 c',scale:'점수 배율 g',prev:'이전 단계',next:'다음 단계',reset:'처음부터',round:'계산은 전체 정밀도로 수행하고 표시값은 소수 셋째 자리로 반올림합니다.',
    one:'1. 이미지와 글을 벡터로 표현하고 정규화',oneText:'두 인코더가 각 입력을 벡터로 바꾼다고 가정합니다. 각 벡터를 길이로 나누면 길이가 1이 됩니다. 예시에서 이미지 1은 강아지, 이미지 2는 꽃이며 각 글은 해당 이미지를 설명합니다.',
    two:'2. 모든 이미지와 글의 유사도 비교',twoText:'길이가 1인 벡터의 내적은 코사인 유사도입니다. 행은 이미지, 열은 글입니다. 대각선은 올바른 짝이고 다른 칸은 이 배치에서 비교하는 비짝입니다. g는 점수의 차이를 조절하며 실제 CLIP에서는 학습되는 배율입니다.',
    three:'3. 양방향으로 짝을 고를 확률',threeText:'이미지→글은 각 행에서, 글→이미지는 각 열에서 softmax를 계산합니다. 아래 값은 두 후보로 구성된 이 배치 안에서의 상대적인 확률입니다. 모든 가능한 글이나 이미지에 대한 확률은 아닙니다.',
    four:'4. 두 방향의 손실 평균',fourText:'정답 확률에 음의 로그를 취하면 정답 확률이 낮을수록 손실이 커집니다. 각 방향의 평균을 다시 평균해 대칭 손실을 얻습니다. 실제 학습은 이 손실을 줄이도록 두 인코더의 매개변수를 갱신합니다.',
    five:'5. 한 값만 학습한다면?',fiveText:'설명을 위해 c만 바꾸고 나머지 벡터와 배율은 고정합니다. 아래 기울기는 현재 손실이 c에 따라 얼마나 변하는지 나타냅니다. 학습률 0.3으로 한 번 갱신한 가상 결과이며 실제 모델을 학습하거나 슬라이더를 바꾸지는 않습니다.',
    link:'생성 모델과 연결',linkText:'CLIP 사전학습의 비교에는 문장 전체의 표현을 사용합니다. Stable Diffusion v1의 텍스트 인코더는 생성 시 토큰별 은닉 상태를 반환하며, 다음 교차 어텐션 예제에서 이 토큰 표현이 이미지 특징에 전달됩니다. 아래 두 예제의 벡터는 서로 독립적으로 가정한 값입니다.',paper:'CLIP 논문 ↗',encoder:'Stable Diffusion 텍스트 인코더 ↗'},
  en:{title:'How does CLIP connect images and text?',intro:'Shrink CLIP pretraining to two image–text pairs. Image 1 matches text 1, and image 2 matches text 2.',fixed:'These vectors are invented for teaching, not outputs from CLIP. The sliders directly change the second text vector and the score scale.',component:'First component c of the second text vector',scale:'Score scale g',prev:'Previous step',next:'Next step',reset:'Start over',round:'Calculations use full precision; displayed values are rounded to three decimals.',
    one:'1. Represent and normalize images and texts',oneText:'Assume that two encoders turn their inputs into vectors. Dividing each vector by its length gives unit-length vectors. In this example, image 1 is a dog and image 2 a flower; each text describes its corresponding image.',
    two:'2. Compare every image and text',twoText:'The dot product of unit vectors is cosine similarity. Rows are images and columns are texts. Diagonal entries are matched pairs; the other entries are non-matches within this batch. g adjusts score differences and is learned in CLIP.',
    three:'3. Match probabilities in both directions',threeText:'Image-to-text softmax operates across each row; text-to-image softmax operates down each column. These are relative probabilities among the two candidates in this batch, not probabilities over every possible image or text.',
    four:'4. Average the losses in both directions',fourText:'The negative log of the correct-pair probability increases when that probability falls. Average within each direction, then average the two results to obtain a symmetric loss. Actual training updates both encoders to reduce this loss.',
    five:'5. What if we learned one value?',fiveText:'For illustration, change only c and hold the other vectors and scale fixed. The gradient shows how the current loss changes with c. This previews one hypothetical update at learning rate 0.3; it does not train a model or change the slider.',
    link:'Connection to image generation',linkText:'CLIP pretraining compares whole-text representations. During generation, the Stable Diffusion v1 text encoder returns token-level hidden states, which can condition image features through cross-attention in the next example. The vectors in the two examples are assumed independently.',paper:'CLIP paper ↗',encoder:'Stable Diffusion text encoder ↗'}
};

export function clipMarkup(values,lang) {
  const t=copy[lang];
  return `<section class="sequence-lab clip-lab" aria-labelledby="clip-title"><div class="eyebrow">DIFFUSION / CLIP</div><h2 id="clip-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls"><div class="sequence-control"><label for="clip-component">${t.component} <output id="clip-value-component">${n(values.component)}</output></label><input id="clip-component" data-clip-input="component" type="range" min="-1.5" max="1.5" step="0.1" value="${values.component}"></div><div class="sequence-control"><label for="clip-scale">${t.scale} <output id="clip-value-scale">${n(values.scale)}</output></label><input id="clip-scale" data-clip-input="scale" type="range" min="0.5" max="4" step="0.5" value="${values.scale}"></div></div><div id="clip-output" aria-live="polite"></div><div class="sequence-actions"><span id="clip-status"></span><button type="button" data-clip-action="previous">${t.prev}</button><button type="button" data-clip-action="next">${t.next} →</button><button type="button" data-clip-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://arxiv.org/abs/2103.00020" target="_blank" rel="noopener noreferrer">${t.paper}</a> · <a href="https://github.com/CompVis/stable-diffusion/blob/main/ldm/modules/encoders/modules.py" target="_blank" rel="noopener noreferrer">${t.encoder}</a></p></section>`;
}

export function clipOutput(values,lang,stage) {
  const t=copy[lang], c=values.component, g=values.scale, r=clipContrastive(c,g), next=c-0.3*r.gradient, nextLoss=clipContrastive(next,g).loss;
  const steps=[
    `<li><b>${t.one}</b><p>${t.oneText}</p><code>I₁ = [2, 0] / 2 = [1, 0]<br>I₂ = [0, 3] / 3 = [0, 1]<br>T₁ = [3, 0] / 3 = [1, 0]<br>T₂ = [${n(c)}, 1] / √(${n(c)}² + 1) = [${n(c/r.norm)}, ${n(1/r.norm)}]</code></li>`,
    `<li><b>${t.two}</b><p>${t.twoText}</p><code>Sᵢⱼ = Iᵢ · Tⱼ<br>S = [[1, ${n(c/r.norm)}], [0, ${n(1/r.norm)}]]<br>Z = gS = [[${n(g)}, ${n(r.b)}], [0, ${n(r.d)}]]</code></li>`,
    `<li><b>${t.three}</b><p>${t.threeText}</p><code>pᵢⱼ = exp(Zᵢⱼ) / Σₖ exp(Zᵢₖ)<br>p₁₁ = ${n(r.p11)}, p₁₂ = ${n(1-r.p11)}<br>p₂₁ = ${n(1-r.p22)}, p₂₂ = ${n(r.p22)}<br>qᵢⱼ = exp(Zᵢⱼ) / Σₖ exp(Zₖⱼ)<br>q₁₁ = ${n(r.q11)}, q₂₁ = ${n(1-r.q11)}<br>q₁₂ = ${n(1-r.q22)}, q₂₂ = ${n(r.q22)}</code></li>`,
    `<li><b>${t.four}</b><p>${t.fourText}</p><code>Lᵢ = −(ln(p₁₁) + ln(p₂₂)) / 2 = ${n(r.imageLoss)}<br>Lₜ = −(ln(q₁₁) + ln(q₂₂)) / 2 = ${n(r.textLoss)}<br>L = (Lᵢ + Lₜ) / 2 = ${n(r.loss)}</code></li>`,
    `<li><b>${t.five}</b><p>${t.fiveText}</p><code>b = Z₁₂, d = Z₂₂<br>db/dc = g / (1 + c²)³ᐟ² = ${n(r.db)}<br>dd/dc = −gc / (1 + c²)³ᐟ² = ${n(r.dd)}<br>dL/dc = [(p₁₂ + q₁₂)db/dc + (p₂₂ + q₂₂ − 2)dd/dc] / 4 = ${n(r.gradient)}<br>c′ = c − 0.3 × dL/dc = ${n(next)}<br>L(c′) = ${n(nextLoss)}</code><p><b>${t.link}:</b> ${t.linkText}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
