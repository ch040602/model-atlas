import {convolutionClassification} from './convolution-lab.js';
import {sequenceExperiment} from './sequence-lab.js';
import {formulaMarkup} from './formula-walkthrough.js';
import {transformerFormulaValues} from './formula-model.js';
import {textMath} from './formula-tex.js';
import {mathMarkup,escapeMathHTML} from './math-render.js';

const number = x => (Math.abs(x)<0.0005 ? 0 : x).toFixed(3);
const vector = values => `[${values.map(number).join(', ')}]`;
const heatColor = x => {
 const color=x<0?[235,153,111]:[95,160,208],strength=Math.min(1,Math.abs(x)/2);
 return `rgb(${color.map(c=>Math.round(250+(c-250)*strength)).join(',')})`;
};
const matrix = (values, columns, tone='green') => `<span class="arch-matrix arch-${tone}" style="--columns:${columns}" aria-hidden="true">${values.map(x=>`<span style="background:${heatColor(x)}">${number(x)}</span>`).join('')}</span>`;
const bars = values => `<span class="arch-bars" aria-hidden="true">${values.map((v,i)=>`<span><i style="width:${Math.max(0,Math.min(100,100*v))}%"></i><b>${i?'B':'A'} ${number(v)}</b></span>`).join('')}</span>`;
const token = (label,values) => `<span class="arch-token"><b>${label}</b><small>${vector(values)}</small></span>`;
const copy = {
 ko:{title:'구조를 따라 한 번에 보기',intro:'그림의 각 부분을 누르거나 다음 단계를 선택하세요. 아래 설명에서 같은 값이 수식으로 어떻게 이어지는지 확인할 수 있습니다.',hint:'그림이 화면보다 넓으면 좌우로 움직여 보세요.',slider:'예제 값 바꾸기',previous:'이전',next:'다음',detail:'계산 실습으로 이어가기',original:'원본 시각화 열기 ↗',round:'설명용 축소 모델이며 계산은 반올림 전 값으로 합니다. 원본 실습과 가중치는 공유하지 않습니다.',step:'단계',explain:'이 단계에서 일어나는 일'},
 en:{title:'Follow the architecture',intro:'Select a part of the diagram or use Next. The explanation below follows the same values through the equations.',hint:'If the diagram is wider than the screen, scroll horizontally.',slider:'Change an example value',previous:'Previous',next:'Next',detail:'Continue to the calculation exercise',original:'Open the original visualization ↗',round:'This is a small illustrative model. Calculations use unrounded values. Its weights are not shared with the original visualization.',step:'Step',explain:'What happens here'}
};
const settings={cnn:{min:0,max:2,step:0.1,key:'strength',lab:'conv-title',ko:'필터 강도 s',en:'Filter strength s'},rnn:{min:-1,max:1,step:0.1,key:'x2',lab:'sequence-title',ko:'두 번째 입력 x₂',en:'Second input x₂'},transformer:{min:-2,max:2,step:0.1,key:'x1',lab:'linked-block-title',ko:'두 번째 위치의 첫 특성 x₁',en:'First feature x₁ at position 2'}};

