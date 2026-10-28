import {formulaWalkthrough,formulaDefaults,num,vec,scaleComparison} from './formula-model.js';
import {stepTex,summaryTex,textMath} from './formula-tex.js';
import {mathMarkup} from './math-render.js';
import {conceptChips,conceptsForStep,decorateMathConcepts} from './concept-help.js';
import {formulaDetailMarkup,detailsForStep} from './formula-details.js';

const labels={
 ko:{title:'수식을 한 연산씩 끝까지 따라가기',intro:'이전 결과를 다음 식에 넣으며 계산합니다. 각 단계의 기호·대입·결과·역할을 읽고 다음으로 넘어가세요. 오른쪽 계산 연결 목록에 지금까지의 식이 계속 쌓입니다. 작은 화면에서는 본문 앞의 목록을 확인하세요. 긴 수식은 수식 영역 안을 좌우로 움직여 읽으세요.',select:'연산 바로 고르기',previous:'이전 연산',next:'다음 연산',reset:'처음',input:'이전 단계에서 가져온 값',first:'모델의 입력과 가정을 먼저 정합니다.',symbols:'이 식의 기호와 연산',equation:'이번에 계산할 식',substitution:'현재 값 대입',result:'이번 결과',role:'왜 이 연산을 하나요?',expanded:'지금까지 확장한 식',history:'지금까지의 계산 연결',complete:'모델 전체 식 펼쳐 보기',locked:'마지막 단계에서 전체 식을 연결합니다.',full:'현재 수식·값을 새 창에서 전체 보기 ↗',original:'원본의 해당 설명 새 창에서 읽기 ↗',mapping:'원본에서 찾아볼 부분',same:'원본은 더 큰 모델과 별도의 가중치를 사용합니다. 아래 설명은 연산의 대응 관계이며 숫자가 동일하다는 뜻은 아닙니다.',rnnMap:'RNN은 별도 원본 시각화 대신 이 사이트의 시퀀스·출력층·역전파 실습으로 연결됩니다.',rnnLink:'관련 RNN 실습 새 창에서 열기 ↗',scope:'학습 범위와 고정값',scale:'√dₖ 나눗셈의 효과 비교',scaleNote:'비교 전용입니다. 내적 점수 [2,0]을 고정하고 분모만 바꿉니다. 높은 차원 Q·K를 다시 생성한 결과가 아니며, 위 연속 계산(dₖ=1)은 바꾸지 않습니다.',dim:'비교할 키 차원 dₖ',raw:'나누기 전',scaled:'√dₖ로 나눈 후',weight:'softmax 가중치',source:'스케일링의 근거: Attention Is All You Need §3.2.1 ↗',connection:'현재 연산은 구조도의 다음 부분에 들어갑니다',chain:'입력부터 현재 단계까지. 각 항목을 누르면 해당 연산으로 돌아갑니다.',round:'표시는 소수 셋째 자리이며 내부 계산은 반올림 전 값을 사용합니다.'},
 en:{title:'Follow every operation through the formula',intro:'Carry each result into the next equation. Read its symbols, substitution, result and purpose before advancing. The right-hand history keeps the calculations connected; on small screens, find it before the lesson. Scroll wide formulas horizontally inside their own area.',select:'Jump to an operation',previous:'Previous operation',next:'Next operation',reset:'Start',input:'Value carried from the previous step',first:'First establish the model inputs and assumptions.',symbols:'Symbols and operations in this equation',equation:'Equation for this operation',substitution:'Substitute current values',result:'Result of this operation',role:'Why perform this operation?',expanded:'The expression expanded so far',history:'Connected calculations so far',complete:'Expand the full model formula',locked:'Connect the full expression at the final step.',full:'Open current formula and values in a full window ↗',original:'Read the matching original explanation in a new tab ↗',mapping:'Where this appears in the original',same:'The original uses a larger model and separate weights. This maps operations, rather than claiming equal numerical values.',rnnMap:'RNN links to this site’s sequence, output-layer and backpropagation exercises instead of an upstream visualization.',rnnLink:'Open the related RNN exercise in a new tab ↗',scope:'Scope and fixed parameters',scale:'Compare the effect of dividing by √dₖ',scaleNote:'Comparison only: hold dot-product scores [2,0] fixed and change the divisor. These are not regenerated higher-dimensional Q/K vectors. The continuous calculation above remains at dₖ=1.',dim:'Key dimension dₖ for the comparison',raw:'Before division',scaled:'After division by √dₖ',weight:'Softmax weights',source:'Scaling reference: Attention Is All You Need §3.2.1 ↗',connection:'This operation belongs to this part of the architecture',chain:'From input to the current step. Select an item to return to that operation.',round:'Display rounds to three decimals; calculations use unrounded values.'}
};
const groupNames={
 cnn:{ko:['입력','합성곱','ReLU 특징 맵','평균 풀링','분류·손실·학습'],en:['Input','Convolution','ReLU feature map','Average pooling','Classification, loss and training']},
 rnn:{ko:['첫 번째 셀','두 번째 셀','세 번째 셀','출력·손실·학습'],en:['First cell','Second cell','Third cell','Output, loss and training']},
 transformer:{ko:['토큰·입력','첫 정규화','Q·K·V 투영','어텐션','출력 투영·첫 잔차','MLP·두 번째 잔차','최종 정규화·토큰 예측'],en:['Tokens and input','First normalization','Q/K/V projections','Attention','Projection and first residual','MLP and second residual','Final normalization and token prediction']}
};
const scope={
 cnn:{ko:'단일 채널 3×3 입력 → 2×2 필터 → ReLU → 전역 평균 풀링 → 두 클래스 → 정답 A의 손실 → 필터 강도 갱신. 이동 간격 1, 패딩 0입니다. 원본 CNN의 최대 풀링과 이 예제의 평균 풀링을 구분합니다.',en:'One-channel 3×3 input → 2×2 kernel → ReLU → global average pooling → two classes → loss for target A → kernel-strength update. Stride 1, padding 0. Distinguish this average pooling from the original CNN’s max pooling.'},
 rnn:{ko:'스칼라 입력 세 개, h₀=0, Wₓ=1, b=0, 출력층 W_out=1·b_out=0. 마지막 시점의 제곱 오차만 역전파합니다. 아래 실습의 모든 시점 손실 선택과 무관하게 이 여정은 마지막 손실로 고정합니다.',en:'Three scalar inputs, h₀=0, Wₓ=1, b=0, output W_out=1 and b_out=0. Backpropagate only the final squared error. This journey stays on final-time loss independently of the all-time-steps option in the exercise below.'},
 transformer:{ko:'GPT-2 방식의 pre-LN 순방향 축소 모델: 두 위치·두 특성, 두 헤드, 헤드마다 dₖ=dᵥ=1, 블록 1개, MLP 2→2→2, 두 토큰 어휘. ε=0.01, γ·β는 특성과 정규화 사이에 공유합니다. 추론을 가정해 드롭아웃을 생략합니다. 기존 연결 블록 실습의 Y 다음에 최종 LN_f와 출력층을 추가합니다. 전체 Transformer 역전파의 수치 전개는 포함하지 않습니다.',en:'GPT-2-style pre-LN toy forward pass: two positions/features, two heads with dₖ=dᵥ=1, one block, a 2→2→2 MLP, and a two-token vocabulary. ε=0.01; γ/β are shared across features and normalization layers. Dropout is omitted for inference. Extend the existing connected block’s Y with final LN_f and a vocabulary head. This does not numerically expand the full Transformer backward pass.'}
};
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function formulaURL(kind,v,lang,step){
 const q=new URLSearchParams({model:kind,lang,step:String(step)});
 for(const key of Object.keys(formulaDefaults[kind]))q.set(key,String(v[key]??formulaDefaults[kind][key]));
 return `formulas.html?${q}`;
}
export function formulaOriginalURL(kind,lang,anchor,values,step){
 const query=new URLSearchParams({lang});
 if(kind==='transformer')query.set('view','article');
 if(values){
  query.set('atlas-model',kind);query.set('atlas-step',String(step));
  for(const key of Object.keys(formulaDefaults[kind]))query.set(`atlas-${key}`,String(values[key]??formulaDefaults[kind][key]));
 }
 if(kind==='cnn')return `upstream/cnn-explainer/public/?${query}#${anchor||'description'}`;
 if(kind==='transformer')return `upstream/transformer-explainer/build/?${query}#${anchor||'description'}`;
 return `index.html#rnn`;
}
export function formulaMarkup(kind,v,lang,step=0){
 const t=labels[lang],m=formulaWalkthrough(kind,v,lang);
 return `<section class="formula-journey" id="formula-journey" aria-labelledby="formula-title">
  <div class="formula-heading"><div><span class="eyebrow">${kind.toUpperCase()} / FORMULA JOURNEY</span><h3 id="formula-title" tabindex="-1">${t.title}</h3></div><a id="formula-full" target="_blank" rel="noopener noreferrer" href="${escape(formulaURL(kind,v,lang,step))}">${t.full}</a></div>
  <p class="formula-intro">${t.intro}</p>
  <div class="formula-workspace">
   <aside class="formula-explanation" aria-label="${lang==='ko'?'현재 단계 설명':'Current step explanation'}">
    <div class="formula-panel-label">${lang==='ko'?'이 단계 이해하기':'Understand this step'}</div>
    <div id="formula-explanation-output" aria-live="polite"></div>
    <details class="formula-scope"><summary>${t.scope}</summary><p>${scope[kind][lang]}</p></details>
   </aside>
   <div class="formula-equations" aria-label="${lang==='ko'?'단계별 수식 계산':'Step-by-step equations'}">
    <div class="formula-toolbar"><label class="formula-selector" for="formula-select">${t.select}<select id="formula-select" data-formula-select>${m.steps.map((s,i)=>`<option value="${i}" ${i===step?'selected':''}>${String(i+1).padStart(2,'0')} · ${escape(s.title)}</option>`).join('')}</select></label><div class="formula-controls"><button type="button" data-formula-action="previous">← ${t.previous}</button><span id="formula-status" role="status"></span><button type="button" data-formula-action="next">${t.next} →</button><button type="button" data-formula-action="reset">${t.reset}</button></div></div>
    <div id="formula-output" aria-live="polite"></div>
    <details class="formula-history" open><summary>${t.history}</summary><p>${t.chain}</p><ol id="formula-history"></ol></details><div id="formula-complete"></div>
   </div>
  </div><p class="formula-round">${t.round}</p></section>`;
}
export function formulaExplanationContent(kind,v,lang,step){
 const t=labels[lang],m=formulaWalkthrough(kind,v,lang),s=m.steps[step],original=formulaOriginalURL(kind,lang,s.anchor,v,step);
 const symbols=s.symbols.map(([symbol,role])=>`<div><dt>${mathMarkup(symbol==='/'?'\\div':textMath(symbol),{inline:true})}</dt><dd>${symbol==='tanh(z)'?mathMarkup('\\frac{\\exp(z)-\\exp(-z)}{\\exp(z)+\\exp(-z)}'):escape(role)}</dd></div>`).join('');
 return `<div data-explanation-id="${s.id}"><p class="formula-group">${groupNames[kind][lang][s.group]}</p><h4 id="formula-current-title" tabindex="-1">${step+1}. ${escape(s.title)}</h4><h5>${t.role}</h5><p class="formula-role">${escape(s.role)}</p>${formulaDetailMarkup(detailsForStep(kind,s.id),lang,true)}<h5>${t.symbols}</h5><dl class="formula-symbols" aria-label="${t.symbols}">${symbols}</dl><div class="formula-original"><b>${t.mapping}</b><p>${kind==='rnn'?t.rnnMap:t.same}</p><a data-formula-original href="${escape(original)}" target="_blank" rel="noopener noreferrer">${kind==='rnn'?t.rnnLink:t.original}</a>${kind==='transformer'&&s.id==='scale'?`<p><a href="https://arxiv.org/html/1706.03762v7#S3.SS2.SSS1" target="_blank" rel="noopener noreferrer">${t.source}</a></p>`:''}</div></div>`;
}
export function formulaStepContent(kind,v,lang,step){
 const t=labels[lang],m=formulaWalkthrough(kind,v,lang),s=m.steps[step];
 const f=stepTex(kind,s);
 const carry=s.sources.length?`<ul>${s.sources.map(i=>`<li><button type="button" data-formula-jump="${i}">${i+1}. ${escape(m.steps[i].title)}</button>${mathMarkup(textMath(m.steps[i].result),{source:m.steps[i].result})}</li>`).join('')}</ul>`:`<p>${t.first}</p>`;
 return `<div class="formula-active" data-formula-id="${s.id}"><div class="formula-carry"><span>${t.input}</span>${carry}</div><h5>${t.equation}</h5>${mathMarkup(f.equation,{source:s.equation,className:'formula-equation'})}${conceptChips(conceptsForStep(kind,s,f.equation),lang)}<h5>${t.substitution}</h5>${mathMarkup(f.calculation,{source:s.calculation,className:'formula-calculation'})}<div class="formula-result"><span>${t.result}</span><output data-result="${escape(s.result)}">${mathMarkup(f.result,{source:s.result})}</output></div><div class="formula-expanded"><span>${t.expanded}</span>${mathMarkup(f.expanded,{source:s.expanded})}</div>${s.id==='scale'?formulaScaleMarkup(lang):''}</div>`;
}
export function formulaScaleMarkup(lang){
 const t=labels[lang];return `<aside class="formula-scale"><h5>${t.scale}</h5><p>${t.scaleNote}</p><label for="formula-dimension">${t.dim}: <output id="formula-dimension-value">2</output></label><input id="formula-dimension" data-formula-dimension type="range" min="1" max="64" step="1" value="2"><div id="formula-scale-result">${formulaScaleResult(2,lang)}</div></aside>`;
}
export function formulaScaleResult(d,lang){
 const r=scaleComparison(d),t=labels[lang];return `${mathMarkup(`\\sqrt{${d}}=${num(Math.sqrt(d))}`)}<p>${t.raw} → ${t.weight}</p>${mathMarkup(textMath(`${vec(r.raw)} → ${vec(r.unscaled)}`),{source:vec(r.unscaled)})}<p>${t.scaled} → ${t.weight}</p>${mathMarkup(`\\frac{${textMath(vec(r.raw))}}{\\sqrt{${d}}}=${textMath(vec(r.scaled))}\\longrightarrow ${textMath(vec(r.weights))}`,{source:vec(r.weights)})}`;
}
// Refresh only calculation regions, so Next and the operation selector retain focus.
export function updateFormula(root,kind,v,lang,step){
 const m=formulaWalkthrough(kind,v,lang),t=labels[lang],index=Math.max(0,Math.min(m.steps.length-1,step));
 root.querySelector('#formula-explanation-output').innerHTML=formulaExplanationContent(kind,v,lang,index);
 root.querySelector('#formula-output').innerHTML=formulaStepContent(kind,v,lang,index);
 root.querySelector('#formula-history').innerHTML=m.steps.slice(0,index+1).map((s,i)=>{const f=stepTex(kind,s);return `<li ${i===index?'aria-current="step"':''}><button type="button" data-formula-jump="${i}">${i+1}. ${escape(s.title)}</button>${mathMarkup(f.equation,{source:s.equation})}${mathMarkup(f.calculation,{source:s.calculation})}${mathMarkup('\\longrightarrow '+f.result,{source:s.result,className:'formula-history-result'})}</li>`;}).join('');
 root.querySelector('#formula-status').textContent=`${index+1} / ${m.steps.length}`;
 root.querySelector('#formula-select').value=String(index);
 root.querySelector('[data-formula-action="previous"]').disabled=index===0;
 root.querySelector('[data-formula-action="next"]').disabled=index===m.steps.length-1;
 root.querySelector('#formula-full').href=formulaURL(kind,v,lang,index);
 root.querySelector('#formula-complete').innerHTML=index===m.steps.length-1?`<details class="formula-total" open><summary>${t.complete}</summary>${summaryTex(kind,m).map((x,i)=>mathMarkup(x,{source:m.summary[i]})).join('')}</details>`:`<p class="formula-round">${t.locked}</p>`;
 decorateMathConcepts(root.querySelector('#formula-journey'),lang);
 return index;
}
export function formulaAction(event,current,count){
 const jump=event.target.closest('[data-formula-jump]'),button=event.target.closest('[data-formula-action]');
 if(jump)return Number(jump.dataset.formulaJump);
 if(!button)return null;
 const action=button.dataset.formulaAction;
 return action==='reset'?0:Math.max(0,Math.min(count-1,current+(action==='next'?1:-1)));
}
