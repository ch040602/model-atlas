"""Check notice extraction against the installed bundle and missing-license cases."""
import importlib.util
import json
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('gan_bundle_licenses', root / 'scripts' / 'gan_bundle_licenses.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

notices = module.report()
assert notices == module.OUTPUT.read_text(encoding='utf-8')
assert '@tensorflow/tfjs-core 0.12.4' in notices
assert 'seedrandom 2.4.3' in notices and 'Copyright 2014 David Bau.' in notices
assert notices.count('Declared license:') >= 20

with tempfile.TemporaryDirectory() as temp:
    package = Path(temp)
    (package / 'package.json').write_text(json.dumps({'name': 'fixture', 'version': '1'}), encoding='utf-8')
    (package / 'NOTICE').write_text('A notice alone is not a license.', encoding='utf-8')
    try:
        module.license_text(package)
    except RuntimeError as exc:
        assert 'No license or notice file found' in str(exc)
    else:
        raise AssertionError('A dependency without a notice must not be silently accepted')

print('PASS: GAN bundle notices match installed inputs; missing notices fail explicitly')
