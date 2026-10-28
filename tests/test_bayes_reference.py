import itertools, json, subprocess
from fractions import Fraction
import numpy as np
from sklearn.naive_bayes import BernoulliNB

# This reference dataset is deliberately independent of the exported JS rows.
X=np.array([[1,1,1],[1,0,0],[1,1,1],[0,1,0],[0,0,0],[0,1,0],[1,0,0],[0,0,0]])
y=np.array([1,1,1,1,0,0,0,0])
script="""import {bayesCalculate} from './bayes-lab.js'; const results=[]; for(const alpha of [0,1])for(let x=0;x<8;x++){let features=[x>>2&1,x>>1&1,x&1];results.push({alpha,features,...bayesCalculate(features,alpha)});} console.log(JSON.stringify(results));"""
results=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],text=True,encoding='utf-8'))
for result in results:
    alpha=result['alpha']; features=result['features']; scores=[]
    for label in [1,0]:
        rows=X[y==label]; probability=Fraction(len(rows),len(X))
        for i,bit in enumerate(features):
            theta=Fraction(int(rows[:,i].sum())+alpha,len(rows)+2*alpha)
            probability*=theta if bit else 1-theta
        scores.append(probability)
    total=sum(scores)
    for i,expected in enumerate(scores):
        assert abs(result['classes'][i]['score']-float(expected))<1e-14
        assert abs(result['probabilities'][i]-float(expected/total))<1e-14
    if alpha==1:
        model=BernoulliNB(alpha=1,force_alpha=True,binarize=None).fit(X,y)
        # scikit-learn orders class 0 (ham) before class 1 (spam)
        predicted=model.predict_proba(np.array([features]))[0]
        assert np.allclose(result['probabilities'],predicted[::-1],rtol=0,atol=1e-14)
print('PASS: all 16 Bernoulli combinations match exact rational calculations; smoothed probabilities match scikit-learn')
