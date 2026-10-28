import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('cnn_bundle_licenses', ROOT / 'scripts' / 'cnn_bundle_licenses.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CnnLicenseTests(unittest.TestCase):
    def test_actual_build_notices_match(self):
        subprocess.run([sys.executable, str(ROOT / 'scripts' / 'cnn_bundle_licenses.py'), '--check'], check=True)

    def test_nested_metadata_and_missing_package(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            package = base / 'node_modules' / 'example'
            nested = package / 'internal'
            nested.mkdir(parents=True)
            (package / 'package.json').write_text(json.dumps({'name': 'example', 'version': '1.0.0'}))
            (nested / 'package.json').write_text(json.dumps({'type': 'module'}))
            old_cnn, old_map = module.CNN, module.SOURCE_MAP
            try:
                module.CNN, module.SOURCE_MAP = base, base / 'public' / 'bundle.js.map'
                self.assertEqual(module.package_for('../node_modules/example/internal/index.js'), package)
                self.assertIsNone(module.package_for('../src/main.js'))
                with self.assertRaises(RuntimeError):
                    module.package_for('../node_modules/missing/index.js')
            finally:
                module.CNN, module.SOURCE_MAP = old_cnn, old_map


if __name__ == '__main__':
    unittest.main()
