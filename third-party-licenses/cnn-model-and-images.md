# CNN Explainer: example image and model provenance

확인일 / Checked: 2026-10-27. This is an inventory, not legal clearance.
원본 리비전 / Upstream revision: [`d0971f9447ed9806022a3d47587b62394682bc51`](https://github.com/poloclub/cnn-explainer/tree/d0971f9447ed9806022a3d47587b62394682bc51).

## 확인한 사실 / Evidence

- 원본의 [Tiny VGG 설명](https://github.com/poloclub/cnn-explainer/blob/d0971f9447ed9806022a3d47587b62394682bc51/tiny-vgg/README.md)은 `tiny-vgg/data.zip`이 Tiny ImageNet의 10개 클래스로 모델을 학습하기 위한 데이터라고 설명합니다.
- 위 압축 파일의 SHA-256: `5946731692b0af42583dc65149227ff521e5129ec50b5bd6be37b49d0d0aa3ab`. 아래 표의 19개 JPEG는 압축 파일 속 이미지와 SHA-256이 일치합니다. 이는 해당 파일들이 같은 바이트임을 보여 주지만, 각 사진의 저작권자 또는 재배포 허락을 확인해 주지는 않습니다. 비교는 JPEG/PNG 파일을 대상으로 했으며 변환되거나 재인코딩된 이미지는 잡아내지 못합니다.
- [ImageNet 이미지 다운로드 안내](https://www.image-net.org/download-images.php)는 ImageNet이 이미지 저작권을 소유하지 않으며, 비상업적 연구·교육 목적의 접근에도 조건이 있다고 밝힙니다. [ImageNet 접근 동의서](https://image-net.org/accessagreement)는 비상업적 연구·교육 목적의 사용과 접근 허용 조건을 명시합니다. 이 동의서가 이 복사본의 모든 권리관계에 어떻게 적용되는지는 별도로 확인해야 합니다. 교육 목적이나 출처 표기만으로 공개 재배포 허락이 자동으로 확인되는 것은 아닙니다.
- 예제 10개는 `src/overview/Overview.svelte`의 `imageOptions`에서 제공됩니다. 모델은 `public/assets/data/model.json`과 그 가중치 파일을 사용합니다. 나머지 JPEG 일부는 현재 선택 목록에 없어도 원본 빌드 자산에 포함될 수 있습니다. 배포 파일에 실제로 무엇이 포함되는지 확인하세요.
- `upstream/`은 이 프로젝트 Git에서 제외되지만 부트스트랩으로 원본 저장소를 내려받으면 `data.zip`과 이미지가 로컬에 생깁니다. 소스 패치만 공개하는 것과 원본 또는 빌드 자산을 함께 배포하는 것은 다릅니다.

## JPEG 비교 / JPEG comparison

경로 접두어 / Source prefix: `public/assets/img/`. SHA-256 is of each local file; archive paths are in `tiny-vgg/data.zip`.

| 파일 / File | SHA-256 | 압축 파일 내 일치 경로 / Matching archive entry |
| --- | --- | --- |
| `boat_1.jpeg` | `767cd685408cfd255c3486edb017bd75ab4097beb478826f780617f4f603d75f` | data/class_10_val/test_images/val_2752.JPEG |
| `bug_1.jpeg` | `02f52ceeb1e5edc8f7b1162966021b9d157ea6f83277de54b9586f7a8354f938` | data/class_10_val/test_images/val_2625.JPEG |
| `bug_3.jpeg` | `ad4cdbde1c63db2edbf287501e50fef41c7036d092addaa5527e305dfa79f060` | data/class_10_val/test_images/val_5154.JPEG |
| `bus_1.jpeg` | `ff7ccbdb78b5da7c791378f02d3cc6d3e79d9bb4dc47d68898234da55376ec14` | data/class_10_val/val_images/val_8914.JPEG |
| `bus_2.jpeg` | `5e3ed877d90c2a4771de7020a0305ee6ee5dc86c8a54bcd165ff396781444aba` | data/class_10_val/test_images/val_5331.JPEG |
| `car_1.jpeg` | `469384feee8381213dc8b52503fc42ab4708cdf452bcf219335538f5a03647d7` | data/class_10_val/test_images/val_9291.JPEG |
| `espresso_1.jpeg` | `9307c85667470cdb22557ebcf77a573dac5df83e360b6e339f47627b5871b3df` | data/class_10_val/test_images/val_7710.JPEG |
| `koala_1.jpeg` | `7d159407825f48c16bcd5293d21ed5064306c4d32dfcda64c52b3a3bc5b20365` | data/class_10_val/val_images/val_7074.JPEG |
| `koala_2.jpeg` | `774b0ed1a6f34f882c6bad788879bfebd0f771282ff5440e9d1ed2ccfd2f36c9` | data/class_10_val/test_images/val_357.JPEG |
| `koala_3.jpeg` | `de99125be09f333a4fa57535375b9defc6d661acce1c9aefaaa302dc9326cb07` | data/class_10_val/test_images/val_2413.JPEG |
| `orange_1.jpeg` | `ac1e3266da220b12f62098f91146a7b22417f3b32bdc3547c091cb82721cf5d8` | data/class_10_val/test_images/val_9916.JPEG |
| `orange_3.jpeg` | `e25ba8f59e051b7e9ed7b6b12316b81735c447e07ab58575c5dd2d69e9912b4f` | data/class_10_val/test_images/val_3109.JPEG |
| `panda_1.jpeg` | `aa027684fb8ca5c3faf6dfcf0152bdeb06865aa4eb5da7e18004ba4d344d6273` | data/class_10_val/test_images/val_4343.JPEG |
| `panda_2.jpeg` | `b9f78292b29df2ecb13d5bebf3f4d4f73c87957ee63eb812ec6bcd3e8d174077` | data/class_10_val/test_images/val_7438.JPEG |
| `panda_3.jpeg` | `41314470054cf09e7f91ab07b8d1b7a55cf138edcf523538f574054bce8afc55` | data/class_10_val/test_images/val_5884.JPEG |
| `panda_5.jpeg` | `b4e4d4403bdc9f65553aa85d12aeb46d258cff97d76b031846cbc03fa1651a99` | data/class_10_val/val_images/val_1215.JPEG |
| `pepper_1.jpeg` | `074afc1c4b93b7b9e6489e320d9f4656f8f00e12ef4a2f2157f61c8668a0e25e` | data/class_10_val/test_images/val_3851.JPEG |
| `pepper_2.jpeg` | `5e24a9b9f9f2ea58def8a04f395cf7abd26e06c9007d33d00f9ec00886fe68f3` | data/class_10_val/test_images/val_5454.JPEG |
| `pizza_1.jpeg` | `2508a03666aea814c2e51ec82265388c14e430773da7a6e43e7256b4162922d3` | data/class_10_val/test_images/val_5586.JPEG |
| `pizza_2.jpeg` | `6adeb1124e2ec3b726a1ce6951ff0457fdd1306521443679cc88ec28f1870303` | 일치 없음 / no byte match |
| `white.jpeg` | `30dd3c58e707a9af2ac513200c85d0db2bfc60b334cffca5d9b0780dc0c33e51` | 일치 없음 / no byte match |

일치하지 않은 `pizza_2.jpeg`와 `white.jpeg`의 출처와 권리는 이 비교만으로 확인되지 않습니다. 일치 없음은 독립 제작이나 자유 이용을 증명하지 않습니다.

## 모델 파일 / Model files

| 경로 / Path | SHA-256 |
| --- | --- |
| `public/assets/data/group1-shard1of1.bin` | `306666f2a1cc2a0a8f7b3422617daac5ecdca20c707ab44b721522be1fe3f630` |
| `public/assets/data/model.json` | `85706d2d99841eb6270ddbf912bcf43c4d1bf76bc68a0a56af49561a69589627` |
| `public/assets/data/nn_10.json` | `025cc0983a1ae7a80e8d790ba5d74139942e126ccd6dd560acd89b7173240e40` |

`model.json`의 `weightsManifest`는 `group1-shard1of1.bin`을 가리킵니다. 원본 Tiny VGG 설명은 학습 후 TensorFlow.js로 변환하는 방법을 제시하지만, 저장된 가중치가 정확히 어떤 학습 실행에서 만들어졌는지와 가중치의 별도 배포 조건을 독립적으로 확인하지 못했습니다. `nn_10.json`의 출처와 권리도 아직 확인하지 못했습니다. 이미지와 학습된 가중치는 서로 다른 자산이므로 이미지 접근 조건을 곧바로 가중치에 적용하지 않습니다.

위 `nn_10.json` 해시는 이 Windows 체크아웃의 CRLF 줄바꿈 바이트입니다. 고정된 Git 원본의 LF 바이트 SHA-256은 `733b2dab025b92de385a5e8badf4a0b9135c68788b3e7aa66b717c9ac064d8e2`입니다. 공개 파일 지문 검사에는 두 바이트 형태가 모두 포함됩니다. 그 밖의 변형을 모두 감지하거나 자산의 권리를 판정하는 것은 아닙니다.

## 공개 전 확인 / Before redistribution

1. 실제 공개할 빌드에 포함되는 이미지와 모델 파일을 확인합니다.
2. 이미지별 권리와 배포 허락을 확인하거나, 허용 범위가 분명한 대체 이미지로 교체합니다. 원본 데이터 압축 파일을 배포할 계획이라면 그 데이터의 권리도 별도로 확인합니다.
3. 모델 가중치의 출처와 배포 조건을 확인하고, 다른 자산·의존성과 제한된 폰트는 [전체 목록](../LICENSES.md)에서 함께 점검합니다.
