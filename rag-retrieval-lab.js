// A fixed toy corpus: lexical TF-IDF retrieval and extractive context, not generation.
const documents=['alpha red blocks','beta blue blocks','gamma blue blocks'];
const queries=['alpha red','blue blocks','fish'];
const vocab=[...new Set(documents.flatMap(d=>d.split(' ')))].sort();
const f=n=>n.toFixed(3);
export function retrieveExample(choice){
 if(!Number.isInteger(choice)||choice<0||choice>=queries.length)throw new RangeError('choose a query');
 const df=vocab.map(term=>documents.filter(d=>d.split(' ').includes(term)).length);
 const idf=df.map(n=>1+Math.log((1+documents.length)/(1+n)));
 const vector=text=>vocab.map((term,i)=>text.split(' ').filter(token=>token===term).length*idf[i]);
 const q=vector(queries[choice]),qnorm=Math.hypot(...q);
 const rows=documents.map((doc,i)=>{
  const v=vector(doc),norm=Math.hypot(...v),dot=v.reduce((sum,x,j)=>sum+x*q[j],0);
  return {id:i+1,doc,vector:v,norm,dot,score:qnorm?dot/(qnorm*norm):0};
 });
 const ranked=rows.slice().sort((a,b)=>b.score-a.score||a.id-b.id);
 return {query:queries[choice],vocab,df,idf,q,qnorm,rows,ranked,selected:ranked[0].score>0?ranked[0]:null};
}
export function ragMarkup(choice,lang){
 const ko=lang==='ko';
 const labels=ko?['alpha와 red 검색','blue와 blocks 검색 (동률)','fish 검색 (어휘 밖)']:['Search alpha and red','Search blue and blocks (tie)','Search fish (out of vocabulary)'];
 return `<section class="metric-lab rag-lab" aria-labelledby="rag-title">
 <h2 id="rag-title">${ko?'검색에서 근거까지 직접 따라가기':'Follow retrieval to evidence'}</h2>
 <p>${ko?'가상의 문서 3개에서 검색어를 바꾸고 검색 점수, 선택된 근거와 답변용 문맥을 확인하세요. 학습을 위한 영어 단어 조합이며 실제 자료가 아닙니다.':'Change a query across three invented documents and inspect the search scores, selected evidence and answer context. These are toy word combinations, not real sources.'}</p>
 <label class="tfidf-choice" for="rag-query">${ko?'검색어':'Query'} <select id="rag-query" data-rag-query>${labels.map((s,i)=>`<option value="${i}" ${choice===i?'selected':''}>${s}</option>`).join('')}</select></label>
 <div id="rag-output" aria-live="polite"></div>
 <p>${ko?'이 예제는 문서에서 어휘와 IDF를 만들고 같은 변환을 검색어에 적용합니다. 공백으로 단어를 나누며 검색어에 없는 어휘는 버립니다. 동률이면 문서 번호가 작은 것을 선택합니다. 점수가 0이면 근거를 주지 않습니다. 유사도는 정답 가능성이나 문서의 신뢰도를 보장하지 않습니다.':'This example fits vocabulary and IDF on the documents and applies the same transform to the query. Words are separated by spaces; unknown query terms are ignored. Ties go to the lower document number. A zero score supplies no evidence. Similarity does not guarantee relevance or source reliability.'}</p>
 <p>${ko?'이 화면은 선택된 문구를 그대로 제시하며 언어 모델을 실행하거나 답변을 생성하지 않습니다. 실제 RAG에서는 선택한 문맥과 질문을 생성 모델에 전달한 후 답변이 출처로 뒷받침되는지 별도 확인합니다.':'This screen copies the selected passage; it does not run a language model or generate an answer. In an actual RAG pipeline, the question and context are sent to a generator, and the resulting answer must be checked against its sources.'} <a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener noreferrer">RAG paper ↗</a> · <a href="https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting" target="_blank" rel="noopener noreferrer">TF-IDF ↗</a></p>
 </section>`;
}
export function ragOutput(choice,lang){
 const ko=lang==='ko',r=retrieveExample(choice);
 const scores=r.rows.map(row=>`<li>D${row.id}: ${f(row.dot)} / (${f(r.qnorm)} × ${f(row.norm)}) = <strong>${r.qnorm?f(row.score):(ko?'계산 불가 (검색어 벡터가 0)':'undefined (zero query vector)')}</strong></li>`).join('');
 const context=r.selected?`<strong data-rag-context>[D${r.selected.id}] ${r.selected.doc}</strong>`:`<strong data-rag-context>${ko?'선택된 근거 없음':'No evidence selected'}</strong>`;
 return `<div class="tfidf-results">
 <p><b>${ko?'① 색인할 문서':'① Documents to index'}</b><br>${r.rows.map(row=>`D${row.id}: ${row.doc}`).join('<br>')}<br>${ko?'어휘 순서':'Vocabulary order'}: [${r.vocab.join(', ')}]</p>
 <p><b>${ko?'② 문서 빈도와 검색어 벡터':'② Document frequencies and query vector'}</b><br>df = [${r.df.join(', ')}]; N = 3<br>idf(t) = ln((1+N)/(1+df(t))) + 1 = [${r.idf.map(f).join(', ')}]<br>${ko?'검색어':'Query'}: ${r.query}<br>TF × idf = [${r.q.map(f).join(', ')}]; ‖q‖ = ${f(r.qnorm)}</p>
 <div><b>${ko?'③ 각 문서와 코사인 유사도':'③ Cosine similarity with each document'}</b><br>score(q,d) = (q · d) / (‖q‖ × ‖d‖)<ul>${scores}</ul></div>
 <p><b>${ko?'④ 상위 1개 문맥':'④ Top-1 context'}</b><br>${context}<br>${r.selected?(ko?'이 문맥과 질문이 생성 모델에 전달될 수 있습니다.':'This context and the question could be supplied to a generator.'):(ko?'근거가 없어 이 예제는 답변용 문맥을 만들지 않습니다.':'Without evidence, this example supplies no answer context.')}</p>
 <p>${ko?'계산은 반올림 전 값으로 수행하고 화면에는 소수 셋째 자리까지 표시합니다.':'Calculations use full precision; displayed values are rounded to three decimals.'}</p></div>`;
}
