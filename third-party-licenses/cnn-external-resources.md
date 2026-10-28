# CNN Explainer external resources and local font

This is an inventory of references in `public/index.html` at the pinned and
patched revision. It does not establish redistribution rights, nor does it
cover resources requested indirectly by these scripts or CSS.

| Resource | Reference in page | Version specificity |
| --- | --- | --- |
| Bulma CSS | `../../../vendor/cnn/bulma-0.8.0.min.css` | Local Bulma 0.8.0; replaces the original jsDelivr URL |
| Neucha font | `fonts.googleapis.com/css?family=Neucha` | No version in URL |
| D3 | `../../../vendor/d3-5.16.0.min.js` | Local D3 5.16.0 bundle; replaces upstream `d3js.org/d3.v5.js` |
| TensorFlow.js | `../../../vendor/tfjs-1.0.0.min.js` | Local 1.0.0 bundle, byte-identical to the original CDN file; [source and notices](cnn-tfjs-bundle.md) |
| Font Awesome | Removed from the patched page | Upstream loaded 5.3.1; control icons now use local text symbols |
| Smooth Scroll and polyfills | `../../../vendor/cnn/smooth-scroll-15.2.1.polyfills.min.js` | Local 15.2.1; replaces the original major-version CDN URL |
| MathJax | Removed from the patched page | Upstream loaded unpinned major version 3; the two article formulas now use native MathML. |
| A Love of Thunder font | `public/assets/font/A Love of Thunder.ttf` | Present in the upstream checkout but no longer requested by the patched page; see below. |

The local Bulma stylesheet is the `css/bulma.min.css` file in the npm Bulma 0.8.0 distribution, checked on 2026-10-27 against the original jsDelivr URL and found byte-identical (SHA-256 `0fd339cab543a859656bb9e510b0da6192295df1560f2b50b6257e4da1fa1752`). It contains no CSS `@import` or `url()` references. The distribution’s [MIT license and copyright notice](cnn-bulma-0.8.0.LICENSE) are retained. `python scripts/cnn_bulma_asset.py` verifies both files offline; `--refresh` downloads the npm archive and checks its pinned SHA-512 and member hashes before restoring them. The source license is also available at the [Bulma 0.8.0 tag](https://github.com/jgthms/bulma/blob/0.8.0/LICENSE).

The original page also loaded an unversioned `recommender-overlay` script from unpkg for cross-project recommendations. The patched page removes that overlay and its script; Model Atlas provides navigation between the labs itself.

The original Font Awesome script has been removed. The patched controls use local text symbols with their existing Korean and English button labels; the icon shapes can vary with the installed system font. This change does not establish rights to other assets.

The original article used MathJax for ReLU and softmax. The patched article renders these two authored formulas directly as MathML with Korean and English accessible names, and the page no longer requests MathJax. Chrome testing covers the two rendered equations with external requests blocked at both the root and a local project prefix. MathML support and screen-reader behavior vary by browser and assistive technology; no physical screen reader was tested.

The local D3 bundle is built from the root npm lockfile and has [notices for its 32 included packages](cnn-d3-bundle-notices.txt). Run `npm ci` at the project root, install the pinned Transformer dependencies as described in the README, then run `node scripts/build_cnn_d3.mjs --check` to verify the generated bundle and notices. The original page's remaining external URLs still require network access and are outside those notices.

The Smooth Scroll polyfill bundle was checked on 2026-10-27: the original `@15` CDN URL served bytes identical to the [15.2.1 distribution at commit `82de06c`](https://github.com/cferdinandi/smooth-scroll/blob/82de06c95c51b3b7b484d88b92da712812738f60/dist/smooth-scroll.polyfills.min.js), SHA-256 `1512662ffdb56b269ac9f0abfade75b58bf197915fb00475e27d1ed8357f7174`. It is now served locally. Retain its [MIT license](cnn-smooth-scroll-15.2.1.LICENSE), the [CSS.escape license](cnn-css-escape.LICENSE), and the [source attribution notes](cnn-smooth-scroll-notices.md). `python scripts/cnn_smooth_scroll_asset.py` verifies the files; `--refresh` retrieves the pinned source bytes and checks hashes before writing them. This observation does not establish what the unpinned CDN served on other dates.

Some URLs can serve different releases over time. Review the exact fetched
files and applicable notices before hosting or redistributing them, and
confirm the rights to each file. Source: the project's
[`public/index.html`](https://github.com/poloclub/cnn-explainer/blob/d0971f9447ed9806022a3d47587b62394682bc51/public/index.html).

## Restricted font in the upstream checkout

The pinned TTF has SHA-256 `a235891249159004ea999a0f2e7bbe0c5554d3e7b08463d9717ace45a4927d5d`. Its embedded name metadata identifies S. John Ross and says “Freeware for private, non-commercial use only.” The [font author's description](https://www.1001fonts.com/a-love-of-thunder-font.html) requests a separate license for public or organizational use. These restrictions must not be assumed to be waived by the CNN repository's MIT license. The patched page uses system fonts and does not request this TTF.

The upstream checkout still contains the file because it is part of the pinned original. **Do not include it in a public deployment or redistributed artifact without permission or an applicable license.** The parent Git repository ignores the entire upstream checkout, but a copied or published `public` directory would otherwise include it. Removing the request does not grant redistribution rights.
