import {mathMarkup,escapeMathHTML as escape} from './math-render.js';

// Small, local glossary. Each card explains the operator used in this lesson,
// rather than introducing a second set of model parameters.
export const mathConcepts={
 relu:{name:['ReLU · 렐루','ReLU'],text:['음수는 0으로, 양수는 그대로 보냅니다. 선형 연산 사이에 비선형성을 넣어 복잡한 패턴을 표현합니다.','Returns zero for negative inputs and leaves positive inputs unchanged. This nonlinearity lets stacked linear layers express more complex patterns.'],tex:String.raw`\operatorname{ReLU}(z)=\max(0,z)`,example:['예: −2 → 0, 3 → 3. 이 예제는 z=0에서 미분값을 0으로 정합니다.','Example: −2 → 0, 3 → 3. This lesson chooses derivative 0 at z=0.']},
 convolution:{name:['합성곱','Convolution'],text:['작은 필터를 입력 위로 옮기며 같은 위치의 값과 가중치를 곱한 뒤 더합니다. 합성곱 자체는 평균이 아닙니다.','Slide a small kernel across the input, multiply matching entries, then sum the products. Convolution itself is not an average.'],tex:String.raw`Z_{i,j}=\sum_u\sum_v X_{i+u,j+v}W_{u,v}+b`,example:['예: [1,2]와 [2,−1]의 가중합은 1×2+2×(−1)=0입니다.','Example: [1,2] with weights [2,−1] gives 1×2+2×(−1)=0.']},
 pooling:{name:['전역 평균 풀링','Global average pooling'],text:['특징 맵의 모든 값을 더하고 원소 수로 나눕니다. 위치별 반응을 하나의 대표값으로 요약합니다.','Sum every value in a feature map and divide by the number of entries. This summarizes spatial responses with one value.'],tex:String.raw`g=\frac{1}{HW}\sum_{i=1}^{H}\sum_{j=1}^{W}A_{i,j}`,example:['예: [1,2,3,4] → 합 10 → 10÷4=2.5.','Example: [1,2,3,4] → sum 10 → 10÷4=2.5.']},
 softmax:{name:['Softmax · 확률로 바꾸기','Softmax'],text:['각 점수의 지수를 전체 지수 합으로 나눠 합이 1인 가중치를 만듭니다. 상대적으로 큰 점수에 더 큰 비중을 줍니다.','Divide each exponentiated score by their total to obtain weights that sum to one. Larger scores receive more weight.'],tex:String.raw`p_i=\frac{\exp(z_i-m)}{\sum_j\exp(z_j-m)},\quad m=\max_j z_j`,example:['예: 점수 [0,0] → [0.5,0.5]. 최댓값 m을 빼도 비율은 같습니다.','Example: scores [0,0] → [0.5,0.5]. Subtracting the maximum m preserves the ratios.']},
 tanh:{name:['tanh · 쌍곡탄젠트','Hyperbolic tangent'],text:['입력을 −1과 1 사이로 눌러 주는 부드러운 활성화입니다. 이 RNN에서는 가중합을 다음 은닉 상태로 바꿉니다.','A smooth activation with outputs between −1 and 1. In this RNN it turns the weighted sum into the next hidden state.'],tex:String.raw`\tanh(z)=\frac{e^z-e^{-z}}{e^z+e^{-z}}`,example:['예: tanh(0)=0, tanh(1)≈0.762.','Example: tanh(0)=0, tanh(1)≈0.762.']},
 exp:{name:['exp · 지수 함수','Exponential'],text:['e를 입력값만큼 거듭제곱합니다. softmax에서 점수를 양수로 바꾸고 점수 차이를 비율로 표현합니다.','Raises e to the input power. Softmax uses it to turn scores into positive values and score differences into ratios.'],tex:String.raw`\exp(z)=e^z,\qquad e\approx2.718`,example:['예: exp(0)=1, exp(1)≈2.718.','Example: exp(0)=1, exp(1)≈2.718.']},
 log:{name:['log · 자연로그','Natural logarithm'],text:['지수 함수의 역함수입니다. 정답 확률의 음의 로그는 정답에 낮은 확률을 줄수록 커집니다.','The inverse of the exponential. The negative log of the target probability grows when that probability is small.'],tex:String.raw`\log(e^z)=z,\qquad L=-\log p_{\mathrm{target}}`,example:['예: 정답 확률 1 → 손실 0, 0.5 → 약 0.693.','Example: target probability 1 → loss 0; 0.5 → about 0.693.']},
 gelu:{name:['GELU · 부드러운 활성화','GELU'],text:['입력 크기에 따라 값을 부드럽게 통과시키는 활성화입니다. 이 여정은 아래 tanh 근사식을 사용합니다.','An activation that smoothly gates values according to their magnitude. This journey uses the tanh approximation below.'],tex:String.raw`\operatorname{GELU}(z)\approx\frac{z}{2}\left[1+\tanh\left(\sqrt{\frac{2}{\pi}}(z+0.044715z^3)\right)\right]`,example:['예: GELU(0)=0. ReLU와 달리 작은 음수도 일부 남습니다.','Example: GELU(0)=0. Unlike ReLU, it retains some small negative values.']},
 layernorm:{name:['LayerNorm · 층 정규화','Layer normalization'],text:['한 위치의 특성들에서 평균을 빼고 표준편차로 나눈 뒤 γ와 β로 조정합니다. ε는 0으로 나누는 것을 막는 작은 양수입니다.','Center the features at one position and divide by their standard deviation, then apply γ and β. A small positive ε prevents division by zero.'],tex:String.raw`\operatorname{LN}(x_i)=\gamma\frac{x_i-\mu}{\sqrt{\sigma^2+\epsilon}}+\beta`,example:['이 예제는 위치마다 두 특성을 함께 정규화합니다. 다른 위치의 값과 섞어 평균내지 않습니다.','This example normalizes the two features at each position together, without averaging across positions.']},
 attention:{name:['어텐션','Attention'],text:['Q와 K의 내적으로 관련도를 구하고, 정규화한 가중치로 V를 섞습니다. 현재 위치가 어떤 정보를 가져올지 정하는 연산입니다.','Score relevance with Q–K dot products, normalize the scores, and mix V with those weights. This determines which information a position retrieves.'],tex:String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V`,example:['Q는 찾는 정보, K는 비교할 특징, V는 실제로 섞을 값입니다.','Q describes what to look for, K what to compare, and V the values to mix.']},
 keydim:{name:['√dₖ · 어텐션 스케일','Attention scale √dₖ'],text:['dₖ는 한 헤드의 키·쿼리 특성 수입니다. 내적을 그 제곱근으로 나눠 차원이 커질 때 점수의 크기가 지나치게 커지는 것을 완화합니다.','dₖ is the number of key/query features in one head. Dividing the dot product by its square root controls score magnitude as that dimension grows.'],tex:String.raw`s_{i,j}=\frac{q_i\cdot k_j}{\sqrt{d_k}}`,example:['예: dₖ=4이면 분모는 2입니다. 현재 연속 계산은 dₖ=1이므로 값이 그대로입니다.','Example: dₖ=4 gives divisor 2. The continuous example uses dₖ=1, so its score is unchanged.']},
 mask:{name:['인과 마스크','Causal mask'],text:['다음 토큰을 예측할 때 미래 위치를 보지 못하게 합니다. 미래 점수에 −∞를 더하면 softmax 가중치가 0이 됩니다.','Prevents next-token prediction from accessing future positions. Adding −∞ to a future score gives it softmax weight zero.'],tex:String.raw`M_{i,j}=\begin{cases}0&j\le i\\-\infty&j>i\end{cases}`,example:['예: 첫 위치는 자기 자신만, 두 번째 위치는 첫째와 둘째 위치를 봅니다.','Example: position 1 sees itself; position 2 sees positions 1 and 2.']},
 residual:{name:['잔차 연결','Residual connection'],text:['블록의 입력을 변환 결과에 더합니다. 기존 정보를 다음 층으로 직접 전달하는 경로를 만듭니다.','Add the block input to its transformation. This gives existing information a direct path to the next layer.'],tex:String.raw`y=x+F(x)`,example:['예: x=[1,2], F(x)=[0.1,−0.2] → y=[1.1,1.8].','Example: x=[1,2], F(x)=[0.1,−0.2] → y=[1.1,1.8].']},
 concat:{name:['Concat · 이어 붙이기','Concatenation'],text:['각 헤드의 결과를 특성 방향으로 나란히 붙입니다. 더하거나 평균내는 연산과 다릅니다.','Place head outputs next to each other along the feature dimension. This differs from summing or averaging them.'],tex:String.raw`\operatorname{Concat}([a],[b])=[a,b]`,example:['예: 헤드 1=[0.2], 헤드 2=[0.8] → [0.2,0.8].','Example: head 1=[0.2], head 2=[0.8] → [0.2,0.8].']},
 embedding:{name:['임베딩','Embedding'],text:['토큰 ID로 학습 가능한 표의 행을 찾아 벡터로 바꿉니다. ID의 숫자 크기 자체를 의미로 사용하지 않습니다.','Look up a token ID in a trainable table to obtain a vector. The numerical magnitude of the ID itself does not represent meaning.'],tex:String.raw`x_i=E[t_i]+P_i`,example:['E[tᵢ]는 토큰 벡터, Pᵢ는 위치 벡터입니다.','E[tᵢ] is the token vector; Pᵢ is the position vector.']},
 mlp:{name:['MLP · 다층 퍼셉트론','Multilayer perceptron'],text:['각 위치에 같은 선형층·활성화·선형층을 적용해 특성을 변환합니다. 어텐션과 달리 이 연산 자체는 위치 사이의 값을 섞지 않습니다.','Apply the same linear–activation–linear transformation at each position. This operation does not itself mix information between positions.'],tex:String.raw`\operatorname{MLP}(x)=\phi(xW_1+b_1)W_2+b_2`,example:['이 축소 모델은 특성 수 2 → 2 → 2를 사용합니다.','This toy model uses feature sizes 2 → 2 → 2.']},
 gradient:{name:['미분·기울기','Derivative and gradient'],text:['매개변수를 조금 바꿀 때 손실이 얼마나 변하는지 나타냅니다. 연결된 연산의 미분을 연쇄 법칙으로 곱해 앞쪽으로 전달합니다.','Measures how loss changes with a small parameter change. The chain rule multiplies derivatives through connected operations.'],tex:String.raw`\frac{\partial L}{\partial w}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial w}`,example:['g>0이면 작은 양의 이동이 손실을 늘립니다. g<0이면 그 반대입니다. η>0에서 −ηg는 감소 방향이지만 큰 걸음의 손실 감소를 보장하지는 않습니다.','A positive gradient means a small positive change increases loss locally; a negative gradient reverses this. For η>0, −ηg is a descent direction, but large steps can increase loss.']},
 learningrate:{name:['η · 학습률','Learning rate η'],text:['기울기 반대 방향으로 얼마나 움직일지 정하는 크기입니다. 너무 크면 한 번의 갱신에서도 손실이 커질 수 있습니다.','Sets how far to move against the gradient. A large step can increase loss even after a single update.'],tex:String.raw`w_{\mathrm{new}}=w-\eta\frac{\partial L}{\partial w}`,example:['예: w=1, η=0.1에서 g=2 → 새 w=0.8, g=−2 → 새 w=1.2. 음의 기울기를 빼면 가중치가 증가합니다.','With w=1 and η=0.1: g=2 → new w=0.8; g=−2 → new w=1.2. Subtracting a negative gradient increases the weight.']},
 mean:{name:['μ · 평균','Mean μ'],text:['값의 합을 개수로 나눈 중심값입니다. 층 정규화에서는 한 위치의 특성들을 대상으로 계산합니다.','The sum of values divided by their count. Layer normalization computes it over the features at a single position.'],tex:String.raw`\mu=\frac{1}{d}\sum_{i=1}^{d}x_i`,example:['예: [1,3]의 평균은 (1+3)÷2=2입니다.','Example: the mean of [1,3] is (1+3)÷2=2.']},
 variance:{name:['σ² · 분산','Variance σ²'],text:['평균에서 벗어난 거리의 제곱을 평균낸 값입니다. 이 정규화는 d−1이 아니라 특성 수 d로 나눕니다.','The mean squared distance from the mean. This normalization divides by feature count d, not d−1.'],tex:String.raw`\sigma^2=\frac{1}{d}\sum_{i=1}^{d}(x_i-\mu)^2`,example:['예: [1,3], 평균 2 → 분산 (1+1)÷2=1.','Example: [1,3], mean 2 → variance (1+1)÷2=1.']},
 logits:{name:['로짓 · 확률 전 점수','Logits'],text:['출력층이 내놓는 정규화 전 점수입니다. 아직 확률이 아니며 softmax를 거쳐 확률로 바뀝니다.','Unnormalized output-layer scores. They become probabilities after softmax.'],tex:String.raw`z=hW_{\mathrm{out}}+b_{\mathrm{out}},\qquad p=\operatorname{softmax}(z)`,example:['로짓은 음수일 수 있고, 합이 1일 필요도 없습니다.','Logits may be negative and need not sum to one.']},
 sum:{name:['Σ · 합 기호','Summation Σ'],text:['아래·위 범위에 들어가는 각 항을 모두 더하라는 뜻입니다. 인덱스가 바뀌면서 어떤 값이 더해지는지 따라가세요.','Add all terms over the lower and upper bounds. Follow the changing index to see which values enter the sum.'],tex:String.raw`\sum_{i=1}^{3}a_i=a_1+a_2+a_3`,example:['예: a=[2,3,4]이면 합은 9입니다.','Example: a=[2,3,4] gives sum 9.']},
 sqrt:{name:['√ · 제곱근','Square root √'],text:['제곱하면 루트 안의 값이 되는 음이 아닌 수입니다. 루트의 가로선 아래 전체가 계산 대상입니다.','The nonnegative number whose square equals the value under the root. Everything under the horizontal bar belongs to its argument.'],tex:String.raw`\sqrt{a}=b\quad\Longleftrightarrow\quad b^2=a,\quad b\ge0`,example:['예: √4=2. √(σ²+ε)는 분산과 ε를 더한 뒤 루트를 취합니다.','Example: √4=2. √(σ²+ε) takes the root after adding variance and ε.']},
 fraction:{name:['분수 · 분자와 분모','Fraction: numerator and denominator'],text:['가로선 위는 분자, 아래는 분모입니다. 각각의 식 전체를 계산한 뒤 분자를 분모로 나눕니다. 분모는 0이 될 수 없습니다.','The numerator is above the rule and the denominator below it. Evaluate each entire expression, then divide the numerator by the nonzero denominator.'],tex:String.raw`\frac{a+b}{c+d}=\frac{(a+b)}{(c+d)}`,example:['예: (2+4)÷(1+2)=6÷3=2.','Example: (2+4)÷(1+2)=6÷3=2.']},
 dotproduct:{name:['내적','Dot product'],text:['같은 위치의 두 특성을 곱한 뒤 모두 더합니다. 어텐션에서는 Q와 K가 얼마나 맞는지 점수를 만드는 데 사용합니다.','Multiply matching features and sum their products. Attention uses this to score how well Q and K match.'],tex:String.raw`q\cdot k=\sum_{r=1}^{d_k}q_rk_r`,example:['예: [1,2]·[3,4]=1×3+2×4=11.','Example: [1,2]·[3,4]=1×3+2×4=11.']}
};
const names=[[/\\operatorname\{ReLU\}/,'relu'],[/\\operatorname\{Conv\}/,'convolution'],[/\\operatorname\{GAP\}/,'pooling'],[/\\operatorname\{softmax\}/,'softmax'],[/\\operatorname\{GELU\}/,'gelu'],[/\\operatorname\{LN\}/,'layernorm'],[/\\operatorname\{Attention\}/,'attention'],[/\\operatorname\{Concat\}/,'concat'],[/\\operatorname\{MLP\}/,'mlp'],[/\\tanh/,'tanh'],[/\\exp/,'exp'],[/\\log/,'log'],[/\\partial/,'gradient'],[/\\sum/,'sum'],[/\\sqrt/,'sqrt'],[/\\frac/,'fraction']];
export function conceptsForStep(kind,step,tex){
 const ids=[];
 if(step.id==='relu'||step.id==='map')ids.push('relu');
 if(step.id==='scale')ids.push('keydim','attention');
 if(step.id==='mask')ids.push('mask','attention');
 if(step.id.includes('mean'))ids.push('mean','layernorm');
 if(step.id.includes('variance'))ids.push('variance','layernorm');
 if(/standardize|affine/.test(step.id))ids.push('layernorm');
 if(step.id.startsWith('residual'))ids.push('residual');
 if(/embedding|position/.test(step.id)&&kind==='transformer')ids.push('embedding');
 if(step.id==='dot')ids.push('dotproduct','attention');
 if(step.id==='update')ids.push('learningrate','gradient');
 if(step.id==='logits'||step.id==='classifier')ids.push('logits');
 if(step.id.startsWith('pool-'))ids.push('pooling');
 if(/mlp-/.test(step.id))ids.push('mlp');
 for(const [pattern,id] of names)if(pattern.test(tex))ids.push(id);
 return [...new Set(ids)];
}
export function conceptChips(ids,lang){
 if(!ids.length)return '';
 const ko=lang==='ko',index=ko?0:1;
 return `<div class="concept-help-chips" lang="${lang}"><span>${ko?'개념에 마우스를 올리거나 선택하세요':'Hover or select a concept'}</span><div>${ids.map(id=>`<button type="button" data-concept="${id}" data-concept-lang="${lang}" aria-controls="atlas-concept-popover" aria-expanded="false">${escape(mathConcepts[id].name[index])}<span aria-hidden="true">?</span></button>`).join('')}</div></div>`;
}

const documents=new WeakMap();
function install(doc){
 if(documents.has(doc))return documents.get(doc);
 const css=doc.createElement('link');css.rel='stylesheet';css.href=new URL('./concept-help.css',import.meta.url).href;doc.head.append(css);
 const popup=doc.createElement('div');popup.id='atlas-concept-popover';popup.className='atlas-concept-popover';popup.setAttribute('popover','manual');popup.setAttribute('role','tooltip');doc.body.append(popup);
 const win=doc.defaultView,state={anchor:null,id:null,pinned:false,timer:null,pointerDismissed:false};
 function close(){
  clearTimeout(state.timer);
  if(state.anchor?.matches('[data-concept]')){state.anchor.setAttribute('aria-expanded','false');state.anchor.removeAttribute('aria-describedby');}
  if(popup.matches(':popover-open'))popup.hidePopover();
  state.anchor=null;state.id=null;state.pinned=false;
 }
 function position(){
  if(!state.anchor)return;
  if(!state.anchor.isConnected){close();return;}
  const a=state.anchor.getBoundingClientRect(),p=popup.getBoundingClientRect(),gap=12;
  if(a.bottom<0||a.top>win.innerHeight){close();return;}
  popup.style.left=`${Math.max(gap,Math.min(a.left,win.innerWidth-p.width-gap))}px`;
  const below=a.bottom+gap;
  popup.style.top=`${Math.max(gap,Math.min(below+p.height<=win.innerHeight-gap?below:a.top-p.height-gap,win.innerHeight-p.height-gap))}px`;
 }
 function show(anchor,pin=false){
  clearTimeout(state.timer);
  const id=anchor.dataset.concept||anchor.dataset.mathConcept;if(!mathConcepts[id])return;
  if(state.anchor===anchor){state.pinned ||= pin;return;}
  close();state.anchor=anchor;state.id=id;state.pinned=pin;
  const lang=anchor.dataset.conceptLang||doc.documentElement.lang,ko=lang!=='en',n=ko?0:1,c=mathConcepts[id];
  popup.lang=ko?'ko':'en';popup.dataset.conceptId=id;
  popup.innerHTML=`<strong>${escape(c.name[n])}</strong><p>${escape(c.text[n])}</p>${mathMarkup(c.tex)}<p class="concept-example">${escape(c.example[n])}</p><small>${ko?'Esc로 닫기 · 선택하면 설명 고정':'Esc to close · select to keep open'}</small>`;
  if(anchor.matches('[data-concept]')){anchor.setAttribute('aria-expanded','true');anchor.setAttribute('aria-describedby',popup.id);}
  popup.showPopover();position();
 }
 const trigger=e=>e.target.closest?.('[data-concept],[data-math-concept]');
 const schedule=()=>{clearTimeout(state.timer);state.timer=setTimeout(()=>{if(!state.pinned&&doc.activeElement!==state.anchor)close();},160);};
 doc.addEventListener('pointerover',e=>{if(state.pointerDismissed)return;const a=trigger(e);if(a&&(!state.pinned||a===state.anchor))show(a);else if(popup.contains(e.target))clearTimeout(state.timer);});
 // Hiding a card can expose a different formula beneath a stationary pointer.
 // After Escape, wait for an intentional pointer move or activation to reopen.
 doc.addEventListener('pointermove',e=>{if(!state.pointerDismissed)return;state.pointerDismissed=false;const a=trigger(e);if(a)show(a);});
 doc.addEventListener('pointerout',e=>{if(state.anchor&&(state.anchor.contains(e.target)||popup.contains(e.target))&&!state.anchor.contains(e.relatedTarget)&&!popup.contains(e.relatedTarget))schedule();});
 doc.addEventListener('focusin',e=>{if(e.target.matches('[data-concept]')){state.pointerDismissed=false;show(e.target);}});
 doc.addEventListener('focusout',e=>{if(e.target===state.anchor)schedule();});
 doc.addEventListener('click',e=>{const a=e.target.closest?.('[data-concept]');if(!a)return;e.preventDefault();if(state.anchor===a&&state.pinned)close();else show(a,true);});
 doc.addEventListener('pointerdown',e=>{state.pointerDismissed=false;if(state.anchor&&!state.anchor.contains(e.target)&&!popup.contains(e.target))close();});
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.anchor){e.preventDefault();close();state.pointerDismissed=true;}});
 win.addEventListener('resize',position);doc.addEventListener('scroll',position,true);
 const api={refresh(){if(state.anchor&&!state.anchor.isConnected)close();}};documents.set(doc,api);return api;
}

export function decorateMathConcepts(root,lang){
 // Node smoke tests use a deliberately tiny DOM stub; imports remain side-effect free.
 const doc=root.nodeType===9?root:root.ownerDocument;if(!doc?.defaultView)return;
 install(doc).refresh();
 const operators={ReLU:'relu',Conv:'convolution',GAP:'pooling',softmax:'softmax',GELU:'gelu',LN:'layernorm',Attention:'attention',Concat:'concat',MLP:'mlp',tanh:'tanh',exp:'exp',log:'log'};
 for(const math of root.querySelectorAll('.atlas-math')){
  // Only pointer markers in KaTeX's aria-hidden visual branch. Equivalent buttons
  // beside the equation supply keyboard/touch access without duplicate math speech.
  for(const element of math.querySelectorAll('.katex-html .mop,.katex-html .sqrt,.katex-html .mfrac')){
   const text=element.textContent.trim();
   const id=operators[text]||(element.classList.contains('sqrt')?(text.includes('dk')?'keydim':'sqrt'):element.classList.contains('mfrac')?'fraction':null);
   if(id){element.dataset.mathConcept=id;element.dataset.conceptLang=lang;}
  }
 }
}
