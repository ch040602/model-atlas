#!/usr/bin/env python3
"""Exercise a project-prefix build without replacing the normal local build.

Copies the Transformer source into a temporary child directory so Node can use
the already installed parent node_modules. The large static model is copied too.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'upstream' / 'transformer-explainer'
PREFIX = '/model-atlas-test'


def main() -> None:
    npm = shutil.which('npm')
    node = shutil.which('node')
    if not npm or not node or not (SOURCE / 'node_modules').is_dir():
        raise RuntimeError('Install the Transformer dependencies and Node.js first')
    temporary = Path(tempfile.mkdtemp(prefix='model-atlas-prefix-test-', dir=SOURCE))
    try:
        for name in ('src', 'static'):
            shutil.copytree(SOURCE / name, temporary / name)
        for name in ('package.json', 'package-lock.json', 'postcss.config.js',
                     'svelte.config.js', 'tailwind.config.js', 'tsconfig.json', 'vite.config.ts'):
            shutil.copy2(SOURCE / name, temporary / name)
        env = os.environ.copy()
        env['MODEL_ATLAS_BASE_PATH'] = PREFIX
        log = ROOT / 'test-results' / 'project-prefix-build.log'
        log.parent.mkdir(parents=True, exist_ok=True)
        with log.open('w', encoding='utf-8') as stream:
            result = subprocess.run([npm, 'run', 'build'], cwd=temporary, env=env,
                                    stdout=stream, stderr=subprocess.STDOUT)
        if result.returncode:
            raise RuntimeError(f'Project-prefix build failed; see {log}')
        print(f'Project-prefix build passed; build output: {log}', flush=True)
        env['MODEL_ATLAS_TEST_PREFIX'] = PREFIX
        env['MODEL_ATLAS_TEST_TRANSFORMER_BUILD'] = str(temporary / 'build')
        subprocess.run([node, 'tests/browser.mjs', '--full'], cwd=ROOT, env=env, check=True)
    finally:
        shutil.rmtree(temporary)


if __name__ == '__main__':
    main()
