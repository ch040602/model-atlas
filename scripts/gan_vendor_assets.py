#!/usr/bin/env python3
"""Verify the pinned GAN UI assets; --refresh restores them from npm tarballs."""
import argparse
import hashlib
import io
import re
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGES = {
    ('dialog-polyfill', '0.4.9'): {
        'sha512': '88ce195d12ce03faa96d6e97ce718eabb22ae7c2685e1646a3e38c1bc2b7c05c6f21ab673139c86a770b18429ae96632ea84e49dd7dbd945d0e851ada14067d6',
        'files': {
            'dialog-polyfill.js': ('vendor/ganlab/dialog-polyfill-0.4.9.js', '1ee1832addb098785df7899ab9d7709fc0e4b6f26909ab9da292d036a05a18e0'),
            'dialog-polyfill.css': ('vendor/ganlab/dialog-polyfill-0.4.9.css', '853d044f8b5f9beeccca37817a9060576379b4e9ac01529c4d6847f368efa1a0'),
        },
        'license': 'third-party-licenses/ganlab-dialog-polyfill-0.4.9.LICENSE',
        'license_sha256': 'c9a5bd7c8cc1267ddacdc5228c68ecd811cf6d74286e9141bc80d8af2eb1a025',
    },
    ('material-design-lite', '1.3.0'): {
        'sha512': '6a8efa6f46ea49329c10cb7b3ee8be27f4b77951746f71967ee294c1f7b694fe432a52d93b006adfb7b4fdb5c4cf1af0eff4ae1c0b9801da02c18ea601886bb2',
        'files': {
            'dist/material.min.js': ('vendor/ganlab/material-1.3.0.min.js', '3c27eee3e7e742ba78c0d9956e337579a5f82db3af39e8da6f450e8632decebc'),
            'dist/material.amber-blue.min.css': ('vendor/ganlab/material.amber-blue-1.3.0.min.css', '6c525ac583ca940e0ccf3b17515d9d77648bc6a815d145c470c86ffce37b080a'),
        },
        'license': 'third-party-licenses/ganlab-material-design-lite-1.3.0.LICENSE',
        'license_sha256': 'dbb22572939f526abc4b72373962840987768da7d1eac9498148c0edcb3ef712',
    },
    ('chart.js', '2.4.0'): {
        'sha512': '1486abf8625bd46655e3e607c6b78fa495a9b8c3e5a2e50fa4d08ec48326510ae5b219a0a9e45d413f7b5f319290d9a17aa65092b667a3d9a3ccdb6c3a5a6120',
        'files': {'dist/Chart.bundle.min.js': ('vendor/ganlab/chart-bundle-2.4.0.min.js', '44048d30d96646d22b79ece77df60c0d4c415dc3118e28c469a185fe0c53eafc')},
        'license': 'third-party-licenses/ganlab-chart.js-2.4.0.LICENSE',
        'license_member': 'LICENSE.md',
        'license_sha256': '7bed48d7324df1ce3ac3e88ce80a8e3985a0cd915a2705a2ab825c614186f107',
        'bundle_modules': {},
    },
    ('chartjs-color', '2.0.0'): {
        'sha512': '2db6ce741615427557e893e159a33548d73d0c2437fdde84fe089c3269df6b0b440a9b383fdf29810da7606d0e938460f3dcefc13013d76fc2307dc3107d2f1a',
        'files': {},
        'license': 'third-party-licenses/ganlab-chartjs-color-2.0.0.LICENSE',
        'license_member': 'LICENSE',
        'license_sha256': '4c0844caafd3db9a4b643ea493558873710f4e9c8b257887ba066e5e80557848',
        'bundle_modules': {2: 'index.js'},
    },
    ('chartjs-color-string', '0.4.0'): {
        'sha512': '0e5b99fa420db1a54d17a56164811919163a7995a379d8242beef15d93699f9ffebb15b88c78d8e24ba53a3578614289e0179d4dcf1361e57d9fd2e92ce59790',
        'files': {},
        'license': 'third-party-licenses/ganlab-chartjs-color-string-0.4.0.LICENSE',
        'license_member': 'LICENSE',
        'license_sha256': '8984783ab2478bbee455f0eb6c375b5b62c57c86d4a55f6bf96dfd08e8d48a10',
        'bundle_modules': {1: 'color-string.js'},
    },
    ('color-convert', '0.5.3'): {
        'sha512': '47005e3bf07fbd947775f28bd727bfbf1f0c1d9e34ba0ce9c9f7951b91ac8ae1a7ae53167b6a3cc3105b2c2a70f42b3157ec07bb36250a25a7c9bac80349629e',
        'files': {},
        'license': 'third-party-licenses/ganlab-color-convert-0.5.3.LICENSE',
        'license_member': 'LICENSE',
        'license_sha256': '8984783ab2478bbee455f0eb6c375b5b62c57c86d4a55f6bf96dfd08e8d48a10',
        'bundle_modules': {3: 'conversions.js', 4: 'index.js'},
    },
    ('color-name', '1.1.1'): {
        'sha512': '2ae786e9ed639e3e1e9e1e8ace15f1039d5ac172bfc81e33d6050d3ee1fcd612c3766be68905381032f59993c1e26f6bc4426467e92a99de75325f6b4b3d81de',
        'files': {},
        'license': 'third-party-licenses/ganlab-color-name-1.1.1.LICENSE',
        'license_member': 'LICENSE',
        'license_sha256': '7357445bac398c76c0aef75a587009fe406d40de6a79789eb5b7ecbbad317ef2',
        'bundle_modules': {5: 'index.js'},
    },
    ('moment', '2.16.0'): {
        'sha512': '266cbe6f4fc132494b958073ac294bb2d9d2f569ff5b362798cdae6fcc23748261a7c5276d34c81cb2d9a44b2098f4cf8231675db4dedf65d829891a75ff6a25',
        'files': {},
        'license': 'third-party-licenses/ganlab-moment-2.16.0.LICENSE',
        'license_member': 'LICENSE',
        'license_sha256': '8f38f320bbf5eb84c08e08676f7ee1d2204ebe5797f6a090d077329cf212fca3',
        'bundle_modules': {6: 'moment.js'},
    },
}