// These models deliberately reuse the numerical exercises, not the upstream networks.
export function architectureModel(kind,v,lang) {
 const ko=lang==='ko';
 if(kind==='cnn') {
  const c=convolutionClassification(v.center,v.strength,v.bias).before, m=c.map, p=m.positions[1];
  const names=ko?['입력 이미지','필터 적용','ReLU 특징 맵','평균 풀링','클래스 확률']:['Input image','Apply filter','ReLU feature map','Average pooling','Class probabilities'];
  const visuals=[matrix(m.image.flat(),3)+'<small class="arch-dimension">3 × 3 × 1</small>',matrix(m.kernel.flat(),2,'orange')+'<small class="arch-dimension">K: 2 × 2</small>',matrix(m.positions.map(x=>x.activation),2,'blue')+'<small class="arch-dimension">2 × 2 × 1</small>',`<span class="arch-pool">μ<br><strong>${number(c.pooled)}</strong></span>`,bars(c.probabilities)];
  const details=[
   [ko?'3×3 픽셀을 입력합니다. 필터는 한 번에 2×2 영역을 읽습니다.':'Start with a 3×3 single-channel image. The filter reads a 2×2 region at a time.',`X = ${m.image.map(vector).join(' ; ')}<br>${ko?'가운데 픽셀':'Center pixel'} = ${number(v.center)}`],
   [ko?'같은 필터를 네 위치에서 재사용합니다. 여기서는 위쪽 오른쪽 위치의 곱과 합을 보여 줍니다.':'Reuse the same filter at all four positions. Here are the products and sum at the top-right position.',`K = ${m.kernel.map(vector).join(' ; ')}<br>z₀₁ = ${p.products.map(a=>`(${number(a.input)} × ${number(a.weight)})`).join(' + ')} + ${number(v.bias)} = ${number(p.sum)}`],
   [ko?'각 위치의 가중합에 ReLU를 적용합니다. 음수는 0이 되어 2×2 특징 맵이 만들어집니다.':'Apply ReLU to each weighted sum. Negative responses become zero, producing a 2×2 feature map.',`aᵢⱼ = max(0, zᵢⱼ)<br>A = ${vector(m.positions.slice(0,2).map(x=>x.activation))} ; ${vector(m.positions.slice(2).map(x=>x.activation))}`],
   [ko?'이 축소 분류기는 네 활성값의 평균으로 특징을 요약합니다. 아래 풀링 실습에서는 최대 풀링도 비교합니다.':'This toy classifier summarizes the four activations by their mean. The pooling exercise below also demonstrates max pooling.',`g = (a₀₀ + a₀₁ + a₁₀ + a₁₁) / 4<br>g = (${m.positions.map(x=>number(x.activation)).join(' + ')}) / 4 = ${number(c.pooled)}`],
   [ko?'평균값과 0을 두 클래스의 점수로 정하고 softmax로 확률을 구합니다. 실제 CNN은 더 많은 채널과 층을 사용합니다.':'Use the mean and zero as two class scores and apply softmax. Real CNNs use more channels and layers.',`logits = [g, 0] = ${vector(c.logits)}<br>pᵢ = exp(logitᵢ) / Σⱼ exp(logitⱼ)<br>p = ${vector(c.probabilities)}`]
  ]; return {names,visuals,details};
 }
 if(kind==='rnn') {
  const inputs=[v.x1,v.x2,v.x3],r=sequenceExperiment(inputs,v.weight,v.target,0.1,false);
  const names=ko?['첫 번째 셀','두 번째 셀','세 번째 셀','마지막 손실']:['First cell','Second cell','Third cell','Final loss'];
  const visuals=inputs.map((x,i)=>`<span class="arch-rnn-input">x${i+1} = ${number(x)} ↓</span><span class="arch-rnn-cell">tanh<br><strong>h${i+1} = ${number(r.states[i+1])}</strong></span><small class="arch-previous">h${i} = ${number(r.states[i])}</small>`).concat(`<span class="arch-loss">L<br><strong>${number(r.loss)}</strong></span><small class="arch-previous">y = ${number(v.target)}</small>`);
  const details=inputs.map((x,i)=>[ko?'현재 입력과 직전 상태를 더한 뒤 tanh를 통과시킵니다. 세 셀은 같은 순환 가중치를 사용합니다.':'Combine the current input with the previous state and apply tanh. The three cells share one recurrent weight.',`hₜ = tanh(xₜ + Wₕhₜ₋₁), h₀ = 0<br>h${i+1} = tanh(${number(x)} + ${number(v.weight)} × ${number(r.states[i])}) = ${number(r.states[i+1])}`]);
  details.push([ko?'이 예제는 마지막 상태 자체를 예측으로 보고 정답과 비교합니다. 아래 출력층 실습에서는 별도 출력층을 추가합니다. 손실은 마지막 시점만 사용합니다.':'This example uses the final state itself as the prediction and compares it with the target. The output-layer exercise below adds a separate output layer. Loss is applied only at the final step.',`ŷ = h₃ = ${number(r.states[3])}<br>L = (h₃ − y)² = (${number(r.states[3])} − ${number(v.target)})² = ${number(r.loss)}`]);
  return {names,visuals,details};
 }
 if(kind==='transformer') {
  const r=transformerFormulaValues(v),b=r.block,[h1,h2]=r.heads,head=r;
  const names=ko?['두 위치의 입력','층 정규화','Q · K · V','두 어텐션 헤드','투영 + 잔차','MLP + 잔차','다음 토큰 확률']:['Two input positions','Layer norm','Q · K · V','Two attention heads','Projection + residual','MLP + residual','Next-token probabilities'];
  const visuals=[token('x¹',[1,0])+token('x²',b.input),token('u¹',r.positions[0])+token('u²',r.positions[1]),`<span class="arch-qkv"><b>Q ${number(r.query)}</b><b>K ${vector(h1.keys)}</b><b>V ${vector(h1.values)}</b></span>`,`<span class="arch-head">H1 ${vector(h1.weights)}<br>→ ${number(h1.output)}</span><span class="arch-head second">H2 ${vector(h2.weights)}<br>→ ${number(h2.output)}</span>`,token('a',r.attention)+token('r',b.residual),token('MLP',b.mlp)+token('y²',b.output),bars(head.probabilities)];
  const details=[
   [ko?'두 벡터는 토큰과 위치 정보가 더해진 입력을 대신합니다. 지금은 두 번째 위치가 앞 위치와 자기 자신을 참고합니다.':'The two vectors stand in for token-plus-position inputs. The second position can attend to the earlier position and itself.',`x⁽¹⁾ = [1.000, 0.000]<br>x⁽²⁾ = ${vector(b.input)}`],
   [ko?'위치마다 두 특성의 평균 μ와 분산 σ²를 구해 정규화합니다. γ는 크기, β는 이동을 조절하며 아래 블록 실습의 값을 사용합니다. ε=0.01은 분모가 0이 되는 것을 막습니다.':'At each position, normalize using the mean μ and variance σ² across its two features. Scale γ and shift β use the block controls below. The ε=0.01 term keeps the denominator nonzero.',`LN(x) = γ(x − μ) / √(σ² + 0.01) + β<br>μ₂ = (${number(b.input[0])} + ${number(b.input[1])}) / 2 = ${number(b.ln1.mean)}<br>σ₂² = ${number(b.ln1.variance)}, γ = ${number(v.gamma)}, β = ${number(v.beta)}<br>u₁ = ${vector(r.positions[0])}<br>u₂ = ${vector(r.positions[1])}`],
   [ko?'정규화된 값에서 질의 Q, 키 K, 값 V를 고릅니다. 아래는 첫 번째 헤드이며 두 번째 헤드는 K와 V의 특성을 바꿉니다.':'Select query Q, keys K and values V from the normalized values. Head 1 is shown; head 2 swaps the key and value features.',`q = u₂₁ = ${number(r.query)}<br>k = ${vector(h1.keys)}, v = ${vector(h1.values)}<br>head 2: k = ${vector(h2.keys)}, v = ${vector(h2.values)}`],
   [ko?'각 헤드는 점수를 softmax로 바꿔 어느 위치를 얼마나 참고할지 정한 뒤 V를 가중합합니다. 차원이 1이므로 √dₖ=1입니다.':'Each head softmaxes its scores into attention weights, then takes a weighted sum of V. The key dimension is one, so √dₖ=1.',`s = qk / √1 = ${vector(h1.scores)}<br>α = softmax(s) = ${vector(h1.weights)}<br>head₁ = ${number(h1.weights[0])} × ${number(h1.values[0])} + ${number(h1.weights[1])} × ${number(h1.values[1])} = ${number(h1.output)}<br>head₂ = ${number(h2.output)}`],
   [ko?'두 헤드를 이어 붙이고 행렬로 섞은 다음 입력을 다시 더합니다. 이 잔차는 원래 정보를 다음 단계에 전달합니다.':'Concatenate the heads, mix them with a matrix, and add the input back. This residual carries the original information onward.',`a = [head₁, head₂] × [[1, 0.5], [−0.5, 1]] = ${vector(r.attention)}<br>r = x⁽²⁾ + a = ${vector(b.residual)}`],
   [ko?'잔차를 다시 정규화하고 활성화 함수를 거친 뒤 결과를 잔차에 더합니다. 선택한 활성화는 아래 블록과 같습니다.':'Normalize the residual again, apply the selected activation, and add the result back. The activation matches the block exercise below.',`LN₂(r) = ${vector(b.ln2.output)}<br>MLP = 0.5 × ${v.activation==='relu'?'ReLU':'GELU≈'}(LN₂(r)) = ${vector(b.mlp)}<br>y⁽²⁾ = r + MLP = ${vector(b.output)}`],
   [ko?'마지막 블록 출력에 최종 층 정규화 LN_f를 적용하고 두 성분을 후보 A·B의 점수로 사용합니다. 이 확률은 위치별 어텐션 가중치와 다릅니다. 아래 연결 블록 실습은 LN_f 직전의 y⁽²⁾에서 끝납니다.':'Apply final layer normalization LN_f after the block, then use the two features as candidate A/B scores. These probabilities differ from attention weights. The connected block exercise below ends at y⁽²⁾ before LN_f.',`logits = LN_f(y⁽²⁾) = ${vector(head.logits)}<br>p = softmax(logits) = ${vector(head.probabilities)}`]
  ]; return {names,visuals,details};
 }
 return null;
}

