import {formulaDetailMarkup} from './formula-details.js';
import {practiceReasoning} from './practice-reasoning.js';
// One scalar coordinate: a training example followed by one deterministic
// DDIM-style sampling steps. The displayed model predictions are user-supplied.
export function diffusionExperiment(clean, noise, prediction, unconditional=prediction, guidance=1) {
  const alphaT = 0.25;
  const alphaS = 0.81;
  const noisy = Math.sqrt(alphaT) * clean + Math.sqrt(1-alphaT) * noise;
  const loss = (noise - prediction) ** 2;
  const guided = unconditional + guidance * (prediction - unconditional);
  const estimatedClean = (noisy - Math.sqrt(1-alphaT) * guided) / Math.sqrt(alphaT);
  const previous = Math.sqrt(alphaS) * estimatedClean + Math.sqrt(1-alphaS) * guided;
  return { alphaT, alphaS, noisy, loss, guided, estimatedClean, previous };
}

// Illustrative denoiser for a single example: fixed baseline prediction plus
// one trainable scalar weight times x_t. The weight starts at zero each time.
export function diffusionTrainingStep(noisy, noise, baseline, rate=0.1) {
  const gradient = 2 * (baseline - noise) * noisy;
  const nextWeight = -rate * gradient;
  const nextPrediction = baseline + nextWeight * noisy;
  return { gradient, nextWeight, nextPrediction, nextLoss:(noise-nextPrediction)**2, rate };
}

// Continue from x_s using a new, externally supplied guided prediction.
export function diffusionSecondStep(previous, prediction) {
  const alphaS=0.81, alphaR=0.96;
  const estimatedClean=(previous-Math.sqrt(1-alphaS)*prediction)/Math.sqrt(alphaS);
  const next=Math.sqrt(alphaR)*estimatedClean+Math.sqrt(1-alphaR)*prediction;
  return {alphaS,alphaR,estimatedClean,next};
}

