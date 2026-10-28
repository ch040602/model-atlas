"""Exercise restoration and conflict handling with a small local Git repository."""
from pathlib import Path
import importlib.util
import subprocess
import tempfile
from unittest.mock import patch as mock_patch

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('bootstrap', ROOT / 'scripts' / 'bootstrap.py')
bootstrap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bootstrap)

def git(path, *args):
    return subprocess.run(['git', *args], cwd=path, check=True, capture_output=True, text=True).stdout.strip()

with tempfile.TemporaryDirectory(prefix='model-atlas-test-') as tmp:
    base = Path(tmp)
    upstream = base / 'origin'
    upstream.mkdir()
    git(upstream, 'init', '-q')
    (upstream / 'example.txt').write_text('original\n', encoding='utf-8')
    git(upstream, 'add', 'example.txt')
    git(upstream, '-c', 'user.name=Model Atlas test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture')
    rev = git(upstream, 'rev-parse', 'HEAD')
    (upstream / 'example.txt').write_text('integration\n', encoding='utf-8')
    patch = subprocess.check_output(['git', 'diff', '--binary'], cwd=upstream)
    git(upstream, 'checkout', '--', 'example.txt')
    target = base / 'project'
    (target / 'patches').mkdir(parents=True)
    (target / 'patches' / 'fixture.patch').write_bytes(patch)
    bootstrap.ROOT = target
    try:
        bootstrap.restore('fixture', str(base / 'missing-origin'), rev, False)
    except subprocess.CalledProcessError:
        pass
    else:
        raise AssertionError('A failed fetch should report an error')
    assert not (target / 'upstream' / 'fixture').exists(), 'Failed fetch must not leave a broken target checkout'
    assert not list((target / 'upstream').iterdir()), 'Temporary checkout must be removed on fetch failure'
    real_run = bootstrap.run
    def fail_checkout(args, cwd, **kwargs):
        if args[:2] == ['git', 'checkout']:
            raise subprocess.CalledProcessError(1, args)
        return real_run(args, cwd, **kwargs)
    with mock_patch.object(bootstrap, 'run', side_effect=fail_checkout):
        try:
            bootstrap.restore('fixture', str(upstream), rev, False)
        except subprocess.CalledProcessError:
            pass
        else:
            raise AssertionError('A failed checkout should report an error')
    assert not list((target / 'upstream').iterdir()), 'Temporary checkout must be removed on checkout failure'
    incomplete = target / 'upstream' / 'incomplete'
    incomplete.mkdir()
    git(incomplete, 'init', '-q')
    (incomplete / 'user.txt').write_text('keep this', encoding='utf-8')
    try:
        bootstrap.restore('incomplete', str(upstream), rev, False)
    except RuntimeError as error:
        assert 'Cannot read HEAD' in str(error)
    else:
        raise AssertionError('Existing incomplete checkouts require inspection')
    assert (incomplete / 'user.txt').read_text(encoding='utf-8') == 'keep this'
    concurrent = target / 'upstream' / 'concurrent'
    def create_target_during_checkout(args, cwd, **kwargs):
        result = real_run(args, cwd, **kwargs)
        if args[:2] == ['git', 'checkout']:
            concurrent.mkdir()
            (concurrent / 'user.txt').write_text('user data', encoding='utf-8')
        return result
    with mock_patch.object(bootstrap, 'run', side_effect=create_target_during_checkout):
        try:
            bootstrap.restore('concurrent', str(upstream), rev, False)
        except RuntimeError as error:
            assert 'appeared during fetch' in str(error)
        else:
            raise AssertionError('A new target checkout must not be overwritten')
    assert (concurrent / 'user.txt').read_text(encoding='utf-8') == 'user data'
    assert not list((target / 'upstream').glob('.concurrent-*'))
    bootstrap.restore('fixture', str(upstream), rev, False)
    restored = target / 'upstream' / 'fixture' / 'example.txt'
    assert restored.read_text(encoding='utf-8') == 'integration\n'
    bootstrap.restore('fixture', str(upstream), rev, True)
    restored.write_text('user edits\n', encoding='utf-8')
    try:
        bootstrap.restore('fixture', str(upstream), rev, False)
    except RuntimeError:
        pass
    else:
        raise AssertionError('Conflicting changes must fail without being overwritten')
    assert restored.read_text(encoding='utf-8') == 'user edits\n'
    try:
        bootstrap.restore('fixture', str(upstream), '0' * 40, False)
    except RuntimeError:
        pass
    else:
        raise AssertionError('A different revision must be rejected')
    assert restored.read_text(encoding='utf-8') == 'user edits\n'
print('PASS: fetch/checkout failure recovery, retry, patch idempotency and preservation of conflicting changes')
