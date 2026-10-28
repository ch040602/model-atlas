// A toy 1×1 convolution at one spatial position: two filters, three channels.
const weights = [[1, -1, 0.5], [-1, 1, 0.5]];
const bias = 0.1;
const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(2);

export function channelExperiment(values) {
  const input = [values.red, values.green, values.blue];
  const outputs = weights.map(filter => {
    const products = filter.map((weight, i) => weight * input[i]);
    const sum = products.reduce((a, b) => a + b, bias);
    return { products, sum, activation: Math.max(0, sum) };
  });
  return { input, weights, bias, outputs };
}

const words = {
  ko: {
    title:'RGB 입력에서 여러 출력 채널 만들기',
    intro:'앞의 공간 이동 예제는 입력 채널 하나를 사용했습니다. 이번에는 한 위치의 RGB 값 세 개를 서로 다른 필터 두 개에 넣습니다.',
    setup:'축소 예제: 1×1 필터, 입력 채널 3개, 출력 채널 2개. 필터마다 채널별 가중치 3개와 편향 1개가 있습니다. 슬라이더 값은 이 예제를 위해 0~1로 정했습니다.',
    red:'빨강 R', green:'초록 G', blue:'파랑 B', previous:'이전 단계', next:'다음 단계', reset:'처음부터',
    one:'1. 입력과 두 필터', two:'2. 필터 A의 출력', three:'3. 필터 B와 최종 출력',
    input:'한 위치의 입력', filter:'필터별 가중치 [R, G, B]', equation:'각 필터는 같은 위치의 세 채널을 각각 곱해 더한 뒤 편향을 더합니다.',
    first:'필터 A의 결과가 출력 채널 A의 이 위치 값이 됩니다.',
    result:'두 필터가 서로 다른 출력 채널을 만듭니다. 각 위치에 같은 가중치를 적용하면 출력 특징 맵이 두 개 생깁니다. 출력값은 색상이나 분류 확률이 아니라 학습된 특징의 활성값입니다.',
    hint:'R=1, G=0, B=0으로 바꾸면 필터 B의 음수 가중합이 ReLU를 거쳐 0이 됩니다.',
    rounding:'계산은 전체 정밀도로 수행하고 소수 둘째 자리까지 표시합니다.'
  },
  en: {
    title:'Make multiple output channels from RGB',
    intro:'The spatial example above used one input channel. Here, the three RGB values at one position go through two different filters.',
    setup:'Toy example: 1×1 filters, 3 input channels, 2 output channels. Each filter has three channel weights and one bias. Slider values are set to 0–1 for this example.',
    red:'Red R', green:'Green G', blue:'Blue B', previous:'Previous step', next:'Next step', reset:'Start over',
    one:'1. Input and two filters', two:'2. Filter A output', three:'3. Filter B and final output',
    input:'Input at one position', filter:'Weights per filter [R, G, B]', equation:'Each filter multiplies and sums the three channels at the same position, then adds its bias.',
    first:'Filter A gives the value at this position in output channel A.',
    result:'The two filters create different output channels. Applying the same weights at each position produces two output feature maps. These outputs are learned feature activations, not colors or class probabilities.',
    hint:'Set R=1, G=0, B=0 to see filter B’s negative weighted sum become zero after ReLU.',
    rounding:'Calculations use full precision and display two decimal places.'
  }
};

export function cnnChannelsMarkup(values, lang) {
  const t=words[lang];
  const controls=['red','green','blue'].map(key => `<div class="sequence-control"><label for="channel-${key}">${t[key]} <output id="channel-value-${key}">${n(values[key])}</output></label><input id="channel-${key}" data-channel-input="${key}" type="range" min="0" max="1" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab cnn-channels-lab" aria-labelledby="channel-title"><div class="eyebrow">CNN / CHANNELS</div><h2 id="channel-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.setup}</p><div class="sequence-controls">${controls}</div><div id="channel-output" aria-live="polite"></div><div class="sequence-actions"><span id="channel-status"></span><button type="button" data-channel-action="previous">${t.previous}</button><button type="button" data-channel-action="next">${t.next} →</button><button type="button" data-channel-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p></section>`;
}

export function cnnChannelsOutput(values, lang, stage) {
  const t=words[lang], x=channelExperiment(values);
  const calculation = i => {
    const label=i===0?'A':'B', output=x.outputs[i], filter=x.weights[i];
    const terms=x.input.map((v,j)=>`(${n(v)} × ${n(filter[j])})`).join(' + ');
    return `<p>z<sub>${label}</sub> = ${terms} + ${n(x.bias)} = <strong>${n(output.sum)}</strong><br>a<sub>${label}</sub> = ReLU(z<sub>${label}</sub>) = max(0, ${n(output.sum)}) = <strong>${n(output.activation)}</strong></p>`;
  };
  let html=`<div class="conv-calc"><h3>${t.one}</h3><p>${t.input} [R, G, B] = [${x.input.map(n).join(', ')}]</p><p>${t.filter}<br>A = [1, −1, 0.5], b<sub>A</sub> = 0.1<br>B = [−1, 1, 0.5], b<sub>B</sub> = 0.1</p><p>${t.equation}</p></div>`;
  if(stage>=2) html+=`<div class="conv-calc"><h3>${t.two}</h3>${calculation(0)}<p>${t.first}</p></div>`;
  if(stage>=3) html+=`<div class="conv-calc"><h3>${t.three}</h3>${calculation(1)}<p>[a<sub>A</sub>, a<sub>B</sub>] = <strong>[${x.outputs.map(o=>n(o.activation)).join(', ')}]</strong></p><p>${t.result}</p><p>${t.hint}</p></div>`;
  return html;
}
