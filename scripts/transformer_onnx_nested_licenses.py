#!/usr/bin/env python3
"""Compare nested ONNX Runtime sources with installed packages and retain notices."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NODE = ROOT / 'upstream/transformer-explainer/node_modules'
MAP = NODE / '@xenova/transformers/node_modules/onnxruntime-web/dist/ort-web.min.js.map'
OUTPUT = ROOT / 'third-party-licenses/transformer-onnx-nested-notices.txt'
PACKAGES = {
    '@protobufjs/aspromise': ('@protobufjs/aspromise', '1.1.2'),
    '@protobufjs/base64': ('@protobufjs/base64', '1.1.2'),
    '@protobufjs/eventemitter': ('@protobufjs/eventemitter', '1.1.0'),
    '@protobufjs/float': ('@protobufjs/float', '1.0.2'),
    '@protobufjs/inquire': ('@protobufjs/inquire', '1.1.0'),
    '@protobufjs/pool': ('@protobufjs/pool', '1.1.0'),
    '@protobufjs/utf8': ('@protobufjs/utf8', '1.1.0'),
    'guid-typescript': ('guid-typescript', '1.0.9'),
    'long': ('onnx-proto/node_modules/long', '4.0.0'),
    'onnx-proto': ('onnx-proto', '4.0.4'),
    'protobufjs': ('onnx-proto/node_modules/protobufjs', '6.11.4'),
    'flatbuffers': ('@xenova/transformers/node_modules/flatbuffers', '1.12.0'),
}
WORKER_SHA = 'fc145bd686110eed216389732f60568563d878bf0b8da1b0151269279cbb14eb'


def normalize(s):
    return s.replace('\r\n', '\n')


def build_inventory():
    source_map = json.loads(MAP.read_text(encoding='utf-8'))
    entries = list(zip(source_map['sources'], source_map['sourcesContent'], strict=True))
    chunks = ['Nested onnxruntime-web 1.14.0 source-map comparison and notices',
              'Matching source files identify compatible package copies, not necessarily unique release versions.',
              'The source map is evidence about that prebuilt file; it does not establish the contents of WASM.', '']
    for name, (location, version) in PACKAGES.items():
        directory = NODE / location
        package = json.loads((directory / 'package.json').read_text(encoding='utf-8'))
        if (package['name'], package['version']) != (name, version):
            raise ValueError(f'Unexpected package: {name} in {directory}')
        marker = f'/node_modules/{name}/'
        sources = [(src, content) for src, content in entries if marker in src]
        if not sources:
            raise ValueError(f'No source-map files for {name}')
        for src, content in sources:
            relative = src.split(marker, 1)[1]
            file = directory / relative
            if not content or normalize(file.read_text(encoding='utf-8')) != normalize(content):
                raise ValueError(f'Source differs: {name}/{relative}')
        chunks += [f'=== {name} {version}: {len(sources)} matching source file(s) ===',
                   f"Declared license: {package.get('license', 'not declared')}",
                   f"Declared author: {package.get('author', 'not declared')}"]
        license_files = sorted(p for p in directory.iterdir() if p.is_file() and p.name.lower().startswith(('license', 'copying', 'notice')))
        if license_files:
            for file in license_files:
                chunks += [f'--- {file.name} ---', file.read_text(encoding='utf-8').strip()]
        else:
            chunks += ['No license text or copyright notice shipped in the package. Further attribution/terms verification is needed.']
        chunks.append('')
    worker = [content for src, content in entries if '/node_modules/worker-loader/dist/runtime/inline.js' in src]
    if len(worker) != 1 or hashlib.sha256(normalize(worker[0]).encode()).hexdigest() != WORKER_SHA:
        raise ValueError('Worker-loader source differs from the checked npm 3.0.8 package')
    license_path = ROOT / 'third-party-licenses/worker-loader-3.0.8.LICENSE'
    chunks += ['=== worker-loader: source matches npm 3.0.8 dist/runtime/inline.js ===',
               'Declared license: MIT; identical file contents do not prove the unique release version.',
               '--- LICENSE from npm worker-loader 3.0.8 ---', license_path.read_text(encoding='utf-8').strip(), '']
    return '\n'.join(chunks)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    output = build_inventory()
    if args.check:
        if OUTPUT.read_text(encoding='utf-8') != output:
            raise SystemExit('Nested notices differ from checked sources or license files')
        print('PASS: ONNX nested source matches and notices')
    else:
        OUTPUT.write_text(output, encoding='utf-8')
        print(f'Wrote {OUTPUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
