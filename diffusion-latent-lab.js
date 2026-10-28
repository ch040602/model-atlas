// Stable Diffusion v1's VAE shape and scale, with one illustrative scalar
// coordinate. The actual neural encoder, denoiser and decoder are not run.
export function latentExample(size, encoded, noise) {
  const factor=0.18215, alpha=0.25, latentSize=size/8;
  const clean=factor*encoded;
  const noisy=Math.sqrt(alpha)*clean+Math.sqrt(1-alpha)*noise;
  const estimate=(noisy-Math.sqrt(1-alpha)*noise)/Math.sqrt(alpha);
  return {factor,alpha,latentSize,pixels:size*size*3,latents:latentSize*latentSize*4,clean,noisy,estimate,decoderInput:estimate/factor};
}

const n=value=>(Math.abs(value)<0.000005?0:value).toFixed(5);
const text={
  ko:{title:'이미지와 잠재표현: 확산이 일어나는 곳',intro:'Stable Diffusion v1을 기준으로 학습 이미지가 잠재표현으로 바뀌고, 노이즈 제거 결과가 이미지로 디코딩되는 흐름을 살펴봅니다.',fixed:'VAE 인코더·디코더와 UNet을 실행하지 않는 축소 예제입니다. 인코더 값과 노이즈는 한 좌표의 가정된 숫자입니다. 원본 시각화 및 앞 실습과 값이나 학습 상태를 공유하지 않습니다.',size:'정사각 이미지 크기 (픽셀)',encoded:'인코더 출력 한 좌표 e',noise:'학습 때 더한 노이즈 ε',previous:'이전 단계',next:'다음 단계',reset:'처음부터',rounding:'계산은 전체 정밀도로 수행하고 화면에는 소수 다섯째 자리까지 표시합니다.',source:'Stable Diffusion v1 설정 ↗',code:'인코딩·디코딩 구현 ↗',
    one:'1. 이미지와 잠재표현의 크기',oneText:'학습에서 VAE 인코더는 RGB 이미지를 더 작은 공간 표현으로 바꿉니다. v1의 한 이미지에서 높이와 너비는 각각 8배 줄고 채널은 4개입니다. 예를 들어 512×512×3은 64×64×4가 됩니다. 48은 텐서 원소 수의 비율이지 실행 속도나 메모리 사용량의 비율이 아닙니다. 크기 변경은 형태 계산 예시이며 모든 해상도에서 같은 품질을 보장하지 않습니다.',
    two:'2. 인코더 출력을 확산 모델의 입력 범위로 조절',twoText:'v1 구현은 인코더의 잠재 샘플에 고정 계수 0.18215를 곱합니다. 여기서 e는 그 잠재 샘플의 한 좌표이고 z₀는 확산에 쓰는 값입니다. 계수는 픽셀 크기나 학습률이 아닙니다. 인코더는 경우에 따라 확률분포를 내고 그 분포에서 샘플을 뽑습니다.',
    three:'3. 학습용 잠재표현에 노이즈 추가',threeText:'앞의 일반 수식 xₜ에서 Stable Diffusion은 이미지 픽셀 대신 잠재표현 zₜ를 사용합니다. 학습 예제에서는 추가한 ε를 알며, 이 값이 UNet의 노이즈 예측 학습 목표가 됩니다. ᾱₜ=0.25는 설명을 위해 정한 값입니다.',
    four:'4. 노이즈 예측으로 깨끗한 잠재값 추정',fourText:'식의 동작을 확인하기 위해 이 예제에서는 예측 εθ가 정답 ε와 정확히 같다고 가정합니다. 실제 생성에서는 정답 노이즈를 알지 못하고 모델의 예측을 사용하며, 독립적인 초기 노이즈에서 여러 역방향 단계를 거칩니다. 한 번의 완벽한 예측은 학습된 모델의 성능을 의미하지 않습니다.',
    five:'5. 스케일을 되돌리고 VAE 디코더에 전달',fiveText:'v1 구현은 확산 결과를 0.18215로 나눈 뒤 학습된 VAE 디코더로 픽셀 이미지를 만듭니다. 디코더는 단순한 이미지 크기 확대가 아니라 잠재 텐서를 이미지로 변환하는 신경망입니다. 여기서는 입력 좌표만 계산하며 디코더의 픽셀 출력은 계산하지 않습니다. 텍스트로 이미지를 생성할 때는 처음에 입력 이미지를 인코딩하지 않습니다.'},
  en:{title:'Images and latents: where diffusion happens',intro:'Follow how a training image becomes a latent and how a denoised latent is decoded, using Stable Diffusion v1 as the reference.',fixed:'This toy does not run the VAE encoder, decoder or UNet. The encoder value and noise are assumed numbers for one coordinate. Values and training state are not shared with the original visualization or the preceding exercises.',size:'Square image size (pixels)',encoded:'One encoder-output coordinate e',noise:'Noise ε added during training',previous:'Previous step',next:'Next step',reset:'Start over',rounding:'Calculations use full precision; displayed values are rounded to five decimals.',source:'Stable Diffusion v1 configuration ↗',code:'Encoding and decoding implementation ↗',
    one:'1. Image and latent dimensions',oneText:'During training, the VAE encoder maps an RGB image to a smaller spatial representation. In v1, each spatial dimension is reduced by a factor of 8 and the latent has four channels. For example, 512×512×3 becomes 64×64×4. The ratio of 48 counts tensor elements, not speed or total memory. Changing the size illustrates dimensions; it does not guarantee equal quality at every resolution.',
    two:'2. Scale the encoder output for diffusion',twoText:'The v1 implementation multiplies the encoder’s latent sample by the fixed factor 0.18215. Here e is one coordinate of that latent sample and z₀ is the value used for diffusion. The factor is neither pixel size nor learning rate. The encoder may produce a distribution from which a latent is sampled.',
    three:'3. Add noise to a training latent',threeText:'For Stable Diffusion, the general xₜ formula above operates on latent zₜ rather than image pixels. During training the added ε is known and is the target for the UNet noise prediction. ᾱₜ=0.25 is an illustrative choice.',
    four:'4. Estimate the clean latent from a noise prediction',fourText:'To check the equation, this example assumes the prediction εθ exactly equals the known ε. During actual generation the true noise is unknown and the model prediction is used over multiple reverse steps, starting from independent initial noise. One perfect prediction is not evidence of a trained model’s performance.',
    five:'5. Undo the scale and pass the result to the VAE decoder',fiveText:'The v1 implementation divides the diffusion result by 0.18215 and uses a trained VAE decoder to produce an image. The decoder is a neural network mapping a latent tensor to an image, not a simple image resize. We calculate only one input coordinate, not the decoder’s pixel output. Text-to-image generation does not begin by encoding an input image.'}
};