const n = value => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
const copy = {
  ko: {
    title:'노이즈 예측에서 생성의 한 단계까지',
    intro:'이미지 전체가 아닌 값 하나를 따라갑니다. 먼저 정답을 아는 학습 예제로 노이즈를 섞고, 같은 값을 사용해 생성 시 계산을 연습합니다.',
    fixed:'ᾱₜ = 0.25, 이전 단계 ᾱₛ = 0.81 (s < t). 이 숫자는 설명을 위한 스케줄입니다. 예측값은 직접 지정하며, 가중치 갱신은 한 예제의 축소 계산입니다. 실제 모델 학습이나 이미지 생성은 수행하지 않습니다.',
    clean:'원본 값 x₀', noise:'실제 노이즈 ε', prediction:'조건부 예측 εcond', unconditional:'무조건 예측 εuncond', guidance:'가이던스 강도 g', nextPrediction:'다음 단계의 조합된 예측 εₛ', next:'다음 단계', previous:'이전 단계', reset:'처음부터',
    forward:'1. 학습 예제에 노이즈 섞기', forwardMeaning:'xₜ는 원본과 노이즈가 섞인 값입니다. 학습 예제에서는 어떤 노이즈를 넣었는지 알고 있습니다.',
    loss:'2. 학습 때 예측 오차 측정', lossMeaning:'이 조건부 학습 예제의 한 좌표에 대한 제곱 오차입니다. 실제 학습은 여러 좌표와 샘플을 사용하며 조건을 생략한 예제도 학습할 수 있습니다. 생성할 때는 실제 노이즈를 모르므로 이 손실을 계산하지 않습니다.',
    train:'3. 예측 가중치 한 번 갱신', trainMeaning:'설명을 위해 예측을 고정된 기준값 εcond와 학습 가능한 스칼라 w×xₜ의 합으로 둡니다. 처음 w=0, 학습률은 0.1입니다. 이 학습 예제에서 손실의 기울기로 w를 갱신하고 같은 예제의 손실을 다시 계산합니다. 실제 확산 모델은 신경망의 많은 파라미터를 여러 예제로 학습합니다.',
    guide:'4. 생성 때 조건의 영향 조절', guideMeaning:'다음은 별도의 생성 계산 예시이며, 위 갱신 결과 대신 슬라이더의 원래 예측값을 사용합니다. 같은 xₜ에서 조건 없이 예측한 값과 텍스트 조건으로 예측한 값을 조합합니다. g=0이면 무조건 예측, g=1이면 조건부 예측이며, g>1이면 조건의 차이를 더 강조합니다. 이것은 생성 중의 조합이지 위 학습 손실을 바꾸는 연산이 아닙니다.',
    estimate:'5. 생성 때 원본 추정', estimateMeaning:'생성에서는 xₜ와 조합한 예측만 사용합니다. 위의 원본과 실제 노이즈는 이 교육용 예제의 비교를 위해서만 알고 있습니다. 예측이 틀리면 추정값도 달라집니다.',
    step:'6. 더 이른 단계 s로 이동', stepMeaning:'새로운 무작위 노이즈를 추가하지 않는 결정적 DDIM 한 단계입니다. xₛ는 최종 이미지가 아니라 다음 모델 입력이며, 다음 단계에서는 새 xₛ에 대한 노이즈를 다시 예측합니다. 스케줄러에 따라 식이 달라집니다.',
    repeat:'7. 새 예측으로 한 단계 더', repeatMeaning:'이제 xₛ를 입력으로 사용합니다. 실제 생성에서는 모델이 xₛ와 시점 s에서 노이즈를 다시 예측하고, 필요하면 조건부·무조건 예측을 조합합니다. 여기서는 그 조합 결과 εₛ를 직접 지정합니다. 이전 εguided와 같을 필요가 없습니다. ᾱᵣ=0.96은 또 다른 예시 스케줄이며 r<s입니다. xᵣ도 아직 최종 이미지가 아닙니다.',
    rounding:'계산은 전체 정밀도로 수행하고 화면에는 소수 셋째 자리까지 표시합니다.', ref:'DDIM 원 논문, 식 (12) ↗', guideRef:'Classifier-free guidance 원 논문 ↗'
  },
  en: {
    title:'From noise prediction to one generation step',
    intro:'Follow one coordinate rather than an entire image. First corrupt a known training example, then use the same value to practice a sampling calculation.',
    fixed:'ᾱₜ = 0.25 and earlier ᾱₛ = 0.81 (s < t). This schedule is illustrative. You provide the predictions; the weight update is a one-example toy calculation. No real model is trained and no image is generated here.',
    clean:'Clean value x₀', noise:'Actual noise ε', prediction:'Conditioned prediction εcond', unconditional:'Unconditioned prediction εuncond', guidance:'Guidance scale g', nextPrediction:'Next step’s guided prediction εₛ', next:'Next step', previous:'Previous step', reset:'Start over',
    forward:'1. Add noise to a training example', forwardMeaning:'xₜ mixes the clean value and noise. In a training example, the added noise is known.',
    loss:'2. Measure prediction error during training', lossMeaning:'This is squared error for one coordinate of a conditioned training example. Real training uses many coordinates and examples and may also train with conditioning dropped. During generation the actual noise is unknown, so this loss is unavailable.',
    train:'3. Update a prediction weight once', trainMeaning:'For illustration, the prediction is a fixed baseline εcond plus a trainable scalar w times xₜ. Start with w=0 and learning rate 0.1. Use this training example’s loss gradient to update w, then recalculate loss on the same example. Real diffusion models train many neural-network parameters on many examples.',
    guide:'4. Adjust conditioning during generation', guideMeaning:'This is a separate sampling illustration using the original slider predictions, not the updated prediction above. Combine predictions for the same xₜ, one without conditioning and one with the text condition. At g=0 the result is unconditioned; at g=1 it is conditioned; g>1 emphasizes their difference. This generation-time combination does not change the training loss above.',
    estimate:'5. Estimate the clean value during generation', estimateMeaning:'Generation uses xₜ and the combined prediction. The clean value and actual noise above are known only for comparison in this exercise. An inaccurate prediction changes the estimate.',
    step:'6. Move to the earlier step s', stepMeaning:'This is one deterministic DDIM step without added random noise. xₛ is the next model input, not the final image. At the next step the model predicts noise again from the new xₛ. Other schedulers use different equations.',
    repeat:'7. Take another step with a new prediction', repeatMeaning:'Now use xₛ as the input. In real sampling the model predicts noise again from xₛ and time s; conditioned and unconditioned predictions can then be combined if needed. Here you supply that combined result εₛ. It need not equal the previous εguided. ᾱᵣ=0.96 is another illustrative schedule value with r<s. xᵣ is not yet the final image.',
    rounding:'Calculations use full precision; displayed values are rounded to three decimals.', ref:'Original DDIM paper, equation (12) ↗', guideRef:'Original classifier-free guidance paper ↗'
  }
};

