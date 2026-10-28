"""Compare the actual JS preview and sequential running state with PyTorch."""
import json
import subprocess
import torch

js = """import {batchNormPreview} from './batchnorm-lab.js';
let state={mean:0,variance:1,count:0};const rows=[];
for(const third of [1,4,-2,2,0,3]){const p=batchNormPreview(third,state);rows.push({state,third,p});state={mean:p.nextMean,variance:p.nextVariance,count:state.count+1};}
console.log(JSON.stringify(rows));"""
rows = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], text=True, encoding='utf-8'))
layer = torch.nn.BatchNorm1d(1, eps=0.01, momentum=0.1, affine=True).double()
for row in rows:
    preview, state = row['p'], row['state']
    layer.eval()
    actual_eval = layer(torch.tensor([[2.]], dtype=torch.double)).item()
    assert abs(actual_eval - preview['evaluation']) < 1e-10
    assert abs(layer.running_mean.item()-state['mean']) < 1e-10
    assert abs(layer.running_var.item()-state['variance']) < 1e-10
    layer.train()
    output = layer(torch.tensor([[0.],[2.],[row['third']]], dtype=torch.double))
    assert torch.allclose(output[:,0], torch.tensor(preview['training'],dtype=torch.double), atol=1e-10)
    assert abs(layer.running_mean.item()-preview['nextMean']) < 1e-10
    assert abs(layer.running_var.item()-preview['nextVariance']) < 1e-10
print('PASS: six sequential training updates and evaluations match torch.nn.BatchNorm1d')

# Compare PyTorch's actual sampled masks and outputs to the JS calculation.
torch.manual_seed(104)
examples=[]
x=torch.tensor([[1.,2.,3.]],dtype=torch.double).repeat(100,1)
for p in [0,0.25,0.5,0.75]:
    drop=torch.nn.Dropout(p)
    drop.train()
    actual=drop(x)
    for row in actual.tolist():
        examples.append({'p':p,'mask':[int(v!=0) for v in row],'output':row})
    drop.eval()
    assert torch.equal(drop(x),x)
js_dropout = """import {dropoutExample} from './dropout-lab.js';
let s='';for await(const c of process.stdin)s+=c;
console.log(JSON.stringify(JSON.parse(s).map(r=>dropoutExample(r.p,r.mask,'train').output)));"""
calculated=json.loads(subprocess.check_output(['node','--input-type=module','-e',js_dropout],input=json.dumps(examples),text=True,encoding='utf-8'))
for case,result in zip(examples,calculated):
    assert all(abs(a-b)<1e-12 for a,b in zip(case['output'],result))
print('PASS: 400 PyTorch dropout masks match training outputs; evaluation is identity')
