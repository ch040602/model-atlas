import json
import math
import subprocess
import torch
import torch.nn.functional as F

script = r'''
import {xorTrainingInitial,xorTrainingCalculate,xorTrainingStep} from './xor-training-lab.js';
const states=[xorTrainingInitial()];
for(let k=1;k<=12;k++)states.push({w:[[Math.sin(k),Math.cos(k)],[Math.cos(k/2),Math.sin(k/2)]],b:[k/7-1,1-k/9],v:[1-k/11,k/13-0.5],c:k/15-0.5,step:0});
const samples=states.map(s=>({s,calculation:xorTrainingCalculate(s),step:xorTrainingStep(s,0.37)}));
let s=xorTrainingInitial();
for(let i=0;i<500;i++)s=xorTrainingStep(s,1).next;
console.log(JSON.stringify({samples,trained:s,loss:xorTrainingCalculate(s).loss}));
'''
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], text=True, encoding='utf-8'))
X = torch.tensor([[0,0],[0,1],[1,0],[1,1]], dtype=torch.float64)
y = torch.tensor([0,1,1,0], dtype=torch.float64)

def tensors(state):
    return [torch.tensor(state[key], dtype=torch.float64, requires_grad=True) for key in ('w','b','v','c')]
def compare(actual, expected):
    if isinstance(actual, list):
        assert len(actual)==len(expected)
        for a, e in zip(actual, expected): compare(a,e)
    else:
        assert math.isclose(actual, expected, rel_tol=1e-10, abs_tol=1e-10), (actual,expected)
def calculation(parameters):
    w,b,v,c=parameters
    hidden=(X@w.T+b).sigmoid()
    logits=hidden@v+c
    return F.binary_cross_entropy_with_logits(logits,y),logits.sigmoid()

for case in data['samples']:
    parameters=tensors(case['s'])
    loss,p=calculation(parameters)
    loss.backward()
    compare(case['calculation']['loss'],loss.item())
    compare([row['p'] for row in case['calculation']['rows']],p.tolist())
    for key, param in zip(('w','b','v','c'),parameters):
        compare(case['calculation']['grad'][key],param.grad.tolist())
        compare(case['step']['next'][key],(param-0.37*param.grad).tolist())

parameters=tensors(data['samples'][0]['s'])
for _ in range(500):
    loss,_=calculation(parameters)
    loss.backward()
    with torch.no_grad():
        for p in parameters:
            p-=p.grad
            p.grad.zero_()
loss,_=calculation(parameters)
for key,param in zip(('w','b','v','c'),parameters):compare(data['trained'][key],param.tolist())
compare(data['loss'],loss.item())
assert loss.item()<0.03
print('PASS: XOR forward, all gradients, simultaneous update and 500 steps against PyTorch float64')