export function architectureMarkup(kind,lang,values,resource) {
 const s=settings[kind]; if(!s)return '';
 const t=copy[lang],ko=lang==='ko';
 return `<section class="architecture-map" aria-labelledby="architecture-title"><div class="arch-heading"><div><span class="eyebrow">${kind.toUpperCase()} / ARCHITECTURE</span><h2 id="architecture-title" tabindex="-1">${t.title}</h2></div><span class="arch-badge">${ko?'구조 → 계산':'STRUCTURE → MATH'}</span></div><p>${t.intro}</p><div class="arch-control"><label for="architecture-input">${t.slider} · ${s[lang]} <output id="architecture-value">${number(values[s.key])}</output></label><input id="architecture-input" data-architecture-input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${values[s.key]}"></div><p class="arch-hint" id="architecture-hint">${t.hint}</p><div class="architecture-viewport" id="architecture-viewport" tabindex="0" role="region" aria-label="${ko?'모델 구조, 가로로 스크롤 가능':'Model architecture, horizontally scrollable'}" aria-describedby="architecture-hint"><div id="architecture-diagram" class="architecture-diagram arch-${kind}"></div></div><div id="architecture-detail" class="architecture-detail" aria-live="polite"></div><div class="architecture-actions"><button type="button" data-architecture-action="previous">← ${t.previous}</button><span id="architecture-status"></span><button type="button" data-architecture-action="next">${t.next} →</button></div><p class="architecture-note">${t.round}</p>${formulaMarkup(kind,values,lang)}<div class="architecture-links"><button type="button" data-architecture-jump="${s.lab}">${t.detail} →</button>${resource?`<a href="${resource}?lang=${lang}" target="_blank" rel="noopener noreferrer">${t.original}</a>`:''}${kind==='rnn'?`<button type="button" data-architecture-jump="rnn-output-title">${ko?'RNN 출력층 실습':'RNN output-layer exercise'} →</button>`:''}</div></section>`;
}

