#!/usr/bin/env python3
"""Collect npm notices for CNN Explainer's generated JavaScript source map.

Run after building CNN Explainer. Separately loaded scripts, styles, fonts,
images and model assets are outside the scope of this report.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from gan_bundle_licenses import license_text

ROOT = Path(__file__).resolve().parent.parent
CNN = ROOT / 'upstream' / 'cnn-explainer'
SOURCE_MAP = CNN / 'public' / 'bundle.js.map'
OUTPUT = ROOT / 'third-party-licenses' / 'cnn-bundle-notices.txt'


def package_for(source: str) -> Path | None:
    # Rollup source paths are relative to the source map. An unresolved
    # node_modules source must fail rather than silently omit a notice.
    if 'node_modules' not in source.replace('\\', '/').split('/'):
        return None
    path = (SOURCE_MAP.parent / source).resolve()
    for directory in (path.parent, *path.parents):
        if directory == CNN:
            break
        manifest = directory / 'package.json'
        if 'node_modules' in directory.parts and manifest.is_file():
            meta = json.loads(manifest.read_text(encoding='utf-8'))
            if meta.get('name') and meta.get('version'):
                return directory
    raise RuntimeError(f'Could not find package metadata for source map entry {source}')


def report() -> str:
    source_map = json.loads(SOURCE_MAP.read_text(encoding='utf-8'))
    if source_map.get('file') != 'bundle.js' or not source_map.get('sources'):
        raise RuntimeError('Unexpected or empty CNN bundle source map')
    packages = {}
    for source in source_map['sources']:
        package = package_for(source)
        if package is None:
            continue
        meta = json.loads((package / 'package.json').read_text(encoding='utf-8'))
        key = (meta['name'], meta['version'], package.relative_to(CNN).as_posix())
        declared = meta.get('license', 'not declared')
        if not isinstance(declared, str):
            declared = json.dumps(declared, ensure_ascii=False, sort_keys=True)
        filename, content = license_text(package)
        packages[key] = (declared, filename, content)
    if not packages:
        raise RuntimeError('No dependency packages found in CNN bundle source map')
    result = ('CNN Explainer JavaScript bundle dependency notices\n'
              'Generated from public/bundle.js.map by scripts/cnn_bundle_licenses.py.\n'
              'This does not cover separate CDN scripts, CSS, fonts, images, or model assets.\n')
    for (name, version, path), (declared, filename, content) in sorted(packages.items()):
        result += f'\n{"=" * 72}\n{name} {version}\nDeclared license: {declared}\nInstalled path: {path}\nNotice source: {filename}\n\n{content}\n'
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        content = report()
        if args.check:
            if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != content:
                raise RuntimeError('CNN bundle notices differ; regenerate and review them')
            print('PASS: CNN bundle dependency notices match source map')
        else:
            OUTPUT.write_text(content, encoding='utf-8', newline='\n')
            print(f'Wrote {OUTPUT.relative_to(ROOT)}')
    except (OSError, RuntimeError, KeyError, ValueError) as exc:
        print(f'Could not generate CNN bundle notices: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
