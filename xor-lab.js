// These fixed weights are hand-designed to demonstrate XOR; there is no fitting.
export const xorInputs=[[0,0],[0,1],[1,0],[1,1]];
export function xorForward(x1,x2,activation) {
  if(![0,1].includes(x1)||![0,1].includes(x2)||!['relu','linear'].includes(activation)) throw new RangeError('Invalid XOR setting');
  const z1=x1-x2, z2=x2-x1;
  const h1=activation==='relu'?Math.max(0,z1):z1;
  const h2=activation==='relu'?Math.max(0,z2):z2;
  const logit=6*h1+6*h2-3;
  const probability=1/(1+Math.exp(-logit));
  return {z1,z2,h1,h2,logit,probability,prediction:probability>=0.5?1:0,target:x1^x2};
}
const f=n=>(Object.is(n,-0)?0:n).toFixed(3);
export function xorMarkup(settings,lang){
  const ko=lang==='ko';
  return `<section class="metric-lab xor-lab" aria-labelledby="xor-title"><h2 id="xor-title">${ko?'XOR를 계산하는 두 은닉 뉴런':'Two hidden neurons calculate XOR'}</h2>
  <p>${ko?'입력 쌍과 활성화 함수를 바꾸어 네 경우를 비교하세요. 가중치는 설명을 위해 직접 정했으며 여기서는 학습하지 않습니다.':'Change the input pair and activation to compare all four cases. The weights are hand-designed for this explanation; no training occurs here.'}</p>
  <div class="xor-controls"><label for="xor-input">${ko?'입력 (x₁, x₂)':'Input (x₁, x₂)'}</label><select id="xor-input" data-xor-input>${xorInputs.map(([a,b],i)=>`<option value="${i}" ${settings.input===i?'selected':''}>(${a}, ${b})</option>`).join('')}</select>
  <label for="xor-activation">${ko?'은닉층 활성화':'Hidden activation'}</label><select id="xor-activation" data-xor-activation><option value="relu" ${settings.activation==='relu'?'selected':''}>ReLU</option><option value="linear" ${settings.activation==='linear'?'selected':''}>${ko?'없음 (항등)':'None (identity)'}</option></select></div>
  <div id="xor-output" aria-live="polite">${xorOutput(settings,lang)}</div>
  <p>${ko?'한 직선으로 XOR를 분리할 수 없는 이유: 분류 기준을 z≥0으로 두면 (0,0)이 0이므로 b&lt;0입니다. (1,0)과 (0,1)이 1이려면 w₁+b≥0, w₂+b≥0입니다. 두 부등식을 더하면 w₁+w₂+2b≥0이고, b&lt;0이므로 w₁+w₂+b&gt;0입니다. 따라서 (1,1)은 0이 될 수 없습니다.':'Why one line cannot separate XOR: with class 1 at z≥0, the (0,0) target of 0 requires b&lt;0. The positive (1,0) and (0,1) points require w₁+b≥0 and w₂+b≥0. Adding them gives w₁+w₂+2b≥0; since b&lt;0, w₁+w₂+b&gt;0. Thus (1,1) cannot be classified as 0.'}</p>
  <p>${ko?'두 선형층 사이에 활성화가 없으면 행렬과 편향을 합쳐 하나의 선형 변환으로 표현할 수 있습니다. 여기서 항등을 선택한 결과는 같은 가중치의 비교 예시이며, 위 부등식이 모든 단일 선형 경계에 대한 근거입니다.':'Without an activation between the two affine layers, their matrices and biases combine into one affine transformation. The identity setting compares the same weights; the inequalities above explain the limit for every single linear boundary.'}</p></section>`;
}
export function xorOutput(settings,lang) {
  const ko=lang==='ko', [x1,x2]=xorInputs[settings.input], r=xorForward(x1,x2,settings.activation), relu=settings.activation==='relu';
  const rows=xorInputs.map(([a,b],i)=>{const v=xorForward(a,b,settings.activation);return `<tr${i===settings.input?' class="xor-selected"':''}><td>(${a}, ${b})</td><td>${v.target}</td><td>${f(v.probability)}</td><td>${v.prediction}</td><td>${v.prediction===v.target?(ko?'맞음':'Correct'):(ko?'다름':'Incorrect')}</td></tr>`;}).join('');
  return `<ol class="xor-steps">
    <li><strong>${ko?'은닉층의 가중합':'Hidden weighted sums'}</strong><p>z₁ = x₁ − x₂ = ${x1} − ${x2} = ${f(r.z1)}<br>z₂ = x₂ − x₁ = ${x2} − ${x1} = ${f(r.z2)}</p><p>${ko?'각 뉴런은 두 입력의 차이를 서로 반대 방향으로 봅니다.':'The two neurons measure the difference in opposite directions.'}</p></li>
    <li><strong>${ko?'은닉 활성화':'Hidden activation'}</strong><p>${relu?'hᵢ = ReLU(zᵢ) = max(0, zᵢ)':'hᵢ = zᵢ'}<br>h₁ = ${f(r.h1)}, h₂ = ${f(r.h2)}</p><p>${relu?(ko?'음수는 0이 되어 차이가 어느 방향에 있는지 나타냅니다.':'Negative values become zero, exposing the direction of the difference.'):(ko?'음수를 그대로 통과시키므로 두 값의 합이 0입니다.':'Negative values pass through, so these two values sum to zero.')}</p></li>
    <li><strong>${ko?'출력 점수와 확률':'Output score and probability'}</strong><p>z = 6h₁ + 6h₂ − 3 = 6 × ${f(r.h1)} + 6 × ${f(r.h2)} − 3 = ${f(r.logit)}<br>p = σ(z) = 1 / (1 + exp(−z)) = <strong>${f(r.probability)}</strong></p><p>${ko?'점수를 0과 1 사이의 확률로 변환합니다. p≥0.5면 클래스 1, 아니면 0으로 정합니다.':'The score is mapped to a probability between 0 and 1. Predict class 1 if p≥0.5; otherwise predict 0.'}</p></li>
    <li><strong>${ko?'예측과 정답':'Prediction and target'}</strong><p>${ko?'예측':'Prediction'} = ${r.prediction} · ${ko?'정답':'Target'} = ${r.target} · ${r.prediction===r.target?(ko?'일치':'Correct'):(ko?'불일치':'Incorrect')}</p></li></ol>
    <p>${ko?'작은 화면에서는 결과 표를 가로로 스크롤하세요. 키보드로 표 영역에 초점을 둔 뒤 방향키로 이동할 수 있습니다.':'On a small screen, scroll the results table horizontally. With a keyboard, focus the table area and use the arrow keys.'}</p>
    <div class="xor-table-wrap" tabindex="0" role="region" aria-label="${ko?'네 입력의 결과 표':'Results for all four inputs'}"><table><thead><tr><th>${ko?'입력':'Input'}</th><th>${ko?'정답':'Target'}</th><th>p</th><th>${ko?'예측':'Prediction'}</th><th>${ko?'비교':'Result'}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p>${ko?'확률은 소수 셋째 자리까지 표시하지만 분류는 반올림 전 값으로 합니다. 높은 확률도 확실성을 보장하지 않습니다.':'Probabilities are rounded to three decimals for display; classification uses unrounded values. A high probability does not guarantee certainty.'}</p>`;
}
