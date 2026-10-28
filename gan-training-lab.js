import {formulaDetailMarkup} from './formula-details.js';
// One real sample and one fake sample. D and then G take one SGD step.
export function ganTrainingExperiment(real, generator, weight, bias, rate=0.2) {
  const sigmoid = x => 1/(1+Math.exp(-x));
  const fake = generator; // z=1, so G(z)=generator*z
  const dReal = sigmoid(weight*real+bias);
  const dFake = sigmoid(weight*fake+bias);
  const dLoss = -Math.log(dReal)-Math.log(1-dFake);
  const dWeightGradient = (dReal-1)*real+dFake*fake;
  const dBiasGradient = (dReal-1)+dFake;
  const nextWeight = weight-rate*dWeightGradient;
  const nextBias = bias-rate*dBiasGradient;
  const nextDReal = sigmoid(nextWeight*real+nextBias);
  const nextDFake = sigmoid(nextWeight*fake+nextBias);
  const nextDLoss = -Math.log(nextDReal)-Math.log(1-nextDFake);
  const gLoss = -Math.log(nextDFake);
  const gGradient = (nextDFake-1)*nextWeight; // z=1
  const nextGenerator = generator-rate*gGradient;
  const updatedFakeScore = sigmoid(nextWeight*nextGenerator+nextBias);
  const nextGLoss = -Math.log(updatedFakeScore);
  // Compare both generator losses from the same fixed, just-updated D and g.
  const squareLoss = (nextDFake-1)**2;
  const squareGradient = 2*(nextDFake-1)*nextDFake*(1-nextDFake)*nextWeight;
  const squareGenerator = generator-rate*squareGradient;
  const squareScore = sigmoid(nextWeight*squareGenerator+nextBias);
  const nextSquareLoss = (squareScore-1)**2;
  return {fake,dReal,dFake,dLoss,dWeightGradient,dBiasGradient,nextWeight,nextBias,nextDReal,nextDFake,nextDLoss,gLoss,gGradient,nextGenerator,updatedFakeScore,nextGLoss,squareLoss,squareGradient,squareGenerator,squareScore,nextSquareLoss};
}

const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const copy = {
  ko:{title:'생성자와 판별자의 한 번씩의 학습',intro:'진짜 값 하나와 가짜 값 하나만 사용하는 축소 예제입니다. 판별자를 한 번 갱신한 다음, 그 판별자를 고정하고 생성자를 한 번 갱신합니다.',fixed:'z = 1, G(z) = g × z, D(u) = σ(wu + b), 학습률 η = 0.2. σ는 시그모이드입니다. 실제 GAN Lab은 더 큰 신경망과 여러 샘플을 사용하며 로그 판별자 손실의 진짜 항에 0.95를 곱합니다.',real:'진짜 값 x',generator:'생성자 가중치 g',weight:'판별자 가중치 w',bias:'판별자 편향 b',next:'다음 단계',previous:'이전 단계',reset:'처음부터',forward:'1. 진짜와 가짜를 판별',forwardMeaning:'G는 가짜 샘플을 만들고, D는 각 값이 진짜라고 판단하는 점수를 냅니다. 여기서는 점수를 확률처럼 계산하지만 실제 확률과 일치하는지는 별도로 평가해야 합니다.',loss:'2. 판별자 손실',lossMeaning:'진짜 점수는 높이고 가짜 점수는 낮추는 방향으로 판별자를 학습합니다. 이 단계에서 g는 고정합니다.',dupdate:'3. 판별자 갱신',dupdateMeaning:'연쇄법칙으로 구한 기울기의 반대 방향으로 w와 b를 갱신합니다. 이어지는 생성자 단계에서는 갱신된 판별자를 고정합니다.',gupdate:'4. 생성자 손실과 갱신',gupdateMeaning:'비포화 생성자 손실 −log D(G(z))를 최소화합니다. D의 연산을 통해 기울기를 전달하지만 w와 b는 바꾸지 않고 g만 갱신합니다.',squareTitle:'같은 시작점에서 제곱 손실과 비교',squareMeaning:'GAN Lab의 제곱 생성자 손실은 (D − 1)²입니다. 위와 같은 갱신된 D와 같은 g에서 출발해 별도로 한 번 갱신한 미리보기입니다. 시그모이드의 D(1 − D)가 기울기에 곱해지므로 D가 0이나 1에 가까우면 작아질 수 있습니다. 두 결과는 서로 이어서 적용하지 않습니다.',compare:'5. 생성자 갱신 후 비교',compareMeaning:'같은 z와 고정된 D로 다시 계산한 한 샘플의 결과입니다. 한 번의 갱신이나 손실 하나만으로 전체 생성 품질이나 다양성을 판단할 수 없습니다.',round:'계산은 전체 정밀도로 수행하며 표시만 소수 셋째 자리로 반올림합니다. 학습률이 크면 한 번의 갱신에서 손실이 증가할 수도 있습니다.',reference:'GAN 원 논문: 번갈아 학습과 생성자 손실 ↗'},
  en:{title:'One update each for discriminator and generator',intro:'This toy example uses one real value and one fake value. Update the discriminator once, then freeze it and update the generator once.',fixed:'z = 1, G(z) = g × z, D(u) = σ(wu + b), learning rate η = 0.2. σ is the sigmoid. The actual GAN Lab uses larger networks and many samples, and weights the real term of its log discriminator loss by 0.95.',real:'Real value x',generator:'Generator weight g',weight:'Discriminator weight w',bias:'Discriminator bias b',next:'Next step',previous:'Previous step',reset:'Start over',forward:'1. Score real and fake',forwardMeaning:'G produces a fake sample and D scores each value as real. Although the score is computed like a probability, calibration must be evaluated separately.',loss:'2. Discriminator loss',lossMeaning:'Train D towards higher real scores and lower fake scores. Hold g fixed in this step.',dupdate:'3. Update the discriminator',dupdateMeaning:'Move w and b against their gradients, calculated by the chain rule. Freeze the updated discriminator during the following generator step.',gupdate:'4. Generator loss and update',gupdateMeaning:'Minimize the non-saturating generator loss −log D(G(z)). Gradients pass through D, but its w and b stay fixed while g changes.',squareTitle:'Compare squared loss from the same starting point',squareMeaning:'GAN Lab’s squared generator loss is (D − 1)². This is a separate one-step preview starting from the same updated D and the same g as above. Its gradient includes the sigmoid derivative D(1 − D), which can be small when D is near 0 or 1. The two updates are not applied sequentially.',compare:'5. Compare after the generator update',compareMeaning:'This compares one sample with the same z and fixed D. One update or one loss value cannot establish overall sample quality or diversity.',round:'Calculations use full precision; displayed values are rounded to three decimals. A large learning rate can increase loss after an update.',reference:'Original GAN paper: alternating updates and generator loss ↗'}
};

