import assert from 'node:assert/strict';
import {formulaWalkthrough,formulaDefaults,transformerFormulaValues,scaleComparison,num,vec} from '../formula-model.js';
import {formulaURL,formulaOriginalURL} from '../formula-walkthrough.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} ≈ ${b}`);
const probs=xs=>xs.map(x=>Math.exp(x)/xs.reduce((s,y)=>s+Math.exp(y),0));
const norm=(xs,g,b)=>{const mean=(xs[0]+xs[1])/2,variance=((xs[0]-mean)**2+(xs[1]-mean)**2)/2;return xs.map(x=>g*(x-mean)/Math.sqrt(variance+0.01)+b);};
let cases=0;
// Independent loop implementation checks the displayed patch, map, mean, class
// probabilities and shared-strength gradient, including negative/ReLU-zero cases.
for(const center of [-1,0,0.4,1])for(const strength of [0,0.3,1,2])for(const bias of [-1,0,0.5,1]){
 const v={center,strength,bias},m=formulaWalkthrough('cnn',v,'en'),get=id=>m.steps.find(s=>s.id===id);
 const x=[[0,0,1],[0,center,1],[0,0,1]],k=[[-strength,strength],[-strength,strength]],a=[];
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){
  let z=bias;for(let u=0;u<2;u++)for(let w=0;w<2;w++)z+=x[i+u][j+w]*k[u][w];a.push(Math.max(0,z));
 }
 const mean=a.reduce((s,x)=>s+x,0)/4,p=probs([mean,0]);
 m.result.forEach((v,i)=>near(v,p[i]));
 assert.equal(get('pool-divide').result,num(mean));assert.equal(get('probabilities').result,vec(p));
 assert.equal(get('loss').result,num(-Math.log(p[0])));
 const coefficients=[center,2-center,center,2-center];
 if(coefficients.every(t=>t===0||Math.abs(strength*t+bias)>1e-4)){
  const loss=s=>{const g=coefficients.reduce((sum,t)=>sum+Math.max(0,s*t+bias),0)/4;return -Math.log(probs([g,0])[0]);};
  const finite=(loss(strength+1e-5)-loss(strength-1e-5))/2e-5;
  assert.ok(Math.abs(Number(get('gradient').result)-finite)<0.00051);
 }
 cases++;
}
for(const x2 of [-1,0,0.4,1])for(const weight of [-2,0,0.5,2])for(const target of [-0.8,0,0.8]){
 const v={x1:1,x2,x3:0.2,weight,target},m=formulaWalkthrough('rnn',v,'en'),h=[0];
 for(const x of [1,x2,0.2])h.push(Math.tanh(x+weight*h.at(-1)));
 h.slice(1).forEach((x,i)=>assert.equal(m.steps.find(s=>s.id===`tanh-${i+1}`).result,num(x)));
 near(m.result,(h[3]-target)**2);
 const evaluate=w=>{let state=0;for(const x of [1,x2,0.2])state=Math.tanh(x+w*state);return (state-target)**2;};
 const finite=(evaluate(weight+1e-5)-evaluate(weight-1e-5))/2e-5;
 assert.ok(Math.abs(Number(m.steps.find(s=>s.id==='shared-gradient').result)-finite)<0.00051);
 cases++;
}
// Independent 2-head forward pass, including zero variance, shared negative
// gamma, nonzero beta, both activation paths and the new final normalization.
for(const x1 of [-2,0,1,2])for(const x2 of [-1,0,1])for(const gamma of [-1,0,1])for(const beta of [-0.5,0.4])for(const activation of ['gelu','relu']){
 const v={x1,x2,gamma,beta,activation},r=transformerFormulaValues(v),u=[[1,0],[x1,x2]].map(x=>norm(x,gamma,beta));
 const heads=[0,1].map(key=>{
  const scores=u.map(x=>u[1][0]*x[key]),p=probs(scores);
  return p.reduce((s,a,i)=>s+a*u[i][1-key],0);
 });
 const a=[heads[0]-0.5*heads[1],0.5*heads[0]+heads[1]],res=[x1+a[0],x2+a[1]],t=norm(res,gamma,beta);
 const gelu=z=>0.5*z*(1+Math.tanh(Math.sqrt(2/Math.PI)*(z+0.044715*z*z*z)));
 const y=res.map((x,i)=>x+0.5*(activation==='relu'?Math.max(0,t[i]):gelu(t[i]))),final=norm(y,gamma,beta),p=probs(final);
 y.forEach((x,i)=>near(x,r.block.output[i]));final.forEach((x,i)=>near(x,r.final.output[i]));p.forEach((x,i)=>near(x,r.probabilities[i]));near(r.loss,-Math.log(p[0]));
 const m=formulaWalkthrough('transformer',v,'en');assert.equal(m.steps.find(s=>s.id==='probability').result,vec(p));cases++;
}
for(const d of [1,2,8,64]){
 const r=scaleComparison(d);r.scaled.forEach((x,i)=>near(x,[2,0][i]/Math.sqrt(d)));r.weights.forEach((x,i)=>near(x,probs([2/Math.sqrt(d),0])[i]));
 if(d>1)assert.ok(r.weights[0]<r.unscaled[0]);
}
for(const kind of Object.keys(formulaDefaults)){
 const ko=formulaWalkthrough(kind,formulaDefaults[kind],'ko'),en=formulaWalkthrough(kind,formulaDefaults[kind],'en');
 assert.equal(ko.steps.length,en.steps.length);assert.equal(new Set(ko.steps.map(s=>s.id)).size,ko.steps.length);
 for(const [i,s] of ko.steps.entries()){
  assert.equal(s.result,en.steps[i].result);assert.ok(s.role&&s.title&&s.equation&&s.calculation&&s.symbols.length);
  for(const text of [s.equation,s.expanded])for(const [open,close] of [['(',')'],['[',']']]){
   let depth=0;for(const c of text){if(c===open)depth++;if(c===close)depth--;assert.ok(depth>=0,`${kind}/${s.id}: unmatched ${close}`);}assert.equal(depth,0,`${kind}/${s.id}: unclosed ${open}`);
  }
  for(const source of s.sources)assert.ok(Number.isInteger(source)&&source<i,`${kind}/${s.id}: dependency must already have been calculated`);
 }
 const url=new URL(formulaURL(kind,formulaDefaults[kind],'en',5),'http://example.test/course/');
 assert.equal(url.pathname,'/course/formulas.html');assert.equal(url.searchParams.get('step'),'5');
 for(const s of ko.steps)assert.ok(!formulaOriginalURL(kind,'ko',s.anchor).startsWith('/'),'preserve project prefixes');
}
console.log(`PASS: ${cases} independent numerical cases, formula dependencies, roles, bilingual results, scaling and portable URLs`);
