export const prerequisites = {
  ko: [
    ['스칼라, 벡터, 행렬', '스칼라는 숫자 하나(예: 3), 벡터는 숫자의 순서 있는 묶음(예: [1, 2]), 행렬은 숫자를 행과 열로 정리한 표입니다. 입력 이미지, 단어의 표현, 가중치는 여러 숫자로 이루어져 있습니다.'],
    ['곱해서 더하기: 내적과 가중합', '[1, 2] · [3, 4] = 1×3 + 2×4 = 11입니다. 각 입력에 가중치를 곱한 뒤 합치므로, 숫자별 중요도를 조절해 하나의 점수를 만듭니다. CNN 필터와 어텐션 점수에서도 사용합니다.'],
    ['행렬의 크기와 곱', '2×3 행렬은 두 행과 세 열을 가집니다. 2×3 행렬과 길이 3인 열벡터를 곱하면 길이 2인 열벡터가 됩니다. 행렬의 각 행과 입력 벡터를 내적해 출력 원소 하나씩을 만듭니다. 곱할 때 안쪽 크기가 같아야 합니다.'],
    ['아래첨자와 파라미터', 'xₜ는 t번째 시점의 입력, xᵢ는 i번째 원소를 뜻합니다. 아래첨자의 의미는 문맥에 따라 다릅니다. θ는 모델의 학습 가능한 파라미터들을 묶어 나타내는 기호입니다.'],
    ['Σ, 평균과 확률', 'Σ는 지정된 값들을 더하라는 뜻입니다. 2, 4의 평균은 (2+4)/2 = 3입니다. 확률은 사건의 가능성을 0과 1 사이로 표현합니다. 모델이 출력한 0.7은 예측 확률이며 실제 비율과 항상 일치하는 것은 아닙니다.'],
    ['기댓값 E와 샘플', 'E[X]는 확률을 고려한 평균입니다. X가 1일 확률이 0.25, 3일 확률이 0.75인 이산 예에서는 E[X]=1×0.25+3×0.75=2.5입니다. 연속값은 확률밀도를 이용해 적분합니다. 학습 목적식의 E는 데이터나 노이즈 분포에 대한 평균을 뜻하며, 실제 학습에서는 보통 샘플로 근사합니다.'],
    ['기울기와 미분', '기울기는 입력을 조금 바꿀 때 출력이 얼마나 변하는지 나타냅니다. 예를 들어 f(w)=w²에서 w=2일 때 기울기 2w=4입니다. w가 0.01 증가하면 f는 약 0.04 증가합니다. 학습은 손실을 줄이기 위해 기울기를 사용합니다.'],
    ['편미분과 연쇄법칙', '∂L/∂w는 다른 독립적인 입력과 파라미터를 고정한 채 w를 조금 바꿀 때 손실 L이 변하는 비율입니다. 중간값인 예측 ŷ는 w에 따라 변합니다. L이 ŷ를 통해 w에 연결되면 ∂L/∂w = (∂L/∂ŷ)(∂ŷ/∂w)입니다. 각 단계의 변화를 곱해 전체 영향을 구합니다.'],
    ['수식의 −를 읽는 법', 'a−b는 a에 −b를 더한다는 뜻입니다. w−ηg에서 η>0이고 g<0이면 음수를 빼므로 w가 커집니다. −log p는 확률을 손실로 바꾸고, x−μ는 중심을 옮깁니다. 같은 −라도 식에서 맡는 역할을 확인하세요.'],
    ['지수, 로그와 softmax', 'e²≈7.389이고 자연로그 ln(e²)=2입니다. softmax는 여러 점수의 지수값을 각각 전체 지수값의 합으로 나눕니다. 점수 [0, 0]은 가중치 [0.5, 0.5]가 됩니다. 점수가 모두 같으면 동일하게 나뉩니다.']
  ],
  en: [
    ['Scalars, vectors and matrices', 'A scalar is one number (such as 3), a vector is an ordered list (such as [1, 2]), and a matrix arranges numbers in rows and columns. Images, word representations and weights contain many numbers.'],
    ['Multiply and add: dot products and weighted sums', '[1, 2] · [3, 4] = 1×3 + 2×4 = 11. Multiply each input by its weight and add the results to make a score whose inputs have different importance. CNN filters and attention scores use this idea.'],
    ['Matrix dimensions and multiplication', 'A 2×3 matrix has two rows and three columns. Multiplying it by a column vector of length 3 gives a column vector of length 2. Each output entry is the dot product of one matrix row and the input vector. The inner dimensions must agree.'],
    ['Subscripts and parameters', 'xₜ denotes the input at time t; xᵢ denotes element i. A subscript’s meaning depends on context. θ denotes a collection of the model’s trainable parameters.'],
    ['Σ, averages and probabilities', 'Σ means to add the specified values. The average of 2 and 4 is (2+4)/2 = 3. Probability expresses the possibility of an event between 0 and 1. A model output of 0.7 is a predicted probability and need not match the actual frequency.'],
    ['Expectation E and samples', 'E[X] is an average that accounts for probability. In a discrete example where X is 1 with probability 0.25 and 3 with probability 0.75, E[X]=1×0.25+3×0.75=2.5. For continuous values, integrate using the probability density. In a training objective E denotes an average over a data or noise distribution, usually approximated using samples.'],
    ['Gradients and derivatives', 'A gradient describes how much an output changes when an input changes slightly. For f(w)=w², the gradient at w=2 is 2w=4. Increasing w by 0.01 increases f by about 0.04. Training uses gradients to reduce loss.'],
    ['Partial derivatives and the chain rule', '∂L/∂w is the rate at which loss L changes as w changes slightly, holding other independent inputs and parameters fixed. The intermediate prediction ŷ still varies with w. If L depends on w through ŷ, then ∂L/∂w = (∂L/∂ŷ)(∂ŷ/∂w). Multiply the changes at each stage to obtain the overall effect.'],
    ['Reading a minus sign', 'a−b means adding −b to a. In w−ηg, when η>0 and g<0, subtracting a negative increases w. Negative log probability defines a loss; x−μ centers a value. Read each minus in its own equation.'],
    ['Exponentials, logarithms and softmax', 'e²≈7.389 and the natural logarithm ln(e²)=2. Softmax divides each score’s exponential by the sum of all exponentials. Scores [0, 0] yield weights [0.5, 0.5]. Equal scores receive equal weights.']
  ]
};
