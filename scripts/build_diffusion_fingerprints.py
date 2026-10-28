#!/usr/bin/env python3
"""Build a compact, reproducible index of pinned Diffusion asset bytes."""
import argparse
import gzip
import hashlib
import io
import json
import subprocess
from pathlib import Path

from bootstrap import ROOT, SOURCES

OUTPUT = ROOT / 'third-party-licenses/diffusion-asset-fingerprints.json.gz'
PROJECT = 'diffusion-explainer'
PREFIXES = ('assets/img/', 'assets/img_orig/', 'assets/latent_viz/', 'assets/gif/',
            'assets/json/', 'assets/noises/', 'assets/preview/', 'assets/umap/')


def build_index():
    checkout = ROOT / 'upstream' / PROJECT
    revision = SOURCES[PROJECT][1]
    tree = subprocess.check_output(['git', 'ls-tree', '-rz', '-l', revision, '--', *PREFIXES], cwd=checkout)
    blobs = {}
    seen_prefixes = set()
    for row in tree.split(b'\0'):
        if not row:
            continue
        header, raw_path = row.split(b'\t', 1)
        mode, kind, oid, raw_size = header.split()
        if kind != b'blob' or mode != b'100644':
            raise RuntimeError(f'Unexpected Git entry: {row!r}')
        path = raw_path.decode('utf-8')
        prefix = next((item for item in PREFIXES if path.startswith(item)), None)
        if prefix is None:
            raise RuntimeError(f'Unexpected path: {path}')
        seen_prefixes.add(prefix)
        size = int(raw_size)
        oid = oid.decode('ascii')
        if oid in blobs:
            if blobs[oid][0] != size:
                raise RuntimeError(f'Inconsistent Git object size: {oid}')
            blobs[oid][1].append(path)
        else:
            blobs[oid] = [size, [path]]
    if seen_prefixes != set(PREFIXES):
        raise RuntimeError(f'Missing asset groups: {set(PREFIXES) - seen_prefixes}')

    rows = []
    crlf_rows = []
    with subprocess.Popen(['git', 'cat-file', '--batch'], cwd=checkout, stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE) as git:
        for oid, (size, paths) in sorted(blobs.items()):
            git.stdin.write((oid + '\n').encode('ascii'))
            git.stdin.flush()
            header = git.stdout.readline().decode('ascii').rstrip('\n').split()
            if header != [oid, 'blob', str(size)]:
                raise RuntimeError(f'Unexpected cat-file header: {header!r}')
            data = git.stdout.read(size)
            if len(data) != size or git.stdout.read(1) != b'\n':
                raise RuntimeError(f'Truncated Git blob: {oid}')
            if hashlib.sha1(f'blob {size}\0'.encode('ascii') + data).hexdigest() != oid:
                raise RuntimeError(f'Git object hash mismatch: {oid}')
            rows.append([size, hashlib.sha256(data).hexdigest(), min(paths), len(paths)])
            if any(path.endswith('.json') for path in paths) and b'\n' in data and b'\r\n' not in data:
                converted = data.replace(b'\n', b'\r\n')
                crlf_rows.append([len(converted), hashlib.sha256(converted).hexdigest(), min(paths)])
        git.stdin.close()
        if git.wait() != 0:
            raise RuntimeError('git cat-file failed')
    rows.sort(key=lambda row: (row[2], row[1]))
    crlf_rows.sort(key=lambda row: row[2])
    payload = json.dumps({'project': PROJECT, 'revision': revision, 'prefixes': PREFIXES,
                          'columns': ['bytes', 'sha256', 'representative_path', 'path_count'],
                          'path_count': sum(row[3] for row in rows), 'files': rows,
                          'crlf_files': crlf_rows},
                         ensure_ascii=False, separators=(',', ':')).encode('utf-8') + b'\n'
    output = io.BytesIO()
    with gzip.GzipFile(fileobj=output, mode='wb', filename='', mtime=0) as stream:
        stream.write(payload)
    return output.getvalue(), len(rows), sum(row[3] for row in rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    content, unique, paths = build_index()
    if args.check:
        if gzip.decompress(OUTPUT.read_bytes()) != gzip.decompress(content):
            raise SystemExit('Diffusion fingerprint index differs from pinned Git objects')
        print(f'PASS: {paths} Diffusion paths and {unique} unique blobs match pinned Git objects')
    else:
        OUTPUT.write_bytes(content)
        print(f'Wrote {OUTPUT.relative_to(ROOT)}: {paths} paths, {unique} unique blobs')


if __name__ == '__main__':
    main()
