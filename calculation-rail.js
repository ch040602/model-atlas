const exerciseGroups={
 diffusion:[['diff-output','diff-title'],['latent-output','latent-title'],['clip-output','clip-title'],['cross-output','cross-title'],['cfg-output','cfg-title']],
 gan:[['gantrain-output','gantrain-title'],['ganmodes-output','ganmodes-title']]
};
const names={cnn:'CNN',rnn:'RNN',diffusion:'Diffusion',transformer:'Transformer',gan:'GAN'};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Move the existing journey list, rather than duplicating its IDs or calculations.
export function mountCalculationRail(kind,lang,root=document){
 const rail=root.querySelector('#calculation-rail');
 if(!rail)return;
 const active=Object.hasOwn(names,kind),ko=lang==='ko';
 rail.hidden=!active;rail.closest('.shell').classList.toggle('has-calculation-rail',active);
 rail.replaceChildren();if(!active)return;
 rail.dataset.model=kind;
 const title=ko?'지금까지의 계산 연결':'Connected calculations so far';
 rail.setAttribute('aria-label',`${names[kind]} · ${title}`);
 rail.innerHTML=`<div class="calculation-rail-heading"><span>${names[kind]}</span><h2>${title}</h2></div><div class="calculation-scroll" tabindex="0" role="region" aria-label="${ko?'계산 연결 목록, 별도 스크롤':'Calculation history, independently scrollable'}"></div>`;
 const viewport=rail.querySelector('.calculation-scroll'),history=root.querySelector('.formula-history');
 if(history){viewport.append(history);return;}
 const groups=exerciseGroups[kind]||[];
 viewport.innerHTML=`<p class="calculation-rail-note">${ko?'각 묶음은 독립적인 실습입니다. 본문에서 펼친 단계와 현재 값을 표시합니다.':'Each group is a separate exercise. It shows the steps revealed in the lesson with their current values.'}</p>${groups.map(([id,titleId])=>`<section class="calculation-group" data-calculation-source="${id}"><h3><button type="button" data-unit-jump="${titleId}">${escape(root.querySelector('#'+titleId).textContent)}</button></h3><div class="calculation-group-steps"></div></section>`).join('')}`;
}

// Reuse the exact rendered steps: no second implementation of the toy models.
export function syncLabCalculation(output){
 const rail=output.ownerDocument.querySelector('#calculation-rail');
 const target=rail?.querySelector(`[data-calculation-source="${output.id}"] .calculation-group-steps`);
 if(!target)return;
 const list=output.querySelector('.sequence-steps')?.cloneNode(true);
 if(!list)return;
 // The rail is a reading copy; keep live controls and unique IDs in the lesson.
 for(const node of [list,...list.querySelectorAll('*')]){
  for(const attribute of [...node.attributes])if(attribute.name==='id'||attribute.name.startsWith('data-')||['for','aria-controls','aria-labelledby','aria-describedby'].includes(attribute.name))node.removeAttribute(attribute.name);
 }
 target.replaceChildren(list);
}
