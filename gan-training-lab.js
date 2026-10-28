import {formulaDetailMarkup} from './formula-details.js';
import {practiceReasoning} from './practice-reasoning.js';
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
  const notes=[
   [[`시그모이드는 로짓을 0과 1 사이로 바꿉니다. 현재 진짜 점수 ${n(r.dReal)}와 가짜 점수 ${n(r.dFake)}는 D가 내는 평가입니다. 생성자는 z=1을 ${n(r.fake)}로 옮겼으며 이 숫자 자체가 진짜일 확률은 아닙니다.`,`Sigmoid maps logits into (0,1). Real score ${n(r.dReal)} and fake score ${n(r.dFake)} are D’s assessments. G maps z=1 to ${n(r.fake)}, which is a sample value, not a probability.`],['판별자 w와 b를 모두 0으로 두면 두 점수는 어떻게 될까요?','What are both scores if D’s w and b are zero?'],['두 로짓이 0이고 σ(0)=0.5라서 진짜·가짜 모두 0.5입니다. 이 상태의 판별자는 두 입력을 구분하지 못합니다.','Both logits are zero and σ(0)=0.5. D cannot distinguish the inputs in this state.']],
   [[`진짜는 정답 1이라 −log(${n(r.dReal)}), 가짜는 정답 0이라 −log(1−${n(r.dFake)})를 더합니다. 첫 항은 진짜 점수를 높일 때, 둘째는 가짜 점수를 낮출 때 작아집니다.`,`The real label is 1, giving −log(${n(r.dReal)}). The fake label is 0, giving −log(1−${n(r.dFake)}). Raising the real score reduces the first term; lowering the fake score reduces the second.`],['진짜와 가짜 값이 같으면 D가 둘을 완벽히 구분할 수 있을까요?','Can D perfectly separate identical real and fake inputs?'],['같은 입력에는 같은 점수를 내므로 불가능합니다. 두 정답을 동시에 만족할 수 없으며 이 한 쌍의 균형 점수는 0.5입니다.','No. Identical inputs receive identical scores. Conflicting labels cannot both be satisfied; the balanced score for this pair is 0.5.']],
   [[`진짜 경로는 (D_real−1)×x, 가짜 경로는 D_fake×가짜값을 기여합니다. 두 사용처가 같은 w를 공유해서 더한 기울기가 ${n(r.dWeightGradient)}입니다. g는 ${n(v.generator)}로 고정한 채 D의 w·b만 바꿉니다.`,`The real path contributes (D_real−1)×x; the fake path contributes D_fake×fake. Sharing w requires adding them, yielding ${n(r.dWeightGradient)}. g stays ${n(v.generator)} while only D’s w/b change.`],['진짜와 가짜가 같은 값이고 D가 0.5씩 출력하면 기울기는 어떻게 될까요?','If real and fake inputs match and both scores are 0.5, what happens to the gradient?'],['두 경로의 w 기여가 상쇄되고 b 기여도 −0.5+0.5=0입니다. 한쪽 손실 항만 보고 갱신 방향을 정하면 안 되는 이유입니다.','The two weight contributions cancel; bias contributions also sum to −0.5+0.5=0. Both loss terms are needed to determine an update.']],
   [[`갱신된 D의 가짜 점수는 ${n(r.nextDFake)}, 기울기에 곱할 w′는 ${n(r.nextWeight)}입니다. 따라서 (D′−1)w′=${n(r.gGradient)}가 됩니다. ${r.gGradient<0?'기울기가 음수라 g를 늘립니다.':r.gGradient>0?'기울기가 양수라 g를 줄입니다.':'기울기가 0이라 g는 그대로입니다.'} D를 고정해도 입력에 대한 반응도를 계산해야 이 방향을 알 수 있습니다.`,`Updated D gives fake score ${n(r.nextDFake)} with w′=${n(r.nextWeight)}, so (D′−1)w′=${n(r.gGradient)}. ${r.gGradient<0?'A negative gradient increases g.':r.gGradient>0?'A positive gradient decreases g.':'A zero gradient leaves g unchanged.'} Freezing D still requires its input sensitivity to find this direction.`],['같은 D에서 w′의 부호가 반대라면 g의 이동 방향은 같을까요?','At the same D score, does reversing the sign of w′ preserve g’s direction?'],['아니요. D′−1은 음수지만 곱하는 w′의 부호에 따라 전체 기울기가 바뀝니다. 판별자의 진짜 점수가 올라가는 입력 방향이 달라집니다.','No. D′−1 is negative, but w′ determines the product’s sign and hence which input direction raises D’s real score.']],
   [[`한 번 바꾼 가짜값 ${n(r.nextGenerator)}을 같은 D에 다시 넣어 점수 ${n(r.updatedFakeScore)}, 생성자 손실 ${n(r.nextGLoss)}를 얻습니다. 비교한 것은 D를 그대로 둔 한 샘플의 개선입니다. D까지 다시 학습하면 생성자의 목표도 움직입니다.`,`Re-evaluating fake value ${n(r.nextGenerator)} with the same D gives score ${n(r.updatedFakeScore)} and G loss ${n(r.nextGLoss)}. This compares one sample under a fixed D. Retraining D moves G’s objective again.`],['생성자 손실이 줄면 모든 데이터 모드를 잘 생성한다는 뜻일까요?','Does lower generator loss establish coverage of all data modes?'],['아니요. 같은 점만 반복해도 이 한 샘플의 점수는 높아질 수 있습니다. 원본 실습의 분포와 다양성도 함께 확인해야 합니다.','No. Repeating one point can raise this score while missing other modes. Inspect the distribution and diversity in the original lab too.']]
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).map((html,i)=>html.replace('</li>',practiceReasoning(...notes[i],lang)+'</li>')).join('')}</ol>`;
}
