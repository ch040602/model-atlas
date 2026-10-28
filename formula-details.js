import {mathMarkup,escapeMathHTML as esc} from './math-render.js';
import {formulaDerivations} from './formula-derivations.js';

// Authored explanations. Equations are explicit TeX, never inferred from prose.
const gd='https://d2l.ai/chapter_optimization/gd.html';
const ce='https://d2l.ai/chapter_linear-classification/softmax-regression.html';
const bptt='https://d2l.ai/chapter_recurrent-neural-networks/bptt.html';
const attention='https://arxiv.org/html/1706.03762v7#S3.SS2.SSS1';
const ddim='https://arxiv.org/html/2010.02502v4';
const gan='https://arxiv.org/html/1406.2661v1';
const row=(ko,en,tex)=>({ko,en,tex});
export const formulaDetails={
 descent:{title:['왜 기울기를 빼나요?','Why subtract the gradient?'],source:gd,rows:[
  row('기울기 g는 w를 양의 방향으로 조금 움직일 때 손실이 변하는 비율입니다. g>0이면 w를 줄이고, g<0이면 w를 늘려야 국소적으로 손실이 줄어듭니다. −는 이 방향을 뒤집습니다. 기울기 자체가 항상 음수라는 뜻은 아닙니다.','The gradient g measures how loss changes for a small positive change in w. Locally, decrease w when g>0 and increase w when g<0. The minus sign reverses the direction; the gradient itself can have either sign.',String.raw`g=\frac{\partial L}{\partial w},\qquad \Delta w=-\eta g,\qquad w_{\mathrm{new}}=w+\Delta w`),
  row('미분 가능한 손실을 현재 점 근처에서 1차로 근사하면, 기울기와 이동량의 곱이 손실 변화입니다. η>0이고 기울기가 0이 아닐 때 충분히 작은 걸음은 손실을 줄입니다.','For a differentiable loss, its first-order local change is gradient times displacement. A sufficiently small step with η>0 and a nonzero gradient decreases loss.',String.raw`\Delta L\approx g\Delta w=-\eta g^2\le0,\qquad \Delta L\approx\nabla L^{\mathsf T}\Delta\theta=-\eta\lVert\nabla L\rVert^2`),
  row('예: η=0.1일 때 g=2이면 Δw=−0.2, g=−2이면 Δw=+0.2입니다. 이 근사는 큰 걸음의 감소를 보장하지 않습니다. 기울기 0도 최솟값의 보장은 아닙니다. 공통 기초의 방향 비교 실습에서 직접 확인하세요.','With η=0.1, g=2 gives Δw=−0.2 and g=−2 gives Δw=+0.2. This approximation does not guarantee improvement for a large step. A zero gradient need not be a minimum. Try both directions in the foundations experiment.')
 ]},
 chain:{title:['미분의 곱과 2는 어디서 나오나요?','Where do the derivative product and 2 come from?'],source:gd,rows:[
  row('선형 예측의 제곱 손실을 예로 들면, 오차 e를 먼저 구하고 제곱합니다. 바깥 제곱의 미분 2e에, 안쪽 예측이 w에 반응하는 정도 x를 곱합니다. 편미분에서는 x와 정답 y를 고정합니다.','For the squared error of a linear prediction, first form error e, then square it. Multiply the outer derivative 2e by x, the response of the inner prediction to w. Hold input x and target y fixed for this partial derivative.',String.raw`z=wx+b,\quad e=z-y,\quad L=e^2,\qquad \frac{\partial L}{\partial w}=\frac{\partial L}{\partial e}\frac{\partial e}{\partial z}\frac{\partial z}{\partial w}=2e\cdot1\cdot x`),
  row('손실을 ½e²로 정의하면 2가 약분됩니다. 최솟값은 같아도 같은 학습률에서 갱신 크기는 다릅니다. 오차가 음수인지뿐 아니라 입력 x의 부호도 기울기에 영향을 줍니다.','Defining loss as ½e² cancels the factor 2. The minimum is unchanged, but the update differs at the same learning rate. The input sign also affects the gradient, not just the error sign.')
 ]},
 logloss:{title:['손실의 −log와 갱신의 −는 역할이 달라요','The minus in −log and the minus in an update'],source:ce,rows:[
  row('0<p≤1에서 log p≤0입니다. −log p는 정답 확률이 1에 가까울수록 작고, 0에 가까울수록 커지는 손실을 만듭니다. 이 −는 확률을 손실로 바꾸는 정의입니다.','For 0<p≤1, log p≤0. Negative log makes loss small near probability 1 and large near 0. This minus belongs to the loss definition.',String.raw`L=-\log p_y,\qquad \frac{\mathrm dL}{\mathrm dp_y}=-\frac{1}{p_y},\qquad -\log1=0,\quad -\log0.1\approx2.303`),
  row('확률 p를 직접 자유롭게 갱신하는 대신, 실제로는 softmax를 거쳐 로짓과 가중치로 미분을 전달합니다. one-hot 정답에서 정답 로짓의 기울기는 p−1, 나머지는 p입니다. 기울기를 빼면 정답 로짓은 올라가고 나머지는 내려갑니다.','Rather than freely updating p, backpropagate through softmax to logits and weights. With one-hot labels, the target logit has gradient p−1 and the others p. Subtracting these gradients raises the target logit and lowers the others.',String.raw`p_i=\frac{e^{z_i}}{\sum_j e^{z_j}},\quad L=-\sum_i y_i\log p_i,\qquad \frac{\partial L}{\partial z_i}=p_i-y_i`),
  row('log의 밑은 자연상수 e입니다. p=0에서는 손실이 무한대로 발산하므로 안정적인 구현은 로짓에서 log-softmax로 계산합니다. 갱신의 −는 이렇게 계산된 손실을 줄이는 방향을 정합니다.','The logarithm is natural. Loss diverges as p approaches 0; stable implementations compute log-softmax from logits. The update minus then chooses a direction that reduces this defined loss.')
 ]},
 weighted:{title:['합성곱은 어떤 평균인가요?','Is convolution an average?'],rows:[
  row('일반적인 CNN의 합성곱은 입력과 필터의 원소별 곱을 더한 가중합에 편향을 더합니다. 필터에 음수도 들어갈 수 있고 합이 1일 필요도 없습니다. 따라서 보통은 평균이 아닙니다. CNN에서는 필터를 뒤집지 않는 상관 연산을 흔히 합성곱이라고 부릅니다.','A typical CNN adds elementwise input–filter products and a bias. Filter weights can be negative and need not sum to one, so this is generally not an average. CNNs commonly call the unflipped cross-correlation operation convolution.',String.raw`z_{i,j}=b+\sum_{c=1}^{C}\sum_{u=0}^{k_h-1}\sum_{v=0}^{k_w-1}K_{c,u,v}X_{c,i+u,j+v}`),
  row('필터 하나를 모든 위치에 공유하면 같은 특징을 다른 위치에서도 찾을 수 있습니다. 이 축소 모델은 채널 1개, 2×2 필터, 스트라이드 1을 사용합니다. 모든 필터값이 ¼이고 편향이 0일 때만 이 2×2 계산이 단순 평균이 됩니다.','Sharing a filter across positions detects the same pattern at different locations. This toy model uses one channel, a 2×2 filter and stride 1. It becomes a simple 2×2 average when every filter entry is ¼ and the bias is zero.')
 ]},
 cnnchain:{title:['출력의 오차가 필터까지 어떻게 가나요?','How does output error reach the filter?'],rows:[
  row('이 축소 분류기의 정답 A 로짓은 평균 풀링 결과이고 다른 로짓은 0입니다. 손실에서 필터 강도 s까지 가는 경로를 거꾸로 읽으면, softmax와 손실의 미분 pₐ−1, 평균의 1/N, ReLU의 통과 여부, 합성곱의 미분을 차례로 곱합니다.','In this toy classifier, the target A logit is the pooled average and the other logit is zero. Reading backwards to filter strength s, multiply the loss/softmax derivative pₐ−1, the averaging factor 1/N, the ReLU gate, and the convolution derivative.',String.raw`\frac{\partial L}{\partial s}=(p_A-1)\frac1N\sum_{i,j}\mathbf1[z_{i,j}>0]\frac{\partial z_{i,j}}{\partial s}`),
  row('같은 s가 여러 위치에서 쓰이므로 경로마다 곱한 값을 모두 더합니다. 이 예제는 네 필터값을 하나의 s로 묶었지만 일반 CNN은 각 필터 원소를 따로 학습합니다. 미분을 모두 구한 뒤 −η를 적용하는 것이 가중치 갱신입니다.','Sum the products from all positions because they share s. This toy ties four filter entries to a single strength s; ordinary CNNs learn each filter entry separately. Only after computing the derivative do we apply −η to update a weight.')
 ]},
 average:{title:['왜 원소 개수로 나누나요?','Why divide by the number of elements?'],rows:[
  row('먼저 모든 값을 더한 뒤 개수 N으로 나누면 각 값이 동일하게 1/N만큼 기여하는 평균입니다. 평균 풀링은 영역을 대표하는 값으로 압축합니다. 이 식은 평균을 내는 단계이며 앞의 학습 가능한 합성곱과 구별됩니다.','Adding all values and dividing by N gives each entry weight 1/N. Average pooling compresses a region to a representative value. This averaging step differs from the earlier trainable convolution.',String.raw`a=\frac{1}{N}\sum_{i=1}^{N}r_i,\qquad \frac{\partial L}{\partial r_i}=\frac{1}{N}\frac{\partial L}{\partial a}`),
  row('이 예제의 전역 평균 풀링은 특징 맵 네 값의 합을 4로 나눕니다. 평균은 원소 수가 달라질 때 단순 합의 크기가 함께 커지는 효과를 줄이지만, 위치 정보 일부를 잃습니다. 최대 풀링은 평균과 다른 연산입니다.','This example globally averages four feature-map values by dividing their sum by 4. Averaging reduces scaling with element count compared with a sum, while losing some spatial information. Max pooling is a different operation.')
 ]},
 relu:{title:['왜 음수는 0으로 바꾸나요?','Why replace negative values with zero?'],rows:[
  row('ReLU는 음수 응답을 막고 양수 응답을 그대로 전달하는 비선형 함수입니다. 선형층만 여러 개 연결하면 하나의 선형 변환으로 합쳐지므로 비선형성이 표현력을 더합니다.','ReLU blocks negative responses and passes positive ones. A chain of linear layers collapses to one linear transformation; a nonlinear activation adds expressive power.',String.raw`r=\max(0,z),\qquad \frac{\partial r}{\partial z}=\begin{cases}1&z>0\\0&z<0\end{cases}`),
  row('z=0에서는 미분이 정의되지 않으며 이 실습은 기울기 0을 선택합니다. 막힌 경로의 기울기는 0이 될 수 있습니다. 이는 기울기 갱신의 − 때문에 생긴 현상이 아닙니다.','At z=0 the derivative is undefined; this exercise chooses 0. A blocked path can receive zero gradient. This does not result from the minus sign in gradient descent.')
 ]},
 recurrent:{title:['이전 상태를 더하고 같은 가중치를 쓰는 이유','Why add memory and reuse the same weight?'],source:bptt,rows:[
  row('현재 입력의 영향과 이전 상태의 영향을 합쳐 새 상태를 만듭니다. h₀는 시작 상태이며, 같은 Wₕ를 모든 시점에 재사용합니다. 시점마다 다른 가중치를 학습하는 식이 아닙니다.','Combine the current input and previous state to form the new state. h₀ is the initial state, and the same Wₕ is reused at every time step rather than learning a different weight at each step.',String.raw`z_t=W_xx_t+W_hh_{t-1}+b,\qquad h_t=\tanh(z_t)`),
  row('이 축소 예제는 스칼라 상태와 가중치를 사용합니다. 같은 가중치가 여러 시점에서 손실에 기여하므로 역전파에서는 그 사용처들의 기여를 합해야 합니다.','The toy example uses scalar states and weights. Because the same weight affects the loss at multiple times, backpropagation must sum contributions from all its uses.')
 ]},
 tanh:{title:['tanh의 1−h²는 왜 곱하나요?','Why multiply by 1−h² for tanh?'],source:bptt,rows:[
  row('tanh는 상태를 −1과 1 사이로 압축합니다. 출력 h를 이용하면 미분은 1−h²입니다. 역전파는 입력에 대한 반응도를 곱하므로 이 항이 등장합니다.','Tanh compresses states between −1 and 1. In terms of output h its derivative is 1−h². Backpropagation multiplies by this local response.',String.raw`h=\tanh(z)=\frac{e^z-e^{-z}}{e^z+e^{-z}},\qquad \frac{\mathrm dh}{\mathrm dz}=1-h^2`),
  row('h가 ±1에 가까우면 1−h²가 0에 가까워져 기울기가 작아집니다. 이 −는 함수의 미분에서 나온 것이며 경사 하강법의 이동 방향을 뜻하지 않습니다.','Near ±1, the factor 1−h² approaches zero and shrinks gradients. This subtraction comes from differentiating the function, not from choosing a descent direction.')
 ]},
 bptt:{title:['시간을 거슬러 곱하고 사용처를 더해요','Multiply backwards in time, sum shared uses'],source:bptt,rows:[
  row('마지막 상태의 제곱 손실을 먼저 미분한 뒤, 이전 시점으로 Wₕ와 tanh 미분을 곱해 전달합니다. 아래는 스칼라 RNN이며 δₜ는 zₜ에 대한 손실 미분입니다.','Differentiate the final-state squared loss, then propagate backwards through Wₕ and the tanh derivative. In this scalar RNN, δₜ denotes the derivative with respect to zₜ.',String.raw`\delta_T=2(h_T-y)(1-h_T^2),\qquad \delta_t=\delta_{t+1}W_h(1-h_t^2),\qquad \frac{\partial L}{\partial W_h}=\sum_{t=1}^{T}\delta_t h_{t-1}`),
  row('각 사용처의 기여는 더하고, 각 경로의 연속된 미분은 곱합니다. 반복되는 곱의 크기에 따라 기울기가 작아지거나 커질 수 있고 Wₕ<0이면 부호도 바뀔 수 있습니다. 합을 구한 다음에만 −η를 적용해 공유 가중치를 한 번 갱신합니다.','Add contributions from different uses; multiply derivatives along each path. Repeated factors can shrink or amplify gradients, and negative Wₕ can flip their signs. Apply −η only after summing, updating the shared weight once.')
 ]},
 softmax:{title:['지수·분모·최댓값 빼기의 역할','Exponents, normalization and subtracting the maximum'],source:ce,rows:[
  row('exp는 모든 유한 점수를 양수로 바꾸고, 같은 행의 합으로 나누면 가중치 합이 1이 됩니다. 더 큰 점수는 더 큰 가중치를 받습니다. 확률로 쓰더라도 예측의 정확성을 보장하지는 않습니다.','Exp makes finite scores positive; dividing by their row sum makes weights sum to one. Larger scores receive larger weights. Using these as probabilities does not guarantee correct predictions.',String.raw`p_i=\frac{e^{s_i}}{\sum_j e^{s_j}}=\frac{e^{s_i-m}}{\sum_j e^{s_j-m}},\qquad m=\max_j s_j`),
  row('최댓값 m을 모든 점수에서 똑같이 빼면 공통인 e⁻ᵐ이 약분되어 확률은 그대로입니다. 큰 지수의 넘침을 막는 수치 안정화이며 기울기 하강이 아닙니다. 분모는 해당 행의 허용된 항 전체를 더합니다.','Subtracting the same maximum from every score cancels a common factor e⁻ᵐ, preserving probabilities. This avoids overflow rather than performing gradient descent. The denominator sums all permitted entries in the row.')
 ]},
 scale:{title:['왜 dₖ가 아니라 √dₖ로 나누나요?','Why divide by √dₖ rather than dₖ?'],source:attention,rows:[
  row('내적은 dₖ개의 곱을 더합니다. 각 성분이 독립이고 평균 0·분산 1이라는 설명용 가정에서는 내적의 분산이 dₖ, 표준편차가 √dₖ입니다. √dₖ로 나누어 점수의 전형적인 크기를 조절합니다.','A dot product sums dₖ products. Under the explanatory assumption of independent zero-mean, unit-variance components, its variance is dₖ and its standard deviation √dₖ. Dividing by √dₖ controls the typical score scale.',String.raw`s_{ij}=\frac{q_i\cdot k_j}{\sqrt{d_k}},\qquad \operatorname{Var}(q_i\cdot k_j)=d_k,\qquad \operatorname{Var}(s_{ij})=1`),
  row('dₖ는 한 헤드의 키·질의 특성 수이며 토큰 개수가 아닙니다. 큰 점수가 softmax를 지나치게 한쪽으로 몰아 기울기를 작게 만드는 경향을 줄입니다. 실제 학습된 Q·K가 항상 위 독립성 가정을 만족한다는 뜻은 아닙니다. 이 축소 모델은 dₖ=1이라 분모가 1입니다.','dₖ counts key/query features per head, not tokens. Scaling reduces the tendency of large scores to saturate softmax. Learned Q and K need not exactly satisfy those assumptions. Here dₖ=1, so the divisor is 1.')
 ]},
 mask:{title:['왜 미래 위치에 −∞를 더하나요?','Why add −∞ at future positions?'],source:attention,rows:[
  row('자기회귀 모델은 다음 토큰을 예측할 때 미래 입력을 볼 수 없습니다. 허용된 위치에는 0, 금지한 위치에는 −∞를 더한 뒤 softmax를 계산합니다.','An autoregressive model must not see future inputs when predicting the next token. Add 0 at permitted positions and −∞ at forbidden ones before softmax.',String.raw`M_{ij}=\begin{cases}0&j\le i\\-\infty&j>i\end{cases},\quad A_{ij}=\frac{e^{s_{ij}+M_{ij}}}{\sum_k e^{s_{ik}+M_{ik}}},\quad e^{-\infty}=0`),
  row('지수값이 0이 되어 금지한 위치의 V가 가중합에 참여하지 않습니다. 유한한 큰 음수는 구현상 근사입니다. 모든 위치를 금지하면 분모도 0이 되므로 유효한 위치가 필요합니다. −∞는 손실의 −log나 갱신의 −와 다른 역할입니다.','A zero exponential removes forbidden V entries from the weighted sum. A large finite negative value is an implementation approximation. A row needs a valid entry to avoid a zero denominator. This minus differs from the ones in negative log loss and gradient updates.')
 ]},
 norm:{title:['평균을 빼고 표준편차로 나누는 순서','Center, scale, then learn an affine transform'],rows:[
  row('한 토큰의 특성 d개에서 평균을 빼면 중심이 0이 됩니다. 제곱 편차의 평균인 분산에 ε를 더한 뒤 제곱근으로 나누어 크기를 조절합니다. ε>0은 분산이 0일 때도 분모를 0이 아니게 합니다.','Subtract the mean across one token’s d features to center them at zero. Divide by the square root of variance plus ε to control scale. Positive ε keeps the denominator nonzero even at zero variance.',String.raw`\mu=\frac1d\sum_i x_i,\quad \sigma^2=\frac1d\sum_i(x_i-\mu)^2,\quad \widehat{x}_i=\frac{x_i-\mu}{\sqrt{\sigma^2+\epsilon}},\quad y_i=\gamma_i\widehat{x}_i+\beta_i`),
  row('γ와 β는 다시 크기와 중심을 조절하는 학습 매개변수입니다. ε 때문에 정규화한 분산이 정확히 1은 아닐 수 있습니다. 이 축소 예제의 ε는 0.01입니다. 평균을 빼는 −는 중심 이동이며 손실을 줄이는 이동이 아닙니다.','Learned γ and β restore adaptable scale and offset. With ε, the normalized variance need not be exactly 1. This toy model uses ε=0.01. Subtracting the mean centers features rather than stepping down a loss.')
 ]},
 residual:{title:['이어 붙이기·투영·잔차 더하기는 달라요','Concatenation, projection and residual addition'],rows:[
  row('각 헤드는 A·V로 정보를 모읍니다. 헤드 결과를 이어 붙이면 특성 축이 길어지고, Wᴼ로 원래 특성 수에 투영한 뒤 같은 모양의 입력에 더합니다. 잔차 덧셈은 연결 연산과 다릅니다.','Each head gathers information with A·V. Concatenation extends the feature axis; Wᴼ projects back to the original size before addition to an identically shaped input. Residual addition is different from concatenation.',String.raw`H_r=A_rV_r,\quad O=\operatorname{Concat}(H_1,\ldots,H_h)W^O,\qquad Y=X+O`),
  row('잔차는 입력을 직접 보존하는 경로를 둡니다. y=x+f(x)의 미분은 I+Jf여서 기울기가 직접 전달되는 항이 생깁니다. 항상 기울기 소실이 없거나 성능이 좋아진다는 보장은 아닙니다.','A residual keeps a direct input path. The derivative of y=x+f(x) is I+Jf, providing a direct gradient term. This does not guarantee absence of vanishing gradients or better performance.')
 ]},
 representation:{title:['토큰 번호에서 학습 가능한 벡터로','From a token ID to a learned vector'],rows:[
  row('토큰 ID는 크기를 비교하는 실수가 아니라 임베딩 표의 행을 고르는 번호입니다. 그 벡터에 같은 차원의 위치 벡터를 더해 내용과 순서 정보를 함께 전달합니다.','A token ID is a row index in an embedding table, not a scalar magnitude. Add a same-sized position vector to provide both content and order.',String.raw`X_{t,:}=E_{\mathrm{token}[t],:}+P_{t,:},\qquad Q=XW_Q,\quad K=XW_K,\quad V=XW_V`),
  row('Q와 K는 어떤 정보를 참고할지 비교하고 V는 모아서 전달할 내용을 표현합니다. 행렬 곱은 입력 특성을 학습 가능한 가중합으로 바꿉니다. 이 실습의 작은 벡터와 가중치는 설명용 고정값입니다.','Q and K support comparisons about what to attend to; V represents the information to gather. Matrix multiplication makes learned weighted combinations of input features. This experiment uses small fixed illustrative vectors and weights.')
 ]},
 mlp:{title:['두 선형층 사이에 비선형 함수를 넣어요','Put a nonlinearity between two linear layers'],rows:[
  row('첫 선형층으로 특성을 조합하고 GELU 또는 ReLU를 적용한 뒤 둘째 선형층으로 원래 차원에 돌려놓습니다. 같은 MLP를 위치마다 독립적으로 적용하며, 위치 사이의 정보는 앞의 attention이 섞습니다.','Combine features in the first linear layer, apply GELU or ReLU, then project back in the second. The same MLP acts independently at each position; attention mixes information between positions.',String.raw`\operatorname{MLP}(x)=\phi(xW_1+b_1)W_2+b_2`),
  row('GELU는 입력을 부드럽게 가중하는 함수로 ReLU처럼 음수를 모두 정확히 0으로 만들지 않습니다. 이 실습은 tanh를 이용한 GELU 근사를 선택할 수 있습니다.','GELU smoothly weights its input and does not set every negative input to exactly zero as ReLU does. This experiment offers the tanh approximation to GELU.')
 ]},
 denoise:{title:['노이즈를 빼는 −도 경사 하강인가요?','Is subtracting noise gradient descent?'],source:ddim,rows:[
  row('노이즈를 섞는 식에서 노이즈 항을 이항하고 원본의 계수로 나누면 원본 추정식이 나옵니다. ε̂는 모델이 예측한 노이즈이고 실제로 넣은 ε와 다를 수 있습니다.','Rearrange the noising equation: subtract its noise term, then divide by the clean-signal coefficient. Predicted noise ε̂ can differ from the actual injected ε.',String.raw`x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon\quad\Longrightarrow\quad \widehat{x}_0=\frac{x_t-\sqrt{1-\bar\alpha_t}\widehat\epsilon}{\sqrt{\bar\alpha_t}}`),
  row('이 −는 식을 풀어 노이즈 성분을 제거하는 이항입니다. 샘플링에서는 보통 모델 가중치를 고정합니다. 학습 시에는 별도로 예측 오차 손실을 미분하고 그 기울기를 가중치에서 뺍니다.','This subtraction algebraically removes an estimated noise component. Model weights are usually fixed during sampling. Training separately differentiates the prediction-error loss and subtracts its parameter gradient.',String.raw`L_{\mathrm{noise}}=\lVert\epsilon-\epsilon_\theta(x_t,t)\rVert^2,\qquad \theta_{\mathrm{new}}=\theta-\eta\nabla_\theta L_{\mathrm{noise}}`),
  row('결정론적 DDIM형 한 단계는 원본 추정값과 예측 노이즈를 다음 스케줄의 계수로 다시 섞습니다. xₜ에서 노이즈를 한 번 빼는 것만으로 모든 생성이 끝나는 것은 아닙니다. 이 실습은 좌표 하나의 축소 계산입니다.','A deterministic DDIM-style step remixes the clean estimate and predicted noise with the next schedule’s coefficients. Generation is not completed by a single subtraction from xₜ. This is a one-coordinate toy calculation.',String.raw`x_s=\sqrt{\bar\alpha_s}\widehat{x}_0+\sqrt{1-\bar\alpha_s}\widehat\epsilon,\qquad s<t`)
 ]},
 adversarial:{title:['GAN은 최대화인데 왜 기울기를 빼나요?','Why descend when GAN also maximizes?'],source:gan,rows:[
  row('원래 미니맥스 목적 V에서 판별자는 최대화하고 생성자는 최소화합니다. 판별자 손실을 Lᴅ=−V로 정의하면, V를 최대화하는 것과 Lᴅ를 최소화하는 것은 같은 방향입니다. 기대값 대신 샘플 평균을 사용할 수 있습니다.','In the original minimax objective V, D maximizes while G minimizes. Defining discriminator loss Lᴅ=−V turns maximizing V into minimizing Lᴅ. Expectations can be estimated with sample averages.',String.raw`V=\mathbb E_x[\log D(x)]+\mathbb E_z[\log(1-D(G(z)))],\quad L_D=-V,\quad \theta_D-\eta\nabla L_D=\theta_D+\eta\nabla V`),
  row('이 실습의 생성자는 원래의 log(1−D) 대신 비포화 손실 −log D를 최소화합니다. D의 가중치는 고정하지만 D를 통과하는 입력 미분은 계산해 G까지 전달합니다. 둘 다 각자 정의한 손실의 기울기를 빼므로 부호가 모순되지 않습니다.','This exercise uses the non-saturating generator loss −log D instead of the original log(1−D). Freeze D’s parameters but differentiate through its input to G. Both optimizers subtract gradients of their own defined losses.',String.raw`L_G=-\mathbb E_z[\log D(G(z))],\qquad \theta_G^{\mathrm{new}}=\theta_G-\eta\nabla_{\theta_G}L_G`),
  row('z=1, G(z)=g, D(u)=σ(wu+b)인 축소 예제에서는 ∂Lɢ/∂g=(D−1)w입니다. D−1이 음수여도 w의 부호에 따라 전체 기울기와 g의 이동 방향이 달라집니다. 학습이 항상 안정적이라는 보장은 아닙니다.','For the toy z=1, G(z)=g and D(u)=σ(wu+b), ∂Lɢ/∂g=(D−1)w. Even though D−1 is negative, the sign of w affects the total gradient and movement of g. Training stability is not guaranteed.')
 ]}
};