export function diffusionMarkup(values, lang) {
  const t = copy[lang];
  const fields = [['clean',-2,2,0.1],['noise',-2,2,0.1],['prediction',-2,2,0.1],['unconditional',-2,2,0.1],['guidance',0,5,0.1],['nextPrediction',-2,2,0.1]];
  const controls = fields.map(([key,min,max,step])=>{const value=values[key] ?? values.prediction;return `<div class="sequence-control"><label for="diff-${key}">${t[key]} <output id="diff-value-${key}">${n(value)}</output></label><input id="diff-${key}" data-diff-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;}).join('');
  return `<section class="sequence-lab diffusion-lab" aria-labelledby="diff-title"><div class="eyebrow">DIFFUSION / TRAINING AND SAMPLING</div><h2 id="diff-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${controls}</div>${formulaDetailMarkup(['denoise','descent'],lang)}<div id="diff-output" aria-live="polite"></div><div class="sequence-actions"><span id="diff-status"></span><button type="button" data-diff-action="previous">${t.previous}</button><button type="button" data-diff-action="next">${t.next} →</button><button type="button" data-diff-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.rounding}</p><p><a href="https://arxiv.org/html/2010.02502#S4.E12" target="_blank" rel="noopener noreferrer">${t.ref}</a> · <a href="https://arxiv.org/abs/2207.12598" target="_blank" rel="noopener noreferrer">${t.guideRef}</a></p></section>`;
}

export function diffusionOutput(values, lang, stage) {
  const t=copy[lang], uncond=values.unconditional ?? values.prediction, guidance=values.guidance ?? 1;
  const r=diffusionExperiment(values.clean,values.noise,values.prediction,uncond,guidance);
  const train=diffusionTrainingStep(r.noisy,values.noise,values.prediction);
  const nextPrediction=values.nextPrediction ?? values.prediction;
  const second=diffusionSecondStep(r.previous,nextPrediction);
  const steps=[
    `<li><b>${t.forward}</b><code>xₜ = √ᾱₜ x₀ + √(1 − ᾱₜ) ε<br>= √0.25 × ${n(values.clean)} + √0.75 × ${n(values.noise)} = ${n(r.noisy)}</code><p>${t.forwardMeaning}</p></li>`,
    `<li><b>${t.loss}</b><code>L = (ε − εcond)² = (${n(values.noise)} − ${n(values.prediction)})² = ${n(r.loss)}</code><p>${t.lossMeaning}</p></li>`,
    `<li><b>${t.train}</b><p>${t.trainMeaning}</p><code>εθ(w) = εcond + w × xₜ; w = 0<br>∂L/∂w = 2(εcond − ε) × xₜ<br>= 2 × (${n(values.prediction)} − ${n(values.noise)}) × ${n(r.noisy)} = ${n(train.gradient)}<br>w_new = 0 − ${n(train.rate)} × ${n(train.gradient)} = ${n(train.nextWeight)}<br>εθ(w_new) = ${n(values.prediction)} + ${n(train.nextWeight)} × ${n(r.noisy)} = ${n(train.nextPrediction)}<br>L_new = (${n(values.noise)} − ${n(train.nextPrediction)})² = ${n(train.nextLoss)}</code></li>`,
    `<li><b>${t.guide}</b><code>εguided = εuncond + g(εcond − εuncond)<br>= ${n(uncond)} + ${n(guidance)} × (${n(values.prediction)} − ${n(uncond)}) = ${n(r.guided)}</code><p>${t.guideMeaning}</p></li>`,
    `<li><b>${t.estimate}</b><code>x̂₀ = (xₜ − √(1 − ᾱₜ) εguided) / √ᾱₜ<br>= (${n(r.noisy)} − √0.75 × ${n(r.guided)}) / √0.25 = ${n(r.estimatedClean)}</code><p>${t.estimateMeaning}</p></li>`,
    `<li><b>${t.step}</b><code>xₛ = √ᾱₛ x̂₀ + √(1 − ᾱₛ) εguided<br>= √0.81 × ${n(r.estimatedClean)} + √0.19 × ${n(r.guided)} = ${n(r.previous)}</code><p>${t.stepMeaning}</p></li>`,
    `<li><b>${t.repeat}</b><p>${t.repeatMeaning}</p><code>x̂₀(s) = (xₛ − √(1 − ᾱₛ) εₛ) / √ᾱₛ<br>= (${n(r.previous)} − √0.19 × ${n(nextPrediction)}) / √0.81 = ${n(second.estimatedClean)}<br>xᵣ = √ᾱᵣ x̂₀(s) + √(1 − ᾱᵣ) εₛ<br>= √0.96 × ${n(second.estimatedClean)} + √0.04 × ${n(nextPrediction)} = ${n(second.next)}</code></li>`
  ];
  const notes=[
    [[`원본 기여는 ${n(0.5*values.clean)}, 노이즈 기여는 ${n(Math.sqrt(0.75)*values.noise)}입니다. 이 둘을 더해 xₜ=${n(r.noisy)}입니다. √0.25와 √0.75를 쓰는 것은 분산 비율을 계수의 제곱으로 정하기 때문이며 두 계수 자체의 합을 1로 맞추는 평균이 아닙니다.`,`Clean contribution ${n(0.5*values.clean)} plus noise contribution ${n(Math.sqrt(0.75)*values.noise)} gives xₜ=${n(r.noisy)}. The coefficients encode variance through their squares; their sum need not be 1 as in an average.`],['원본만 1 늘리면 xₜ는 얼마나 변할까요?','How much does xₜ change if only the clean value increases by 1?'],['원본 계수가 √0.25=0.5이므로 0.5 늘어납니다. 실제 노이즈를 바꾸지 않아도 xₜ는 달라집니다.','It rises by 0.5 because the clean coefficient is √0.25. Noise stays unchanged.']],
    [[`정답 노이즈 ${n(values.noise)}와 예측 ${n(values.prediction)}의 차이를 제곱해 ${n(r.loss)}입니다. 원본 픽셀과 비교하는 손실이 아닙니다. 예측이 같으면 0이며 부호가 다른 오차도 제곱 후에는 양수입니다.`,`Squaring the gap between true noise ${n(values.noise)} and prediction ${n(values.prediction)} gives ${n(r.loss)}. This compares noises, not clean pixels. Matching predictions give zero; opposite error signs both produce positive loss.`],['조건부 예측을 실제 노이즈와 같게 맞춰 보세요.','Match the conditioned prediction to the actual noise.'],['손실이 0이 됩니다. 이 설정은 정답을 아는 학습 예제에서만 직접 맞출 수 있습니다.','Loss becomes zero. Directly matching the known noise is possible here because this is a training example.']],
    [[`예측에 w가 영향을 주는 비율은 xₜ=${n(r.noisy)}입니다. 그래서 예측 오차의 미분 2(예측−정답)에 xₜ를 곱한 ${n(train.gradient)}가 가중치 기울기입니다. 갱신 후 같은 입력으로 다시 평가한 손실은 ${n(train.nextLoss)}입니다.`,`The prediction responds to w with rate xₜ=${n(r.noisy)}. Multiplying this by 2(prediction−target) gives weight gradient ${n(train.gradient)}. Re-evaluating the same input after the update gives loss ${n(train.nextLoss)}.`],['원본과 노이즈를 모두 0으로 두고 예측만 1로 두면 학습되나요?','Set clean and noise to zero, but prediction to 1. Can this weight learn?'],['xₜ=0이므로 w×xₜ는 항상 0이고 기울기도 0입니다. 오차가 있어도 이 한 가중치로 예측을 바꿀 수 없습니다.','xₜ=0 makes w×xₜ and its derivative zero. Error remains, but this single weight cannot change the prediction.']],
    [[`조건부−무조건부 차이는 ${n(values.prediction-uncond)}입니다. 여기에 g=${n(guidance)}를 곱해 무조건부 예측 ${n(uncond)}에 더하니 ${n(r.guided)}입니다. g는 노이즈를 무조건 줄이는 비율이 아니라 조건이 만든 차이를 강조하는 계수입니다.`,`The conditioned–unconditioned gap is ${n(values.prediction-uncond)}. Multiply by g=${n(guidance)} and add baseline ${n(uncond)} to get ${n(r.guided)}. Guidance scales the conditioning difference, not an unconditional reduction of noise.`],['조건부와 무조건부 예측을 같게 한 뒤 g를 바꿔 보세요.','Match both predictions, then change g.'],['차이가 0이라 g를 바꿔도 조합 결과는 같습니다. 두 예측이 다를 때만 가이던스가 이 숫자를 바꿉니다.','Their difference is zero, so guidance cannot change the combined prediction.']],
    [[`현재 xₜ에서 예측한 노이즈 기여 ${n(Math.sqrt(0.75)*r.guided)}를 빼고 0.5로 나눠 ${n(r.estimatedClean)}입니다. 노이즈 예측 오차는 −√3배로 전달되어 원본 추정 오차를 만듭니다.`,`Subtract predicted noise contribution ${n(Math.sqrt(0.75)*r.guided)} from xₜ and divide by 0.5 to obtain ${n(r.estimatedClean)}. Noise-prediction error becomes clean-estimation error multiplied by −√3.`],['g=1로 두고 조건부 예측을 실제 노이즈와 같게 해 보세요.','Set g=1 and match the conditioned prediction to true noise.'],['추정 원본은 주어진 원본과 같습니다. 이는 섞었던 항을 정확히 빼고 원본 계수로 나누었기 때문입니다.','The clean estimate matches the supplied clean value: the exact noise term is removed and the clean coefficient divided out.']],
    [[`원본 추정에 붙는 계수는 0.5→0.9로 커지고 노이즈 계수는 약 0.866→0.436으로 작아집니다. 이를 다시 섞은 xₛ=${n(r.previous)}가 다음 모델 입력입니다. xₛ가 원본에 가까운지는 예측의 정확도에도 달려 있습니다.`,`The clean coefficient rises from 0.5 to 0.9 and the noise coefficient falls from about 0.866 to 0.436. Their remix xₛ=${n(r.previous)} is the next input. Whether it is closer to the clean value also depends on prediction accuracy.`],['예측이 정확해도 xₛ가 곧바로 x₀가 될까요?','Does an exact noise prediction make xₛ equal x₀ immediately?'],['아니요. ᾱₛ=0.81에서는 노이즈 계수가 아직 0이 아닙니다. 노이즈가 더 적은 중간 시점으로 이동한 것입니다.','No. At ᾱₛ=0.81 the noise coefficient is still nonzero; this is an intermediate, less noisy time.']],
    [[`새 입력 ${n(r.previous)}에 새 예측 ${n(nextPrediction)}을 적용해 원본을 다시 ${n(second.estimatedClean)}로 추정합니다. 이제 계수를 √0.96과 √0.04로 바꾸어 ${n(second.next)}을 얻습니다. 이전 추정값을 고정 복사하는 과정이 아닙니다.`,`New prediction ${n(nextPrediction)} on new input ${n(r.previous)} re-estimates clean content as ${n(second.estimatedClean)}. Remixing with √0.96 and √0.04 gives ${n(second.next)}. The old estimate is not simply copied.`],['다음 단계 예측만 바꾸면 앞의 xₛ도 바뀔까요?','Does changing only the next prediction change the earlier xₛ?'],['아니요. 앞의 xₛ는 유지되고 두 번째 원본 추정과 xᵣ만 바뀝니다. 각 예측이 쓰이는 시점을 구별하세요.','No. xₛ stays fixed; only the second clean estimate and xᵣ change. Each prediction belongs to its own time.']]
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).map((html,i)=>html.replace('</li>',practiceReasoning(...notes[i],lang)+'</li>')).join('')}</ol>`;
}
