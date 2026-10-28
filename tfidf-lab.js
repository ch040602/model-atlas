const terms=['cat','dog','bird'];
export function tfidfExample(addBird,documentIndex){
  if(typeof addBird!=='boolean'||!Number.isInteger(documentIndex)||documentIndex<0||documentIndex>2)throw new RangeError('choose a document and a boolean');
  const counts=[[2,1,0],[0,1,1],[1,1,addBird?1:0]],n=counts.length;
  const df=terms.map((_,j)=>counts.filter(row=>row[j]>0).length);
  const idf=df.map(value=>Math.log((1+n)/(1+value))+1);
  const raw=counts[documentIndex].map((v,j)=>v*idf[j]);
  const norm=Math.hypot(...raw);
  return {terms,counts,df,idf,raw,norm,normalized:raw.map(v=>norm?v/norm:0)};
}
const f=x=>x.toFixed(3);
export function tfidfMarkup(settings,lang){
 const ko=lang==='ko';
 return `<section class="metric-lab tfidf-lab" aria-labelledby="tfidf-title">
 <h2 id="tfidf-title">${ko?'단어 수에서 TF-IDF 벡터까지':'From word counts to a TF-IDF vector'}</h2>
 <p>${ko?'세 문서를 훈련 말뭉치로 사용하고 단어는 공백으로 구분합니다. 세 번째 문서에 bird를 추가하면 bird의 문서 빈도와 모든 문서에서의 IDF가 어떻게 바뀌는지 확인하세요.':'Use three documents as a training corpus, with whitespace-separated words. Add bird to document 3 and observe how its document frequency and IDF change for every document.'}</p>
 <label><input type="checkbox" data-tfidf-bird ${settings.addBird?'checked':''}> ${ko?'세 번째 문서에 bird 추가':'Add bird to document 3'}</label>
 <label class="tfidf-choice" for="tfidf-doc">${ko?'계산할 문서':'Document to calculate'} <select id="tfidf-doc" data-tfidf-doc><option value="0" ${settings.documentIndex===0?'selected':''}>1</option><option value="1" ${settings.documentIndex===1?'selected':''}>2</option><option value="2" ${settings.documentIndex===2?'selected':''}>3</option></select></label>
 <div id="tfidf-output" aria-live="polite"></div>
 <p>${ko?'여기서는 단어별 출현 횟수를 TF로 쓰고 자연로그와 보정 IDF를 사용합니다. 결과는 L2 정규화합니다. 단어가 없는 벡터는 0으로 두며, 이 예제의 세 문서는 비어 있지 않습니다. 실제로는 어휘와 IDF를 훈련 데이터에서만 학습하세요.':'Here TF is the raw count, IDF is smoothed with the natural logarithm, and the resulting vector is L2-normalized. An all-zero vector remains zero; none of these three documents is empty. Fit the vocabulary and IDF on training data only.'} <a href="https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting" target="_blank" rel="noopener noreferrer">${ko?'계산 방식 참고':'Formula reference'} ↗</a></p>
 </section>`;
}
export function tfidfOutput(settings,lang){
 const ko=lang==='ko',r=tfidfExample(settings.addBird,settings.documentIndex),doc=settings.documentIndex+1;
 return `<div class="tfidf-results"><p><b>${ko?'① 훈련 문서와 어휘':'① Training documents and vocabulary'}</b><br>1: cat cat dog<br>2: dog bird<br>3: dog cat${settings.addBird?' bird':''}<br>${ko?'어휘 순서':'Vocabulary order'}: [cat, dog, bird]</p>
 <p><b>${ko?'② 문서의 단어 수와 전체 문서 빈도':'② Document counts and document frequency'}</b><br>TF(document ${doc}) = [${r.counts[settings.documentIndex].join(', ')}]<br>df = [${r.df.join(', ')}]; N = 3</p>
 <p><b>${ko?'③ 단어별 가중치':'③ Term weights'}</b><br>idf(t) = ln((1+N)/(1+df(t))) + 1<br>idf = [${r.idf.map(f).join(', ')}]<br>TF × idf = [${r.raw.map(f).join(', ')}]</p>
 <p><b>${ko?'④ 길이로 나누기':'④ Normalize by length'}</b><br>‖TF × idf‖₂ = ${f(r.norm)}<br>${ko?'최종 벡터':'Final vector'} = <strong data-tfidf-result="vector">[${r.normalized.map(f).join(', ')}]</strong></p>
 <p>${ko?'df는 단어가 나타난 문서 수로, 한 문서에서 두 번 나와도 1만 셉니다. 화면 표시값만 반올림합니다.':'df counts documents containing a term, not occurrences within one document. Only displayed values are rounded.'}</p></div>`;
}
