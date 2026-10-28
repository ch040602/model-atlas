// Original articles mount asynchronously and images can shift their positions.
// Settle an explicit article link, then stop immediately when the reader acts.
(()=>{
 let stop=()=>{};
 function follow(){
  stop();
  const id=location.hash.slice(1);
  if(!/^(article-[a-z-]+|figure-[a-z-]+|embedding|self-attention|description)$/.test(id))return;
  let frame=0,focused=false;
  function align(){
   frame=0;const target=document.getElementById(id);if(!target)return;
   target.style.scrollMarginTop='24px';
   target.scrollIntoView({block:'start',behavior:'instant'});
   if(!focused){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});focused=true;}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(align);}
  const resize=new ResizeObserver(schedule),mount=new MutationObserver(schedule);
  resize.observe(document.body);mount.observe(document.body,{childList:true,subtree:true});
  const inputs=['wheel','pointerdown','keydown','touchstart'];
  const timeout=setTimeout(()=>stop(),10000);
  stop=()=>{resize.disconnect();mount.disconnect();cancelAnimationFrame(frame);clearTimeout(timeout);inputs.forEach(type=>window.removeEventListener(type,stop));};
  inputs.forEach(type=>window.addEventListener(type,stop,{passive:true,once:true}));schedule();
 }
 window.addEventListener('hashchange',follow);
 follow();
 import('./original-cursor-help.js');
 if(new URLSearchParams(location.search).has('atlas-model'))import('./article-formula-reference.js');
})();
