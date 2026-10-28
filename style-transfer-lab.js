// A two-channel, two-position feature-space example; no CNN or image is run.
const content = [[1, 0], [0, 1]];
const style = [[1, 1], [1, 0]];
const initial = [[0.6, 0.4], [0.2, 0.8]];
const fmt = x => (Math.abs(x) < 0.00005 ? 0 : x).toFixed(4);
const gram = f => f.map(a => f.map(b => a.reduce((sum, x, p) => sum + x * b[p], 0) / 2));
const difference = (a, b) => a.map((row, i) => row.map((x, j) => x - b[i][j]));
const squares = m => m.flat().reduce((sum, x) => sum + x * x, 0);
const matrix = m => m.map(row => `[${row.map(fmt).join(', ')}]`).join('  ');

export function styleTransferExample(weight, rate, swap = false) {
  if (!Number.isFinite(weight) || weight < 0 || weight > 4 || !Number.isFinite(rate) || rate < 0 || rate > 0.5 || typeof swap !== 'boolean') throw new RangeError('invalid style settings');
  const f = initial.map(row => swap ? [...row].reverse() : [...row]);
  const target = gram(style), current = gram(f), error = difference(current, target);
  const contentLoss = squares(difference(f, content)) / 4;
  const styleLoss = squares(error) / 4;
  // d(1/4 ||FFᵀ/2 - A||²)/dF = (FFᵀ/2 - A)F/2.
  const gradContent = difference(f, content).map(row => row.map(x => x / 2));
  const gradStyle = error.map(row => f[0].map((_, p) => row.reduce((sum, value, channel) => sum + value * f[channel][p], 0) / 2));
  const gradient = gradContent.map((row, i) => row.map((value, p) => value + weight * gradStyle[i][p]));
  const next = f.map((row, i) => row.map((value, p) => value - rate * gradient[i][p]));
  const nextContent = squares(difference(next, content)) / 4;
  const nextStyle = squares(difference(gram(next), target)) / 4;
  return {f, content, style, current, target, contentLoss, styleLoss, gradContent, gradStyle, gradient, next, nextContent, nextStyle, total: contentLoss + weight * styleLoss, nextTotal: nextContent + weight * nextStyle};
}

export function styleTransferMarkup(settings, lang) {
  const ko = lang === 'ko';
  return `<section class="metric-lab" aria-labelledby="style-transfer-title">
  <h2 id="style-transfer-title">${ko ? '특징과 그램 행렬로 변환 목표 만들기' : 'Build a transformation objective from features and Gram matrices'}</h2>
  <p>${ko ? '가상의 2개 채널 × 2개 위치를 사용합니다. 슬라이더는 갱신을 미리 계산하며 이미지나 CNN은 실행하지 않습니다.' : 'Use two hypothetical channels at two positions. Sliders preview an update; no image or CNN is run.'}</p>
  <label class="pca-control" for="style-weight">${ko ? '스타일 손실 가중치 λ' : 'Style-loss weight λ'} <output id="style-weight-value">${fmt(settings.weight)}</output></label>
  <input id="style-weight" data-style-weight type="range" min="0" max="4" step="0.25" value="${settings.weight}">
  <label class="pca-control" for="style-rate">${ko ? '특징 갱신 크기 η' : 'Feature update step size η'} <output id="style-rate-value">${fmt(settings.rate)}</output></label>
  <input id="style-rate" data-style-rate type="range" min="0" max="0.5" step="0.05" value="${settings.rate}">
  <p><label><input data-style-swap type="checkbox" ${settings.swap ? 'checked' : ''}> ${ko ? '현재 특징의 두 위치 바꾸기' : 'Swap the two positions in the current features'}</label></p>
  <div id="style-transfer-output" aria-live="polite"></div>
  <p>${ko ? '실제 이미지로 시작하기: 공식 튜토리얼의 노트북이나 Python 코드를 열고 내용·스타일 이미지 두 개를 준비합니다. 코드의 이미지 경로를 준비한 파일에 맞추고, 안내된 라이브러리와 VGG19 사전 학습 가중치를 설치·다운로드한 뒤 실행하세요. CPU도 사용할 수 있지만 시간이 걸릴 수 있습니다. 이미지와 가중치는 이 프로젝트에 포함하지 않습니다.' : 'Try real images: open the notebook or Python code in the official tutorial and prepare a content and a style image. Adjust the code’s image paths to those files, install the listed libraries, download pretrained VGG19 weights, and run it. CPU works but can take time. Images and weights are not included here.'} <a href="https://docs.pytorch.org/tutorials/advanced/neural_style_tutorial.html" target="_blank" rel="noopener noreferrer">PyTorch neural style tutorial ↗</a> · <a href="https://github.com/pytorch/tutorials/blob/main/advanced_source/neural_style_tutorial.py" target="_blank" rel="noopener noreferrer">GitHub source ↗</a></p>
  </section>`;
}

