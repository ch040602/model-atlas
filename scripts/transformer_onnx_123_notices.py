#!/usr/bin/env python3
"""Inventory source headers in ONNX Runtime 1.23.0's shipped JS source map.

First make an audit build with `npx vite build --sourcemap`. This checks that
its outer map embeds the exact installed prebundle, then retains third-party
headers in that prebundle's own map. It does not inspect compiled WASM.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / 'upstream/transformer-explainer'
DIST = APP / 'node_modules/onnxruntime-web/dist'
PREBUNDLE = DIST / 'ort.bundle.min.mjs'
NESTED_MAP = DIST / 'ort.bundle.min.mjs.map'
OUTPUT = ROOT / 'third-party-licenses/transformer-onnx-1.23-js-notices.txt'
PREFIX = '../lib/wasm/jsep/webgpu/ops/3rd-party/'
EXPECTED = {'activation_util.ts', 'conv_util.ts', 'matmul_packed_webgpu.ts',
            'conv2d_mm_webgpu.ts', 'conv3d_naive_webgpu.ts', 'conv_backprop_webgpu.ts'}


def source_entries(path):
    source_map = json.loads(path.read_text(encoding='utf-8'))
    return list(zip(source_map['sources'], source_map['sourcesContent'], strict=True))


def build_inventory():
    manifest = json.loads((DIST.parent / 'package.json').read_text(encoding='utf-8'))
    if manifest.get('name') != 'onnxruntime-web' or manifest.get('version') != '1.23.0':
        raise ValueError('Expected onnxruntime-web 1.23.0')
    prebundle = PREBUNDLE.read_text(encoding='utf-8')
    matches = [(m, content) for m in (APP / 'build').rglob('*.map')
               for source, content in source_entries(m)
               if source.endswith('/node_modules/onnxruntime-web/dist/ort.bundle.min.mjs')]
    if len(matches) != 1 or matches[0][1] != prebundle:
        raise ValueError('Audit build map does not contain exactly the installed ONNX prebundle')
    entries = [(s, c) for s, c in source_entries(NESTED_MAP) if s.startswith(PREFIX)]
    if {s[len(PREFIX):] for s, _ in entries} != EXPECTED or len(entries) != len(EXPECTED):
        raise ValueError('Unexpected third-party ONNX source-map files; re-audit')
    digest = hashlib.sha256(prebundle.encode('utf-8')).hexdigest()
    result = ['ONNX Runtime Web 1.23.0: nested JavaScript source-map notices',
              'The audit-build source map embeds the installed ort.bundle.min.mjs byte for byte.',
              f'Prebundle SHA-256: {digest}',
              'The prebundle map identifies these source files and retains their original headers.',
              'The maps do not prove which individual functions survive tree-shaking, or describe WASM.', '']
    for source, content in entries:
        if not content or not content.startswith('/**') or 'Copyright' not in content[:1000]:
            raise ValueError(f'Missing expected header in {source}')
        end = content.find('*/')
        if end < 0 or 'Apache License, Version 2.0' not in content[:end]:
            raise ValueError(f'Unexpected license header in {source}')
        provenance = next((line for line in content[end+2:].splitlines()
                           if line.startswith('// sampled from ')), None)
        if not provenance:
            raise ValueError(f'Missing provenance comment in {source}')
        result += [f'=== {source} ===', content[:end+2], provenance, '']
    result += ['=== Apache License 2.0 ===',
               (ROOT / 'third-party-licenses/ganlab.LICENSE').read_text(encoding='utf-8').strip(), '']
    return '\n'.join(result)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    notice = build_inventory()
    if args.check:
        if OUTPUT.read_text(encoding='utf-8') != notice:
            raise SystemExit('Nested ONNX 1.23 JavaScript notices differ; investigate')
        print('PASS: ONNX Runtime 1.23 audit-map prebundle and nested source notices')
    else:
        OUTPUT.write_text(notice, encoding='utf-8')
        print(f'Wrote {OUTPUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
