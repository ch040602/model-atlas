// A chosen mask is illustrative; the exercise does not draw random numbers.
const input=[1,2,3];
const f=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vector=a=>`[${a.map(f).join(', ')}]`;
export function dropoutExample(p,mask,mode){
 if(!Number.isFinite(p)||p<0||p>=1||!Array.isArray(mask)||mask.length!==3||!mask.every(v=>v===0||v===1)||!['train','eval'].includes(mode))throw new RangeError('invalid dropout setting');
 const keep=1-p, kept=mask.reduce((a,b)=>a+b,0), probability=keep**kept*p**(3-kept);
 const training=input.map((x,i)=>x*mask[i]/keep);
 return {input:[...input],keep,kept,probability,training,output:mode==='train'?training:[...input]};
}
export function dropoutMarkup(settings,lang){
 const ko=lang==='ko', {p,mask,mode}=settings;
 return `<section class="metric-lab dropout-lab" aria-labelledby="dropout-title">
 <h2 id="dropout-title">${ko?'드롭아웃: 마스크와 학습·평가':'Dropout: mask, training and evaluation'}</h2>
 <p>${ko?'활성값 [1, 2, 3]에 대해 제거 확률 p와 마스크를 바꿔 보세요. 체크한 값은 남기고 체크하지 않은 값은 제거합니다. 이 마스크는 직접 선택한 가상의 한 사례이며 무작위로 뽑은 결과가 아닙니다.':'For activations [1, 2, 3], change the drop probability p and mask. Checked values are kept; unchecked values are removed. This manually chosen mask is a hypothetical case, not a random draw.'}</p>
 <label class="pca-control" for="dropout-p">${ko?'제거 확률 p':'Drop probability p'} <output id="dropout-p-value">${f(p)}</output></label>
 <input id="dropout-p" data-dropout-p type="range" min="0" max="0.75" step="0.25" value="${p}">
 <fieldset class="dropout-mask"><legend>${ko?'가정한 마스크 m (1은 유지)':'Chosen mask m (1 means keep)'}</legend>${mask.map((v,i)=>`<label><input type="checkbox" data-dropout-mask="${i}" ${v?'checked':''}> x${i+1}=${input[i]}</label>`).join('')}</fieldset>
 <label class="dropout-mode" for="dropout-mode">${ko?'실행 모드':'Mode'} <select id="dropout-mode" data-dropout-mode><option value="train" ${mode==='train'?'selected':''}>${ko?'학습':'Training'}</option><option value="eval" ${mode==='eval'?'selected':''}>${ko?'평가':'Evaluation'}</option></select></label>
 <div id="dropout-output" aria-live="polite"></div>
 <p>${ko?'일반적인 원소별 드롭아웃은 학습할 때 각 활성값을 확률 p로 독립적으로 제거합니다. 매번 정확히 p의 비율만큼 제거되는 것은 아닙니다. 평가 때는 마스크와 p를 적용하지 않고 입력을 그대로 반환합니다. 구현에 따라 채널 단위 등 다른 변형도 있습니다.':'Standard elementwise dropout independently removes each activation with probability p during training. Exactly a fraction p need not be removed on each pass. Evaluation returns the input unchanged without applying the mask or p. Other variants, such as channel-wise dropout, exist.'}</p>
 <p>${ko?'한 번의 출력은 달라져도 여러 마스크에 대한 각 활성값의 기대값은 원래 입력과 같습니다. 이 사실이 신경망 전체의 출력 기댓값이나 성능까지 같다는 뜻은 아닙니다.':'One output can differ, but each activation’s expected value over masks equals its input. That does not mean the full network’s expected output or performance is unchanged.'}</p>
 <p><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.Dropout.html" target="_blank" rel="noopener noreferrer">${ko?'PyTorch 드롭아웃 문서':'PyTorch dropout documentation'} ↗</a></p>
 </section>`;
}
export function dropoutOutput(settings,lang){
 const ko=lang==='ko',r=dropoutExample(settings.p,settings.mask,settings.mode),p=settings.p,mode=settings.mode;
 const status=r.probability===0 ? (ko?'이 마스크는 현재 p에서 발생하지 않습니다.':'This mask cannot occur at the current p.') : '';
 return `<div class="dropout-steps">
 <p><b>${ko?'① 선택한 마스크의 확률':'① Probability of the chosen mask'}</b><br>m = [${settings.mask.join(', ')}], ${ko?'남긴 개수':'kept'} = ${r.kept}<br>
 P(m) = (1 − p)<sup>${r.kept}</sup> × p<sup>${3-r.kept}</sup> = <strong data-dropout-result="probability">${f(r.probability)}</strong> ${status}</p>
 <p><b>${ko?'② 학습 시 스케일 적용':'② Scale during training'}</b><br>yᵢ = mᵢ × xᵢ / (1 − p)<br>
 y = ${vector(r.training)}<br>${ko?'남긴 값은 유지 확률로 나누고 제거한 값은 0입니다.':'Kept values are divided by the keep probability; dropped values become zero.'}</p>
 <p><b>${ko?'③ 선택한 실행 모드의 출력':'③ Output in the selected mode'}</b><br>
 <span data-dropout-result="mode">${mode==='train'?(ko?'학습: 위의 가상 마스크 적용':'Training: apply the hypothetical mask above'):(ko?'평가: 마스크와 무관하게 입력 그대로':'Evaluation: input unchanged regardless of mask')}</span><br>
 ${ko?'출력':'Output'} = <strong data-dropout-result="output">${vector(r.output)}</strong></p>
 <p><b>${ko?'④ 여러 마스크에 대한 한 값의 기대값':'④ Expected value of one activation across masks'}</b><br>
 E[y₂] = (1 − p) × (2 / (1 − p)) + p × 0<br>= ${f(r.keep)} × ${f(2/r.keep)} + ${f(p)} × 0 = <strong data-dropout-result="expectation">2.000</strong></p>
 <p>${ko?'계산은 반올림 전 값으로 수행하며 화면에는 소수 셋째 자리까지 표시합니다.':'Calculations use full precision; values are displayed to three decimal places.'}</p>
 </div>`;
}
