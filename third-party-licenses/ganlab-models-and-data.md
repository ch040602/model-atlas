# GAN Lab: example data and pretrained weights / 예제 데이터와 사전 학습 가중치

확인일 / Checked: 2026-10-27. Pinned GAN Lab revision: [`09073e8d8c05ff572e287ba5e69007b3fb9101cd`](https://github.com/poloclub/ganlab/tree/09073e8d8c05ff572e287ba5e69007b3fb9101cd). This record identifies observed files and code; it does not establish the rights or complete training provenance of each asset.

## Runtime example data / 실행 중 예제 데이터

The pinned [`demo/ganlab_input_providers.ts`](https://github.com/poloclub/ganlab/blob/09073e8d8c05ff572e287ba5e69007b3fb9101cd/demo/ganlab_input_providers.ts) generates two-dimensional samples in the browser. It implements line, two Gaussians, ring and disjoint distributions with random numbers; the drawing option samples user-supplied positions with added noise. Noise inputs are generated from uniform or truncated-normal distributions. These are code-generated examples, not evidence about the data used in each stored checkpoint's actual training run.

## Checkpoint inventory / 가중치 파일 목록

The pinned [`demo/ganlab.ts`](https://github.com/poloclub/ganlab/blob/09073e8d8c05ff572e287ba5e69007b3fb9101cd/demo/ganlab.ts) requests `pretrained_models/pretrained_<shape>.json` when pretrained mode is used; the JSON manifests identify the binary files and include configuration and iteration counts. The local files below were compared byte-for-byte with the Git blobs at the pinned revision. The tensor byte counts derived from each manifest match the corresponding binary sizes. Matching these files and manifests does not prove which code, dataset, seed or training run produced the weights, nor establish separate redistribution terms.

| Shape | JSON SHA-256 | Weight file SHA-256 | Weight bytes | Float32 tensors | Recorded iteration |
| --- | --- | --- | ---: | ---: | ---: |
| disjoint | `465cc56051ff69ab8a006f326b45c0b05d5ea00567ca27811358ccb4bf40db5b` | `5ff55c37dc3d5489e9f113f4b8ae6418448118b0583c68b7d92aa64f80404ccb` | 2,324 | 16 | 1,710 |
| gaussians | `650a61636bfab12d174061861a7470a7feb463b526fcd08960ba7f257fb02c62` | `c787e3562ca4c287a6a6c4b60ae499a265e46250077707a4f6e9a88ad1651975` | 876 | 12 | 1,931 |
| line | `30515dbae223fe951d679a41f63bd942d621ed57321eff80a543d2db1116b433` | `6cafa425913415ab678dfd1a7ca694268cf4f189e7f7a53ce3c56642fc56ad5e` | 496 | 12 | 466 |
| ring | `721f5586c9a3179d51b06d47e2363b7d4b016b8224260e0da6b2049078e01f92` | `5157d7ac53e95b7fc57e7b4e228a8843f341e6dc3169bdbaad86a0a63d3967a2` | 1,516 | 14 | 812 |

Run `python scripts/check_gan_models.py` from the project root to repeat the checkout revision, local file, Git blob and manifest-size comparisons. The check uses the local Git object database, not a fresh network download; a matching hash identifies bytes, not rights. The recorded iteration count is metadata supplied by the checkpoint and is not independently verified training history.

## Rights and limits / 권리와 확인 범위

The upstream repository includes the [Apache License 2.0](ganlab.LICENSE) and its [README](https://github.com/poloclub/ganlab/blob/09073e8d8c05ff572e287ba5e69007b3fb9101cd/README.md) credits the GAN Lab authors and their collaboration. The observed checkpoint JSON files do not themselves include a license or provenance statement. The repository license and file location do not independently resolve all rights in the trained weights; confirm their origin and terms before distributing them. The separate [figure and image inventory](ganlab-figures-and-images.md) records `demo/figures` and `demo/images`; external resources and user-uploaded models are not covered by this record.

The patched lab still requests the original checkpoint by default. Turning off pretrained mode or choosing a different distribution creates a fresh model using current settings without requesting a checkpoint. If the initial manifest is missing, or the float32 weight data has an unexpected byte length, the lab reports the failure and starts from scratch. These checks do not validate the provenance or license of a loaded checkpoint; the checkpoint files remain in the upstream checkout.
