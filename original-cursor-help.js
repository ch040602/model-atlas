import {cursorMatch,cursorContext,keyboardRegions} from './original-cursor-context.js';
import {mathMarkup,escapeMathHTML as esc} from './math-render.js';
import {formulaDetailMarkup} from './formula-details.js';

// Keep this entry in the original pages as well as their iframes, so opening an
// upstream lab in its own window retains the same explanations.
export function installOriginalCursorHelp(doc=document){
 const win=doc.defaultView,path=win.location.pathname;
 const kind=path.includes('/cnn-explainer/')?'cnn':path.includes('/transformer-explainer/')?'transformer':path.includes('/diffusion-explainer/')?'diffusion':path.includes('/ganlab/')?'gan':null;
 if(!kind||doc.getElementById('atlas-cursor-help'))return;
 const lang=new URLSearchParams(win.location.search).get('lang')==='en'?'en':'ko',ko=lang==='ko',t=(a,b)=>ko?a:b;
 for(const file of ['original-cursor-help.css','vendor/katex/katex.min.css','math-render.css']){
  const href=new URL(file,import.meta.url).href;
  if(![...doc.querySelectorAll('link[rel=stylesheet]')].some(el=>el.href===href)){
   const css=doc.createElement('link');css.rel='stylesheet';css.href=href;doc.head.append(css);
  }
 }
 const panel=doc.createElement('aside');panel.id='atlas-cursor-help';panel.lang=lang;panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','atlas-cursor-title');panel.tabIndex=-1;
 // A manual popover stays above upstream SVG/popovers without trapping focus.
 const topLayer=typeof panel.showPopover==='function';if(topLayer)panel.setAttribute('popover','manual');
 panel.innerHTML=`<header><span>${t('커서로 읽는 원본 실습','Read the original at your cursor')}</span><button type="button" data-cursor-close aria-label="${t('설명 닫기','Close explanation')}">×</button></header><div class="atlas-cursor-content"></div><footer><button type="button" data-cursor-pin aria-pressed="false">${t('설명 고정','Pin explanation')}</button><button type="button" data-cursor-refresh>${t('현재 값 새로 읽기','Read current values')}</button></footer>`;
 const toggle=doc.createElement('button');toggle.type='button';toggle.id='atlas-cursor-toggle';toggle.lang=lang;toggle.setAttribute('aria-pressed','true');toggle.textContent=t('커서 설명 켜짐','Cursor help on');toggle.title=t('요소에 마우스를 올리거나 Tab으로 이동하세요. F2로 설명에 초점을 옮깁니다. 터치는 요소를 탭하세요.','Hover or Tab to a component. F2 focuses its explanation. On touch screens, tap a component.');
 doc.body.append(panel,toggle);
 const content=panel.querySelector('.atlas-cursor-content'),pin=panel.querySelector('[data-cursor-pin]');
 let enabled=true,pinned=false,active=null,pending=null,point=null,samplePoint=null,shownKey='',showTimer=0,hideTimer=0,decorateTimer=0,suppressed=null,lastRead=0,lastPointerDown=0,pointerFocusTarget=null;
 const visible=()=>!panel.hidden;
 function clearActive(){
  if(!active)return;
  active.element.classList.remove('atlas-cursor-target');
  active.element.removeAttribute('data-atlas-cursor-target');
  const ids=(active.element.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!=='atlas-cursor-description');
  if(ids.length)active.element.setAttribute('aria-describedby',ids.join(' '));else active.element.removeAttribute('aria-describedby');
 }
 function hide(){
  clearTimeout(showTimer);clearTimeout(hideTimer);pending=null;
  clearActive();active=null;shownKey='';pinned=false;pin.setAttribute('aria-pressed','false');
  if(topLayer&&panel.matches(':popover-open'))panel.hidePopover();panel.hidden=true;
 }
 function place(){
  const gap=16,rect=panel.getBoundingClientRect(),width=win.innerWidth,height=win.innerHeight;
  let x=(point?.x??width-rect.width-gap)+gap,y=(point?.y??gap)+gap;
  if(x+rect.width>width-gap)x=(point?.x??width)-rect.width-gap;
  if(y+rect.height>height-gap)y=(point?.y??height)-rect.height-gap;
  panel.style.left=`${Math.max(gap,Math.min(x,width-rect.width-gap))}px`;
  panel.style.top=`${Math.max(gap,Math.min(y,height-rect.height-gap))}px`;
 }
 function render(match,force=false){
  if(!match.element.isConnected){hide();return;}
  const data=cursorContext(match,samplePoint,lang);if(!data)return;
  if(!force&&visible()&&shownKey===data.key&&active?.element===match.element)return;
  const changedTarget=active?.element!==match.element;
  clearActive();active=match;shownKey=data.key;
  match.element.classList.add('atlas-cursor-target');
  match.element.setAttribute('data-atlas-cursor-target','');
  if(!match.element.hasAttribute('aria-keyshortcuts'))match.element.setAttribute('aria-keyshortcuts','F2');
  const ids=new Set((match.element.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add('atlas-cursor-description');match.element.setAttribute('aria-describedby',[...ids].join(' '));
  const chapter=kind==='gan'?'gan':kind;
  const destination=new URL(`index.html?lang=${lang}#${chapter}`,import.meta.url).href;
  content.innerHTML=`<h3 id="atlas-cursor-title">${esc(data.title)}</h3><p id="atlas-cursor-description">${esc(data.why)}</p>${data.tex?mathMarkup(data.tex):''}${data.live?`<section class="atlas-cursor-live"><h4>${t('가리킨 위치 · 읽은 시점의 값','At this location · values when read')}</h4><p>${esc(data.live)}</p>${data.calculation?mathMarkup(data.calculation):''}</section>`:''}${data.details.length?`<details data-cursor-derivation><summary>${t('왜 이 식인가 · 원리와 별도 수치 예제','Why this equation · principles and separate examples')}</summary><div></div></details>`:''}<a href="${esc(destination)}" target="_blank" rel="noopener noreferrer">${t('이 모델의 단계별 계산에서 이어 보기 ↗','Continue with this model’s worked calculations ↗')}</a><p class="atlas-cursor-hint">${t('커서를 잠시 멈추면 설명합니다. 고정하면 펼쳐 읽을 수 있습니다. 애니메이션·학습 중 바뀐 값은 새로 읽으세요. Tab/터치 지원 · F2: 설명으로 · Esc: 닫기.','Pause over a component to inspect it. Pin to read further. Read again for values changed by animation or training. Tab/touch supported · F2: focus explanation · Esc: close.')}</p>`;
  const derivation=content.querySelector('[data-cursor-derivation]');
  derivation?.addEventListener('toggle',()=>{
   if(derivation.open&&!derivation.querySelector('.formula-detail')){
    derivation.querySelector('div').innerHTML=formulaDetailMarkup(data.details,lang,true);place();
   }
  });
  panel.hidden=false;if(topLayer&&!panel.matches(':popover-open'))panel.showPopover();
  if(changedTarget)panel.scrollTop=0;
  pin.setAttribute('aria-pressed',String(pinned));pin.textContent=pinned?t('고정 해제','Unpin'):t('설명 고정','Pin explanation');place();
 }
 function scheduleClose(){clearTimeout(hideTimer);if(!pinned)hideTimer=setTimeout(hide,450);}
 function onPointer(event){
  if(panel.contains(event.target)||toggle.contains(event.target)){clearTimeout(hideTimer);clearTimeout(showTimer);return;}
  if(!enabled||pinned)return;
  const match=cursorMatch(event.target,kind);point={x:event.clientX,y:event.clientY};samplePoint=point;
  if(!match){clearTimeout(showTimer);pending=null;suppressed=null;scheduleClose();return;}
  if(suppressed===match.element)return;suppressed=null;clearTimeout(hideTimer);
  if(active?.element===match.element&&visible()){
   // Moving within a feature-map image can change the numeric coordinate.
   if(Date.now()-lastRead>160){lastRead=Date.now();render(match);}return;
  }
  if(pending?.element===match.element)return;
  clearTimeout(showTimer);pending=match;showTimer=setTimeout(()=>{pending=null;render(match);},280);
 }
 doc.addEventListener('pointermove',onPointer,{passive:true,capture:true});
 doc.addEventListener('pointerdown',event=>{
  lastPointerDown=Date.now();
  pointerFocusTarget=null;
  if(!enabled||panel.contains(event.target)||toggle.contains(event.target))return;
  const match=cursorMatch(event.target,kind);if(!match)return;
  pointerFocusTarget=match.element;
  // Mouse-down focus must not open a card between an original control's down
  // and up events. Close the unpinned hover card before the original click.
  if(event.pointerType!=='touch'){if(!pinned)hide();suppressed=match.element;return;}
  clearTimeout(showTimer);clearTimeout(hideTimer);point={x:event.clientX,y:event.clientY};samplePoint=point;pinned=true;render(match,true);
 },{passive:true,capture:true});
 doc.addEventListener('focusin',event=>{
  if(!enabled||pinned||panel.contains(event.target)||toggle.contains(event.target))return;
  const match=cursorMatch(event.target,kind);if(!match)return;
  if(match.element===pointerFocusTarget&&Date.now()-lastPointerDown<250)return;
  const rect=match.element.getBoundingClientRect();point={x:rect.left+rect.width/2,y:rect.top+rect.height/2};samplePoint=null;
  clearTimeout(showTimer);clearTimeout(hideTimer);suppressed=null;render(match,true);
 },true);
 doc.addEventListener('focusout',event=>{if(!panel.contains(event.relatedTarget)&&!active?.element.contains(event.relatedTarget))scheduleClose();},true);
 panel.addEventListener('pointerenter',()=>{clearTimeout(hideTimer);clearTimeout(showTimer);});
 panel.addEventListener('pointerleave',scheduleClose);
 panel.addEventListener('focusin',()=>clearTimeout(hideTimer));
 pin.addEventListener('click',()=>{pinned=!pinned;pin.setAttribute('aria-pressed',String(pinned));pin.textContent=pinned?t('고정 해제','Unpin'):t('설명 고정','Pin explanation');});
 panel.querySelector('[data-cursor-refresh]').addEventListener('click',()=>{if(active)render(active,true);});
 function dismiss(){const target=active?.element;if(panel.contains(doc.activeElement)&&target?.isConnected)target.focus({preventScroll:true});hide();suppressed=target;}
 panel.querySelector('[data-cursor-close]').addEventListener('click',dismiss);
 doc.addEventListener('keydown',event=>{
  lastPointerDown=0;
  if(event.key==='Escape'&&visible()){dismiss();return;}
  if(event.key==='F2'&&visible()){event.preventDefault();pinned=true;pin.setAttribute('aria-pressed','true');pin.textContent=t('고정 해제','Unpin');panel.focus({preventScroll:true});}
 },true);
 toggle.addEventListener('click',()=>{enabled=!enabled;toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?t('커서 설명 켜짐','Cursor help on'):t('커서 설명 꺼짐','Cursor help off');if(!enabled)hide();});
 win.addEventListener('resize',()=>{if(visible())place();});
 // Only semantic regions gain an extra focus stop; existing control roles,
 // roving tabindex values and original aria-describedby tokens are preserved.
 function decorate(){
  const selector=keyboardRegions(kind);if(!selector)return;
  for(const el of doc.querySelectorAll(selector)){
   if(!el.hasAttribute('tabindex')&&!el.matches('a,button,input,select,textarea,[role=button]'))el.setAttribute('tabindex','0');
   if(!el.hasAttribute('aria-keyshortcuts'))el.setAttribute('aria-keyshortcuts','F2');
  }
 }
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>!panel.contains(r.target)&&r.addedNodes.length)||decorateTimer)return;
  decorateTimer=setTimeout(()=>{decorateTimer=0;decorate();},250);
 });
 observer.observe(doc.body,{childList:true,subtree:true});decorate();
}
if(typeof document!=='undefined')installOriginalCursorHelp();
