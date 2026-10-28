// Independent four-token example; the upstream app uses model logits instead.
export const exampleLogits = [2, 1, 0, -1];
export function samplingExample({temperature, mode, k, p, draw}, logits=exampleLogits) {
  const scaled = logits.map((logit,index)=>({index,logit,scaled:logit/temperature})).sort((a,b)=>b.scaled-a.scaled || a.index-b.index);
  const max=scaled[0].scaled;
  const weights=scaled.map(item=>Math.exp(item.scaled-max));
  const sum=weights.reduce((a,b)=>a+b,0);
  let cumulative=0;
  const rows=scaled.map((item,index)=>({...item,probability:weights[index]/sum,cumulative:(cumulative+=weights[index]/sum)}));
  let count=mode==='top-k' ? Math.min(k,rows.length) : rows.findIndex(item=>item.cumulative>=p)+1;
  if (count===0) count=rows.length; // Floating-point rounding at p=1.
  const kept=rows.slice(0,count).reduce((a,item)=>a+item.probability,0);
  let running=0;
  for(const [index,row] of rows.entries()) {
    row.kept=index<count;
    row.final=row.kept?row.probability/kept:0;
    running+=row.final;
    row.finalCumulative=running;
  }
  const selected=rows.slice(0,count).find(row=>draw<row.finalCumulative) || rows[count-1];
  return {rows,count,selected};
}
const n=x=>x.toFixed(3);
const text={
  ko:{title:'온도와 다음 토큰 선택',intro:'같은 로짓으로 온도와 후보 선택 규칙을 바꾸어 다음 토큰 확률을 살펴보세요.',fixed:'별도로 만든 토큰 A–D의 로짓 [2, 1, 0, −1]입니다. 원본 모델의 값이나 생성 결과와 연결되지 않습니다.',temperature:'온도 T',mode:'후보 선택 방식',k:'상위 후보 수 k',p:'누적 확률 기준 p',draw:'선택에 쓸 숫자 u',previous:'이전 단계',next:'다음 단계',reset:'처음부터',scaled:'각 로짓을 양수 온도 T로 나눕니다. 낮은 온도는 점수 차이를 키우고, 높은 온도는 줄입니다.',full:'전체 후보에 소프트맥스를 적용한 확률과 높은 순서의 누적 확률입니다. 아직 후보를 제거하지 않았습니다.',filter:'Top-k는 상위 k개를 남깁니다. Top-p는 위 전체 확률의 누적 합이 처음 p 이상이 되는 후보까지 포함합니다. 경계 후보도 포함합니다.',final:'남은 후보의 확률을 합이 1이 되도록 다시 나눕니다. 예시 숫자 u를 0 이상 1 미만의 균등 난수로 생각하면 누적 확률이 u보다 처음 커지는 토큰이 선택됩니다. 슬라이더는 무작위 생성 대신 선택 원리를 보여 줍니다.',selected:'선택된 예시 토큰',token:'토큰',logit:'로짓',scaledLabel:'로짓 / T',prob:'전체 확률',cumulative:'누적 확률',kept:'남김',yes:'예',no:'아니요',finalLabel:'선택 확률',round:'계산은 전체 정밀도로 수행하고 표시값만 반올림합니다.',link:'원본 샘플링 구현 ↗'},
  en:{title:'Temperature and next-token selection',intro:'Change temperature and the candidate rule for the same logits to see the next-token probabilities.',fixed:'This independent toy example uses logits [2, 1, 0, −1] for tokens A–D. It does not use the original model’s logits or generated result.',temperature:'Temperature T',mode:'Candidate selection',k:'Top candidate count k',p:'Cumulative threshold p',draw:'Choice value u',previous:'Previous step',next:'Next step',reset:'Start over',scaled:'Divide each logit by positive temperature T. A lower temperature increases score differences; a higher one reduces them.',full:'Softmax gives probabilities over all candidates; cumulative probabilities follow descending order. No candidate has been removed yet.',filter:'Top-k keeps the k highest candidates. Top-p includes candidates through the first one where the cumulative probability above reaches p. The boundary candidate is included.',final:'Renormalize the retained probabilities to sum to 1. Treat u as a uniform random value from 0 inclusive to 1 exclusive: select the first token whose cumulative probability exceeds u. The slider illustrates selection rather than generating randomness.',selected:'Example selected token',token:'Token',logit:'Logit',scaledLabel:'Logit / T',prob:'Full probability',cumulative:'Cumulative',kept:'Kept',yes:'Yes',no:'No',finalLabel:'Selection probability',round:'Calculations use full precision; only displayed values are rounded.',link:'Original sampling implementation ↗'}
};
export function samplingMarkup(v,lang){
 const t=text[lang];
 const control=(key,min,max,step)=>`<div class="sequence-control"><label for="sample-${key}">${t[key]} <output id="sample-value-${key}">${n(v[key])}</output></label><input id="sample-${key}" data-sample-input="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${v[key]}"></div>`;
 return `<section class="sequence-lab sample-lab" aria-labelledby="sample-title"><div class="eyebrow">TRANSFORMER / SAMPLING</div><h2 id="sample-title">${t.title}</h2><p>${t.intro}</p><p class="sequence-fixed">${t.fixed}</p><div class="sequence-controls">${control('temperature',0.2,2,0.1)}<div class="sequence-control"><label for="sample-mode">${t.mode}</label><select id="sample-mode" data-sample-mode><option value="top-k" ${v.mode==='top-k'?'selected':''}>Top-k</option><option value="top-p" ${v.mode==='top-p'?'selected':''}>Top-p</option></select></div>${control('k',1,4,1)}${control('p',0.1,1,0.1)}${control('draw',0,0.99,0.01)}</div><div id="sample-output" aria-live="polite"></div><div class="sequence-actions"><span id="sample-status"></span><button type="button" data-sample-action="previous">${t.previous}</button><button type="button" data-sample-action="next">${t.next} →</button><button type="button" data-sample-action="reset">${t.reset}</button></div><p class="sequence-rounding">${t.round}</p><p><a href="https://github.com/poloclub/transformer-explainer/blob/bfe50afba10b9b560b84143ee1107d977defa74f/src/utils/data.ts" target="_blank" rel="noopener noreferrer">${t.link}</a></p></section>`;
}
export function samplingOutput(v,lang,stage){
 const t=text[lang], {rows,selected}=samplingExample(v);
 const header=[t.token,t.logit,t.scaledLabel,...(stage>=2?[t.prob,t.cumulative]:[]),...(stage>=3?[t.kept]:[]),...(stage>=4?[t.finalLabel]:[])];
 const table=rows.map(r=>`<tr><th scope="row">${String.fromCharCode(65+r.index)}</th><td>${n(r.logit)}</td><td>${n(r.scaled)}</td>${stage>=2?`<td>${n(r.probability)}</td><td>${n(r.cumulative)}</td>`:''}${stage>=3?`<td>${r.kept?t.yes:t.no}</td>`:''}${stage>=4?`<td>${n(r.final)}</td>`:''}</tr>`).join('');
 return `<div class="conv-calc"><p>${t.scaled}</p>${stage>=2?`<p><code>P(j) = exp(zⱼ/T) / Σ exp(zᵢ/T)</code></p><p>${t.full}</p>`:''}${stage>=3?`<p>${t.filter}</p>`:''}${stage>=4?`<p>${t.final}</p><p><strong>${t.selected}: ${String.fromCharCode(65+selected.index)} (u = ${n(v.draw)})</strong></p>`:''}</div><p class="sequence-rounding">${lang==='ko'?'표가 좁은 화면에서 잘리면 좌우로 이동하세요.':'Scroll the table horizontally on a narrow screen.'}</p><div class="training-history" role="region" tabindex="0" aria-label="${lang==='ko'?'토큰 확률 표':'Token probability table'}"><table><thead><tr>${header.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${table}</tbody></table></div>`;
}
