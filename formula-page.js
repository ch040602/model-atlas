import {formulaDefaults,formulaWalkthrough,num} from './formula-model.js';
import {formulaMarkup,updateFormula,formulaAction,formulaScaleResult,formulaURL} from './formula-walkthrough.js';
import {formulaSidebar} from './sidebar-formulas.js';
import {mountCalculationRail} from './calculation-rail.js';

const query=new URLSearchParams(location.search),kind=Object.hasOwn(formulaDefaults,query.get('model'))?query.get('model'):'transformer';
let lang=query.get('lang')==='en'?'en':'ko',step=0;
const values={...formulaDefaults[kind]},root=document.querySelector('#formula-page');
const fields={
 cnn:[['center',-1,1,'가운데 픽셀','Center pixel'],['strength',0,2,'필터 강도 s','Kernel strength s'],['bias',-1,1,'편향 b','Bias b']],
 rnn:[['x1',-1,1,'첫 입력 x₁','First input x₁'],['x2',-1,1,'두 번째 입력 x₂','Second input x₂'],['x3',-1,1,'세 번째 입력 x₃','Third input x₃'],['weight',-2,2,'순환 가중치 Wₕ','Recurrent weight Wₕ'],['target',-1,1,'정답 y','Target y']],
 transformer:[['x1',-2,2,'두 번째 위치 첫 특성','Position 2, first feature'],['x2',-2,2,'두 번째 위치 둘째 특성','Position 2, second feature'],['gamma',-2,2,'정규화 크기 γ','Normalization scale γ'],['beta',-2,2,'정규화 이동 β','Normalization shift β']]
};
// Whitelist both names and ranges; never render arbitrary query text.
for(const [key,min,max] of fields[kind])if(query.has(key)){
 const value=Number(query.get(key));if(Number.isFinite(value))values[key]=Math.max(min,Math.min(max,value));
}
if(kind==='transformer'&&query.get('activation')==='relu')values.activation='relu';
const requested=Number(query.get('step'));if(Number.isInteger(requested))step=Math.max(0,Math.min(formulaWalkthrough(kind,values).steps.length-1,requested));
function refresh(){
 step=updateFormula(document,kind,values,lang,step);
 const relative=formulaURL(kind,values,lang,step);history.replaceState(null,'',relative);
 document.querySelector(`#formula-sidebar [data-formula-start="${kind}"]`).href=formulaURL(kind,values,lang,0);
}
function render(){
 const ko=lang==='ko';document.documentElement.lang=lang;document.title=`${kind.toUpperCase()} — ${ko?'수식 여정':'Formula journey'} · Model Atlas`;
 document.querySelector('#formula-sidebar').innerHTML=`<a class="brand" href="index.html#${kind}"><span>MODEL <b>ATLAS</b><small>LEARN BY LOOKING CLOSER</small></span></a><div class="sidebar-tools"><button class="language" type="button" data-formula-language>${ko?'English':'한국어'}</button></div><a class="concept-library-link" href="index.html#${kind}">← ${ko?'단원으로 돌아가기':'Back to the chapter'}</a>${formulaSidebar(lang,{current:kind,hrefFor:id=>formulaURL(id,id===kind?values:formulaDefaults[id],lang,0)})}`;
 root.innerHTML=`<h1>${kind.toUpperCase()} · ${ko?'입력부터 끝까지 이어지는 수식':'Connected equations from input to output'}</h1><div class="formula-page-controls">${fields[kind].map(([key,min,max,a,b])=>`<label>${ko?a:b}<output id="page-value-${key}">${num(values[key])}</output><input type="range" data-formula-value="${key}" min="${min}" max="${max}" step="0.1" value="${values[key]}"></label>`).join('')}${kind==='transformer'?`<label>${ko?'MLP 활성화':'MLP activation'}<select data-formula-activation><option value="gelu" ${values.activation==='gelu'?'selected':''}>GELU ≈</option><option value="relu" ${values.activation==='relu'?'selected':''}>ReLU</option></select></label>`:''}</div>${formulaMarkup(kind,values,lang,step)}`;
 mountCalculationRail(kind,lang);
 refresh();
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-formula-language]')){lang=lang==='ko'?'en':'ko';render();return;}
 const next=formulaAction(event,step,formulaWalkthrough(kind,values,lang).steps.length);
 if(next===null)return;
 const jumped=Boolean(event.target.closest('[data-formula-jump]'));step=next;refresh();
 if(jumped){const heading=root.querySelector('#formula-current-title');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}
});
root.addEventListener('change',event=>{
 if(event.target.matches('[data-formula-select]')){step=Number(event.target.value);refresh();}
 if(event.target.matches('[data-formula-activation]')){values.activation=event.target.value;refresh();}
});
root.addEventListener('input',event=>{
 const field=event.target.dataset.formulaValue;
 if(field){values[field]=Number(event.target.value);root.querySelector(`#page-value-${field}`).textContent=num(values[field]);refresh();}
 if(event.target.matches('[data-formula-dimension]')){
  const d=Number(event.target.value);root.querySelector('#formula-dimension-value').textContent=d;root.querySelector('#formula-scale-result').innerHTML=formulaScaleResult(d,lang);
 }
});
render();
