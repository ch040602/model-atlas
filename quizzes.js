// Each quiz is [question, choices, correct index, explanation].
export const quizzes = {
 foundation:{ko:[
  ['역전파가 계산하는 것은 무엇인가요?',['각 파라미터에 대한 손실의 기울기','정답 데이터를 새로 만드는 방법','모델의 입력 크기'],0,'기울기는 각 파라미터에 대한 손실의 국소적인 변화 방향을 알려 줍니다.'],
  ['훈련에 사용하지 않은 데이터로 평가하는 이유는?',['새로운 데이터에도 잘 작동하는지 확인하려고','기울기를 더 크게 만들려고','정답을 숨기면 항상 정확도가 올라가므로'],0,'훈련 데이터만으로는 과적합과 일반화 성능을 구분하기 어렵습니다.']
 ],en:[
  ['What does backpropagation calculate?',['Loss gradients with respect to parameters','A way to create target data','The input size'],0,'Gradients describe how the loss changes locally with each parameter.'],
  ['Why evaluate on held-out data?',['To assess performance on unseen examples','To make gradients larger','Because hiding labels always raises accuracy'],0,'Training results alone cannot distinguish fitting the training set from generalization.']
 ]},
 cnn:{ko:[
  ['합성곱에서 같은 필터를 여러 위치에 적용하는 이유는?',['위치별 동일한 패턴을 찾기 위해','모든 픽셀을 하나의 숫자로 지우기 위해','정답 레이블을 입력에 추가하기 위해'],0,'공유된 필터가 이미지의 여러 위치에서 같은 유형의 패턴을 검사합니다.'],
  ['ReLU(−2)의 결과는?',['−2','0','2'],1,'ReLU는 max(0, z)이므로 음수 입력은 0이 됩니다.']
 ],en:[
  ['Why apply the same filter at multiple positions?',['To detect a pattern at different locations','To erase all pixels into one number','To add the label to the input'],0,'A shared filter checks for the same kind of pattern across an image.'],
  ['What is ReLU(−2)?',['−2','0','2'],1,'ReLU is max(0, z), so a negative input becomes zero.']
 ]},
 rnn:{ko:[
  ['RNN의 hₜ₋₁은 무엇인가요?',['이전 시점의 은닉 상태','현재 정답 레이블','학습률'],0,'이전 상태가 현재 입력과 결합하여 다음 상태를 만듭니다.'],
  ['시간 역전파에서 기울기 소실이 생길 수 있는 이유는?',['작은 국소 기울기가 여러 번 곱해질 수 있어서','시점마다 가중치가 반드시 무작위로 바뀌어서','손실 함수가 항상 0이어서'],0,'여러 시점에 걸쳐 작은 기울기를 곱하면 먼 시점의 영향이 작아질 수 있습니다.']
 ],en:[
  ['What is hₜ₋₁ in an RNN?',['The previous hidden state','The current target label','The learning rate'],0,'The previous state combines with the current input to form the next state.'],
  ['Why can gradients vanish through time?',['Small local gradients can multiply repeatedly','Weights must become random at every step','The loss is always zero'],0,'Multiplying small gradients across steps can reduce the influence of distant steps.']
 ]},
 diffusion:{ko:[
  ['노이즈 예측 학습에서 모델의 목표는?',['더한 노이즈를 예측하기','정답 레이블을 항상 0으로 만들기','이미지를 무조건 그대로 복사하기'],0,'모델의 예측과 실제 노이즈의 차이로 손실을 계산합니다.'],
  ['생성 단계에서 일반적인 시작점은?',['무작위 노이즈','정답이 이미 완성된 이미지','분류 정확도'],0,'역방향 단계에서 모델의 예측과 스케줄러를 이용해 노이즈를 점차 줄입니다.']
 ],en:[
  ['What does a noise-prediction model learn to predict?',['The added noise','A label that is always zero','An unconditional copy of the image'],0,'The loss compares the predicted noise with the actual noise.'],
  ['What is the usual starting point for generation?',['Random noise','An already completed target image','Classification accuracy'],0,'Reverse steps use model predictions and a scheduler to progressively reduce noise.']
 ]},
 transformer:{ko:[
  ['어텐션에서 softmax 가중치의 역할은?',['값 벡터를 섞는 비율을 정한다','토큰의 원문을 삭제한다','모델의 가중치를 직접 업데이트한다'],0,'각 값 벡터에 가중치를 곱해 더하면 문맥을 반영한 표현이 만들어집니다.'],
  ['자기회귀 생성 시 미래 토큰을 가리는 이유는?',['예측할 때 아직 알 수 없는 정보를 사용하지 않도록','모든 확률을 0으로 만들기 위해','위치 정보를 없애기 위해'],0,'현재 위치는 허용된 이전 문맥만 참고해 다음 토큰을 예측합니다.']
 ],en:[
  ['What do softmax attention weights control?',['How value vectors are mixed','Deletion of the original token text','Direct updates of model weights'],0,'The weighted sum of values produces a context-informed representation.'],
  ['Why mask future tokens in autoregressive generation?',['To avoid using information unavailable at prediction time','To make all probabilities zero','To remove position information'],0,'A position predicts from the permitted preceding context.']
 ]},
 gan:{ko:[
  ['생성자 G의 출력은?',['랜덤 입력으로 만든 가짜 샘플','정답 레이블만','판별자의 학습률'],0,'G는 노이즈를 데이터처럼 보이는 샘플로 변환합니다.'],
  ['생성자 업데이트 중 판별자는 어떻게 되나요?',['파라미터는 고정하고 연산을 통해 기울기를 전달한다','판별자를 삭제한다','판별자와 생성자의 파라미터를 반드시 동시에 바꾼다'],0,'판별자를 통과하는 기울기는 생성자에 도달하지만 해당 업데이트에서는 판별자의 가중치를 바꾸지 않습니다.']
 ],en:[
  ['What does generator G output?',['A fake sample made from random input','Only the target label','The discriminator learning rate'],0,'G maps noise to a sample intended to resemble data.'],
  ['What happens to the discriminator during a generator update?',['Freeze its parameters but pass gradients through its operations','Delete it','Always update both networks simultaneously'],0,'Gradients pass through the discriminator to the generator while discriminator weights stay fixed for that update.']
 ]}
};

