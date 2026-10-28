#!/usr/bin/env python3
"""Collect notices for the exact npm modules Browserify includes in GAN Lab.

This does not cover HTML imports, CDN assets, models, other labs or build tools.
Run after installing GAN Lab dependencies; --check compares the saved result.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAN = ROOT / 'upstream' / 'ganlab'
OUTPUT = ROOT / 'third-party-licenses' / 'ganlab-bundle-notices.txt'


def package_for(module: Path) -> Path | None:
    for directory in (module.parent, *module.parents):
        if directory == GAN:
            break
        if directory.name == 'node_modules':
            continue
        if 'node_modules' in directory.parts and (directory / 'package.json').is_file():
            return directory
    return None


def license_text(package: Path) -> tuple[str, str]:
    files = sorted(p for p in package.iterdir() if p.is_file() and p.name.lower().startswith(('license', 'licence', 'copying')))
    notices = sorted(p for p in package.iterdir() if p.is_file() and p.name.lower().startswith('notice'))
    if files:
        files += notices
        return ', '.join(f.name for f in files), '\n\n'.join(f.read_text(encoding='utf-8-sig', errors='strict').strip() for f in files)
    # seedrandom 2.4.3 ships its MIT notice in the source header, not LICENSE.
    meta = json.loads((package / 'package.json').read_text(encoding='utf-8'))
    if meta.get('name') == 'seedrandom' and meta.get('version') == '2.4.3':
        source = (package / 'seedrandom.js').read_text(encoding='utf-8')
        if source.startswith('/*') and 'Permission is hereby granted' in source:
            texts = [source[2:source.index('*/')].strip()]
            texts.extend(p.read_text(encoding='utf-8-sig', errors='strict').strip() for p in notices)
            return ', '.join(['seedrandom.js header', *(p.name for p in notices)]), '\n\n'.join(texts)
    raise RuntimeError(f'No license or notice file found for {package}; inspect it before regenerating.')


def report() -> str:
    command = ['node', 'node_modules/browserify/bin/cmd.js', 'demo/ganlab.ts', '-p', '[tsify', '-p', 'tsconfig-dev.json]', '--list']
    result = subprocess.run(command, cwd=GAN, check=True, text=True, capture_output=True, encoding='utf-8')
    packages: dict[tuple[str, str, str], tuple[str, str, str]] = {}
    for line in result.stdout.splitlines():
        module = Path(line.strip())
        package = package_for(module)
        if not package:
            continue
        meta = json.loads((package / 'package.json').read_text(encoding='utf-8'))
        key = (meta['name'], meta['version'], package.relative_to(GAN).as_posix())
        declared = meta.get('license', 'not declared')
        if not isinstance(declared, str):
            declared = json.dumps(declared, ensure_ascii=False, sort_keys=True)
        filename, text = license_text(package)
        packages[key] = (declared, filename, text)
    if not packages:
        raise RuntimeError('Browserify did not report any dependency packages.')
    intro = ('GAN Lab Browserify dependency notices\n'
             'Generated from the modules included in demo/bundle.js by scripts/gan_bundle_licenses.py.\n'
             'This list covers the JavaScript bundle only; HTML imports, CDN assets, and other labs are separate.\n')
    sections = []
    for (name, version, path), (declared, filename, text) in sorted(packages.items()):
        sections.append(f'\n{"=" * 72}\n{name} {version}\nDeclared license: {declared}\nInstalled path: {path}\nNotice source: {filename}\n\n{text}\n')
    return intro + ''.join(sections)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check that saved notices match the current bundle inputs')
    args = parser.parse_args()
    try:
        content = report()
        if args.check:
            if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != content:
                print('GAN bundle notices differ; regenerate and review them.', file=sys.stderr)
                return 1
            print('PASS: GAN bundle dependency notices match Browserify inputs')
        else:
            OUTPUT.write_text(content, encoding='utf-8', newline='\n')
            print(f'Wrote {OUTPUT.relative_to(ROOT)}')
    except (OSError, RuntimeError, subprocess.CalledProcessError, KeyError, ValueError) as exc:
        print(f'Could not generate GAN bundle notices: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
