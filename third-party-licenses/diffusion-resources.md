# Diffusion Explainer: assets and external resources

확인일 / Checked: 2026-10-27. 원본 리비전 / Pinned revision: [`0820016ce908a8e66619b7a1c9369af1498160d6`](https://github.com/poloclub/diffusion-explainer/tree/0820016ce908a8e66619b7a1c9369af1498160d6). This inventory does not establish redistribution rights for each asset.

## Precomputed assets / 미리 계산된 자산

The authors' [paper](https://arxiv.org/html/2305.03509) states that the tool precomputes intensive operations for preset prompts and that it illustrates image representations by decoding them and upscaling them. The pinned source [`js/function.js`](https://github.com/poloclub/diffusion-explainer/blob/0820016ce908a8e66619b7a1c9369af1498160d6/js/function.js) references files in `assets/img/` and `assets/latent_viz/` by prompt, seed, guidance and timestep. [`js/compare.js`](https://github.com/poloclub/diffusion-explainer/blob/0820016ce908a8e66619b7a1c9369af1498160d6/js/compare.js) also loads a UMAP JSON file. The original [README](https://github.com/poloclub/diffusion-explainer/blob/0820016ce908a8e66619b7a1c9369af1498160d6/README.md) identifies the software as MIT licensed; it does not identify the model checkpoint or state separate rights for every image and data file.

The local checkout had the following directories, counted recursively on the date above. Bytes are file sizes, not transferred or compressed sizes; the count does not prove which files a particular session requests.

| Directory under `assets/` | Files | Bytes |
| --- | ---: | ---: |
| `img` | 18,360 | 438,843,451 |
| `img_orig` | 1,224 | 98,978,634 |
| `latent_viz` | 18,360 | 30,316,488 |
| `gif` | 5 | 13,254,634 |
| `json` | 1 | 30,741 |
| `noises` | 3 | 6,040 |
| `preview` | 1 | 530,732 |
| `umap` | 1 | 2,219,730 |

The observed paper and README do not by themselves verify the checkpoint, generation settings and rights for each checked-in asset. In particular, do not assume that a particular Stable Diffusion model license is the license of these exact files. The checkout is ignored by this project’s Git configuration, but a server exposing the whole checkout can still serve the asset directories.

The [compressed fingerprint index](diffusion-asset-fingerprints.json.gz) covers all 37,955 pinned paths in these eight directories, represented by 28,370 unique Git blobs. `python scripts/build_diffusion_fingerprints.py --check` reconstructs it from the pinned Git tree and validates each blob's Git object ID before hashing. The index also contains derived CRLF forms of the two JSON files, since Windows checkouts can change their line endings. `python scripts/audit_publication.py <publication_directory>` detects byte-identical copies even when renamed; it reports a representative original path when a blob occurs at multiple paths. This screen does not identify re-encoded images or establish any rights.

## Icons marked Font Awesome Pro / 상업용 표시 아이콘

The pinned source contains seven SVG files with a Font Awesome Pro 6.2.1 commercial-license header: `icons/backward-step.svg`, `icons/forward-step.svg`, `icons/left.svg`, `icons/right.svg`, `icons/pause.svg`, `icons/play_before.svg`, and `icons/replay.svg`. A software MIT license does not override that header. Model Atlas replaces the three used by the controller with original inline shapes; the play icon is also an original shape. The comparison arrow no longer loads the Font Awesome kit. The original seven files remain in the ignored upstream checkout because bootstrap restores the pinned repository. **Do not publish or serve the complete `icons/` directory containing these files without confirming permission; exclude the seven files from any deployment.** Other upstream icons and images remain subject to separate provenance checks. The local development server can still serve ignored files if given their paths.

The CLIP explanation originally displays `icons/whitedog.jpg` and `icons/yellowflower.jpg`; their separate provenance and redistribution terms have not been established. The patched page uses original inline SVG illustrations and bilingual captions instead and does not request those JPEGs. The original files remain in the ignored upstream checkout and may still be served directly. The publication fingerprint screen detects byte-identical copies of these two photos, including renamed copies. This replacement does not establish rights for other images or precomputed assets.

## External requests / 외부 연결

The pinned [`index.html`](https://github.com/poloclub/diffusion-explainer/blob/0820016ce908a8e66619b7a1c9369af1498160d6/index.html) includes Google Analytics, a Font Awesome kit, Google Fonts and `d3.v7.min.js` from `d3js.org`. The original D3 URL specifies a major version, not an immutable minor release. Model Atlas removes the Analytics and Font Awesome kit references and uses a local D3 7.9.0 bundle built from the pinned Transformer dependency tree. [The D3 notice inventory](diffusion-d3-bundle-notices.txt) contains license texts for all 34 packages included by that build; `node scripts/build_diffusion_d3.mjs --check` regenerates and compares both the bundle and its notices. Google Fonts remain external; actual requests depend on runtime and network conditions. Their terms and any additional resources they load should be checked for the intended deployment. The local course also loads fonts separately.

## Before redistribution / 공개 배포 전

Identify the exact files served, confirm rights for the precomputed assets and external resources, and retain applicable notices. If rights cannot be established, use appropriately licensed replacements or obtain permission. This inventory neither establishes legal clearance nor says that the upstream MIT license automatically covers third-party content.