export function ganTrainingMarkup(values,lang) {
  const t=copy[lang];
  const fields=['real','generator','weight','bias'];
  const controls=fields.map(key=>`<div class="sequence-control"><label for="gantrain-${key}">${t[key]} <output id="gantrain-value-${key}">${n(values[key])}</output></label><input id="gantrain-${key}" data-gantrain-input="${key}" type="range" min="-2" max="2" step="0.1" value="${values[key]}"></div>`).join('');
  return `<section class="sequence-lab gan-training-lab" aria-labelledby="gantrain-title"><div class="eyebrow">GAN / ALTERNATING UPDATES</div><h2 id="gantrain-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div>${formulaDetailMarkup(['adversarial','descent'],lang)}<div id="gantrain-output" aria-live="polite"></div><div class="sequence-actions"><span id="gantrain-status"></span><button type="button" data-gantrain-action="previous">${t.previous}</button><button type="button" data-gantrain-action="next">${t.next} →</button><button type="button" data-gantrain-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://arxiv.org/html/1406.2661#S3" target="_blank" rel="noopener noreferrer">${t.reference}</a></p></section>`;
}

export function ganTrainingOutput(v,lang,stage) {
  const t=copy[lang], r=ganTrainingExperiment(v.real,v.generator,v.weight,v.bias);
  const steps=[
    `<li><b>${t.forward}</b><code>G(1) = g × 1 = ${n(r.fake)}<br>D(x) = σ(${n(v.weight)} × ${n(v.real)} + ${n(v.bias)}) = ${n(r.dReal)}<br>D(G(1)) = σ(${n(v.weight)} × ${n(r.fake)} + ${n(v.bias)}) = ${n(r.dFake)}</code><p>${t.forwardMeaning}</p></li>`,
    `<li><b>${t.loss}</b><code>L_D = −log D(x) − log(1 − D(G(1)))<br>= −log(${n(r.dReal)}) − log(1 − ${n(r.dFake)}) = ${n(r.dLoss)}</code><p>${t.lossMeaning}</p></li>`,
    `<li><b>${t.dupdate}</b><code>∂L_D/∂w = (D(x) − 1)x + D(G(1))G(1) = ${n(r.dWeightGradient)}<br>∂L_D/∂b = D(x) − 1 + D(G(1)) = ${n(r.dBiasGradient)}<br>w′ = ${n(v.weight)} − 0.2 × ${n(r.dWeightGradient)} = ${n(r.nextWeight)}<br>b′ = ${n(v.bias)} − 0.2 × ${n(r.dBiasGradient)} = ${n(r.nextBias)}<br>L_D,new = ${n(r.nextDLoss)}</code><p>${t.dupdateMeaning}</p></li>`,
    `<li><b>${t.gupdate}</b><code>D′(G(1)) = ${n(r.nextDFake)}<br>L_G = −log D′(G(1)) = ${n(r.gLoss)}<br>∂L_G/∂g = (D′(G(1)) − 1)w′ × 1 = ${n(r.gGradient)}<br>g′ = ${n(v.generator)} − 0.2 × ${n(r.gGradient)} = ${n(r.nextGenerator)}</code><p>${t.gupdateMeaning}</p><b>${t.squareTitle}</b><code>L_G,sq = (D′(G(1)) − 1)² = (${n(r.nextDFake)} − 1)² = ${n(r.squareLoss)}<br>∂L_G,sq/∂g = 2(D′ − 1)D′(1 − D′)w′ = ${n(r.squareGradient)}<br>g′_sq = ${n(v.generator)} − 0.2 × ${n(r.squareGradient)} = ${n(r.squareGenerator)}</code><p>${t.squareMeaning}</p></li>`,
    `<li><b>${t.compare}</b><code>G′(1) = ${n(r.nextGenerator)}<br>D′(G′(1)) = ${n(r.updatedFakeScore)}<br>L_G,new = −log(${n(r.updatedFakeScore)}) = ${n(r.nextGLoss)}<br>D′(G′_sq(1)) = ${n(r.squareScore)}<br>L_G,sq,new = (${n(r.squareScore)} − 1)² = ${n(r.nextSquareLoss)}</code><p>${t.compareMeaning}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
