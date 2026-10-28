import {transformerBlockExperiment} from './transformer-block-lab.js';

// Two 2D positions, one causal query at the second position, and two 1D heads.
// The fixed first position and adjustable second position are normalized before
// every Q/K/V projection. Biases and dropout are omitted for this toy inference.
export function linkedBlockExample(values) {
  const fixed=transformerBlockExperiment({x1:1,x2:0,attention:0,activation:values.activation,gamma:values.gamma,beta:values.beta});
  const second=transformerBlockExperiment({...values,attention:0});
  const positions=[fixed.ln1.output,second.ln1.output];
  const query=positions[1][0];
  const heads=[{key:0,value:1},{key:1,value:0}].map(({key,value})=>{
    const keys=positions.map(p=>p[key]), vals=positions.map(p=>p[value]);
    const scores=keys.map(k=>query*k); // d_k = 1, and both positions are allowed.
    const max=Math.max(...scores),exps=scores.map(s=>Math.exp(s-max)),sum=exps[0]+exps[1];
    const weights=exps.map(e=>e/sum),output=weights.reduce((a,w,i)=>a+w*vals[i],0);
    return {keys,values:vals,scores,weights,output};
  });
  const [h1,h2]=heads.map(head=>head.output);
  const attention=[h1-0.5*h2,0.5*h1+h2];
  const block=transformerBlockExperiment({...values,attentionVector:attention});
  return {positions,query,heads,attention,block};
}
const n=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vec=a=>`[${a.map(n).join(', ')}]`;
const text={
 ko:{title:'한 블록을 처음부터 끝까지 연결하기',intro:'두 위치의 입력을 층 정규화한 뒤 두 어텐션 헤드, 출력 투영, 두 잔차와 MLP를 순서대로 계산합니다. 두 번째 위치의 입력, 정규화의 γ·β와 활성화는 바로 위 블록의 슬라이더와 선택을 사용합니다.',note:'첫 위치는 [1, 0]으로 고정합니다. 이 예제는 앞의 별도 다중 헤드 예제와 가중치를 공유하지 않습니다. 위의 가정한 어텐션 출력 a 슬라이더도 사용하지 않습니다. 모든 가중치는 설명용이며 추론을 가정해 드롭아웃을 생략합니다.',one:'1. 두 위치를 각각 정규화',oneText:'같은 층 정규화를 각 위치의 특성에 적용합니다. ε=0.01이며 두 특성과 두 정규화에서 위에서 선택한 동일한 γ·β를 사용합니다. 위치 2의 입력을 바꾸면 해당 정규화 결과와 아래 계산이 함께 바뀝니다.',two:'2. 두 헤드에서 문맥 모으기',twoText:'정규화된 두 벡터에서 각 헤드의 Q, K, V를 고릅니다. x⁽ⁱ⁾는 i번째 위치의 벡터, uᵢⱼ에서 i는 위치(1 또는 2), j는 특성 번호입니다. 위치 2는 위치 1과 자기 자신을 볼 수 있습니다. 각 헤드의 차원은 1이므로 √dₖ=1입니다. 점수를 softmax로 바꾸고 값의 가중합을 계산합니다.',three:'3. 이어 붙이고 출력 투영',threeText:'헤드의 스칼라 출력을 이어 붙인 뒤 2×2 행렬로 섞어 어텐션 출력 a를 구합니다. 이 값은 확률이 아닙니다.',four:'4. 첫 잔차와 MLP 전 정규화',fourText:'위치 2의 원래 입력에 어텐션 출력을 더한 다음, 그 합의 두 특성을 다시 정규화합니다.',five:'5. MLP와 두 번째 잔차',fiveText:'정규화 결과에 선택한 활성화 함수를 적용하고 0.5를 곱합니다. 첫 잔차에 이를 더하면 이 위치의 블록 출력입니다. GELU는 tanh 근사입니다.',end:'실제 GPT-2는 더 많은 차원·헤드와 학습된 파라미터를 사용합니다. 이 수치는 가상의 예이며 실제 모델을 학습하거나 원본 실습에 값을 전달하지 않습니다.',round:'계산에는 반올림 전 값을 쓰고 표시만 소수 셋째 자리까지 합니다.'},
 en:{title:'Connect a complete Transformer block',intro:'Normalize two positions, then follow two attention heads, output projection, both residuals and the MLP. The second-position input, normalization γ and β, and activation use the controls in the block exercise immediately above.',note:'The first position is fixed at [1, 0]. This example does not share weights with the separate multi-head example above. It also does not use the assumed attention-output a slider. All weights are illustrative, and dropout is omitted for inference.',one:'1. Normalize each position',oneText:'Apply layer normalization across features at each position with ε=0.01. Both features and both normalizations use the same γ and β selected above. Changing position 2 updates its normalization and all following calculations.',two:'2. Gather context with two heads',twoText:'Each head selects Q, K and V from the normalized vectors. x⁽ⁱ⁾ is the vector at position i; in uᵢⱼ, i denotes the position (1 or 2) and j the feature. Position 2 can attend to position 1 and itself. Each head has dimension 1, so √dₖ=1. Convert scores with softmax and compute the weighted sum of values.',three:'3. Concatenate and project',threeText:'Concatenate the scalar head outputs, then mix them through a 2×2 matrix to obtain attention output a. It is not a probability.',four:'4. First residual and MLP normalization',fourText:'Add attention output to the original position-2 input, then normalize the two features of that sum again.',five:'5. MLP and second residual',fiveText:'Apply the selected activation to the normalized result and multiply by 0.5. Add it to the first residual to obtain this position’s block output. GELU uses the tanh approximation.',end:'Real GPT-2 uses more dimensions and heads and learned parameters. These values are illustrative; the example does not train a model or pass values to the original lab.',round:'Calculations use unrounded values; only the display is rounded to three decimals.'}
};
export function linkedBlockMarkup(lang) {
 const t=text[lang];return `<section class="sequence-lab linked-block-lab" aria-labelledby="linked-block-title"><div class="eyebrow">TRANSFORMER / CONNECTED BLOCK</div><h2 id="linked-block-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.note}</p><div id="linked-block-output" aria-live="polite"></div><p>${t.end}</p><p class="sequence-rounding">${t.round}</p></section>`;
}
export function linkedBlockOutput(values,lang) {
 const t=text[lang],r=linkedBlockExample(values),[h1,h2]=r.heads,b=r.block;
 const head=(h,i)=>`head ${i}: q = ${n(r.query)}, k = ${vec(h.keys)}, v = ${vec(h.values)}<br>s = qk / √1 = ${vec(h.scores)}<br>softmax(s) = <span data-linked="weights${i}">${vec(h.weights)}</span><br>h${i} = ${n(h.weights[0])} × ${n(h.values[0])} + ${n(h.weights[1])} × ${n(h.values[1])} = <span data-linked="head${i}">${n(h.output)}</span>`;
 const activation=values.activation==='relu'?'ReLU':'GELU≈';
 return `<ol class="sequence-steps"><li><b>${t.one}</b><p>${t.oneText}</p><code>x⁽¹⁾ = [1, 0]; x⁽²⁾ = ${vec(b.input)}<br>u₁ = LN(x⁽¹⁾) = <span data-linked="norm1">${vec(r.positions[0])}</span><br>u₂ = LN(x⁽²⁾) = <span data-linked="norm2">${vec(r.positions[1])}</span></code></li><li><b>${t.two}</b><p>${t.twoText}</p><code>head 1: q=u₂₁, kᵢ=uᵢ₁, vᵢ=uᵢ₂<br>head 2: q=u₂₁, kᵢ=uᵢ₂, vᵢ=uᵢ₁<br>${head(h1,1)}<br>${head(h2,2)}</code></li><li><b>${t.three}</b><p>${t.threeText}</p><code>concat = [h1, h2] = <span data-linked="concat">${vec([h1.output,h2.output])}</span><br>Wᴼ = [[1, 0.5], [−0.5, 1]]<br>a = concat × Wᴼ = <span data-linked="attention">${vec(r.attention)}</span></code></li><li><b>${t.four}</b><p>${t.fourText}</p><code>r = x⁽²⁾ + a = ${vec(b.input)} + ${vec(r.attention)} = <span data-linked="residual">${vec(b.residual)}</span><br>LN₂(r) = <span data-linked="norm-residual">${vec(b.ln2.output)}</span></code></li><li><b>${t.five}</b><p>${t.fiveText}</p><code>MLP = 0.5 × ${activation}(LN₂(r)) = <span data-linked="mlp">${vec(b.mlp)}</span><br>y⁽²⁾ = r + MLP = <strong data-linked="result">${vec(b.output)}</strong></code></li></ol>`;
}