export function architectureDiagram(kind,lang,values,stage) {
 const model=architectureModel(kind,values,lang),t=copy[lang];
 const count=model.names.length,width=44+145*count+28*(count-1),height=kind==='transformer'?310:kind==='rnn'?260:255;
 const wire=(from,to,y=142,color='#719c88')=>`<path d="M ${from} ${y} C ${from+12} ${y},${to-12} ${y},${to} ${y}" fill="none" stroke="${color}" stroke-width="1.5" marker-end="url(#arch-arrow)"/>`;
 let wires=Array.from({length:count-1},(_,i)=>wire(22+145+173*i,22+173*(i+1),kind==='rnn'?136:142)+(kind==='rnn'?`<text x="${181+173*i}" y="126" text-anchor="middle">h${i+1}</text>`:'')).join('');
 if(kind==='rnn') wires+=`<text x="${width/2}" y="240" text-anchor="middle">h₀ = 0 · Wₓ = 1 · Wₕ = ${number(values.weight)} (${lang==='ko'?'모든 시점에서 공유':'shared across time'}) · b = 0</text>`;
 if(kind==='cnn') wires+=`<text x="${width/2}" y="236" text-anchor="middle">${lang==='ko'?'단일 채널 · 이동 간격 1 · 패딩 0 · 같은 필터를 네 위치에서 사용':'One channel · stride 1 · no padding · one filter reused at four positions'}</text>`;
 if(kind==='transformer') {
  wires+=`<path d="M 94 171 V 222 Q 94 237 109 237 H 771 Q 786 237 786 222 V 176" fill="none" stroke="#8c7bc1" stroke-width="1.5" marker-end="url(#arch-arrow)"/><text x="440" y="254" text-anchor="middle">x² → r (${lang==='ko'?'입력을 더하는 잔차 연결':'residual: add the input'})</text><path d="M 796 176 V 267 Q 796 280 809 280 H 946 Q 959 280 959 267 V 176" fill="none" stroke="#8c7bc1" stroke-width="1.5" marker-end="url(#arch-arrow)"/><text x="878" y="299" text-anchor="middle">r → y² (${lang==='ko'?'잔차':'residual'})</text>`;
 }
 const graph=`<svg class="architecture-wires" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><defs><marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#719c88"/></marker></defs>${wires}</svg>`;
 return graph+model.names.map((name,i)=>`<button type="button" class="architecture-node ${i===stage?'selected':''}" data-architecture-step="${i}" aria-pressed="${i===stage}" aria-label="${t.step} ${i+1}: ${name}"><span class="arch-node-number">${String(i+1).padStart(2,'0')}</span><span class="arch-node-title">${name}</span><span class="arch-visual">${model.visuals[i]}</span></button>`).join('');
}

export function architectureDetail(kind,lang,values,stage) {
 const model=architectureModel(kind,values,lang),[description,math]=model.details[stage],t=copy[lang];
 const formatted=math.split('<br>').map(line=>mathMarkup(line.startsWith('pᵢ =')?'p_i=\\frac{\\exp(\\ell_i)}{\\sum_j\\exp(\\ell_j)}':textMath(line),{source:line})).join('');
 return `<div class="arch-detail-label">${t.step} ${stage+1} / ${model.names.length} · ${t.explain}</div><h3>${model.names[stage]}</h3><p>${description}</p><code data-architecture-math="${stage}" data-math-source="${escapeMathHTML(math.replaceAll('<br>','\n'))}">${formatted}</code>`;
}