export function formulaDetailMarkup(keys,lang,open=false){
 const i=lang==='ko'?0:1;
 return keys.map(key=>{
  const c=formulaDetails[key],d=formulaDerivations[key];
  const derivation=`<p class="derivation-idea">${esc(d.idea[i])}</p><details class="derivation-steps"><summary>${i===0?'식이 만들어지는 과정 · 세 단계로 읽기':'Read the derivation in three steps'}</summary><ol>${d.steps.map(s=>`<li><h6>${esc(s.title[i])}</h6><p>${esc(s.text[i])}</p>${mathMarkup(s.tex)}</li>`).join('')}</ol><div class="derivation-example"><b>${i===0?'별도의 고정 예제로 확인':'Check with a separate fixed example'}</b><p>${esc(d.example[i])}</p></div></details>`;
  const reference=`<details class="derivation-reference"><summary>${i===0?'일반식과 적용 조건 더 읽기':'Read the general formula and assumptions'}</summary>${c.rows.map(r=>`<p>${esc(r[lang])}</p>${r.tex?mathMarkup(r.tex):''}`).join('')}</details>`;
  return `<details class="formula-detail" data-math-detail="${key}" ${open?'open':''}><summary>${esc(c.title[i])}</summary><div>${derivation}${reference}${c.source?`<a href="${c.source}" target="_blank" rel="noopener noreferrer">${i===0?'근거와 유도 읽기':'Read the derivation'} ↗</a>`:''}${key==='descent'?`<p><a href="index.html?section=gradient-direction-title#foundation" target="_blank" rel="noopener noreferrer">${i===0?'기울기를 빼고 더하는 실습':'Try subtracting and adding gradients'} ↗</a></p>`:''}</div></details>`;
 }).join('');
}
export function detailsForStep(kind,id){
 if(id==='update')return ['descent'];
 if(id==='loss')return kind==='rnn'?['chain']:['logloss'];
 if(kind==='cnn'){
  if(id==='gradient')return ['cnnchain','descent'];
  if(id.startsWith('pool-'))return ['average'];
  if(['exponential','denominator','probabilities'].includes(id))return ['softmax'];
  return [id==='relu'||id==='map'?'relu':'weighted'];
 }
 if(kind==='rnn'){
  if(id.startsWith('delta-')||id==='shared-gradient')return ['bptt','tanh'];
  if(id.startsWith('tanh-'))return ['tanh'];
  return [id==='error'?'chain':'recurrent'];
 }
 if(id.includes('mean')||id.includes('variance')||id.includes('standardize')||id.includes('affine'))return ['norm'];
 if(id==='scale'||id==='dot')return ['scale'];
 if(id==='mask')return ['mask'];
 if(id.startsWith('softmax-')||['vocab-exp','probability'].includes(id))return ['softmax'];
 if(['mlp-first','mlp-second','activation-inner','activation'].includes(id))return ['mlp'];
 if(id.startsWith('weighted-value')||id.startsWith('head')||['concat','projection','residual1','residual2'].includes(id))return ['residual'];
 return ['representation'];
}
