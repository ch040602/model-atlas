// Presentation only: numerical results remain in formula-model.js and its labs.
// Main equations are authored explicitly so a slash never guesses the scope of
// a sum, derivative, root or softmax denominator.
const tex=String.raw;
const equations={
 cnn:{
  input:tex`X\in\mathbb{R}^{3\times3\times1},\quad K\in\mathbb{R}^{2\times2}`,
  shape:tex`H_{\mathrm{out}}=\left\lfloor\frac{H+2P-F}{S}\right\rfloor+1`,
  patch:tex`P_{ij}[u,v]=X[i+u,j+v]`,
  'weighted-sum':tex`s_{01}=\sum_{u=0}^{1}\sum_{v=0}^{1}X[u,1+v]K[u,v]`,
  bias:tex`z_{01}=s_{01}+b`,relu:tex`a_{01}=\operatorname{ReLU}(z_{01})=\max(0,z_{01})`,
  map:tex`A[i,j]=\operatorname{ReLU}\!\left(\sum_{u=0}^{1}\sum_{v=0}^{1}X[i+u,j+v]K[u,v]+b\right)`,
  'pool-sum':tex`S_A=\sum_{i,j} A[i,j]`,
  'pool-divide':tex`g=\frac{1}{H'W'}\sum_{i,j}A[i,j]=\frac{S_A}{H'W'}`,
  classifier:tex`\ell=gW_{\mathrm{out}}+b_{\mathrm{out}}`,
  exponential:tex`e_c=\exp(\ell_c)`,denominator:tex`D=\sum_j\exp(\ell_j)`,
  probabilities:tex`p_c=\frac{\exp(\ell_c)}{\sum_j\exp(\ell_j)}`,
  loss:tex`L=-\log p_A`,
  gradient:tex`\frac{\partial L}{\partial s}=\sum_{i,j}(p_A-1)\cdot\frac{1}{4}\cdot\mathbf{1}_{\{z_{ij}>0\}}\cdot\frac{\partial z_{ij}}{\partial s}`,
  update:tex`s_{\mathrm{new}}=s-\eta\frac{\partial L}{\partial s}`
 },
 rnn:{
  initial:tex`h_0=0;\quad W_x=1;\quad W_h=w;\quad b=0`,
  output:tex`\hat y=W_{\mathrm{out}}h_3+b_{\mathrm{out}}`,error:tex`e=\hat y-y`,loss:tex`L=(\hat y-y)^2`,
  'shared-gradient':tex`\frac{\partial L}{\partial W_h}=\sum_{t=1}^{3}\delta_t h_{t-1}`,
  update:tex`W_{h,\mathrm{new}}=W_h-\eta\frac{\partial L}{\partial W_h}`
 },
 transformer:{
  tokens:tex`\text{text}\longrightarrow\operatorname{tokenizer}\longrightarrow[\mathrm{id}_A,\mathrm{id}_B]`,
  embedding:tex`E_t=W_E[\mathrm{id}_t]`,position:tex`X_t=E_t+P_t`,
  query:tex`Q=UW_Q;\quad W_Q=\begin{bmatrix}1\\0\end{bmatrix}`,
  key:tex`K_1=U\begin{bmatrix}1\\0\end{bmatrix};\quad K_2=U\begin{bmatrix}0\\1\end{bmatrix}`,
  value:tex`V_1=U\begin{bmatrix}0\\1\end{bmatrix};\quad V_2=U\begin{bmatrix}1\\0\end{bmatrix}`,
  dot:tex`s_j=q_2\cdot k_j=\sum_{r=1}^{d_k}q_{2,r}k_{j,r}`,
  scale:tex`S_{\mathrm{scaled}}=\frac{QK^{\mathsf T}}{\sqrt{d_k}}`,
  mask:tex`\begin{gathered}S_{\mathrm{masked}}=\frac{QK^{\mathsf T}}{\sqrt{d_k}}+M\\[4pt]M_{ij}=\begin{cases}-\infty&j>i\\0&j\le i\end{cases}\end{gathered}`,
  'softmax-shift':tex`s'_j=s_j-\max_k s_k`,
  'softmax-exp':tex`e_j=\exp(s'_j)`,
  'softmax-sum':tex`D_s=\sum_j\exp(s'_j)`,
  'softmax-divide':tex`\alpha_j=\frac{\exp(s'_j)}{\sum_k\exp(s'_k)}`,
  head1:tex`\mathrm{head}_1=\sum_j\alpha_j V_j`,
  head2:tex`\mathrm{head}_2=\operatorname{softmax}\!\left(\frac{Q_2K_2^{\mathsf T}}{\sqrt{d_k}}+M\right)V_2`,
  concat:tex`C=\operatorname{Concat}(\mathrm{head}_1,\mathrm{head}_2)`,
  projection:tex`a=CW^O;\quad W^O=\begin{bmatrix}1&0.5\\-0.5&1\end{bmatrix}`,
  residual1:tex`R=X+a`,
  'mlp-first':tex`Z=\operatorname{LN}_2(R)W_1+b_1;\quad W_1=I;\quad b_1=0`,
  'mlp-second':tex`m=HW_2+b_2;\quad W_2=0.5I;\quad b_2=0`,
  residual2:tex`Y=R+m`,logits:tex`\ell=\operatorname{LN}_f(Y)W_{\mathrm{vocab}}+b_{\mathrm{vocab}}`,
  'vocab-exp':tex`e_c=\exp(\ell_c-\max\ell)`,
  probability:tex`p_c=\frac{\exp(\ell_c-\max\ell)}{\sum_j\exp(\ell_j-\max\ell)}`,
  loss:tex`L=-\log p_A`
 }
};

