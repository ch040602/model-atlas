# CNN TensorFlow.js 1.0.0 bundle

`vendor/tfjs-1.0.0.min.js` is the unmodified `dist/tf.min.js` from the
[`@tensorflow/tfjs` 1.0.0 npm package](https://registry.npmjs.org/@tensorflow/tfjs/-/tfjs-1.0.0.tgz).
The original CNN page loaded this exact version from jsDelivr. On 2026-10-27,
the npm tarball SHA-512 matched its registry integrity
`ZnX4GvIpKBywybBCOXi0ym04LVosJwvZN2hOKatvO6/P1HkOw5Qfu+rwQLuKsZMrcdzJXzNN8L0NiJiPu6AStw==`,
and the jsDelivr file matched the tarball file byte for byte. The local file
SHA-256 is `665a0c2f9b5bf9dcba1b81a9e78372a84eee1ba37ae5a6d3c775df935b9b2358`;
`node tests/test_cnn_translation.mjs` checks this hash and the page reference.

The npm archive's `dist/tf.min.js.map` names 306 sources: 174 TensorFlow.js
core, 52 layers, 41 converter, 17 data, 16 seedrandom, two util, two inherits,
and two tfjs root sources. The map embeds their source contents. The registry
map is not copied into `vendor`; developer tools may report its absence when
attempting to resolve the bundle's original source-map comment. The registry
manifests for the four declared TensorFlow dependencies specify 1.0.0 and
Apache-2.0; their TypeScript sources are not included at those source paths in
the package tarballs, so the map alone does not prove exact provenance of
every top-level source. The published [TensorFlow.js license](cnn-tfjs-apache-2.0.txt)
and the [Layers package license](cnn-tfjs-layers.LICENSE), which also includes
MIT terms and copyright information, are retained here.

Five nested `tfjs-data/node_modules/@tensorflow/tfjs-core/dist` source contents
match the corresponding files inside the tfjs 1.0.0 tarball's `.yalc` directory;
its manifest identifies version `1.0.0-alpha4-7fa985d2` and Apache-2.0. Its
[included license](cnn-tfjs-core-alpha-apache-2.0.txt) is retained separately.

The map also contains two copies of seedrandom. All eight source files under
the top-level core match the installed seedrandom 2.4.3 package; the eight under
data match seedrandom 2.4.4. The two source files for util match util 0.11.1,
and the two for inherits match inherits 2.0.3. Matching source files does not
prove the packages' installed versions where releases share identical files.
The [nested notices](cnn-tfjs-nested-notices.txt) retain the seedrandom and
alea copyright/license headers, the util source header and package license,
and the inherits package license. This is a source-map-based inventory of this
bundle, not a complete audit of the CNN build or its model and images.
