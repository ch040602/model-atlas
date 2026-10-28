import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';

const configUrl=pathToFileURL(resolve('upstream/transformer-explainer/svelte.config.js')).href;
function config(prefix) {
  return spawnSync(process.execPath,['--input-type=module','-e',`import config from ${JSON.stringify(configUrl)}; console.log(config.kit.paths.base)`],{
    encoding:'utf8',env:{...process.env,NODE_ENV:'production',MODEL_ATLAS_BASE_PATH:prefix}
  });
}
for (const [prefix,expected] of [['','/upstream/transformer-explainer/build'],['/repo','/repo/upstream/transformer-explainer/build']]) {
  const result=config(prefix);
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout.trim(),expected);
}
const invalid=config('/repo/');
assert.notEqual(invalid.status,0);
assert.match(invalid.stderr,/MODEL_ATLAS_BASE_PATH/);
assert.ok(existsSync(resolve('.nojekyll')),'GitHub Pages must publish underscore-prefixed build directories');
console.log('PASS: root and project deployment prefixes; invalid trailing slash rejected');
