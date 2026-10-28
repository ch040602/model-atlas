#!/usr/bin/env python3
"""Record selected upstream Git-blob fingerprints for the publication audit."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

from bootstrap import ROOT, SOURCES

OUTPUT = ROOT / 'third-party-licenses/publication-asset-fingerprints.json'
GROUPS = (
    ('cnn-explainer', 'public/assets/img/', 'CNN example image: verify its individual rights', ('.jpeg',)),
    ('cnn-explainer', 'public/assets/font/A Love of Thunder.ttf', 'Restricted font: exclude unless permission is confirmed', None),
    ('cnn-explainer', 'tiny-vgg/data.zip', 'Tiny ImageNet-derived archive: verify rights before redistribution', None),
    ('cnn-explainer', 'public/assets/data/model.json', 'CNN model: verify provenance and redistribution terms', None),
    ('cnn-explainer', 'public/assets/data/group1-shard1of1.bin', 'CNN model: verify provenance and redistribution terms', None),
    ('cnn-explainer', 'public/assets/data/nn_10.json', 'CNN model data: verify provenance and redistribution terms', None),
    ('transformer-explainer', 'static/article_assets/embedding.png', 'Replaced Transformer embedding screenshot: verify individual rights', None),
    ('transformer-explainer', 'static/article_assets/QKV.png', 'Replaced Transformer QKV screenshot: verify individual rights', None),
    ('transformer-explainer', 'static/article_assets/attention.png', 'Replaced Transformer attention screenshot: verify individual rights', None),
    ('transformer-explainer', 'static/article_assets/mlp.png', 'Replaced Transformer MLP screenshot: verify individual rights', None),
    ('transformer-explainer', 'static/article_assets/softmax.png', 'Replaced Transformer softmax screenshot: verify individual rights', None),
    ('transformer-explainer', 'static/model-v2/', 'Transformer model chunk: verify provenance and redistribution terms', None),
    ('diffusion-explainer', 'icons/', 'Font Awesome Pro-marked icon: exclude unless permission is confirmed',
     ('backward-step.svg', 'forward-step.svg', 'left.svg', 'right.svg', 'pause.svg', 'play_before.svg', 'replay.svg')),
    ('diffusion-explainer', 'icons/whitedog.jpg', 'Diffusion CLIP photo: verify individual rights', None),
    ('diffusion-explainer', 'icons/yellowflower.jpg', 'Diffusion CLIP photo: verify individual rights', None),
    ('ganlab', 'demo/figures/', 'GAN Lab figure: verify individual rights', ('.png', '.gif')),
    ('ganlab', 'demo/images/', 'GAN Lab image: verify individual rights', ('.png',)),
    ('ganlab', 'demo/pretrained_models/', 'GAN Lab checkpoint: verify provenance and redistribution terms', ('.json', '.bin')),
)


def build_manifest():
    entries = []
    transformer_chunks = {}
    for project, prefix, reason, suffixes in GROUPS:
        checkout = ROOT / 'upstream' / project
        revision = SOURCES[project][1]
        paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', revision, '--', prefix], cwd=checkout, text=True).splitlines()
        paths = [p for p in paths if suffixes is None or any(p.endswith(s) for s in suffixes)]
        if not paths:
            raise RuntimeError(f'No pinned Git files found for {project}/{prefix}')
        for path in paths:
            data = subprocess.check_output(['git', 'show', f'{revision}:{path}'], cwd=checkout)
            entries.append({'project': project, 'revision': revision, 'path': path,
                            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'reason': reason})
            # Windows Git may convert selected text assets on checkout. Record
            # the exact all-CRLF form derived from the pinned blob as well.
            if path.lower().endswith(('.json', '.svg')) and b'\n' in data and b'\r' not in data:
                converted = data.replace(b'\n', b'\r\n')
                entries.append({'project': project, 'revision': revision, 'path': path + ' (CRLF line endings)',
                                'bytes': len(converted), 'sha256': hashlib.sha256(converted).hexdigest(),
                                'reason': reason + ' (CRLF line endings)'})
            if project == 'transformer-explainer' and path.startswith('static/model-v2/gpt2.onnx.part'):
                transformer_chunks[int(path.rsplit('part', 1)[1])] = path
    if set(transformer_chunks) != set(range(63)):
        raise RuntimeError('Expected Transformer model parts 0 through 62')
    digest = hashlib.sha256()
    size = 0
    checkout = ROOT / 'upstream' / 'transformer-explainer'
    revision = SOURCES['transformer-explainer'][1]
    for number in range(63):
        data = subprocess.check_output(['git', 'show', f'{revision}:{transformer_chunks[number]}'], cwd=checkout)
        digest.update(data)
        size += len(data)
    entries.append({'project': 'transformer-explainer', 'revision': revision,
                    'path': 'static/model-v2/gpt2.onnx.part0..62 (concatenated in numeric order)',
                    'bytes': size, 'sha256': digest.hexdigest(),
                    'reason': 'Concatenated Transformer model: verify provenance and redistribution terms'})
    entries.sort(key=lambda item: (item['project'], item['path']))
    return json.dumps({'scope': 'Selected exact upstream files and one concatenated model, not a comprehensive license audit',
                       'files': entries}, ensure_ascii=False, indent=2) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = build_manifest()
    if args.check:
        if OUTPUT.read_text(encoding='utf-8') != expected:
            raise SystemExit('Fingerprint manifest differs from the pinned Git files')
        print('PASS: selected fingerprints match pinned Git files')
    else:
        OUTPUT.write_text(expected, encoding='utf-8')
        print(f'Wrote {OUTPUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