export function latentMarkup(values,lang) {
  const t=text[lang];
  const fields=[['size',256,768,64],['encoded',-2,2,0.1],['noise',-2,2,0.1]];
  const controls=fields.map(([key,min,max,step])=>`<div class="sequence-control"><label for="latent-${key}">${t[key]} <output id="latent-value-${key}">${key==='size'?values[key]:n(values[key])}</output></label><input id="latent-${key}" data-latent-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab latent-lab" aria-labelledby="latent-title"><div class="eyebrow">DIFFUSION / LATENT SPACE</div><h2 id="latent-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div><div id="latent-output" aria-live="polite"></div><div class="sequence-actions"><span id="latent-status"></span><button type="button" data-latent-action="previous">${t.previous}</button><button type="button" data-latent-action="next">${t.next} →</button><button type="button" data-latent-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://github.com/CompVis/stable-diffusion/blob/main/configs/stable-diffusion/v1-inference.yaml" target="_blank" rel="noopener noreferrer">${t.source}</a> · <a href="https://github.com/CompVis/stable-diffusion/blob/main/ldm/models/diffusion/ddpm.py" target="_blank" rel="noopener noreferrer">${t.code}</a></p></section>`;
}

export function latentOutput(values,lang,stage) {
  const t=text[lang],r=latentExample(values.size,values.encoded,values.noise);
  const steps=[
    `<li><b>${t.one}</b><p>${t.oneText}</p><code>RGB: ${values.size} × ${values.size} × 3 = ${r.pixels}<br>latent: ${r.latentSize} × ${r.latentSize} × 4 = ${r.latents}<br>${r.pixels} / ${r.latents} = 48</code></li>`,
    `<li><b>${t.two}</b><p>${t.twoText}</p><code>z₀ = 0.18215 × e = 0.18215 × ${n(values.encoded)} = ${n(r.clean)}</code></li>`,
    `<li><b>${t.three}</b><p>${t.threeText}</p><code>zₜ = √ᾱₜ z₀ + √(1 − ᾱₜ) ε<br>= √0.25 × ${n(r.clean)} + √0.75 × ${n(values.noise)} = ${n(r.noisy)}</code></li>`,
    `<li><b>${t.four}</b><p>${t.fourText}</p><code>εθ = ε = ${n(values.noise)}<br>ẑ₀ = (zₜ − √(1 − ᾱₜ) εθ) / √ᾱₜ<br>= (${n(r.noisy)} − √0.75 × ${n(values.noise)}) / √0.25 = ${n(r.estimate)}</code></li>`,
    `<li><b>${t.five}</b><p>${t.fiveText}</p><code>decoder input = ẑ₀ / 0.18215 = ${n(r.estimate)} / 0.18215 = ${n(r.decoderInput)}<br>image = VAE_decode(latent / 0.18215)</code></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