def check_file(path, expected):
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != expected:
        raise ValueError(f'Unexpected SHA-256 for {path}: {actual}')

def refresh():
    output = {}
    bundle_modules = {}
    module_sources = {}
    for (name, version), package in PACKAGES.items():
        url = f'https://registry.npmjs.org/{name}/-/{name}-{version}.tgz'
        with urllib.request.urlopen(url, timeout=30) as response:
            archive = response.read()
        if hashlib.sha512(archive).hexdigest() != package['sha512']:
            raise ValueError(f'Unexpected package integrity for {name}@{version}')
        with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as source:
            license_bytes = source.extractfile('package/' + package.get('license_member', 'LICENSE')).read()
            if license_bytes.replace(b'\r\n', b'\n') != (ROOT / package['license']).read_bytes().replace(b'\r\n', b'\n'):
                raise ValueError(f'License differs from saved notice for {name}@{version}')
            if name == 'chart.js':
                readable = source.extractfile('package/dist/Chart.bundle.js').read().decode('utf-8')
                marker = '({1:[function(require,module,exports){'
                start = readable.index(marker) + len(marker)
                module_id = 1
                for boundary in re.finditer(r'\},\{([^\n]*)\}\],(\d+):\[function\(require,module,exports\)\{', readable):
                    bundle_modules[module_id] = readable[start:boundary.start()]
                    start, module_id = boundary.end(), int(boundary.group(2))
                    if module_id > 6:
                        break
            for module_id, member in package.get('bundle_modules', {}).items():
                module_sources[module_id] = source.extractfile('package/' + member).read().decode('utf-8')
            for member, (destination, digest) in package['files'].items():
                content = source.extractfile('package/' + member).read()
                if hashlib.sha256(content).hexdigest() != digest:
                    raise ValueError(f'Unexpected content for {name}@{version}/{member}')
                output[ROOT / destination] = content
    def normalize_js(text):
        # Browserify replaces package names in require() with numeric module IDs.
        return re.sub(r"require\((?:\d+|['\"][^'\"]+['\"])\)", 'require(X)', text.replace('\r\n', '\n')).strip()
    if set(bundle_modules) != set(module_sources):
        raise ValueError('Unexpected Chart.js bundle module inventory')
    for module_id in module_sources:
        if normalize_js(bundle_modules[module_id]) != normalize_js(module_sources[module_id]):
            raise ValueError(f'Chart.js dependency source differs for module {module_id}')
    for destination, content in output.items():
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Download verified npm tarballs and restore the vendored files')
    args = parser.parse_args()
    if args.refresh:
        refresh()
    for (name, version), package in PACKAGES.items():
        for destination, digest in package['files'].values():
            check_file(ROOT / destination, digest)
        license_bytes = (ROOT / package['license']).read_bytes().replace(b'\r\n', b'\n')
        if hashlib.sha256(license_bytes).hexdigest() != package['license_sha256']:
            raise ValueError(f'Unexpected license text for {name}@{version}')
        print(f'OK {name}@{version}: assets and/or notice verified')

if __name__ == '__main__':
    main()
