import json
import subprocess

import numpy as np
from sklearn.metrics import confusion_matrix, roc_auc_score, roc_curve

script = """import {rocSamples,rocAt,rocCurve} from './roc-lab.js';
console.log(JSON.stringify({samples:rocSamples,curve:rocCurve(),results:Array.from({length:21},(_,i)=>rocAt(i/20))}));"""
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], text=True))
labels = np.array([s['label'] for s in data['samples']])
scores = np.array([s['score'] for s in data['samples']])
assert len(labels) == 6 and np.sum(labels) == 3
fpr, tpr, _ = roc_curve(labels, scores, drop_intermediate=False)
assert np.allclose([p['fpr'] for p in data['curve']['points']], fpr)
assert np.allclose([p['tpr'] for p in data['curve']['points']], tpr)
assert np.isclose(data['curve']['auc'], roc_auc_score(labels, scores))
assert np.isclose(data['curve']['auc'], 5.5/9)
for index, result in enumerate(data['results']):
    tn, fp, fn, tp = confusion_matrix(labels, scores >= index / 20, labels=[0, 1]).ravel()
    assert [result[k] for k in ('tn', 'fp', 'fn', 'tp')] == [tn, fp, fn, tp]
    assert np.isclose(result['tpr'], tp / (tp + fn))
    assert np.isclose(result['fpr'], fp / (fp + tn))
    assert result['precision'] is None if tp + fp == 0 else np.isclose(result['precision'], tp / (tp + fp))
print('PASS: all 21 thresholds, ties and ROC AUC against scikit-learn')
