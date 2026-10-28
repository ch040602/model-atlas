# Model Atlas

**수식을 한 단계씩 계산하며 배우는 한·영 머신러닝·딥러닝 학습 웹앱**

입력에서 예측과 손실, 기울기와 가중치 갱신까지 직접 따라갑니다. CNN·RNN·Transformer는 이전 계산 결과를 다음 식에 넣으며 전체 식을 확장하고, Diffusion·GAN은 모델별 실습으로 생성과 학습 과정을 확인합니다.

[English](README.en.md) · [상세 학습·개발 가이드](DEVELOPMENT_GUIDE.ko.md) · [교육과정 대조표](CURRICULUM_AUDIT.md) · [출처와 라이선스](LICENSES.md)

## 빠른 시작

기본 학습 화면은 **Python 3**로 실행합니다. Git으로 내려받거나 저장소의 **Code → Download ZIP**을 선택해 압축을 풀어 주세요.

```sh
git clone https://github.com/ch040602/model-atlas.git
cd model-atlas
python scripts/serve.py
```

macOS·Linux에서 `python` 명령이 없다면 `python3 scripts/serve.py`를 사용하세요.

Windows에서는 **`START_MODEL_ATLAS.bat`을 두 번 클릭**해도 됩니다. 로컬 서버가 사용 가능한 포트를 선택하고 기본 브라우저를 엽니다.

