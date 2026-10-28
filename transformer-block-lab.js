// One position in a toy pre-LN Transformer block. Attention is supplied rather
// than computed here; it depends on the normalized inputs at all positions.
const epsilon=0.01;
const n=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vector=xs=>`[${xs.map(n).join(', ')}]`;
// GPT-2's published tanh approximation to GELU; the visualized PyTorch model
// uses nn.GELU() with its default exact form instead.
const geluArgument=x=>Math.sqrt(2/Math.PI)*(x+0.044715*x**3);
export const geluApprox=x=>0.5*x*(1+Math.tanh(geluArgument(x)));
function normalize(x, gamma, beta) {
  const mean=(x[0]+x[1])/2;
  const variance=((x[0]-mean)**2+(x[1]-mean)**2)/2;
  const standardized=x.map(value=>(value-mean)/Math.sqrt(variance+epsilon));
  return {mean,variance,standardized,output:standardized.map(value=>gamma*value+beta)};
}
export function transformerBlockExperiment(values) {
  const input=[values.x1,values.x2];
  const gamma=values.gamma ?? 1, beta=values.beta ?? 0;
  const ln1=normalize(input,gamma,beta);
  const attention=values.attentionVector ? [...values.attentionVector] : [values.attention,-values.attention];
  const residual=input.map((value,i)=>value+attention[i]);
  const ln2=normalize(residual,gamma,beta);
  const hidden=ln2.output.map(value=>values.activation==='relu'?Math.max(0,value):geluApprox(value));
  const mlp=hidden.map(value=>0.5*value);
  const output=residual.map((value,i)=>value+mlp[i]);
  return {input,ln1,attention,residual,ln2,hidden,mlp,output};
}
const words={
 ko:{title:'Transformer 블록: 정규화와 두 잔차 연결', intro:'앞에서 어텐션이 문맥을 모으는 방법을 보았습니다. 여기서는 한 토큰 위치의 벡터가 GPT-2 방식의 블록을 어떻게 통과하는지 살펴봅니다.', fixed:'2차원 축소 예제입니다. 층 정규화의 ε=0.01이며, 조절하는 γ와 β는 설명을 위해 두 특성과 두 정규화에 동일하게 적용합니다. 실제 모델은 보통 특성과 정규화 층마다 별도의 학습 파라미터를 사용합니다. MLP의 두 가중치 행렬은 각각 단위행렬과 0.5배 단위행렬, 편향은 0입니다. 활성화는 GELU 근사와 ReLU 중에서 선택합니다. 원본 실습의 PyTorch 모델은 기본 GELU를 사용합니다.', x1:'입력 첫 값 x₁',x2:'입력 둘째 값 x₂',attention:'가정한 어텐션 출력 a',gamma:'정규화 크기 γ',beta:'정규화 이동 β',activation:'MLP 활성화 함수',gelu:'GELU 근사',relu:'ReLU',previous:'이전 단계',next:'다음 단계',reset:'처음부터',one:'1. 어텐션 전 층 정규화',oneText:'한 토큰의 두 특성에서 평균과 분산을 구합니다. 각 값에서 평균을 빼고 √(분산+ε)으로 나눕니다. ε는 분산이 0이어도 나눗셈이 가능하게 합니다. 그 결과에 γ를 곱하고 β를 더해 크기와 중심을 조절합니다. 실제 γ와 β는 학습되는 파라미터입니다. 정규화는 학습을 안정시키는 데 도움을 줍니다.',two:'2. 어텐션 출력과 첫 잔차',twoText:'정규화된 벡터는 다른 위치의 정규화된 벡터와 함께 어텐션에 들어갑니다. 계산을 분리하기 위해 여기서는 그 결과를 [a, −a]로 직접 가정합니다. 이전 어텐션 실습의 결과가 자동으로 전달되는 것은 아닙니다. 원래 입력 x에 어텐션 출력을 더해 잔차 스트림 r을 만듭니다. 이 우회 경로는 기존 표현과 기울기가 이어지는 경로를 제공합니다.',three:'3. MLP 전 층 정규화',threeText:'r의 두 특성을 다시 정규화해 같은 위치의 MLP 입력으로 사용합니다. 층 정규화는 다른 토큰이 아니라 이 토큰의 특성 차원을 따라 계산합니다.',four:'4. MLP와 두 번째 잔차',fourText:'단위행렬을 곱한 뒤 선택한 활성화 함수를 각 성분에 적용하고 0.5배 단위행렬을 곱합니다. GELU 근사는 입력의 부호와 크기에 따라 값을 부드럽게 조절하며 음수 입력도 작은 음수로 남을 수 있습니다. ReLU는 음수를 0으로 바꿉니다. 이 GELU는 tanh 근사이며 원본 실습의 PyTorch 기본 GELU와 수치가 조금 다를 수 있습니다. 비선형 활성화는 선형 변환만 반복하는 것보다 복잡한 함수를 표현하게 합니다. MLP는 각 위치를 같은 가중치로 독립적으로 변환합니다. 그 결과를 r에 더한 y는 다음 블록 또는 마지막 정규화의 입력이 됩니다.',round:'계산은 전체 정밀도로 수행하며 소수 셋째 자리까지 표시합니다. 원본 GPT-2는 학습된 층 정규화 파라미터, 다중 헤드 어텐션과 더 큰 MLP를 사용합니다.',source:'GPT-2의 GELU 근사 구현 ↗',modelSource:'원본 실습의 PyTorch 모델 ↗'},
 en:{title:'Transformer block: normalization and two residuals',intro:'The previous exercise showed how attention gathers context. Here follow one token vector through a GPT-2-style block.',fixed:'Two-dimensional toy example. Layer norm uses ε=0.01. For this example the selected γ and β are shared by both features and both normalizations; the real model normally learns separate parameters per feature and normalization layer. The two MLP weight matrices are the identity and half the identity; biases are zero. Choose between an approximate GELU and ReLU. The original lab’s PyTorch model uses the default GELU.',x1:'First input x₁',x2:'Second input x₂',attention:'Assumed attention output a',gamma:'Normalization scale γ',beta:'Normalization shift β',activation:'MLP activation',gelu:'GELU approximation',relu:'ReLU',previous:'Previous step',next:'Next step',reset:'Start over',one:'1. Layer norm before attention',oneText:'Find the mean and variance across this token’s two features. Subtract the mean and divide by √(variance+ε). The ε permits division even when variance is zero. Multiply that standardized result by γ and add β to adjust its scale and center. In the model γ and β are learned parameters. Normalization can help stabilize training.',two:'2. Attention output and first residual',twoText:'The normalized vector enters attention together with normalized vectors at other positions. To isolate this calculation, we supply its output as [a, −a]. It is not automatically passed from the previous attention exercise. Add that output to the original input x to form the residual stream r. This bypass provides a path for the existing representation and gradients.',three:'3. Layer norm before the MLP',threeText:'Normalize r across its two features again for the MLP at the same position. Layer normalization operates across features of this token, not across other tokens.',four:'4. MLP and second residual',fourText:'Multiply by the identity, apply the selected activation to each component, then multiply by half the identity. Approximate GELU smoothly adjusts values by sign and magnitude and can keep a small negative value; ReLU maps negatives to zero. This tanh approximation can differ slightly from the original lab’s default PyTorch GELU. The nonlinear activation lets the MLP express functions beyond repeated linear transformations. It transforms each position independently with shared weights. Add its result to r; y enters the next block or the final normalization.',round:'Calculations use full precision and display three decimal places. GPT-2 uses learned layer-norm parameters, multi-head attention and a larger MLP.',source:'GPT-2 GELU approximation ↗',modelSource:'Original lab’s PyTorch model ↗'}
};
export function transformerBlockMarkup(values,lang) {
 const t=words[lang];
 const controls=[['x1',-2,2],['x2',-2,2],['attention',-2,2],['gamma',-2,2],['beta',-2,2]].map(([key,min,max])=>`<div class="sequence-control"><label for="block-${key}">${t[key]} <output id="block-value-${key}">${n(values[key] ?? (key==='gamma'?1:0))}</output></label><input type="range" id="block-${key}" data-block-input="${key}" min="${min}" max="${max}" step="0.1" value="${values[key] ?? (key==='gamma'?1:0)}"></div>`).join('');
 return `<section class="sequence-lab transformer-block-lab" aria-labelledby="block-title"><div class="eyebrow">TRANSFORMER / BLOCK</div><h2 id="block-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><label class="block-activation" for="block-activation">${t.activation}<select id="block-activation" data-block-activation><option value="gelu" ${values.activation!=='relu'?'selected':''}>${t.gelu}</option><option value="relu" ${values.activation==='relu'?'selected':''}>${t.relu}</option></select></label><div id="block-output" aria-live="polite"></div><div class="sequence-actions"><span id="block-status"></span><button type="button" data-block-action="previous">${t.previous}</button><button type="button" data-block-action="next">${t.next} →</button><button type="button" data-block-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://github.com/openai/gpt-2/blob/master/src/model.py" target="_blank" rel="noopener noreferrer">${t.source}</a> · <a href="https://github.com/poloclub/transformer-explainer/blob/bfe50afba10b9b560b84143ee1107d977defa74f/src/utils/model/model.py" target="_blank" rel="noopener noreferrer">${t.modelSource}</a></p></section>`;
}
export function transformerBlockOutput(values,lang,stage) {
 const t=words[lang], r=transformerBlockExperiment(values), gamma=values.gamma ?? 1, beta=values.beta ?? 0;
 const ln=(x,stats)=>`μ = (${n(x[0])} + ${n(x[1])}) / 2 = ${n(stats.mean)}<br>σ² = ((${n(x[0])} − ${n(stats.mean)})² + (${n(x[1])} − ${n(stats.mean)})²) / 2 = ${n(stats.variance)}<br>x̂ = (${vector(x)} − ${n(stats.mean)}) / √(${n(stats.variance)} + 0.01) = ${vector(stats.standardized)}<br>LN = γ × x̂ + β = ${n(gamma)} × ${vector(stats.standardized)} + ${n(beta)} = ${vector(stats.output)}`;
 const isRelu=values.activation==='relu';
 const first=r.ln2.output[0];
 const activationDetail=isRelu ? `h = ReLU(I × LN₂(r)) = ${vector(r.hidden)}` : `GELU(z) ≈ 0.5z × [1 + tanh(√(2/π) × (z + 0.044715z³))]<br>z = I × LN₂(r) = ${vector(r.ln2.output)}<br>u₁ = √(2/π) × (z₁ + 0.044715 × z₁³) = ${n(geluArgument(first))}<br>h₁ ≈ 0.5 × ${n(first)} × (1 + tanh(${n(geluArgument(first))})) = ${n(r.hidden[0])}<br>h ≈ GELU(z) = ${vector(r.hidden)}`;
 const steps=[`<li><b>${t.one}</b><code>x = ${vector(r.input)}<br>${ln(r.input,r.ln1)}</code><p>${t.oneText}</p></li>`,
 `<li><b>${t.two}</b><code>Attention(LN₁(x)) = ${vector(r.attention)}<br>r = x + Attention(LN₁(x))<br>= ${vector(r.input)} + ${vector(r.attention)} = ${vector(r.residual)}</code><p>${t.twoText}</p></li>`,
 `<li><b>${t.three}</b><code>${ln(r.residual,r.ln2)}</code><p>${t.threeText}</p></li>`,
 `<li><b>${t.four}</b><code>${activationDetail}<br>MLP = 0.5I × h = ${vector(r.mlp)}<br>y = r + MLP = ${vector(r.residual)} + ${vector(r.mlp)} = <strong>${vector(r.output)}</strong></code><p>${t.fourText}</p></li>`];
 return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