export function styleTransferOutput(settings, lang) {
  const ko = lang === 'ko', r = styleTransferExample(settings.weight, settings.rate, settings.swap);
  return `<div class="style-transfer-results">
  <p><b>${ko ? '① 고정된 특징 비교' : '① Compare fixed features'}</b><br>
  ${ko ? '행은 채널, 열은 위치입니다. 현재 F는 갱신 대상, C는 내용 기준, S는 스타일 기준입니다.' : 'Rows are channels and columns are positions. Current F is the update target, C the content target, and S the style target.'}<br>
  F = ${matrix(r.f)}<br>C = ${matrix(r.content)}<br>S = ${matrix(r.style)}</p>
  <p><b>${ko ? '② 스타일의 그램 행렬' : '② The style Gram matrix'}</b><br>
  G(F)ᵢⱼ = (Fᵢ₁Fⱼ₁ + Fᵢ₂Fⱼ₂) / 2<br>
  G(F)₁₁ = (${fmt(r.f[0][0])}² + ${fmt(r.f[0][1])}²) / 2 = ${fmt(r.current[0][0])}<br>
  G(F) = ${matrix(r.current)}<br>G(S) = ${matrix(r.target)}<br>
  ${ko ? '채널 쌍의 위치별 곱을 평균합니다. 이는 평균을 뺀 공분산이나 정규화된 상관계수는 아닙니다. 두 위치를 함께 바꾸어도 G(F)는 같지만, C와 같은 위치끼리 비교하는 내용 손실은 바뀔 수 있습니다.' : 'Average products across positions for each channel pair. This is neither mean-centered covariance nor a normalized correlation coefficient. Swapping both positions leaves G(F) unchanged, but content loss can change because it compares corresponding positions with C.'}</p>
  <p><b>${ko ? '③ 가중 손실' : '③ Weighted loss'}</b><br>
  Lcontent = Σ(F − C)² / 4 = <span data-style-result="content">${fmt(r.contentLoss)}</span><br>
  Lstyle = Σ(G(F) − G(S))² / 4 = <span data-style-result="style">${fmt(r.styleLoss)}</span><br>
  L = Lcontent + λLstyle = ${fmt(r.contentLoss)} + ${fmt(settings.weight)} × ${fmt(r.styleLoss)} = <strong data-style-result="total">${fmt(r.total)}</strong><br>
  ${ko ? '분모 4는 이 축소 예제의 네 원소에 대한 평균입니다. 그램 행렬은 위치 수 2로 나누었지만 아래 PyTorch 튜토리얼은 배치·채널·위치 수로 나눕니다. 따라서 손실 규모와 가중치는 직접 비교할 수 없습니다.' : 'Division by 4 averages the four entries in this toy example. Here the Gram matrix is divided by two positions, while the PyTorch tutorial below divides by batch, channel and position counts. Loss scales and weights are therefore not directly comparable.'}</p>
  <p><b>${ko ? '④ 기울기와 한 번의 갱신 미리보기' : '④ Preview one gradient update'}</b><br>
  ∇F Lcontent = (F − C) / 2<br>∇F Lstyle = (G(F) − G(S))F / 2<br>
  ∇F L = ∇F Lcontent + λ∇F Lstyle = ${matrix(r.gradient)}<br>
  Fnew = F − η∇F L = <span data-style-result="next">${matrix(r.next)}</span><br>
  ${ko ? '갱신 후' : 'After update'}: Lcontent = ${fmt(r.nextContent)}, Lstyle = ${fmt(r.nextStyle)}, L = <span data-style-result="next-total">${fmt(r.nextTotal)}</span></p>
  <p>${ko ? '이 예제는 특징값을 직접 한 번 바꾼 계산입니다. 실제 스타일 전이는 보통 고정 CNN을 통해 이미지 픽셀에 역전파하고 여러 층과 여러 갱신을 사용합니다. 특징을 직접 수정한 결과가 실제 이미지로 실현된다는 보장은 없습니다.' : 'This example directly changes feature values once. Actual style transfer usually backpropagates through a fixed CNN to image pixels and uses multiple layers and updates. Directly modified features need not correspond to a realizable image.'}</p>
  </div>`;
}
