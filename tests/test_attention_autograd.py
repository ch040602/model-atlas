"""Compare the complete attention slider grid with independent PyTorch autograd."""
import json
import math
import subprocess
from pathlib import Path
import torch

root = Path(__file__).resolve().parent.parent
script = r"""
import {queryTrainingStep} from './attention-lab.js';
const rows=[];
for(const mask of [false,true]) for(let a=-20;a<=20;a++) for(let b=-20;b<=20;b++) {
 const r=queryTrainingStep([a/10,b/10],mask);
 rows.push({mask,q:[a/10,b/10],weights:r.before.weights,output:r.before.output,
   loss:r.head.before.loss,scoreGradient:r.scoreGradient,queryGradient:r.queryGradient});
}
process.stdout.write(JSON.stringify(rows));
"""
rows = json.loads(subprocess.check_output(['node','--input-type=module','-e',script], cwd=root, encoding='utf-8'))
q = torch.tensor([row['q'] for row in rows], dtype=torch.float64, requires_grad=True)
mask = torch.tensor([row['mask'] for row in rows], dtype=torch.bool)
keys = torch.tensor([[1,0],[0,1],[1,1]], dtype=torch.float64)
values = torch.tensor([[1,0],[0,2],[2,2]], dtype=torch.float64)
scores = q @ keys.T / math.sqrt(2)
scores = scores.masked_fill(torch.stack((torch.zeros_like(mask),torch.zeros_like(mask),mask),dim=1), float('-inf'))
scores.retain_grad()
weights = torch.softmax(scores,dim=1)
output = weights @ values
loss = torch.nn.functional.cross_entropy(output,torch.zeros(len(rows),dtype=torch.long),reduction='none')
loss.sum().backward()
for name, expected in [('weights',weights),('output',output),('loss',loss),('scoreGradient',scores.grad),('queryGradient',q.grad)]:
    actual=torch.tensor([row[name] for row in rows],dtype=torch.float64)
    assert torch.allclose(actual,expected.detach(),atol=1e-12,rtol=1e-12), name
print(f'PASS: {len(rows)} masked and unmasked attention configurations against PyTorch autograd')
