import {formulaDefaults,formulaWalkthrough} from './formula-model.js';
import {formulaURL} from './formula-walkthrough.js';
import {stepTex} from './formula-tex.js';
import {mathMarkup} from './math-render.js';
import {conceptChips,conceptsForStep,decorateMathConcepts} from './concept-help.js';

// A read-along reference in the original's own window, with the exact numerical
// snapshot from the lesson. Upstream model inputs and weights remain independent.
const q=new URLSearchParams(location.search),kind=q.get('atlas-model');
if(['cnn','transformer'].includes(kind)){
 const lang=q.get('lang')==='en'?'en':'ko',ko=lang==='ko',values={...formulaDefaults[kind]};
 const limits={center:[-1,1],strength:[0,2],bias:[-1,1],x1:[-2,2],x2:[-2,2],gamma:[-2,2],beta:[-2,2]};
 for(const key of Object.keys(values))if(q.has(`atlas-${key}`)){
  if(key==='activation'){values[key]=q.get(`atlas-${key}`)==='relu'?'relu':'gelu';continue;}
  const n=Number(q.get(`atlas-${key}`));if(Number.isFinite(n))values[key]=Math.max(limits[key][0],Math.min(limits[key][1],n));
 }
 const m=formulaWalkthrough(kind,values,lang),raw=Number(q.get('atlas-step')),step=Number.isInteger(raw)?Math.max(0,Math.min(m.steps.length-1,raw)):0,s=m.steps[step];
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./article-formula-reference.css',import.meta.url).href;document.head.append(link);
 for(const file of ['vendor/katex/katex.min.css','math-render.css']){
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL(file,import.meta.url).href;document.head.append(css);
 }
 const box=document.createElement('aside');box.className='atlas-formula-reference';box.lang=lang;box.setAttribute('aria-label',ko?'앞에서 계산한 수식':'Previously calculated formula');
 const details=document.createElement('details');details.open=window.innerWidth>=900;
 const summary=document.createElement('summary');summary.textContent=`${kind.toUpperCase()} · ${step+1}/${m.steps.length} · ${s.title}`;details.append(summary);
 const content=document.createElement('div');content.className='atlas-reference-content';
 const add=(tag,text)=>{const element=document.createElement(tag);element.textContent=text;content.append(element);return element;};
 add('p',ko?'이 창의 해당 문단과 앞에서 계산한 식을 함께 읽으세요. 원본의 가중치·숫자는 별도입니다.':'Read this article section alongside your worked equation. The original uses separate weights and numbers.');
 const f=stepTex(kind,s);
 for(const key of ['equation','calculation','result']){
  if(key==='result')add('strong',ko?'계산 결과':'Result');
  const math=add('div','');math.innerHTML=mathMarkup(f[key],{source:s[key]});
 }
 const help=add('div','');help.innerHTML=conceptChips(conceptsForStep(kind,s,f.equation),lang);
 add('p',s.role);
 const back=add('a',ko?'전체 수식 여정에서 계속 보기 ↗':'Continue in the full formula journey ↗');
 back.href=new URL(formulaURL(kind,values,lang,step),import.meta.url).href;back.target='_blank';back.rel='noopener noreferrer';
 const close=add('button',ko?'수식 참고 닫기':'Close formula reference');close.type='button';close.dataset.formulaReferenceClose='';close.addEventListener('click',()=>{box.remove();decorateMathConcepts(document,lang);});
 details.append(content);box.append(details);document.body.append(box);
 decorateMathConcepts(box,lang);
}