const sub={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₐ':'a','ₑ':'e','ₓ':'x','ₕ':'h','ₖ':'k','ₗ':'l','ₘ':'m','ₙ':'n','ₒ':'o','ₚ':'p','ₛ':'s','ₜ':'t','ᵢ':'i','ⱼ':'j','ᵣ':'r','ᵤ':'u','ᵥ':'v','₊':'+','₋':'-','₌':'='};
const sup={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ˣ':'x','ᵀ':tex`\mathsf T`,'ᴼ':'O','ᴺ':'N','ˡ':'l','⁺':'+','⁻':'-','⁽':'(','⁾':')'};
const symbols={'γ':tex`\gamma `,'β':tex`\beta `,'μ':tex`\mu `,'σ':tex`\sigma `,'ε':tex`\varepsilon `,'η':tex`\eta `,'δ':tex`\delta `,'α':tex`\alpha `,'π':tex`\pi `,'Σ':tex`\sum `,'∂':tex`\partial `,'ℓ':tex`\ell `,'∞':tex`\infty `,'→':tex`\longrightarrow `,'×':tex`\times `,'·':tex`\cdot `,'⊙':tex`\odot `,'≈':tex`\approx `,'∈':tex`\in `,'ℝ':tex`\mathbb{R}`,'−':'-','…':tex`\cdots `,'′':"'",'⌊':tex`\lfloor `,'⌋':tex`\rfloor `,'¼':tex`\frac{1}{4}`};
const functions=new Set(['Conv','ReLU','GAP','softmax','Concat','Attention','activation','LN','MLP','mean']);
const roman=new Set(['id','ids','head','logits','scores','new','out','vocab','scaled','masked','target','text','tokenizer']);

// Small, deliberately scoped adapter for legacy numeric substitutions. It only
// accepts division between atoms: a number, a vector, a balanced group or a root.
// Symbolic equations above specify their fraction boundaries explicitly.
function atom(s,start,direction){
 let i=start;while(s[i]===' ')i+=direction;
 const end=i,open=direction===1?'([':')]',close=direction===1?')]':'([';
 if(open.includes(s[i])){
  const stack=[s[i]];i+=direction;
  while(i>=0&&i<s.length&&stack.length){if(open.includes(s[i]))stack.push(s[i]);else if(close.includes(s[i]))stack.pop();i+=direction;}
  if(stack.length)throw new Error('Unbalanced numeric math group');
  return direction===1?[end,i]:[i+1,end+1];
 }
 if(direction===1&&s[i]==='√'){const range=atom(s,i+1,1);return [end,range[1]];}
 while(i>=0&&i<s.length&&/[\p{L}\p{N}_.′²³̂]/u.test(s[i]))i+=direction;
 if(i===end)throw new Error(`Unsupported division operand in ${s}`);
 return direction===1?[end,i]:[i+1,end+1];
}
export function textMath(source,saved=[]){
 const hold=value=>{const i=saved.push(value)-1;return `\uE000${i}\uE001`;};
 let s=String(source)
  .replace(/-\d+(?:\.\d+)?(?=[²³])/g,'($&)')
  .replace(/([+−×·])\s*(-\d+(?:\.\d+)?)/g,'$1 ($2)')
  .replace(/x̂/g,()=>hold(tex`\hat x`)).replace(/ŷ/g,()=>hold(tex`\hat y`));
 // Matrices use semicolons or commas between rows in the numerical model.
 s=s.replace(/\[\[([^\[\]]*)\](?:\s*[;,]\s*\[([^\[\]]*)\])+\]/g,full=>{
  const rows=[...full.matchAll(/\[([^\[\]]*)\]/g)].map(m=>m[1].split(',').map(x=>textMath(x.trim(),saved)).join('&'));
  return hold(tex`\begin{bmatrix}`+rows.join(tex`\\`)+tex`\end{bmatrix}`);
 });
 s=s.replace(/∂L\/∂s/g,()=>hold(tex`\frac{\partial L}{\partial s}`));
 while(s.includes('/')){
  const pos=s.indexOf('/'),[a,b]=atom(s,pos-1,-1),[c,d]=atom(s,pos+1,1);
  const unwrap=x=>x.startsWith('(')&&x.endsWith(')')?x.slice(1,-1):x;
  s=s.slice(0,a)+hold(tex`\frac{${textMath(unwrap(s.slice(a,b)),saved)}}{${textMath(unwrap(s.slice(c,d)),saved)}}`)+s.slice(d);
 }
 let out='';
 for(let i=0;i<s.length;){
  const c=s[i];
  if(c==='\uE000'){const end=s.indexOf('\uE001',i);out+=saved[Number(s.slice(i+1,end))];i=end+1;continue;}
  if(c==='√'){
   if(i===s.length-1){out+=tex`\surd `;i++;continue;}
   const [a,b]=atom(s,i+1,1),value=s.slice(a,b);out+=tex`\sqrt{${textMath(value.startsWith('(')?value.slice(1,-1):value,saved)}}`;i=b;continue;
  }
  if(c==='_'){
   const m=s.slice(i+1).match(/^[a-zA-Z]+|^\d+/);if(!m)throw new Error(`Missing subscript in ${source}`);
   out+=`_{${m[0].length>1?tex`\mathrm{${m[0]}}`:m[0]}}`;i+=m[0].length+1;continue;
  }
  if(sub[c]!==undefined||sup[c]!==undefined){
   const map=sub[c]!==undefined?sub:sup,which=map===sub?'_':'^';let value='';
   while(map[s[i]]!==undefined)value+=map[s[i++]];
   out+=`${which}{${value}}`;continue;
  }
  if(/[a-zA-Z]/.test(c)){
   const word=s.slice(i).match(/^[a-zA-Z]+/)[0];
   out+=functions.has(word)?tex`\operatorname{${word}}`:['exp','log','tanh','max'].includes(word)?`\\${word} `:roman.has(word)?tex`\mathrm{${word}}`:word;
   i+=word.length;
   if(/^[humzxVck]$/.test(word)&&/\d/.test(s[i]||'')){out+=`_{${s[i++]}}`;}
   continue;
  }
  if(/[가-힣]/u.test(c)){
   const word=s.slice(i).match(/^[가-힣 ]+/u)[0];out+=tex`\text{${word}}`;i+=word.length;continue;
  }
  if(c==='δ'||c==='α'){
   out+=symbols[c];i++;if(/\d/.test(s[i]||''))out+=`_{${s[i++]}}`;continue;
  }
  out+=symbols[c]??c;i++;
 }
 return out.replace(/;/g,tex`;\quad `);
}

const cnnCore=tex`\operatorname{GAP}(\operatorname{ReLU}(\operatorname{Conv}(X,K)+b))`;
const rnnLoss=tex`\left(\tanh(x_3+W_h\tanh(x_2+W_h\tanh(x_1+W_hh_0)))-y\right)^2`;

export function stepTex(kind,step){
 let equation=equations[kind][step.id];
 const id=step.id;
 if(kind==='cnn'&&id.startsWith('product-'))equation=tex`t_{uv}=X[i+u,j+v]K[u,v]`;
 if(kind==='rnn'){
  const t=Number(id.split('-')[1]);
  if(id.startsWith('input-'))equation=tex`u_${t}=W_xx_${t}`;
  if(id.startsWith('memory-'))equation=tex`m_${t}=W_hh_{${t-1}}`;
  if(id.startsWith('sum-'))equation=tex`z_${t}=u_${t}+m_${t}+b`;
  if(id.startsWith('tanh-'))equation=tex`h_${t}=\tanh(z_${t})`;
  if(id.startsWith('delta-'))equation=tex`\delta_${t}=\frac{\partial L}{\partial z_${t}}=`+(t===3?tex`2(h_3-y)`:tex`W_h\delta_{${t+1}}`)+tex`(1-h_${t}^2)`;
 }
 if(kind==='transformer'){
  const norm=id.match(/^(ln[12]|final)-(mean|variance|standardize|affine)$/);
  if(norm){
   const name=norm[1]==='ln1'?'U':norm[1]==='ln2'?'T':'F';
   equation={mean:tex`\mu=\frac{1}{D}\sum_{j=1}^{D}x_j`,variance:tex`\sigma^2=\frac{1}{D}\sum_{j=1}^{D}(x_j-\mu)^2`,standardize:tex`\hat x_j=\frac{x_j-\mu}{\sqrt{\sigma^2+\varepsilon}}`,affine:tex`${name}=\gamma\odot\hat x+\beta`}[norm[2]];
  }
  if(id.startsWith('weighted-value-')){const t=Number(id.at(-1))+1;equation=tex`c_${t}=\alpha_${t}V_${t}`;}
  if(id==='activation-inner')equation=step.equation.startsWith('GELU is')?tex`u=\max(0,z)`:tex`u=\sqrt{\frac{2}{\pi}}(z+0.044715z^3)`;
  if(id==='activation')equation=step.equation.startsWith('H =')?tex`H=\operatorname{ReLU}(Z)`:tex`\operatorname{GELU}(z)\approx\frac{z}{2}\left[1+\tanh\!\left(\sqrt{\frac{2}{\pi}}(z+0.044715z^3)\right)\right]`;
 }
 if(!equation)throw new Error(`Missing TeX equation: ${kind}/${id}`);
 let expanded;
 if(kind==='cnn'&&id==='update')expanded=tex`s_{\mathrm{new}}=s-\eta\frac{\partial}{\partial s}\left[-\log\operatorname{softmax}([${cnnCore},0])_A\right]`;
 else if(kind==='rnn'&&id==='update')expanded=tex`W_{h,\mathrm{new}}=W_h-\eta\frac{\partial}{\partial W_h}\left[${rnnLoss}\right]`;
 else if(kind==='rnn'&&id==='shared-gradient')expanded=tex`\frac{\partial L}{\partial W_h}=\delta_1h_0+\delta_2h_1+\delta_3h_2`;
 else if(kind==='rnn'&&id.startsWith('delta-'))expanded=equation;
 else if(kind==='transformer'&&/standardize$/.test(id))expanded=tex`\hat x=\frac{x-\mu}{\sqrt{\sigma^2+\varepsilon}}`;
 else {
  // Split at the exact authored attention fraction before adapting legacy text.
  const pieces=step.expanded.split(/(Q[₁₂]?K[₁₂]?ᵀ\s*\/\s*√dₖ)/);
  expanded=pieces.map(p=>/^Q[₁₂]?K[₁₂]?ᵀ\s*\//.test(p)?tex`\frac{${textMath(p.split('/')[0])}}{\sqrt{d_k}}`:textMath(p)).join('');
 }
 // A root containing a numeric fraction is a balanced atom, not a string slash.
 const calculation=textMath(step.calculation);
 return {equation,calculation,result:textMath(step.result),expanded};
}

export function summaryTex(kind,model){
 if(kind==='cnn')return [tex`p=\operatorname{softmax}\!\left(\operatorname{GAP}(\operatorname{ReLU}(\operatorname{Conv}(X,K)+b))W_{\mathrm{out}}+b_{\mathrm{out}}\right)`,tex`z[i,j,o]=b[o]+\sum_c\sum_u\sum_vX[i+u,j+v,c]K[u,v,c,o]`,tex`g[o]=\frac{1}{H'W'}\sum_i\sum_j\operatorname{ReLU}(z[i,j,o])`];
 if(kind==='rnn')return [tex`h_t=\tanh(W_xx_t+W_hh_{t-1}+b);\quad\hat y=W_{\mathrm{out}}h_T+b_{\mathrm{out}}`,tex`L=(\hat y-y)^2;\quad\frac{\partial L}{\partial W_h}=\sum_{t=1}^{T}\delta_t h_{t-1}`,textMath(model.summary[2])];
 return [tex`X^0=E[\mathrm{ids}]+P;\quad U^l=\operatorname{LN}_{1,l}(X^l)`,tex`R^l=X^l+\operatorname{Concat}_h\!\left(\operatorname{softmax}\!\left(\frac{(U^lW_{Q,h})(U^lW_{K,h})^{\mathsf T}}{\sqrt{d_k}}+M\right)U^lW_{V,h}\right)W^O`,tex`X^{l+1}=R^l+\operatorname{activation}(\operatorname{LN}_{2,l}(R^l)W_1+b_1)W_2+b_2`,tex`p=\operatorname{softmax}(\operatorname{LN}_f(X^N)W_{\mathrm{vocab}}+b_{\mathrm{vocab}});\quad L=-\log p_{\mathrm{target}}`];
}