// Hints align with choice indexes; null marks the correct answer.
export const quizHints = {
 foundation:{ko:[
  [null,'정답이나 학습 목표는 손실을 정의할 때 쓰입니다. 역전파는 손실의 기울기를 파라미터에 연결합니다.','입력 크기는 모델을 구성할 때 정합니다. 역전파는 손실이 파라미터에 어떻게 반응하는지 계산합니다.'],
  [null,'평가는 파라미터를 갱신하지 않고 예측을 비교합니다. 기울기의 크기를 키우는 단계가 아닙니다.','정답을 숨기는 것 자체가 정확도를 높이지는 않습니다. 평가에서는 예측을 별도로 준비한 정답과 비교합니다.']
 ],en:[
  [null,'Targets or training objectives help define the loss. Backpropagation connects loss gradients to parameters.','Input size is chosen when constructing the model. Backpropagation measures how the loss responds to parameters.'],
  [null,'Evaluation compares predictions without updating parameters; it is not a step for increasing gradients.','Hiding labels does not itself improve accuracy. Evaluation compares predictions with separately held-out targets.']
 ]},
 cnn:{ko:[
  [null,'필터를 적용하면 위치마다 결과가 생겨 특징 맵을 만듭니다. 모든 픽셀을 하나로 지우지는 않습니다.','정답 레이블은 학습 손실을 계산할 때 사용합니다. 필터가 이동하는 목적은 입력의 패턴을 살펴보는 것입니다.'],
  ['ReLU는 입력을 그대로 두기 전에 0과 비교합니다. −2는 0보다 작습니다.',null,'절댓값을 취하는 함수가 아닙니다. −2와 0 중 큰 값을 선택합니다.']
 ],en:[
  [null,'Applying the filter produces a result at each position, forming a feature map rather than erasing all pixels.','Labels are used to calculate a training loss. Moving the filter examines patterns in the input.'],
  ['ReLU compares its input with zero; −2 is less than zero.',null,'ReLU is not the absolute-value function. Choose the larger of −2 and zero.']
 ]},
 rnn:{ko:[
  [null,'정답 레이블은 예측과 비교해 손실을 계산할 때 쓰입니다. h의 아래 첨자는 시간에 따른 상태를 나타냅니다.','학습률은 가중치 갱신 크기를 조절합니다. h는 시점마다 전달되는 상태입니다.'],
  [null,'RNN은 시점마다 같은 순환 가중치를 공유합니다. 갱신 없이 시점을 펼쳐도 기울기 소실이 생길 수 있습니다.','손실이 0일 필요는 없습니다. 먼 시점으로 기울기가 전달될 때 곱해지는 항들을 살펴보세요.']
 ],en:[
  [null,'A target label is compared with a prediction to calculate the loss. The subscript on h denotes a state over time.','The learning rate controls update size. h is a state passed between time steps.'],
  [null,'An RNN shares recurrent weights across time. Gradients can vanish even while the weights are fixed during the unrolled pass.','The loss need not be zero. Consider the terms multiplied as a gradient travels to earlier steps.']
 ]},
 diffusion:{ko:[
  [null,'이 예제의 손실은 레이블 분류가 아니라 예측된 노이즈와 실제 노이즈를 비교합니다.','입력에는 이미 노이즈가 섞여 있습니다. 모델이 예측하는 대상과 입력을 구분해 보세요.'],
  [null,'생성할 때 완성된 정답 이미지를 입력으로 주지 않습니다. 역방향 과정의 시작 상태를 떠올려 보세요.','분류 정확도는 평가 지표이지 이미지 생성의 초기 데이터가 아닙니다.']
 ],en:[
  [null,'This objective compares predicted noise with actual noise; it is not a label-classification loss.','The input is already noisy. Distinguish the input from the quantity the model is trained to predict.'],
  [null,'Generation does not start with a completed target image. Think about the initial state of the reverse process.','Classification accuracy is an evaluation metric, not the initial data for image generation.']
 ]},
 transformer:{ko:[
  [null,'원래 토큰 텍스트를 삭제하는 연산이 아닙니다. 가중치는 여러 값 벡터를 결합하는 데 사용됩니다.','가중치는 순전파에서 계산됩니다. 학습 파라미터 갱신에는 손실과 역전파가 따로 필요합니다.'],
  [null,'미래 위치만 가립니다. 자기 위치와 허용된 과거 위치의 확률까지 모두 0으로 만들지는 않습니다.','마스크는 접근할 위치를 제한합니다. 위치 정보 자체를 지우는 것은 아닙니다.']
 ],en:[
  [null,'Attention does not delete the original token text. Its weights combine value vectors.','Attention weights are calculated during the forward pass. Updating trainable parameters separately requires a loss and backpropagation.'],
  [null,'The mask excludes future positions, not all positions. The current and permitted earlier positions remain available.','The mask limits which positions can be attended to; it does not remove positional information.']
 ]},
 gan:{ko:[
  [null,'정답 레이블만 출력하는 역할은 아닙니다. 생성자의 결과가 판별자의 입력이 된다는 점을 살펴보세요.','학습률은 업데이트 설정입니다. 생성자는 노이즈를 데이터 공간의 샘플로 변환합니다.'],
  [null,'판별자의 연산은 생성자에 기울기를 전달하는 경로로 여전히 필요합니다.','이 예제는 번갈아 업데이트합니다. 생성자 단계에서 판별자의 가중치는 고정합니다.']
 ],en:[
  [null,'G does not output only a label. Consider what the discriminator receives from the generator.','A learning rate is an update setting. The generator maps noise into a sample in data space.'],
  [null,'The discriminator’s operations are still needed as a path for gradients to reach the generator.','This example alternates updates. Discriminator weights are fixed during the generator step.']
 ]}
};
