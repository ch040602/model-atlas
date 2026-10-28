import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('transformer_bundle_licenses', ROOT / 'scripts' / 'transformer_bundle_licenses.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TransformerLicenseTests(unittest.TestCase):
    def test_audit_build_notices_match(self):
        subprocess.run([sys.executable, str(ROOT / 'scripts' / 'transformer_bundle_licenses.py'), '--check'], check=True)
        content = module.OUTPUT.read_text(encoding='utf-8')
        for package in ('gsap 3.13.0', 'onnxruntime-web 1.14.0', 'onnxruntime-web 1.23.0', '@xenova/transformers 2.17.2'):
            self.assertIn(package, content)
        self.assertIn('Prebundled library dependencies', content)

    def test_resolve_map_from_precopy_directory_and_fail_missing(self):
        with tempfile.TemporaryDirectory() as tmp:
            app = Path(tmp).resolve()
            package = app / 'node_modules' / 'example'
            nested = package / 'internal'
            nested.mkdir(parents=True)
            (package / 'package.json').write_text(json.dumps({'name': 'example', 'version': '1.0.0'}))
            (nested / 'package.json').write_text(json.dumps({'type': 'module'}))
            (nested / 'index.js').write_text('// example')
            virtual_map = app / '.svelte-kit' / 'output' / 'client' / '_app' / 'immutable' / 'chunks' / 'bundle.js.map'
            old_app = module.APP
            try:
                module.APP = app
                source = '../../../../../../node_modules/example/internal/index.js'
                self.assertEqual(module.package_for(source, virtual_map), package)
                self.assertIsNone(module.package_for('../../src/main.js', virtual_map))
                with self.assertRaises(RuntimeError):
                    module.package_for('../../../../../../node_modules/missing/index.js', virtual_map)
            finally:
                module.APP = old_app


if __name__ == '__main__':
    unittest.main()
