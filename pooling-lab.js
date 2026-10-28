import { convolutionExperiment } from './convolution-lab.js';

// Two-by-two max pooling with stride 2. At a tie, this toy routes the
// gradient to the first maximum in row-major order; implementations may differ.
export function poolingExperiment(conv, values) {
  const map = values.source === 'conv'
    ? convolutionExperiment(conv.center, conv.strength, conv.bias).positions.map(p => p.activation)
    : [values.example, 0.5, 1, 0.2];
  const max = Math.max(...map);
  // Slider calculations can differ by a few ULPs even when their exact decimal values tie.
  const tolerance = 8 * Number.EPSILON * Math.max(1, ...map.map(Math.abs));
  const maxima = map.map((x, i) => max - x <= tolerance ? i : -1).filter(i => i >= 0);
  const winner = maxima[0];
  const ties = maxima.length;
  const gradient = map.map((_, i) => i === winner ? values.gradient : 0);
  return { map, max, winner, ties, gradient };
}
const words = {
  ko: {title:'최대 풀링과 기울기 전달', intro:'2×2 특징 맵에서 가장 큰 값을 뽑고, 다음 층에서 온 기울기가 어디로 돌아가는지 살펴보세요.', source:'특징 맵 선택', conv:'위 합성곱의 현재 특징 맵', example:'직접 조절하는 별도 예시', exampleValue:'별도 예시의 왼쪽 위 값', gradient:'다음 층에서 온 기울기 g', previous:'이전 단계', next:'다음 단계', reset:'처음부터'},
  en: {title:'Max pooling and gradient routing', intro:'Select the largest value in a 2×2 feature map, then see where the gradient from the next layer goes.', source:'Feature map source', conv:'Current feature map from convolution above', example:'Separate adjustable example', exampleValue:'Top-left value of the separate example', gradient:'Incoming gradient g', previous:'Previous step', next:'Next step', reset:'Start over'}
};
const n = x => (Object.is(x, -0) ? 0 : x).toFixed(2);
const matrix = a => `[ ${n(a[0])}, ${n(a[1])} ; ${n(a[2])}, ${n(a[3])} ]`;
export function poolingMarkup(values, lang) {
  const t=words[lang];
  return `<section class="sequence-lab" aria-labelledby="pool-title"><div class="eyebrow">CNN / MAX POOLING</div><h2 id="pool-title">${t.title}</h2><p>${t.intro}</p><fieldset class="token-choice"><legend>${t.source}</legend><label><input type="radio" name="pool-source" data-pool-source="conv" value="conv" ${values.source==='conv'?'checked':''}> ${t.conv}</label><label><input type="radio" name="pool-source" data-pool-source="example" value="example" ${values.source==='example'?'checked':''}> ${t.example}</label></fieldset><div class="sequence-controls"><div class="sequence-control"><label for="pool-example">${t.exampleValue} <output id="pool-example-value">${n(values.example)}</output></label><input type="range" id="pool-example" data-pool-example min="0" max="2" step="0.1" value="${values.example}" ${values.source==='conv'?'disabled':''}></div><div class="sequence-control"><label for="pool-gradient">${t.gradient} <output id="pool-gradient-value">${n(values.gradient)}</output></label><input type="range" id="pool-gradient" data-pool-gradient min="-1" max="1" step="0.1" value="${values.gradient}"></div></div><div id="pool-output" aria-live="polite"></div><div class="sequence-actions"><span id="pool-status"></span><button type="button" data-pool-action="previous">${t.previous}</button><button type="button" data-pool-action="next">${t.next} →</button><button type="button" data-pool-action="reset">${t.reset}</button></div></section>`;
}
export function poolingOutput(conv, values, lang, stage) {
  const r=poolingExperiment(conv,values), ko=lang==='ko';
  const source=values.source==='conv' ? (ko?'위 슬라이더의 현재 합성곱·ReLU 결과입니다. 학습 갱신 미리보기의 변경된 가중치는 반영하지 않습니다.':'This is the current convolution and ReLU result from the sliders above, before the previewed weight update.') : (ko?'앞 계산과 독립적인 가상의 특징 맵입니다. 왼쪽 위 값만 조절합니다.':'This is a separate hypothetical feature map; only its top-left value is adjustable.');
  const position=ko?['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래'][r.winner]:['top left','top right','bottom left','bottom right'][r.winner];
  const tie=r.ties>1 ? (ko?`최댓값이 ${r.ties}곳에서 같아 이 지점에서 최댓값 함수는 미분 가능하지 않습니다. 이 예제는 행 우선 순서에서 처음인 ${position}에 기울기를 보냅니다. 구현에 따라 처리 방식은 다를 수 있습니다.`:`The maximum occurs at ${r.ties} positions, where the max function is not differentiable. This toy routes the gradient to the first maximum in row-major order (${position}); implementations may handle ties differently.`) : (ko?`최댓값은 ${position}에 하나입니다.`:`There is one maximum, at the ${position}.`);
  let out=`<ol class="sequence-steps"><li><b>${ko?'1. 입력 특징 맵':'1. Input feature map'}</b><code>A = ${matrix(r.map)}</code><p>${source}</p></li>`;
  if(stage>=2) out+=`<li><b>${ko?'2. 순전파':'2. Forward pass'}</b><code>max(${r.map.map(n).join(', ')}) = ${n(r.max)} → [ ${n(r.max)} ]</code><p>${ko?'윈도와 이동 간격이 모두 2이고 패딩이 없으므로 2×2 입력은 1×1 출력이 됩니다.':'With a 2×2 window, stride 2 and no padding, the 2×2 input yields one 1×1 output.'} ${tie}</p></li>`;
  if(stage>=3) out+=`<li><b>${ko?'3. 역전파':'3. Backward pass'}</b><code>g = ${n(values.gradient)}; ∂L/∂A = ${matrix(r.gradient)}</code><p>${ko?'다음 층에서 온 g를 선택된 위치로 전달하고 나머지는 0입니다. g는 이 예제에서 가정한 값이며, 풀링에는 학습할 가중치가 없습니다. 이전 ReLU나 합성곱까지의 역전파는 계산하지 않습니다.':'The selected position receives the assumed incoming g; the others receive zero. Pooling has no trainable weights. This example does not propagate through the earlier ReLU or convolution.'}</p></li>`;
  return out+`</ol><p class="sequence-rounding">${ko?'표시는 소수 둘째 자리까지 반올림합니다. 동률은 표시 반올림이 아닌 계산값으로 판단하되 부동소수점 오차 수준의 차이는 같은 값으로 봅니다.':'Values are displayed to two decimals. Ties use the calculated values before display rounding, treating differences at floating-point error scale as equal.'}</p>`;
}
