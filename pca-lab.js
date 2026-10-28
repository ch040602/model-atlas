// Four centered, two-dimensional training points. Axis selection is manual:
// PCA itself would select the direction with maximum projected variance.
const points=[[-1,-1],[-0.4,0.4],[0.4,-0.4],[1,1]];
export function pcaProjection(angle){
  if(!Number.isFinite(angle)||angle < -90||angle > 90) throw new RangeError('angle must be between -90 and 90 degrees');
  const radians=angle*Math.PI/180, axis=[Math.cos(radians),Math.sin(radians)];
  const samples=points.map(point=>{
    const score=point[0]*axis[0]+point[1]*axis[1];
    const reconstructed=axis.map(value=>score*value);
    return {point,score,reconstructed};
  });
  const total=points.reduce((sum,[x,y])=>sum+x*x+y*y,0);
  const kept=samples.reduce((sum,s)=>sum+s.score*s.score,0);
  const error=samples.reduce((sum,s)=>sum+(s.point[0]-s.reconstructed[0])**2+(s.point[1]-s.reconstructed[1])**2,0);
  return {axis,samples,total,kept,error,ratio:kept/total};
}
const f=n=>(Math.abs(n)<0.0005?0:n).toFixed(3);
export function pcaLabMarkup(angle,lang){
  const ko=lang==='ko';
  return `<section class="metric-lab pca-lab" aria-labelledby="pca-title">
    <h2 id="pca-title">${ko?'2차원을 한 축으로 압축하기':'Compress two dimensions onto one axis'}</h2>
    <p>${ko?'훈련 점은 (−1, −1), (−0.4, 0.4), (0.4, −0.4), (1, 1)이며 평균은 (0, 0)입니다. 축을 0°, 45°, −45°로 바꾸며 네 점의 투영과 복원을 비교해 보세요.':'The training points are (−1, −1), (−0.4, 0.4), (0.4, −0.4), and (1, 1), with mean (0, 0). Compare projection and reconstruction at 0°, 45°, and −45°.'}</p>
    <label class="pca-control" for="pca-angle">${ko?'축의 각도 θ':'Axis angle θ'} <output id="pca-angle-value">${angle}°</output></label>
    <input id="pca-angle" data-pca-angle type="range" min="-90" max="90" step="5" value="${angle}">
    <div id="pca-output" aria-live="polite"></div>
    <p>${ko?'PCA는 훈련 데이터에서 분산이 가장 큰 축을 선택합니다. 이 예제에서는 45°가 첫 주성분입니다. 축의 부호를 뒤집어도 같은 직선입니다. 실제 데이터에서는 평균과 축을 훈련 데이터로만 구해 검증·시험에 적용합니다.':'PCA selects the direction with maximum variance on training data. Here 45° is the first principal component. Reversing an axis gives the same line. For real data, fit the mean and axes on training data only, then apply them to validation and test data.'}</p>
    <p>${ko?'두 특징의 단위나 크기가 다르면 분산과 선택된 축이 달라질 수 있습니다. 작은 분산이 항상 불필요한 정보는 아닙니다. 이 예제는 평균이 0인 점에 별도 표준화를 적용하지 않습니다.':'Different feature scales can change variance and the selected axis. Low variance does not always mean unimportant information. These centered points are not separately standardized.'}</p>
    <p><a href="https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html" target="_blank" rel="noopener noreferrer">${ko?'PCA 참고 자료':'PCA reference'} ↗</a></p>
  </section>`;
}
export function pcaLabOutput(angle,lang){
  const ko=lang==='ko', r=pcaProjection(angle), sample=r.samples[3];
  const xy=([x,y])=>[130+75*x,120-75*y].map(f);
  const a=xy(r.axis.map(x=>x*1.55)),b=xy(r.axis.map(x=>-x*1.55));
  const projections=r.samples.map(s=>{
    const [x,y]=xy(s.point),[px,py]=xy(s.reconstructed);
    return `<line x1="${x}" y1="${y}" x2="${px}" y2="${py}" class="pca-error"/><circle cx="${x}" cy="${y}" r="5" class="pca-point"/><circle cx="${px}" cy="${py}" r="4" class="pca-projection"/>`;
  }).join('');
  return `<div class="pca-layout">
    <svg class="pca-diagram" viewBox="0 0 260 240" aria-hidden="true">
      <line x1="10" y1="120" x2="250" y2="120" class="pca-coordinate"/>
      <line x1="130" y1="4" x2="130" y2="236" class="pca-coordinate"/>
      <line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="pca-axis"/>
      ${projections}
    </svg>
    <div><p class="pca-legend"><span class="pca-original-key">●</span> ${ko?'원래 점':'Original points'} · <span class="pca-projection-key">●</span> ${ko?'복원한 점':'reconstructed points'} · ─ ${ko?'선택한 축':'selected axis'}</p>
      <p><b>${ko?'① 선택한 단위 축':'① Chosen unit axis'}</b><br>u = (cos θ, sin θ) = (${f(r.axis[0])}, ${f(r.axis[1])})</p>
      <p><b>${ko?'② 점 (1, 1)을 1차원으로 투영':'② Project point (1, 1) to one dimension'}</b><br>z = (1, 1) · u = ${f(sample.score)}</p>
      <p><b>${ko?'③ 다시 2차원으로 복원':'③ Reconstruct in two dimensions'}</b><br>x̂ = z u = (${f(sample.reconstructed[0])}, ${f(sample.reconstructed[1])})</p>
    </div>
  </div>
  <p class="pca-result"><b>${ko?'④ 네 훈련 점의 분산과 오차':'④ Variance and error across the four training points'}</b><br>
    ${ko?'보존 분산 비율':'Retained variance ratio'} = Σz² / Σ‖x‖² = ${f(r.kept)} / ${f(r.total)} = <strong>${(100*r.ratio).toFixed(1)}%</strong><br>
    ${ko?'복원 오차 제곱합':'Squared reconstruction error'} = Σ‖x − x̂‖² = ${f(r.error)}
  </p>
  <p>${ko?'z는 점 하나를 나타내는 숫자 한 개입니다. 복원값 x̂는 선택한 축 위에 있으므로 원래 점과 다를 수 있으며, 점선은 그 차이를 보여 줍니다. 화면의 수치는 반올림했지만 계산에는 전체 정밀도를 사용합니다.':'z is one number representing a point. The reconstruction x̂ lies on the chosen axis and can differ from the original; dashed lines show that difference. Values are rounded for display but calculations use full precision.'}</p>`;
}
