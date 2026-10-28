// Fixed post-convolution feature maps for a GAP + linear classifier example.
const features=[[2,1,0,1],[1,0,2,1]];
const fmt=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);

export function camExample(weight1,weight2,bias) {
  if (![weight1,weight2,bias].every(Number.isFinite)) throw new RangeError('finite weights and bias required');
  const weights=[weight1,weight2];
  const averages=features.map(channel=>channel.reduce((a,b)=>a+b,0)/channel.length);
  const map=features[0].map((_,i)=>weights.reduce((sum,w,k)=>sum+w*features[k][i],0));
  const meanMap=map.reduce((a,b)=>a+b,0)/map.length;
  const logit=bias+weights.reduce((sum,w,k)=>sum+w*averages[k],0);
  return {features,weights,averages,map,meanMap,logit,bias};
}

export function camMarkup(values,lang) {
  const ko=lang==='ko';
  const controls=[['weight1',ko?'채널 1 가중치':'Channel 1 weight'],['weight2',ko?'채널 2 가중치':'Channel 2 weight'],['bias',ko?'클래스 편향':'Class bias']];
  return `<section class="metric-lab cam-lab" aria-labelledby="cam-title">
  <h2 id="cam-title">${ko?'특성 맵에서 CAM과 클래스 점수까지':'From feature maps to a CAM and class score'}</h2>
  <p>${ko?'두 개의 2×2 특성 맵을 고정하고 한 클래스의 가중치와 편향을 바꿉니다. 숫자는 설명용이며 실제 이미지나 CNN의 출력이 아닙니다.':'Keep two 2×2 feature maps fixed and change one class’s weights and bias. These are teaching values, not outputs from an image or a real CNN.'}</p>
  ${controls.map(([key,label])=>`<label class="pca-control" for="cam-${key}">${label} <output id="cam-${key}-value">${fmt(values[key])}</output></label><input id="cam-${key}" data-cam-input="${key}" type="range" min="-2" max="2" step="0.25" value="${values[key]}">`).join('')}
  <div id="cam-output" aria-live="polite"></div>
  <p>${ko?'이 계산은 전역 평균 풀링 뒤 선형 분류기를 사용하는 CAM 구조의 예입니다. CAM은 Grad-CAM과 다른 방법이며, 강조된 위치가 반드시 객체 전체나 인과적 근거를 뜻하지 않습니다.':'This illustrates CAM for a global-average-pooling plus linear classifier. CAM differs from Grad-CAM; highlighted locations do not necessarily cover the whole object or establish causation.'} <a href="https://arxiv.org/abs/1512.04150" target="_blank" rel="noopener noreferrer">CAM paper ↗</a> · <a href="https://arxiv.org/abs/1610.02391" target="_blank" rel="noopener noreferrer">Grad-CAM paper ↗</a></p>
  </section>`;
}

export function camOutput(values,lang) {
  const ko=lang==='ko', r=camExample(values.weight1,values.weight2,values.bias);
  const label=ko?['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래']:['Top left','Top right','Bottom left','Bottom right'];
  const cell=i=>`<td class="${r.map[i]>0?'cam-positive':r.map[i]<0?'cam-negative':'cam-zero'}"><span>${label[i]}</span><span>F₁ = ${r.features[0][i]} · F₂ = ${r.features[1][i]}</span><strong>${fmt(r.map[i])}</strong></td>`;
  return `<div class="cam-results">
    <p><b>${ko?'① 채널별 전역 평균 풀링':'① Global average pooling per channel'}</b><br>
    ${ko?'채널':'Channel'} 1: (2 + 1 + 0 + 1) / 4 = ${fmt(r.averages[0])}<br>
    ${ko?'채널':'Channel'} 2: (1 + 0 + 2 + 1) / 4 = ${fmt(r.averages[1])}</p>
    <p><b>${ko?'② 위치별 가중합으로 CAM 만들기':'② Build the CAM as a weighted sum at each position'}</b><br>CAM(i) = w₁ × F₁(i) + w₂ × F₂(i)<br>${ko?'왼쪽 위':'Top left'} = ${fmt(r.weights[0])} × 2 + ${fmt(r.weights[1])} × 1 = ${fmt(r.map[0])}</p>
    <table class="cam-map"><caption>${ko?'이 클래스의 2×2 CAM 점수':'2×2 CAM scores for this class'}</caption><tbody><tr>${cell(0)}${cell(1)}</tr><tr>${cell(2)}${cell(3)}</tr></tbody></table>
    <p>${ko?'각 칸에 두 채널의 입력값과 CAM 점수를 함께 표시합니다. 양수·음수는 이 예제에서 로짓에 평균되어 반영될 부호 있는 위치별 점수입니다. 편향은 각 위치에 더하지 않습니다.':'Each cell shows both feature values and its CAM score. The signed scores are averaged to contribute to this example’s class logit. Bias is not added to each location.'}</p>
    <p><b>${ko?'③ 풀링된 특징으로 클래스 로짓 계산':'③ Compute the class logit from pooled features'}</b><br>
    logit = w₁ × GAP₁ + w₂ × GAP₂ + b = ${fmt(r.weights[0])} × ${fmt(r.averages[0])} + ${fmt(r.weights[1])} × ${fmt(r.averages[1])} + ${fmt(r.bias)} = <strong data-cam-result="logit">${fmt(r.logit)}</strong><br>
    ${ko?'같은 값 확인: CAM 평균 + 편향':'Check the same value: mean CAM + bias'} = ${fmt(r.meanMap)} + ${fmt(r.bias)} = ${fmt(r.meanMap+r.bias)}</p>
    <p>${ko?'로짓은 softmax 이전의 점수이지 확률이 아닙니다. 다른 클래스의 가중치나 로짓은 이 예제에 없으므로 확률을 구할 수 없습니다. 편향만 바꾸면 CAM은 그대로이고 로짓만 바뀝니다.':'The logit is a score before softmax, not a probability. Other class weights and logits are absent, so a probability cannot be computed. Changing only the bias changes the logit but leaves the CAM unchanged.'}</p>
  </div>`;
}
