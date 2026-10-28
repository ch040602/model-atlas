#!/usr/bin/env python3
"""Check CNN's pinned Bulma stylesheet; --refresh restores it from npm."""
import argparse
import hashlib
import io
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = 'https://registry.npmjs.org/bulma/-/bulma-0.8.0.tgz'
ARCHIVE_SHA512 = '9e17f7ac6ca2661fd533b16b489ff929e2e57da1645f3d2761c5eb8b29df3c7e2f5699f19eac84c1a34674d095cc7cb2080ddc1e091000ca5d17f4856c51997c'
FILES = {
    'package/css/bulma.min.css': ('vendor/cnn/bulma-0.8.0.min.css', '0fd339cab543a859656bb9e510b0da6192295df1560f2b50b6257e4da1fa1752'),
    'package/LICENSE': ('third-party-licenses/cnn-bulma-0.8.0.LICENSE', '8bb0ddbf446808281c5c600dba88b1fc8a383b39bed39eb24b1a77fb6643d74b'),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def refresh():
    with urllib.request.urlopen(URL, timeout=30) as response:
        archive = response.read()
    if hashlib.sha512(archive).hexdigest() != ARCHIVE_SHA512:
        raise ValueError('Unexpected Bulma archive SHA-512')
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as source:
        extracted = {}
        for member, (destination, expected) in FILES.items():
            data = source.extractfile(member).read()
            if digest(data) != expected:
                raise ValueError(f'Unexpected SHA-256 for {member}')
            extracted[destination] = data
    for destination, data in extracted.items():
        path = ROOT / destination
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    if args.refresh:
        refresh()
    for destination, expected in FILES.values():
        path = ROOT / destination
        if digest(path.read_bytes()) != expected:
            raise ValueError(f'Unexpected SHA-256 for {path}')
    print('PASS: Bulma 0.8.0 stylesheet and MIT license match pinned SHA-256 hashes')


if __name__ == '__main__':
    main()
