import {escapeMathHTML as esc} from './math-render.js';

export function practiceReasoning(meaning,question,answer,lang){
 const i=lang==='ko'?0:1;
 return `<section class="practice-reasoning"><h4>${i===0?'이 계산이 이 결과를 만드는 이유':'Why this calculation produces this result'}</h4><p>${esc(meaning[i])}</p><details><summary>${i===0?'직접 바꾸며 확인하기':'Try a controlled change'}</summary><p>${esc(question[i])}</p><details><summary>${i===0?'예상 결과와 이유':'Expected result and reason'}</summary><p>${esc(answer[i])}</p></details></details></section>`;
}