- 브라우저가 열리지 않으면 명령 창에 표시된 `http://127.0.0.1:포트번호/` 주소를 직접 여세요.
- 학습 중에는 서버 명령 창을 열어 두세요. 터미널에서는 `Ctrl+C`로 종료합니다.
- `index.html`을 직접 여는 대신 서버 주소로 접속해야 모듈 스크립트가 실행됩니다.
- 기본 개념·수식·축소 계산 실습은 별도 프런트엔드 빌드 없이 사용할 수 있습니다. 네 원본 시각화의 복원은 [아래 절차](#원본-시각화-복원)를 따르세요.

## 무엇을 배우나요?

| 순서 | 단원 | 따라가는 계산과 개념 |
| --- | --- | --- |
| 1 | 공통 기초 | 수학 기호, 데이터 분할, 예측과 손실, 기울기의 부호, 학습률, 한 예제·미니배치 갱신, 조기 종료 |
| 2 | CNN | 입력과 필터의 곱, 가중합과 편향, ReLU, 평균 풀링, 분류 확률, 손실, 필터 기울기와 갱신 |
| 3 | RNN | 입력·이전 상태의 결합, tanh, 시간축 상태 전달, 마지막 출력의 손실, BPTT와 공유 가중치 갱신, LSTM·GRU |
| 4 | Diffusion | 노이즈 주입·예측, 원본 추정과 DDIM형 한 단계, 잠재 공간, CLIP, 교차 어텐션, 조건과 가이던스 |
| 5 | Transformer | 토큰·위치 임베딩, 정규화, Q·K·V, 내적과 스케일링, 인과 마스크, softmax, 다중 헤드, 잔차, MLP, 출력 확률·손실 |
| 6 | GAN | 진짜·가짜 점수, 판별자 손실과 갱신, 고정된 판별자를 통한 생성자 학습, 손실 함수와 모드 붕괴 |

사이드바의 **개념 찾아보기**에서는 머신러닝·딥러닝 개념을 검색하고 관련 단원으로 이동할 수 있습니다. **데이터·언어·영상 확장 경로**에는 전통적 모델, 평가 지표, 텍스트 표현, 언어 모델·RAG, ViT, 객체 검출·추적 등 추가 주제와 외부 실습 링크가 있습니다. 강의자료와의 대응 범위는 [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md)에 정리했습니다.

## 수식을 따라가는 방법

1. 사이드바의 **수식 처음부터 따라가기**에서 CNN·RNN·Transformer 중 하나를 선택합니다.
2. 현재 단계의 기호와 역할, **현재 숫자로 이 결과가 나온 이유**를 읽고 이전 결과가 어떻게 대입되는지 확인합니다.
3. **다음 연산**을 눌러 식을 계속 확장합니다. CNN 20단계, RNN 21단계, Transformer 41단계를 제공합니다.
4. 슬라이더로 값을 바꾸고 같은 식의 결과가 어떻게 달라지는지 비교합니다.
5. **현재 수식·값을 새 창에서 전체 보기**로 선택한 단계와 입력값을 유지한 읽기 화면을 엽니다.
6. 원본 설명 링크에서 대응 문단과 계산 참고 패널을 함께 확인합니다.

각 단계의 **직접 예측해 보기**에서는 한 값만 바꿀 때의 결과를 먼저 생각하고 이유를 펼쳐 확인합니다. **이 결과가 다음에 쓰이는 곳**은 실제로 값을 받는 연산으로 연결됩니다. 공통 수식 19개에는 핵심 원리, 세 단계 유도, 별도 수치 예제와 적용 조건을 나누어 담았습니다. Diffusion·GAN 실습에도 각 단계의 현재 값 해석과 비교 실험을 제공합니다.

분수·제곱근·행렬·합 기호는 로컬 **KaTeX**로 표시합니다. 긴 식은 수식 영역 안에서 좌우로 스크롤할 수 있고, 수식 기호나 개념 버튼에서는 정의와 예제를 확인할 수 있습니다.

| 화면 영역 | 사용 방법 |
| --- | --- |
| 왼쪽 사이드바 | 단원, 수식 시작점, 개념 검색, 언어 전환 |
| 본문 수식의 설명 영역 | 선택한 연산의 목적, 기호, 부호·분모·미분의 상세 설명 |
| 본문 수식의 계산 영역 | 이전 값, 수식, 수치 대입, 결과와 누적 식 |
| 오른쪽 계산 연결 | 모델별 계산 기록을 독립적으로 스크롤하고 원하는 단계로 이동 |

작은 화면에서는 메뉴와 계산 연결 목록이 본문 앞에 배치됩니다. Diffusion·GAN의 오른쪽 목록에는 각 독립 실습에서 펼친 단계와 현재 값이 표시됩니다.

## 왜 기울기를 빼나요?

공통 기초의 **왜 기울기에 −를 붙이나요?** 실습에서는 손실 계산 → 기울기의 부호 → 두 이동 방향 → 새 손실 → 감소 조건 순으로 설명을 펼칩니다.

$$
g=\frac{\partial L}{\partial w},\qquad \Delta w=-\eta g,\qquad w_{\mathrm{new}}=w+\Delta w
$$

양의 학습률에서 기울기가 양수이면 가중치를 줄이고, 음수이면 음수를 빼므로 가중치를 늘립니다. 미분 가능한 손실을 현재 점 근처에서 1차로 근사하면 다음과 같습니다.

$$
\Delta L\approx g\Delta w=-\eta g^2\le 0
$$

이는 기울기가 0이 아닐 때 **충분히 작은 걸음**의 감소를 설명합니다. 실습에서는 같은 출발점에서 기울기를 빼거나 더하고 실제 손실을 다시 계산합니다. 양수·음수·0인 기울기와 큰 학습률의 프리셋, 포물선 그래프, 이차함수의 정확한 감소 조건을 비교할 수 있습니다. [유도 참고](https://d2l.ai/chapter_optimization/gd.html)

각 모델에서도 −log의 손실 정의, 평균을 빼는 정규화, 미래 위치의 마스크, 노이즈 제거의 이항, GAN의 최소화·최대화처럼 **같은 부호가 맡는 서로 다른 역할**을 해당 수식 옆에서 설명합니다.

## 원본 시각화 복원

네 원본 실습은 **커서가 가리킨 요소의 역할과 수식**도 설명합니다. CNN 특징 맵 위에서는 해당 좌표의 채널별 곱의 합·편향·출력을, Transformer 행렬에서는 질의·키 위치와 실제 점수/비중을 읽습니다. Diffusion은 현재 표시 단계·시드·가이던스와 저장된 결과의 의미를, GAN은 선택된 손실과 표시 값의 계산 시점을 설명합니다. 실제 수치가 없는 벡터 색 띠는 구조 예시라고 표시합니다.

잠시 마우스를 올리거나 **Tab**으로 요소에 이동하세요. **설명 고정** 또는 **F2**로 펼쳐 읽고, **Esc**로 닫습니다. 터치에서는 요소를 탭합니다. **현재 값 새로 읽기**는 애니메이션·학습으로 바뀐 값을 다시 읽으며, 오른쪽 아래 버튼으로 설명을 끌 수 있습니다. 같은 단원 안의 원본과 새 창 모두에서 작동합니다.

원본 시각화를 실행하려면 **Git, Python 3.10 이상, Node.js·npm, Corepack**을 준비한 뒤 프로젝트 폴더에서 실행하세요.

```sh
python scripts/bootstrap.py --build
python scripts/serve.py
```

스크립트가 고정된 원본 버전을 내려받고 통합 패치를 적용한 뒤 빌드합니다. 모델과 예제 자산 다운로드에는 시간과 디스크 공간이 필요합니다. 기존 체크아웃을 강제로 초기화하거나 정리하지 않습니다.

| 연결된 원본 | 본문에서 여는 단원 |
| --- | --- |
| [CNN Explainer](https://github.com/poloclub/cnn-explainer) | CNN |
| [Diffusion Explainer](https://github.com/poloclub/diffusion-explainer) | Diffusion |
| [Transformer Explainer](https://github.com/poloclub/transformer-explainer) | Transformer |
| [GAN Lab](https://github.com/poloclub/ganlab) | GAN |

단원의 **원본 시각화 실습**을 펼치거나 새 창으로 열어 사용할 수 있습니다. RNN은 이 프로젝트의 시퀀스·게이트·역전파 실습으로 학습합니다. 원본 시각화와 축소 예제는 각각의 입력과 가중치를 사용합니다.

복원된 소스의 버전과 패치를 확인하려면 다음 명령을 사용하세요.

```sh
python scripts/bootstrap.py --check
```

고정 버전과 빌드 과정은 [scripts/bootstrap.py](scripts/bootstrap.py), 변경 내역은 [patches/](patches/)에 있습니다.

## 개발 및 검증

개발용 의존성을 설치합니다.

```sh
npm ci
```

계산·기본 화면 흐름과 새 수식 설명을 확인합니다.

```sh
node tests/smoke.mjs
node tests/test_formula.mjs
node tests/test_formula_details.mjs
node tests/test_step_reasoning.mjs
```

브라우저 검증에는 Chrome 또는 Playwright Chromium이 필요합니다. Chrome이 없으면 `npx playwright install chromium`으로 준비할 수 있습니다. 원본 화면까지 여는 검증은 원본 복원·빌드 후 실행하세요.

```sh
node tests/test_formula_workspace.mjs
node tests/test_formula_typesetting.mjs
node tests/test_formula_browser.mjs
node tests/test_calculation_rail.mjs
node tests/test_original_cursor.mjs
python tests/test_patches.py
```

기울기 실습에는 20,181개 독립 계산 사례, 기존 수식에는 256개 수치 사례, 조판에는 492개 표현 검증을 수행했습니다. 한·영, 모바일·데스크톱 크기, 키보드 조작과 프로젝트 하위 경로에서도 확인했습니다. 전체 검증 명령과 세부 범위는 [상세 가이드](DEVELOPMENT_GUIDE.ko.md#개발-확인)와 [TODO.md](TODO.md)에 있습니다.

## 학습 범위와 출처

본문의 숫자 실습은 계산 원리를 보여 주는 축소 모델입니다. CNN은 단일 채널, RNN은 작은 스칼라 상태, Transformer는 두 위치·두 특성과 두 헤드를 사용합니다. Transformer의 연속 수식은 순전파와 정답 손실까지 전개하며 전체 역전파의 수치 전개는 포함하지 않습니다. 실습에서 얻은 손실 변화는 해당 예제의 결과입니다.

이 저장소에는 학습 웹앱, 통합 패치, 로컬 라이브러리와 라이선스 고지를 포함합니다. 원본 체크아웃·모델 가중치·강의 PDF는 포함하지 않으며 원본은 bootstrap으로 복원합니다.

- 원본 및 제3자 소프트웨어·폰트 고지: [LICENSES.md](LICENSES.md), [third-party-licenses/](third-party-licenses/)
- 학습 화면의 한·영 출처 안내: [credits.html](credits.html)
- 강의자료 및 참고 개념의 대응 범위: [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md)
- 디자인 참고와 적용 원칙: [DESIGN.md](DESIGN.md)

각 원본과 자산의 라이선스는 해당 고지를 따릅니다. 프로젝트의 새 코드 전체에 적용하는 별도 최상위 라이선스는 현재 선언되어 있지 않습니다. 상세 가이드에는 개별 실습과 확인한 범위, 남은 항목을 보존했습니다.
