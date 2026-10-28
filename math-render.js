import katex from './vendor/katex/katex.js';

export const escapeMathHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// TeX comes from authored lesson content. Keep HTML and URL commands disabled.
const cache=new Map();
export function mathMarkup(tex,{source=tex,inline=false,className=''}={}){
 const key=String(inline)+tex;
 let html=cache.get(key);
 if(!html){
  html=katex.renderToString(tex,{displayMode:!inline,output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false,maxExpand:1000});
  if(cache.size>=2048)cache.clear();
  cache.set(key,html);
 }
 return `<span class="atlas-math ${inline?'math-inline':'math-block'} ${className}" data-math-source="${escapeMathHTML(source)}">${html}</span>`;
}
