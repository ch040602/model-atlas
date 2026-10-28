// Binary logistic classifier: two fixed pixel-like inputs and true class y=1.
export function fgsmExample(epsilon){
 if(!Number.isFinite(epsilon)||epsilon<0||epsilon>0.3)throw new RangeError('epsilon must be between 0 and 0.3');
 const x=[0.6,0.4],w=[2,-2],bias=-0.2;
 const forward=input=>{
  const z=w[0]*input[0]+w[1]*input[1]+bias;
  const probability=1/(1+Math.exp(-z));
  return {z,probability,loss:Math.log1p(Math.exp(-z)),prediction:probability>=0.5?1:0};
 };
 const before=forward(x),gradient=w.map(weight=>(before.probability-1)*weight);
 const raw=x.map((value,i)=>value+epsilon*Math.sign(gradient[i]));
 const changed=raw.map(value=>Math.max(0,Math.min(1,value)));
 return {x,w,bias,before,gradient,raw,changed,after:forward(changed),maxChange:Math.max(...changed.map((value,i)=>Math.abs(value-x[i])))};
}
const f=n=>(Math.abs(n)<0.0005?0:n).toFixed(3);
export function fgsmMarkup(epsilon,lang){
 const ko=lang==='ko';
 return `<section class="metric-lab" aria-labelledby="fgsm-title">
 <h2 id="fgsm-title">${ko?'손실을 이용해 입력을 한 번 바꾸기':'Change an input once using the loss'}</h2>
 <p>${ko?'정답 y=1인 두 입력을 0부터 1 사이의 픽셀 값처럼 취급합니다. 먼저 원래 분류 결과와 입력에 대한 기울기를 구하고, ε를 바꾸어 손실과 예측을 비교하세요.':'Treat the two inputs as pixel values in [0,1] with true label y=1. First find the original prediction and input gradient, then change ε and compare loss and prediction.'}</p>
 <label class="pca-control" for="fgsm-epsilon">${ko?'변화 한도':'Perturbation budget'} ε <output id="fgsm-epsilon-value">${f(epsilon)}</output></label><input id="fgsm-epsilon" data-fgsm-epsilon type="range" min="0" max="0.3" step="0.01" value="${epsilon}">
 <div id="fgsm-output" aria-live="polite"></div>
 <p>${ko?'이는 고정된 두 입력의 로지스틱 분류기이지 이미지나 CNN을 실행한 결과가 아닙니다. 한 번의 FGSM으로 실패했다고 모든 변화에 견고하다고 결론낼 수 없습니다. 입력 정규화를 사용하면 변화 한도의 단위와 유효 범위를 그에 맞게 변환해야 합니다.':'This is a fixed two-input logistic classifier, not an image or CNN execution. A failed single FGSM attempt does not establish robustness to every perturbation. With normalized inputs, transform the budget units and valid range accordingly.'} <a href="https://docs.pytorch.org/tutorials/beginner/fgsm_tutorial.html" target="_blank" rel="noopener noreferrer">${ko?'PyTorch의 실제 이미지 실습':'PyTorch image tutorial'} ↗</a></p>
 </section>`;
}
export function fgsmOutput(epsilon,lang){
 const ko=lang==='ko',r=fgsmExample(epsilon),vector=a=>'['+a.map(f).join(', ')+']';
 const same=r.before.prediction===r.after.prediction;
 return `<div class="iou-results">
 <p><b>${ko?'① 원래 예측과 손실':'① Original prediction and loss'}</b><br>x = ${vector(r.x)}, w = [2, −2], b = −0.2, y = 1<br>z = w·x + b = ${f(r.before.z)}, p(y=1) = σ(z) = <strong>${f(r.before.probability)}</strong><br>L = −log(p) = <strong data-fgsm-result="before-loss">${f(r.before.loss)}</strong>; ${ko?'예측 클래스':'predicted class'} = ${r.before.prediction}</p>
 <p><b>${ko?'② 입력 기울기':'② Input gradient'}</b><br>∇ₓL = (p − y)w = <strong data-fgsm-result="gradient">${vector(r.gradient)}</strong><br>${ko?'각 성분의 부호는 이 지점에서 손실이 증가하는 방향을 뜻합니다. 가중치가 아닌 입력에 대한 미분입니다.':'Each sign indicates a local direction of increasing loss. This derivative is with respect to input, not weights.'}</p>
 <p><b>${ko?'③ FGSM 한 단계':'③ One FGSM step'}</b><br>x′ = clip(x + ε sign(∇ₓL), 0, 1)<br>${vector(r.x)} + ${f(epsilon)} × [−1, 1] → <strong data-fgsm-result="input">${vector(r.changed)}</strong><br>${ko?'최대 성분 변화':'Maximum coordinate change'} = ${f(r.maxChange)} ≤ ε</p>
 <p><b>${ko?'④ 바뀐 입력으로 다시 예측':'④ Predict again with the changed input'}</b><br>z′ = ${f(r.after.z)}, p′(y=1) = <strong data-fgsm-result="probability">${f(r.after.probability)}</strong>, L′ = <strong data-fgsm-result="after-loss">${f(r.after.loss)}</strong><br>${ko?'예측 클래스':'Predicted class'}: ${r.before.prediction} → <strong data-fgsm-result="class">${r.after.prediction}</strong> (${same?(ko?'변화 없음':'unchanged'):(ko?'바뀜':'changed')})<br>${ko?'p ≥ 0.5이면 클래스 1로 판정합니다. 이 예에서는 클래스 0이 정답과 다릅니다.':'Class 1 is predicted when p ≥ 0.5. In this example class 0 differs from the true label.'}</p>
 </div>`;
}
