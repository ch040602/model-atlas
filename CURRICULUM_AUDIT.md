# 학습 경로와 강의자료 대조

기준 자료는 로컬의 `advanced_big_data.pdf`(200쪽, Advanced Big Data Week #2)입니다. PDF 파일의 쪽 번호를 사용했습니다. 주제와 순서를 확인하는 데 활용했으며, 비공개 표시가 있는 원본 PDF·그림·문제와 문장을 이 프로젝트에 복제하지 않았습니다. 이 문서는 원본을 배포할 권한을 부여하지 않습니다.

| PDF 쪽 | 확인한 주제 | 현재 학습 위치와 깊이 |
| --- | --- | --- |
| 1–25 | 빅데이터와 5V | 확장 경로 `big-data-context`: 데이터 특성과 문제 정의를 소개합니다. 분산 처리 구현은 다루지 않습니다. |
| 26–58 | 인공지능의 언어·지각·추론·학습, 희소·밀집 표현 | 기초 단원과 `text-counts`, `word-vectors`, `vision-tasks`: 주제의 연결을 소개합니다. 모든 이미지 사례를 재현하지는 않습니다. |
| 59–72 | 선형 모델, XOR, MLP, 최적화, 과적합, 조기 종료, 드롭아웃 | 기초 단원과 `linear-models`, `nonlinear-mlp`, 데이터 분할, 조기 종료, 배치 정규화·드롭아웃 실습. XOR 순전파 실습은 직접 정한 가중치로 은닉 활성화의 역할을 비교하고, 별도 시그모이드 MLP 실습은 네 입력에 대한 역전파와 두 층의 반복 갱신을 계산합니다. 외부 Playground에도 연결합니다. 조기 종료는 서로 다른 가상 훈련·검증 관계에서 최적 체크포인트와 기다리는 횟수를 보여 줍니다. 로지스틱 회귀는 가상의 이진 분류 데이터로 확률과 손실을 계산하고 반복 학습합니다. |
| 73–82 | 생성, 프롬프트 및 모델의 한계 | Diffusion, Transformer, GAN 및 `retrieval-generation`: 생성과 검색 근거를 다룹니다. 프롬프트 사례 전체는 다루지 않습니다. |
| 83–88 | BoW, TF-IDF, Word2Vec, ELMo | `text-counts`에서 TF-IDF 계산 실습; `word-vectors`에서 정적·문맥 표현과 CBOW·Skip-gram을 소개하고 한 쌍과 선택한 음성 샘플에 대한 벡터 갱신을 계산합니다. 전체 말뭉치에 대한 Word2Vec 학습은 구현하지 않았습니다. |
| 89–98 | RNN, Seq2Seq, 어텐션, Transformer, BART, BERT, SBERT, T5, GPT, RAG | RNN·Transformer 실습과 `sequence-context`, `language-model-families`, `retrieval-generation`. RNN 단원에서 고정된 인공 토큰 네 순서로 softmax·교차 엔트로피와 반복 학습을 연결합니다. 검색 개념에서 TF-IDF와 코사인 유사도를 사용한 축소 검색·문맥 선택을 계산합니다. 자연어 모델별 전체 사전학습이나 생성 모델을 포함한 실제 RAG 파이프라인은 구현하지 않았습니다. |
| 99–118 | 영상 이해의 어려움과 데이터 다양성 | `vision-tasks`, `big-data-context`에서 영상 과제와 데이터 다양성을 소개합니다. 사진별 세부 의미를 재현하지 않습니다. |
| 119–143 | 영상 과제의 사례: 분류·검출·분할·생성·변환·자세·추적·3차원·질의응답·적대적 예제 | CNN·Diffusion·GAN 단원과 `vision-tasks`, `style-transfer`, `pose-tracking`, `scene-reconstruction`, `visual-question-answering`, `scene-relations`에서 과제를 소개합니다. `style-transfer`는 이미지 변환의 추가 사례로 내용·스타일 손실을 가상 특징에서 계산하고 공식 이미지 실습에 연결합니다. 143쪽의 적대적 예제는 `adversarial-examples`의 FGSM 축소 실습으로 연결합니다. 이미지 변환의 각 모델과 슬라이드별 세부 도해는 재현하지 않았습니다. |
| 144–158 | 영상 이해의 어려움과 데이터 다양성 반복 | 105–118쪽과 유사한 사례를 다시 제시합니다. 개별 이미지와 설명은 복제하지 않았습니다. |
| 159–173 | 분류, CAM, 약지도 위치 추정, 검출기, DETR, 인스턴스 분할 | `vision-cam`, `detection-models`, `vision-tasks`. CAM의 특성 맵·전역 평균 풀링·클래스 로짓과 상자를 움직이는 IoU 수치 실습, DETR 공식 노트북 링크를 제공합니다. 검출기의 완전한 학습 과정은 포함하지 않습니다. |
| 174–185 | GAN 생성 | GAN 단원과 원본 GAN Lab. 생성자·판별자 손실과 교대 갱신을 작은 수치 예제로 다룹니다. |
| 186–199 | 그림형 복습 문제 | 14개 문제의 그림을 화면으로 확인해 5V, 희소·밀집 표현, 선형·비선형, 최적화, Word2Vec, 순차 모델, Transformer, 영상 관계, CNN, ViT, CAM, 검출 및 GAN 주제를 대조했습니다. ViT 개념에서 가상 이미지의 패치 평탄화·투영·위치 벡터와 분류 토큰을 계산하지만 인코더나 분류기는 실행하지 않습니다. 원래 문제는 복제하지 않았으며 모든 그림의 세부 표현을 1:1로 재현하지는 않았습니다. |
| 200 | 마무리 | 별도 학습 개념 없음. |

확장 경로는 데이터 → 비선형 모델 → 단어 표현 → 문맥과 언어 모델 → 검색 → 영상 과제 → 이미지 Transformer와 검출·관계·설명의 순서입니다. 기존의 CNN → RNN → Diffusion → Transformer → GAN Lab 순서는 유지합니다. 강의의 개요를 보충해 데이터 누수, TF-IDF의 평활화와 정규화, IoU, RAG 평가, 다음 토큰의 손실과 퍼플렉시티 같은 내용을 덧붙였습니다.

PDF의 추출 가능한 텍스트로 전 페이지의 주제 표제를 살피고, 글자가 이미지에 포함된 복습 문제 186–199쪽과 영상 사례 99–158쪽은 별도로 렌더링해 주제 수준으로 확인했습니다. 본문 페이지의 세부 도해와 사례 전체는 대조하지 않았으므로, 이 표는 PDF의 모든 세부 내용이 완전히 반영되었다는 증거는 아닙니다.

추가 체험 자료는 프로젝트 안에 원본을 포함하지 않고 외부 링크로 연결합니다. [TensorFlow Playground](https://github.com/tensorflow/playground)는 브라우저에서 신경망 설정을 바꾸는 실습이며 Apache-2.0 라이선스를 명시합니다. [Embedding Projector](https://github.com/tensorflow/embedding-projector-standalone)는 외부 시각화 사이트 링크이며 해당 저장소는 보관 상태입니다. [DETR](https://github.com/facebookresearch/detr#notebooks)은 Apache-2.0 코드와 공식 노트북 안내를 제공하지만 노트북 실행 환경과 모델 파일 접근은 별도입니다. 링크된 데이터·모델·의존성의 권리는 해당 제공처에서 따로 확인해야 합니다.
