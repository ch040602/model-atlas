// An adjustable illustrative probability table, not a trained model or GPT-2 output.
const probabilities = {
  start: {A:0.8, B:0.05, C:0.05, EOS:0.1},
  afterA: {A:0.05, B:0.35, C:0.55, EOS:0.05},
  afterAB: {A:0.05, B:0.03, C:0.02, EOS:0.9},
  afterAC: {A:0.05, B:0.05, C:0.1, EOS:0.8}
};

export function tokenSequenceExperiment(choice, targetProbability=0.35) {
  if (choice !== 'B' && choice !== 'C') throw new Error('Expected B or C');
  if (!Number.isFinite(targetProbability) || targetProbability <= 0 || targetProbability > 1) throw new RangeError('Expected target probability in (0, 1]');
  // Preserve the relative proportions of A, C and EOS when B changes.
  const scale = (1-targetProbability)/(1-probabilities.afterA.B);
  const afterA = {A:probabilities.afterA.A*scale, B:targetProbability, C:probabilities.afterA.C*scale, EOS:probabilities.afterA.EOS*scale};
  const targets = [probabilities.start.A, afterA.B, probabilities.afterAB.EOS];
  const losses = targets.map(p => -Math.log(p));
  const meanLoss = losses.reduce((a,b)=>a+b,0)/losses.length;
  const ending = choice === 'B' ? probabilities.afterAB : probabilities.afterAC;
  return {targets, losses, meanLoss, sequenceProbability:targets.reduce((a,b)=>a*b,1),
    perplexity:Math.exp(meanLoss), afterA, chosenProbability:afterA[choice], endProbability:ending.EOS};
}

const words = {
  ko: {
    title:'정답으로 학습하고, 예측을 이어 생성하기',
    intro:'같은 다음 토큰 모델이라도 학습과 생성에 사용하는 앞 문맥은 다를 수 있습니다. 세 단계를 펼쳐 비교하세요.',
    fixed:'설명용 확률표에서 한 확률을 직접 바꾸는 예제입니다. A·B·C는 토큰, BOS는 시작 표식, EOS는 종료 표식입니다. GPT-2의 실제 토큰이나 확률이 아니며 모델을 학습하지 않습니다.',
    probability:'정답 B의 확률 P(B | BOS, A)', probabilityText:'B의 확률을 직접 바꾸면 나머지 A·C·EOS 확률은 기존 비율을 유지하며 합이 1이 되도록 바뀝니다. 이는 가상 확률표를 직접 바꾸는 것이지 가중치 학습이 아닙니다.',
    ppl:'같은 세 정답의 평균 손실을 지수함수로 바꾸면 토큰당 퍼플렉시티가 됩니다. 여기서는 EOS도 한 토큰으로 셉니다. 낮을수록 이 고정 정답에 더 높은 확률을 준 것이지만, 단일 예제의 점수는 일반화나 생성 품질을 보장하지 않습니다. 비교할 때는 같은 데이터, 토큰화, EOS 포함 여부와 문맥 조건을 사용해야 합니다.', probabilityLabel:'다음 토큰 전체 확률', pplReference:'퍼플렉시티 계산 안내 ↗',
    choice:'생성 중 두 번째 토큰을 직접 선택', b:'B 선택', c:'C 선택', previous:'이전 단계', next:'다음 단계', reset:'처음부터',
    one:'1. 학습: 입력과 다음 정답을 한 칸씩 맞추기',
    oneText:'정답 시퀀스가 A, B, EOS라고 합시다. 각 위치는 앞에 있는 정답 토큰까지만 보고 다음 정답을 예측합니다. 이를 정답을 입력에 사용하는 teacher forcing이라고 합니다. 인과 마스크를 사용하면 미래 정답을 볼 수 없습니다. 표는 각 문맥을 따로 보여 주지만 Transformer는 마스크를 적용해 여러 위치를 한 번에 계산할 수 있습니다.',
    position:'위치', context:'모델에 주는 앞 문맥', target:'다음 정답',
    two:'2. 학습: 정답의 확률로 손실 계산',
    twoText:'출력 확률에서 해당 위치의 정답 확률만 골라 −log를 취하고 세 위치를 평균합니다. 실제 학습은 손실이 작아지도록 가중치를 업데이트하지만, 이 예제는 가중치를 갱신하지 않습니다.',
    three:'3. 생성: 고른 토큰을 다음 입력에 붙이기',
    threeText:'먼저 시작 표식에서 A를 고릅니다. 아래 표는 다음 토큰의 전체 확률입니다. greedy 방식은 가장 높은 확률을 고르지만, 여기서는 B 또는 C를 직접 선택해 다음 문맥의 차이를 확인합니다. 선택은 무작위 샘플링이 아닙니다.',
    ending:'EOS를 고르면 생성을 멈춥니다. B를 골랐을 때와 C를 골랐을 때 마지막 확률이 다른 이유는 앞 문맥이 달라졌기 때문입니다. 학습의 세 번째 위치는 정답 B를, 생성은 실제로 선택한 토큰을 사용합니다.',
    result:'생성 결과', round:'자연로그를 사용하고 결과만 소수 셋째 자리로 반올림합니다. 실제 언어 모델은 더 많은 토큰과 문맥을 사용합니다. 원본 Transformer Explainer는 생성 과정을 보여 주며 이 확률표나 학습 손실과 연결되어 있지 않습니다.'
  },
  en: {
    title:'Train on targets, generate from predictions',
    intro:'The same next-token model can receive different preceding context during training and generation. Reveal the three steps to compare them.',
    fixed:'This toy example lets you adjust one entry of an illustrative probability table. A, B and C are tokens; BOS marks the start and EOS the end. These are not GPT-2 tokens or probabilities, and this exercise does not train a model.',
    probability:'Target B probability P(B | BOS, A)', probabilityText:'Changing B directly rescales A, C and EOS in their original proportions so all four probabilities sum to 1. This changes a toy probability table, not learned weights.',
    ppl:'Exponentiating the mean loss for these same targets gives token-level perplexity. Here EOS counts as one token. A lower value assigns greater probability to this fixed target sequence, but a single example does not establish generalization or generation quality. Comparisons require the same data, tokenization, EOS convention and context.', probabilityLabel:'Full next-token probabilities', pplReference:'Perplexity guide ↗',
    choice:'Manually choose the second generated token', b:'Choose B', c:'Choose C', previous:'Previous step', next:'Next step', reset:'Start over',
    one:'1. Training: align inputs with next targets',
    oneText:'Suppose the target sequence is A, B, EOS. Each position sees only the preceding target tokens and predicts the next target. Feeding the ground truth as input is called teacher forcing. A causal mask prevents looking at future targets. The table shows the contexts separately, but a Transformer can compute multiple positions together with the mask.',
    position:'Position', context:'Preceding context', target:'Next target',
    two:'2. Training: calculate loss from target probabilities',
    twoText:'Select the probability of the target at each position, take −log, and average the three terms. Training updates weights to reduce the loss; this exercise does not update weights.',
    three:'3. Generation: append the selected token',
    threeText:'First choose A after the start marker. The next-token distribution is shown below. Greedy decoding chooses the most probable token; here choose B or C yourself to compare the resulting contexts. This manual choice is not random sampling.',
    ending:'Selecting EOS stops generation. Its probability differs after B and C because the preceding context differs. Training uses the ground-truth B at the third position; generation uses the token actually chosen.',
    result:'Generated sequence', round:'Natural logarithms are used; only the displayed result is rounded to three decimal places. Real language models use more tokens and longer contexts. The original Transformer Explainer shows generation and is not connected to this probability table or training loss.'
  }
};
const n = x => x.toFixed(3);

