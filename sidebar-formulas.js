// Shared navigation only: no renderer or model download is needed by this menu.
const models=[
 ['cnn','CNN',20,'입력 → 특징 → 분류·갱신','Input → features → classification and update'],
 ['rnn','RNN',21,'입력 → 상태 → 손실·역전파','Input → states → loss and backpropagation'],
 ['transformer','Transformer',41,'토큰 → 어텐션 → 다음 토큰','Tokens → attention → next token']
];
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function formulaSidebar(lang,{current='',hrefFor=id=>`index.html?section=formula-title#${id}`}={}){
 const ko=lang==='ko',title=ko?'수식 처음부터 따라가기':'Follow formulas from the start';
 return `<section class="sidebar-formulas" aria-labelledby="sidebar-formulas-title"><h2 id="sidebar-formulas-title">${title}</h2><div role="navigation" aria-label="${title}">${models.map(([id,name,count,a,b])=>`<a class="sidebar-formula-link ${current===id?'is-current':''}" data-formula-start="${id}" href="${escape(hrefFor(id))}"><span>${name}<small>${count}${ko?'단계':' steps'}</small></span><span class="sidebar-formula-caption">${ko?a:b}</span></a>`).join('')}</div></section>`;
}
