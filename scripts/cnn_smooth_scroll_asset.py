#!/usr/bin/env python3
"""Verify CNN's pinned Smooth Scroll distribution; --refresh restores it."""
import argparse
import hashlib
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = {
    'vendor/cnn/smooth-scroll-15.2.1.polyfills.min.js': (
        'https://raw.githubusercontent.com/cferdinandi/smooth-scroll/82de06c95c51b3b7b484d88b92da712812738f60/dist/smooth-scroll.polyfills.min.js',
        '1512662ffdb56b269ac9f0abfade75b58bf197915fb00475e27d1ed8357f7174'),
    'third-party-licenses/cnn-smooth-scroll-15.2.1.LICENSE': (
        'https://raw.githubusercontent.com/cferdinandi/smooth-scroll/82de06c95c51b3b7b484d88b92da712812738f60/LICENSE.md',
        'ce0cbdfa94ec0b923a9208cf72a6008e5b22c978e38a21b29a821b987b4d63f9'),
    'third-party-licenses/cnn-css-escape.LICENSE': (
        'https://raw.githubusercontent.com/mathiasbynens/CSS.escape/4b25c283eaf4dd443f44a7096463e973d56dd1b2/LICENSE-MIT.txt',
        '483acb265f182907d1caf6cff9c16c96f31325ed23792832cc5d8b12d5f88c8a'),
}


def verify(data, expected, name):
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError(f'Unexpected SHA-256 for {name}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    if args.refresh:
        downloaded = {}
        for destination, (url, expected) in FILES.items():
            with urllib.request.urlopen(url, timeout=30) as response:
                data = response.read()
            verify(data, expected, url)
            downloaded[destination] = data
        for destination, data in downloaded.items():
            path = ROOT / destination
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    for destination, (_, expected) in FILES.items():
        verify((ROOT / destination).read_bytes(), expected, destination)
    print('PASS: Smooth Scroll 15.2.1 and retained licenses match pinned SHA-256 hashes')


if __name__ == '__main__':
    main()