export function tokenSequenceMarkup(choice,lang,targetProbability=0.35) {
  const t=words[lang];
  return `<section class="sequence-lab token-sequence-lab" aria-labelledby="token-sequence-title"><div class="eyebrow">TRANSFORMER / NEXT TOKEN</div><h2 id="token-sequence-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-control"><label for="token-target-probability">${t.probability} <output id="token-target-value">${n(targetProbability)}</output></label><input id="token-target-probability" data-token-target-probability type="range" min="0.05" max="0.8" step="0.05" value="${targetProbability}"></div><p>${t.probabilityText}</p><fieldset class="token-choice"><legend>${t.choice}</legend><label><input type="radio" name="token-choice" data-token-choice value="B" ${choice==='B'?'checked':''}> ${t.b}</label><label><input type="radio" name="token-choice" data-token-choice value="C" ${choice==='C'?'checked':''}> ${t.c}</label></fieldset><div id="token-sequence-output" aria-live="polite"></div><div class="sequence-actions"><span id="token-sequence-status"></span><button type="button" data-token-sequence-action="previous">${t.previous}</button><button type="button" data-token-sequence-action="next">${t.next} →</button><button type="button" data-token-sequence-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://huggingface.co/docs/transformers/perplexity" target="_blank" rel="noopener noreferrer">${t.pplReference}</a></p></section>`;
}

export function tokenSequenceOutput(choice,lang,stage,targetProbability=0.35) {
  const t=words[lang], r=tokenSequenceExperiment(choice,targetProbability);
  const rows=[['1','BOS','A'],['2','BOS, A','B'],['3','BOS, A, B','EOS']].map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('');
  const steps=[
    `<li><b>${t.one}</b><p>${t.oneText}</p><div class="training-history"><table><thead><tr><th scope="col">${t.position}</th><th scope="col">${t.context}</th><th scope="col">${t.target}</th></tr></thead><tbody>${rows}</tbody></table></div></li>`,
    `<li><b>${t.two}</b><p>${t.twoText}</p><code>−log P(A | BOS) = −log ${n(r.targets[0])} = ${n(r.losses[0])}<br>−log P(B | BOS, A) = −log ${n(r.targets[1])} = ${n(r.losses[1])}<br>−log P(EOS | BOS, A, B) = −log ${n(r.targets[2])} = ${n(r.losses[2])}<br>L = (${n(r.losses[0])} + ${n(r.losses[1])} + ${n(r.losses[2])}) / 3 = <strong data-token-mean-loss>${n(r.meanLoss)}</strong><br>P(A, B, EOS | BOS) = ${n(r.targets[0])} × ${n(r.targets[1])} × ${n(r.targets[2])} = <strong data-token-sequence-probability>${n(r.sequenceProbability)}</strong><br>PPL = exp(L) = exp(${n(r.meanLoss)}) = <strong data-token-perplexity>${n(r.perplexity)}</strong></code><p>${t.ppl}</p></li>`,
    `<li><b>${t.three}</b><p>${t.threeText}</p><p>${t.probabilityLabel}: <span data-token-distribution>${Object.entries(r.afterA).map(([token,p])=>`${token} ${n(p)}`).join(' · ')}</span></p><code>P(A | BOS) = 0.800 → A<br>P(${choice} | BOS, A) = ${n(r.chosenProbability)} → ${choice}<br>P(EOS | BOS, A, ${choice}) = ${n(r.endProbability)} → EOS<br>${t.result}: A → ${choice} → EOS</code><p>${t.ending}</p></li>`
  ];
  return `<ol class="sequence-steps">${steps.slice(0,stage).join('')}</ol>`;
}
