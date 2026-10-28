#!/usr/bin/env python3
"""Find selected known upstream assets in a proposed publication directory.

This is a byte-fingerprint screen, not a license clearance or complete inventory.
Exit 1 means at least one fingerprint matched; exit 2 means the scan was incomplete.
"""
import argparse
import gzip
import hashlib
import json
import os
import stat
import zlib
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'third-party-licenses/publication-asset-fingerprints.json'
DIFFUSION_MANIFEST = ROOT / 'third-party-licenses/diffusion-asset-fingerprints.json.gz'
DIFFUSION_REVISION = '0820016ce908a8e66619b7a1c9369af1498160d6'
DIFFUSION_PREFIXES = ['assets/img/', 'assets/img_orig/', 'assets/latent_viz/', 'assets/gif/',
                      'assets/json/', 'assets/noises/', 'assets/preview/', 'assets/umap/']
# SHA-256 of each parsed index serialized as sorted, compact ASCII JSON. This
# catches accidental valid-looking edits as well as truncated/missing indexes.
# Regenerate and independently verify both indexes before updating these values.
SELECTED_INDEX_SHA256 = 'c9daf2e6f969d30e91ddc1158623bc9414b719f8d756a6a1af56c80ca6cd73db'
DIFFUSION_INDEX_SHA256 = '2f47cda0f6767475f640905747beaddee1f20e436db98851184e97d9edf78fad'


def verify_index(document, expected, label):
    encoded = json.dumps(document, sort_keys=True, separators=(',', ':'), ensure_ascii=True).encode('ascii')
    if hashlib.sha256(encoded).hexdigest() != expected:
        raise ValueError(f'{label} fingerprint index does not match the expected content')


def load_entries():
    selected = json.loads(MANIFEST.read_text(encoding='utf-8'))
    verify_index(selected, SELECTED_INDEX_SHA256, 'Selected')
    entries = selected['files']
    with gzip.open(DIFFUSION_MANIFEST, 'rt', encoding='utf-8') as stream:
        diffusion = json.load(stream)
    verify_index(diffusion, DIFFUSION_INDEX_SHA256, 'Diffusion')
    if diffusion['project'] != 'diffusion-explainer' or diffusion['columns'] != ['bytes', 'sha256', 'representative_path', 'path_count']:
        raise ValueError('Unexpected Diffusion fingerprint index format')
    if diffusion['revision'] != DIFFUSION_REVISION or diffusion['prefixes'] != DIFFUSION_PREFIXES:
        raise ValueError('Unexpected Diffusion fingerprint revision or scope')
    if diffusion['path_count'] != 37955 or len(diffusion['files']) != 28370 or diffusion['path_count'] != sum(row[3] for row in diffusion['files']):
        raise ValueError('Inconsistent Diffusion fingerprint path count')
    seen = set()
    for size, digest, path, count in diffusion['files']:
        if (not isinstance(size, int) or size < 0 or not isinstance(count, int) or count < 1
                or not isinstance(digest, str) or len(digest) != 64 or any(c not in '0123456789abcdef' for c in digest)
                or not isinstance(path, str) or not any(path.startswith(prefix) for prefix in DIFFUSION_PREFIXES)
                or (size, digest) in seen):
            raise ValueError('Invalid Diffusion fingerprint entry')
        seen.add((size, digest))
        entries.append({'project': diffusion['project'], 'revision': diffusion['revision'], 'path': path,
                        'bytes': size, 'sha256': digest, 'path_count': count,
                        'reason': 'Diffusion precomputed asset: verify provenance and redistribution terms'})
    if len(diffusion['crlf_files']) != 2:
        raise ValueError('Inconsistent Diffusion CRLF fingerprint count')
    for size, digest, path in diffusion['crlf_files']:
        if (not isinstance(size, int) or size < 0 or not isinstance(digest, str) or len(digest) != 64
                or any(c not in '0123456789abcdef' for c in digest) or not isinstance(path, str)
                or not path.endswith('.json') or not any(path.startswith(prefix) for prefix in DIFFUSION_PREFIXES)
                or (size, digest) in seen):
            raise ValueError('Invalid Diffusion CRLF fingerprint entry')
        seen.add((size, digest))
        entries.append({'project': diffusion['project'], 'revision': diffusion['revision'], 'path': path,
                        'bytes': size, 'sha256': digest,
                        'reason': 'Diffusion precomputed asset with CRLF line endings: verify provenance and redistribution terms'})
    return entries


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def is_link_or_reparse_point(path):
    metadata = path.lstat()
    return stat.S_ISLNK(metadata.st_mode) or bool(
        getattr(metadata, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 0x400)
    )


