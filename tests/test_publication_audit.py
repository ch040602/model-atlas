import shutil
import subprocess
import sys
import tempfile
import unittest
import json
import gzip
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT = ROOT / 'scripts/audit_publication.py'


class PublicationAuditTests(unittest.TestCase):
    def test_diffusion_assets_are_detected_across_all_indexed_groups(self):
        index_path = ROOT / 'third-party-licenses/diffusion-asset-fingerprints.json.gz'
        with gzip.open(index_path, 'rt', encoding='utf-8') as stream:
            index = json.load(stream)
        self.assertEqual(index['path_count'], 37955)
        self.assertEqual(len(index['files']), 28370)
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            for number, prefix in enumerate(index['prefixes']):
                row = next(row for row in index['files'] if row[2].startswith(prefix))
                source = ROOT / 'upstream/diffusion-explainer' / row[2]
                shutil.copyfile(source, target / f'renamed-{number}.dat')
            changed = bytearray((target / 'renamed-0.dat').read_bytes())
            changed[-1] ^= 1
            (target / 'changed.dat').write_bytes(changed)
            result = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            for number in range(len(index['prefixes'])):
                self.assertIn(f'MATCH renamed-{number}.dat', result.stdout)
            self.assertNotIn('MATCH changed.dat', result.stdout)
            self.assertIn('Diffusion precomputed asset', result.stdout)
            self.assertIn('This same blob occurs at 120 pinned Diffusion paths', result.stdout)
            self.assertIn('8 fingerprint match(es)', result.stdout)

    def test_json_git_and_crlf_bytes_are_both_found(self):
        checkout = ROOT / 'upstream/diffusion-explainer'
        revision = '0820016ce908a8e66619b7a1c9369af1498160d6'
        paths = ['assets/json/text_vector.json', 'assets/umap/umap_0.99_15_0.json']
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            for number, path in enumerate(paths):
                data = subprocess.check_output(['git', 'show', f'{revision}:{path}'], cwd=checkout)
                self.assertNotIn(b'\r\n', data)
                (target / f'original-{number}.dat').write_bytes(data)
                (target / f'crlf-{number}.dat').write_bytes(data.replace(b'\n', b'\r\n'))
            result = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            for number in range(2):
                self.assertIn(f'MATCH original-{number}.dat', result.stdout)
                self.assertIn(f'MATCH crlf-{number}.dat', result.stdout)
            self.assertIn('4 fingerprint match(es)', result.stdout)
            self.assertIn('with CRLF line endings', result.stdout)

    def test_cnn_model_data_git_and_crlf_bytes_are_both_found(self):
        checkout = ROOT / 'upstream/cnn-explainer'
        revision = 'd0971f9447ed9806022a3d47587b62394682bc51'
        original = subprocess.check_output(['git', 'show', f'{revision}:public/assets/data/nn_10.json'], cwd=checkout)
        self.assertNotIn(b'\r', original)
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            (target / 'git.json').write_bytes(original)
            (target / 'windows.json').write_bytes(original.replace(b'\n', b'\r\n'))
            result = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('MATCH git.json', result.stdout)
            self.assertIn('MATCH windows.json', result.stdout)
            self.assertIn('CNN model data: verify provenance and redistribution terms (CRLF line endings)', result.stdout)
            self.assertIn('2 fingerprint match(es)', result.stdout)

    def test_missing_or_damaged_diffusion_index_is_incomplete(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'scripts').mkdir()
            (root / 'third-party-licenses').mkdir()
            shutil.copyfile(AUDIT, root / 'scripts/audit_publication.py')
            shutil.copyfile(ROOT / 'third-party-licenses/publication-asset-fingerprints.json',
                            root / 'third-party-licenses/publication-asset-fingerprints.json')
            target = root / 'publication'
            target.mkdir()
            for content in [None, b'not a gzip file', gzip.compress(b'{"files":[]}')]:
                if content is not None:
                    (root / 'third-party-licenses/diffusion-asset-fingerprints.json.gz').write_bytes(content)
                result = subprocess.run([sys.executable, str(root / 'scripts/audit_publication.py'), str(target)],
                                        capture_output=True, text=True, encoding='utf-8')
                self.assertEqual(result.returncode, 2, result.stderr)
                self.assertIn('INCOMPLETE fingerprint index', result.stdout)

    def test_valid_looking_index_corruption_is_incomplete(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'scripts').mkdir()
            (root / 'third-party-licenses').mkdir()
            shutil.copyfile(AUDIT, root / 'scripts/audit_publication.py')
            selected_path = root / 'third-party-licenses/publication-asset-fingerprints.json'
            diffusion_path = root / 'third-party-licenses/diffusion-asset-fingerprints.json.gz'
            selected = json.loads((ROOT / 'third-party-licenses/publication-asset-fingerprints.json').read_text(encoding='utf-8'))
            with gzip.open(ROOT / 'third-party-licenses/diffusion-asset-fingerprints.json.gz', 'rt', encoding='utf-8') as stream:
                diffusion = json.load(stream)
            target = root / 'publication'
            target.mkdir()
            def save():
                # Formatting and gzip encoding do not affect the canonical commitment.
                selected_path.write_text(json.dumps(selected, ensure_ascii=False), encoding='utf-8')
                with gzip.open(diffusion_path, 'wt', encoding='utf-8') as stream:
                    json.dump(diffusion, stream, ensure_ascii=False)
            def audit():
                return subprocess.run([sys.executable, str(root / 'scripts/audit_publication.py'), str(target)],
                                      capture_output=True, text=True, encoding='utf-8')
            save()
            self.assertEqual(audit().returncode, 0)
            selected['files'][0]['sha256'] = '0' * 64
            save()
            result = audit()
            self.assertEqual(result.returncode, 2)
            self.assertIn('Selected fingerprint index does not match', result.stdout)
            selected['files'].pop()
            save()
            self.assertEqual(audit().returncode, 2)
            selected = json.loads((ROOT / 'third-party-licenses/publication-asset-fingerprints.json').read_text(encoding='utf-8'))
            diffusion['files'][0][1] = '0' * 64
            save()
            result = audit()
            self.assertEqual(result.returncode, 2)
            self.assertIn('Diffusion fingerprint index does not match', result.stdout)

    def test_large_match_set_is_counted_when_display_is_limited(self):
        source = ROOT / 'upstream/diffusion-explainer/assets/noises/noise_pred_empty.jpg'
        with tempfile.TemporaryDirectory() as tmp:
            for number in range(101):
                shutil.copyfile(source, Path(tmp) / f'{number:03}.jpg')
            result = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertEqual(result.stdout.count('MATCH '), 100)
            self.assertIn('1 additional matches omitted', result.stdout)
            self.assertIn('101 fingerprint match(es)', result.stdout)

    def test_summary_retains_other_categories_after_truncation_and_all_lists_them(self):
        diffusion = ROOT / 'upstream/diffusion-explainer/assets/noises/noise_pred_empty.jpg'
        font = ROOT / 'upstream/cnn-explainer/public/assets/font/A Love of Thunder.ttf'
        icon = ROOT / 'upstream/diffusion-explainer/icons/play_before.svg'
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            for number in range(101):
                shutil.copyfile(diffusion, target / f'a-{number:03}.jpg')
            shutil.copyfile(font, target / 'z-font.dat')
            shutil.copyfile(icon, target / 'z-icon.dat')
            limited = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(limited.returncode, 1, limited.stderr)
            self.assertEqual(limited.stdout.count('MATCH '), 100)
            self.assertIn('101 file(s), 101 fingerprint association(s); example: a-000.jpg', limited.stdout)
            self.assertIn('cnn-explainer: Restricted font: exclude unless permission is confirmed', limited.stdout)
            self.assertIn('diffusion-explainer: Font Awesome Pro-marked icon', limited.stdout)
            self.assertIn('example: z-font.dat', limited.stdout)
            self.assertIn('example: z-icon.dat', limited.stdout)
            self.assertNotIn('MATCH z-font.dat', limited.stdout)
            self.assertIn('use --all', limited.stdout)
            complete = subprocess.run([sys.executable, str(AUDIT), '--all', tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(complete.returncode, 1, complete.stderr)
            self.assertEqual(complete.stdout.count('MATCH '), 103)
            self.assertIn('MATCH z-font.dat', complete.stdout)
            self.assertIn('MATCH z-icon.dat', complete.stdout)
            self.assertNotIn('additional matches omitted', complete.stdout)

    def test_summary_counts_multiple_source_associations_for_one_file(self):
        spec = importlib.util.spec_from_file_location('publication_audit', AUDIT)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        path = Path('shared.dat')
        entry = {'project': 'example', 'reason': 'review', 'path': 'one'}
        groups = module.grouped_matches([(path, entry), (path, {**entry, 'path': 'two'}),
                                        (path, {**entry, 'reason': 'other'})])
        self.assertEqual(len(groups[('example', 'review')]['paths']), 1)
        self.assertEqual(groups[('example', 'review')]['associations'], 2)
        self.assertEqual(groups[('example', 'other')]['paths'], {path})

    def test_concatenated_model_and_changed_model(self):
        manifest = json.loads((ROOT / 'third-party-licenses/publication-asset-fingerprints.json').read_text(encoding='utf-8'))
        entries = [entry for entry in manifest['files'] if 'concatenated in numeric order' in entry['path']]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['bytes'], 656662664)
        self.assertEqual(entries[0]['sha256'], 'ccf64e934094054603c5b7bd98191f0fd2ea0315a81e9e0d8104070f64413119')
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / 'renamed-model.dat'
            with target.open('wb') as output:
                for index in range(63):
                    source = ROOT / f'upstream/transformer-explainer/static/model-v2/gpt2.onnx.part{index}'
                    with source.open('rb') as stream:
                        shutil.copyfileobj(stream, output, length=1024 * 1024)
            result = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('MATCH renamed-model.dat', result.stdout)
            self.assertIn('Concatenated Transformer model', result.stdout)
            with target.open('r+b') as stream:
                original = stream.read(1)
                stream.seek(0)
                stream.write(bytes([original[0] ^ 1]))
            changed = subprocess.run([sys.executable, str(AUDIT), tmp], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(changed.returncode, 0, changed.stderr)
            self.assertNotIn('MATCH renamed-model.dat', changed.stdout)

    def test_renamed_copies_are_reported_but_changed_bytes_are_not(self):
        fixtures = [
            ('upstream/cnn-explainer/public/assets/font/A Love of Thunder.ttf', 'font.bin'),
            ('upstream/cnn-explainer/public/assets/img/koala_1.jpeg', 'nested/renamed-image.dat'),
            ('upstream/diffusion-explainer/icons/play_before.svg', 'renamed-icon.txt'),
            ('upstream/diffusion-explainer/icons/whitedog.jpg', 'renamed-dog.dat'),
            ('upstream/diffusion-explainer/icons/yellowflower.jpg', 'renamed-flower.dat'),
            ('upstream/ganlab/demo/figures/figure-paper-screenshot.png', 'renamed-figure.dat'),
            ('upstream/transformer-explainer/static/article_assets/embedding.png', 'renamed-embedding.dat'),
            ('upstream/transformer-explainer/static/article_assets/QKV.png', 'renamed-qkv.dat'),
            ('upstream/transformer-explainer/static/article_assets/attention.png', 'renamed-attention.dat'),
            ('upstream/transformer-explainer/static/article_assets/mlp.png', 'renamed-mlp.dat'),
            ('upstream/transformer-explainer/static/article_assets/softmax.png', 'renamed-softmax.dat'),
            ('upstream/transformer-explainer/static/model-v2/gpt2.onnx.part0', 'renamed-model-chunk.dat'),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp)
            for original, name in fixtures:
                dest = target / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / original, dest)
            changed = bytearray((target / 'renamed-icon.txt').read_bytes())
            changed[-1] ^= 1
            (target / 'modified-icon.txt').write_bytes(changed)
            result = subprocess.run([sys.executable, str(AUDIT), str(target)], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            for _, name in fixtures:
                self.assertIn(Path(name).name, result.stdout)
            self.assertNotIn('MATCH modified-icon.txt', result.stdout)
            self.assertIn(f'{len(fixtures)} fingerprint match(es)', result.stdout)
            for _, name in fixtures:
                (target / name).unlink()
            clean = subprocess.run([sys.executable, str(AUDIT), str(target)], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(clean.returncode, 0, clean.stderr)
            self.assertIn('No matches does not establish redistribution rights', clean.stdout)

    def test_unreadable_directory_link_does_not_count_as_complete(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            try:
                (root / 'link').symlink_to(ROOT / 'upstream', target_is_directory=True)
            except OSError:
                self.skipTest('Creating directory symlinks is unavailable')
            result = subprocess.run([sys.executable, str(AUDIT), str(root)], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 2)
            self.assertIn('Skipped linked or reparse directory', result.stdout)

    @unittest.skipUnless(sys.platform == 'win32', 'Windows junction test')
    def test_junction_is_reported_without_following_it(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'target').mkdir()
            create = subprocess.run(['cmd', '/c', 'mklink', '/J', str(root / 'link'), str(root / 'target')], capture_output=True)
            if create.returncode:
                self.skipTest('Creating a junction is unavailable')
            result = subprocess.run([sys.executable, str(AUDIT), str(root)], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 2)
            self.assertIn('Skipped linked or reparse directory', result.stdout)


if __name__ == '__main__':
    unittest.main()
