// A single positive pair and an optional, explicitly selected negative sample.
// Input and output embeddings are separate; all updates use the old vectors.
export function skipgramInitial(){return {center:[0.4,-0.2],positive:[0.1,0.3],negative:[-0.3,0.2]};}
export function skipgramStep(vectors,includeNegative,rate){
 const {center:u,positive:p,negative:n}=vectors;
 if(![u,p,n].every(v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite))||typeof includeNegative!=='boolean'||!Number.isFinite(rate)||rate<0||rate>1)throw new RangeError('invalid vectors or settings');
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1], sigmoid=x=>1/(1+Math.exp(-x));
 const sp=dot(u,p),sn=dot(u,n),pp=sigmoid(sp),pn=sigmoid(sn);
 // Stable softplus computes -log(sigmoid(s)) without log(0).
 const softplus=x=>Math.max(x,0)+Math.log1p(Math.exp(-Math.abs(x)));
 const loss=softplus(-sp)+(includeNegative?softplus(sn):0);
 const gradCenter=u.map((_,i)=>(pp-1)*p[i]+(includeNegative?pn*n[i]:0));
 const gradPositive=u.map(x=>(pp-1)*x);
 const gradNegative=u.map(x=>includeNegative?pn*x:0);
 const next={center:u.map((x,i)=>x-rate*gradCenter[i]),positive:p.map((x,i)=>x-rate*gradPositive[i]),negative:n.map((x,i)=>x-rate*gradNegative[i])};
 return {sp,sn,pp,pn,loss,gradCenter,gradPositive,gradNegative,next};
}
const num=x=>(Math.abs(x)<0.0005?0:x).toFixed(3);
const vec=v=>'['+v.map(num).join(', ')+']';
export function skipgramMarkup(settings,lang){
 const ko=lang==='ko';
 return `<section class="metric-lab skipgram-lab" aria-labelledby="skipgram-title">
 <h2 id="skipgram-title">${ko?'Skip-gram: 단어 벡터 한 번 학습하기':'Skip-gram: train word vectors one step'}</h2>
 <p>${ko?'예시 문장 “cat dog”에서 cat을 중심 단어, dog를 실제 주변 단어로 둡니다. bird는 이 업데이트에서 선택한 음성 샘플입니다. 각 단어가 원래부터 비슷하거나 다르다고 가정하는 것은 아닙니다.':'In the toy sentence “cat dog”, cat is the center and dog is an observed context. Bird is the negative sample selected for this update; the words are not assumed inherently similar or different.'}</p>
 <label><input type="checkbox" data-skipgram-negative ${settings.includeNegative?'checked':''}> ${ko?'음성 샘플 bird 사용':'Use bird as a negative sample'}</label>
 <label class="tfidf-choice" for="skipgram-rate">${ko?'학습률':'Learning rate'} <select id="skipgram-rate" data-skipgram-rate>${[0,0.1,0.5,1].map(n=>`<option value="${n}" ${settings.rate===n?'selected':''}>${n}</option>`).join('')}</select></label>
 <p class="skipgram-actions"><button type="button" data-skipgram-step>${ko?'벡터 한 번 갱신':'Update vectors once'}</button> <button type="button" data-skipgram-reset>${ko?'벡터 초기화':'Reset vectors'}</button></p>
 <div id="skipgram-output" aria-live="polite"></div>
 <p>${ko?'이 실습은 단일 쌍과 선택한 음성 샘플로 손실을 계산합니다. 시그모이드 점수는 전체 어휘에 대한 softmax 확률이 아닙니다. 실제 Word2Vec은 여러 문맥 쌍과 표본을 사용하며, 벡터의 기하학적 관계가 한 번의 갱신마다 반드시 개선되는 것은 아닙니다.':'This exercise uses one pair and a chosen negative sample. Sigmoid scores are not softmax probabilities over the vocabulary. Real Word2Vec uses many context pairs and samples; geometric relationships need not improve on every update.'} <a href="https://arxiv.org/abs/1310.4546" target="_blank" rel="noopener noreferrer">${ko?'음성 샘플링 논문':'Negative sampling paper'} ↗</a></p>
 </section>`;
}
export function skipgramOutput(settings,lang){
 const ko=lang==='ko',v=settings.vectors,r=skipgramStep(v,settings.includeNegative,settings.rate);
 const prior=settings.last;
 return `${prior?`<p data-skipgram-feedback>${ko?'방금 갱신: 같은 쌍과 설정에서 손실':'Last update: loss on the same pair and settings'} ${num(prior.before)} → ${num(prior.after)} (${ko?'학습률':'learning rate'} ${num(prior.rate)})</p>`:''}
 <div class="tfidf-results">
 <p><b>${ko?'① 현재 벡터':'① Current vectors'}</b><br>u(cat) = ${vec(v.center)}<br>v(dog) = ${vec(v.positive)}<br>v(bird) = ${vec(v.negative)}<br>${ko?'u는 중심 입력 벡터, v는 주변 단어를 점수화하는 출력 벡터입니다.':'u is the center input vector; v is an output vector used to score a context word.'}</p>
 <p><b>${ko?'② 내적과 시그모이드 점수':'② Dot products and sigmoid scores'}</b><br>s₊ = u·v(dog) = ${num(r.sp)}; σ(s₊) = ${num(r.pp)}<br>s₋ = u·v(bird) = ${num(r.sn)}; σ(s₋) = ${num(r.pn)}${settings.includeNegative?'':` (${ko?'손실에서 제외':'excluded from loss'})`}<br>${ko?'관찰된 쌍은 높은 점수, 선택한 음성 쌍은 낮은 점수를 목표로 합니다.':'The objective favors a high score for the observed pair and a low score for the selected negative pair.'}</p>
 <p><b>${ko?'③ 현재 손실':'③ Current loss'}</b><br>L = −log σ(s₊)${settings.includeNegative?' − log σ(−s₋)':''} = <strong data-skipgram-result="loss">${num(r.loss)}</strong></p>
 <p><b>${ko?'④ 기울기와 다음 갱신':'④ Gradients and next update'}</b><br>∂L/∂u = (σ(s₊)−1)v(dog)${settings.includeNegative?' + σ(s₋)v(bird)':''} = ${vec(r.gradCenter)}<br>∂L/∂v(dog) = (σ(s₊)−1)u = ${vec(r.gradPositive)}<br>∂L/∂v(bird) = ${settings.includeNegative?'σ(s₋)u':'0'} = ${vec(r.gradNegative)}<br>u′ = u − η∂L/∂u = ${vec(r.next.center)}<br>v′(dog) = ${vec(r.next.positive)}; v′(bird) = ${vec(r.next.negative)}</p>
 <p>${ko?'버튼을 누르면 표시된 세 벡터가 동시에 갱신됩니다. 모든 기울기는 갱신 전 벡터에서 계산하며, 표시만 반올림합니다.':'The button applies all three vector updates simultaneously. Every gradient uses the old vectors; only display values are rounded.'}</p></div>`;
}