def scan(directory, entries):
    sizes = defaultdict(lambda: defaultdict(list))
    for entry in entries:
        sizes[entry['bytes']][entry['sha256']].append(entry)
    matches, issues = [], []
    def onerror(error):
        issues.append(str(error))
    for base, dirs, files in os.walk(directory, followlinks=False, onerror=onerror):
        for name in list(dirs):
            path = Path(base) / name
            try:
                linked = is_link_or_reparse_point(path)
            except OSError as error:
                issues.append(f'{path}: {error}')
                linked = True
            if linked:
                issues.append(f'Skipped linked or reparse directory: {path}')
                dirs.remove(name)
        for name in files:
            path = Path(base) / name
            try:
                if is_link_or_reparse_point(path):
                    issues.append(f'Skipped linked or reparse file: {path}')
                    continue
                candidates = sizes.get(path.stat().st_size, ())
                if candidates:
                    digest = sha256(path)
                    for entry in candidates.get(digest, ()):
                        matches.append((path.relative_to(directory), entry))
            except OSError as error:
                issues.append(f'{path}: {error}')
    return matches, issues


def grouped_matches(matches):
    """Group fingerprint associations, retaining distinct paths and an example.

    One file can match multiple source entries, so associations and unique
    paths are counted separately. Counts in different groups can overlap.
    """
    groups = defaultdict(lambda: {'paths': set(), 'associations': 0})
    for path, entry in matches:
        group = groups[(entry['project'], entry['reason'])]
        group['paths'].add(path)
        group['associations'] += 1
    return groups


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path, help='Folder that would actually be published')
    parser.add_argument('--all', action='store_true', help='Print every matching fingerprint association instead of the first 100')
    args = parser.parse_args()
    directory = args.directory.resolve()
    if not directory.is_dir():
        parser.error(f'Not a directory: {directory}')
    try:
        entries = load_entries()
    except (OSError, EOFError, ValueError, KeyError, TypeError, IndexError, zlib.error) as error:
        print(f'INCOMPLETE fingerprint index: {error}')
        return 2
    matches, issues = scan(directory, entries)
    matches.sort(key=lambda item: (str(item[0]).casefold(), str(item[0]), item[1]['project'], item[1]['path']))
    print(f'Scanned: {directory}')
    groups = grouped_matches(matches)
    if groups:
        print('Summary by project and review reason (groups can overlap):')
        for (project, reason), group in sorted(groups.items()):
            example = min(group['paths'], key=lambda path: (str(path).casefold(), str(path)))
            print(f'  {project}: {reason}\n    {len(group["paths"])} file(s), {group["associations"]} fingerprint association(s); example: {example}')
    shown = matches if args.all else matches[:100]
    for path, entry in shown:
        print(f'MATCH {path}\n  {entry["reason"]}\n  Source: {entry["project"]}/{entry["path"]}')
        if entry.get('path_count', 1) > 1:
            print(f'  This same blob occurs at {entry["path_count"]} pinned Diffusion paths; source shown is representative.')
    if len(shown) < len(matches):
        print(f'... {len(matches) - len(shown)} additional matches omitted from this display; use --all to list them.')
    for issue in issues:
        print(f'INCOMPLETE {issue}')
    print(f'{len(matches)} fingerprint match(es); {len(issues)} scan issue(s).')
    print('Only selected byte-identical files are checked. Transformed files, archive contents, '
          'other Diffusion assets, other reassembled or transformed Transformer weights, external resources and other dependencies '
          'are not comprehensively covered. No matches does not establish redistribution rights.')
    return 2 if issues else 1 if matches else 0


if __name__ == '__main__':
    raise SystemExit(main())
