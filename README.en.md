# Model Atlas

Each of the 82 formula operations now explains its current numerical result, offers a controlled prediction with a reason to reveal, and links to the operations that actually consume it. Nineteen shared formula topics separate the core idea, three derivation steps, a worked example and applicability conditions. Diffusion and GAN exercises also explain the current values and why controlled changes affect the result.

The four original labs include cursor-position explanations. Inspect CNN map coordinates for channel contributions, bias and output, or Transformer matrix cells for actual query/key scores and attention weights. Diffusion explains its displayed step, seed, guidance and saved results; GAN follows the selected loss and the timing of displayed values. Schematic vector stripes are identified as illustrations. Hover or focus a region with Tab; pin the card or press F2 to read it, and Escape to close. Touch a component on touch screens. “Read current values” refreshes the snapshot after animation or training, and the bottom-right toggle disables help. This works in embedded and separate-window originals.

The learning site includes [credits and license summaries](credits.html) in Korean and English. The [detailed record](LICENSES.md) covers the separate review of models, images and other assets.

The ROC and threshold concept follows six synthetic scores through predictions, confusion counts, recall, false positive rate, the ROC curve and AUC. It includes tied scores and the case with no positive predictions. This fixed example does not evaluate a trained classifier.

The neural style-transfer concept in the vision path compares a toy two-channel, two-position Gram matrix, content and style losses, gradients, and one feature update. Swapping positions illustrates a limitation of the style statistic. This does not generate an image; the page links to the official PyTorch image tutorial and source.

English | [한국어](README.md)

The Vision Transformer concept includes a 4×4 grayscale toy: select a patch and change a pixel to follow flattening, shared projection, position vectors and the class token into the encoder input. Its values are illustrative; it does not run an encoder or classify images. A link leads to the Transformer unit's text token and position embedding exercise.

GAN Lab displays the discriminator training loss without the original half scaling in its numbers and chart. Values come from the batch before the final update; discriminator and generator can use different batches and times. Bar lengths use separate display scaling.

In GAN Lab, use Tab and Enter or Space to choose a data distribution. The selected choice exposes its state to assistive technology. The drawing panel can be opened by keyboard, but drawing itself requires a pointer.

The original Transformer sampling card distinguishes how top-k and top-p choose candidates after temperature scaling. A toy probability example shows the top-p threshold and renormalization; it is not a model output.

The foundations unit includes an early-stopping exercise: train a small linear model one epoch at a time, track the best validation loss and patience, then restore its saved weight. Its two synthetic splits deliberately follow different relationships, so the result does not establish generalization.

In the concept library, **From linear models to nonlinear MLPs** offers a four-input XOR walkthrough from hidden weighted sums and ReLU to output probability and prediction, with an identity-activation comparison. Its weights are hand-designed rather than trained. A separate two-hidden-neuron sigmoid model trains on all four XOR examples, showing one example's backpropagation and full-batch average gradients and updates for both layers. Its starting weights are chosen for the lesson, and training results on these four points do not assess generalization. The external Playground offers another exercise.


Units follow **guide → core concepts and symbols → architecture and connected formulas → calculation exercises → original lab → review**. Use **A suggested first pass** or the unit contents to jump to a section. Foundations starts with mathematical prerequisites, then data splitting, single-example training, mini-batches and early stopping. Diffusion proceeds through noise and latent space, CLIP, cross-attention, then condition dropout and guidance. RNN uses integrated sequence and gate exercises instead of a separate original lab.

Choose CNN, RNN or Transformer under **Follow formulas from the start** in the sidebar to open the first operation while retaining adjusted inputs in the current page. Restarting the current model in the standalone reader also preserves its adjusted values. Language controls are in the sidebar, and there is no top bar. Desktop navigation stays beside the lesson; small screens place it before the content.

After the core concepts, **Follow the architecture** lets you select feature maps, unfolded cells, Q/K/V or residual connections to follow explanations and numerical equations. Its slider and the corresponding detailed exercise share values in both directions. These are small examples: a single-channel CNN with average pooling, a scalar RNN with final-state loss, and a two-position, two-head Transformer with two imaginary output candidates.

After the calculation exercises, expanding **Original interactive visualization** loads the original lab inside the same unit. The original and toy examples use independent inputs and weights. Horizontal controls and scrolling reveal the wide original diagrams; a separate-tab link is also available. The original Transformer may take time to load its tokenizer and model.

**Follow every operation through the formula** connects 20 CNN, 21 RNN and 41 Transformer steps. Each operation identifies the earlier results it uses, symbol roles, numerical substitutions, its result and purpose; a growing history connects the full expression. CNN separates convolution's weighted sum from average pooling's division. RNN carries states across time and backpropagates to the shared weight. Transformer follows embeddings, Q/K/V, dot products, division by √dₖ, causal masking, softmax numerators and denominator, both heads, residuals, MLP, final normalization, vocabulary probabilities and loss. A separate comparison demonstrates scaling beyond the toy heads' dimension 1. This does not numerically expand the full Transformer backward pass.

These three models' architecture details and formula journeys use local KaTeX for stacked fractions, roots, sum limits, indices and matrices. This includes substitutions, results, carried values, histories, full expressions, standalone pages and original-article reference cards. Wide formulas scroll inside their own area on small screens. The renderer and fonts ship in `vendor/katex/`; math rendering does not use a remote CDN.

On wide screens, the current explanation and symbol roles appear on the left of the formula workspace; operation selection, equations, substitutions and results appear on the right. Both follow the same step. Small screens stack the explanation before the equations. Hover marked operators such as ReLU, softmax or √dₖ, or focus a concept button beneath the equation, to read a definition, formula and example. Clicking or tapping a button keeps the card open; Escape or selecting outside dismisses it. Help also works in the standalone reader and original-article reference cards. [DESIGN.md](DESIGN.md) records the visual reference and its adaptation.

**Connected calculations so far** occupies a separate right rail for CNN, RNN, Diffusion, Transformer and GAN. At widths of 1180px or more, the rail stays beside the lesson and its list scrolls independently. CNN/RNN/Transformer entries return to their operation. Diffusion/GAN groups mirror the revealed steps and current values of each separate exercise, with links back to that exercise. The standalone formula reader uses the same rail. Smaller screens place a height-limited scroll area before the lesson. The mark to the left of the Model Atlas wordmark has been removed.

The full-window link preserves the selected operation and all control values in a standalone reading page. The original-explanation link opens the matching article section with a reference panel showing the worked equation, result and purpose. Expand the panel using its heading on small screens. The windows have independent controls; the toy weights are not passed into the original network.

The original CNN article's ReLU and softmax formulas use native MathML rather than the external MathJax script. Chrome rendering was tested; physical screen readers and other browser combinations were not tested.

The optimizer concept page compares repeated SGD, momentum and Adam updates on the same scalar loss, including Adam's bias correction and state updates at zero learning rate. This deterministic toy does not show stochastic mini-batch noise.

The two-mode GAN exercise compares the original 900-cell chart’s smoothed, unnormalized JS sum with JS after normalization. It uses assumed proportions and does not read the live GAN samples or chart.

The original CNN tutorial chapter links work by keyboard. They seek the embedded player when ready and otherwise open the corresponding timestamp on YouTube. The English video requires an internet connection.

In the original CNN convolution detail, the matrix shows one selected input channel’s contribution. The full output before ReLU sums all input channels and adds the bias for that output channel; the detail and integrated guide explain the distinction.

The extended vision path also introduces pose estimation and object tracking, novel-view synthesis of 3D scenes, and visual question answering. Their examples are hand calculations, not model runs. The CAM page also connects two illustrative feature maps to global average pooling, signed spatial scores and a class logit. Adjusting the class bias shows that it changes the logit without changing the CAM; no image or CNN is run.

The extended vision path includes a two-input FGSM exercise: compare the input gradient, perturbation budget, loss and prediction in a toy classifier. It is not an image or CNN run; the page links to a PyTorch image tutorial.
Use **Concept library** in the sidebar to search machine-learning and deep-learning concepts, read explanations and work through small examples. Related links connect units and the library. Some classical models are covered by explanations and hand calculations rather than executable training labs.

The naive Bayes concept page uses eight toy messages to calculate class priors, word presence and absence, smoothing, and normalized class scores. It is not a real spam filter or a generalization evaluation.

The **extended path: data, language and vision** follows the broad sequence of a local Advanced Big Data lecture: problem definition, MLPs, word and sentence representations, language models and RAG, then vision tasks. It includes an interactive BoW/TF-IDF calculation and links to external neural-network, embedding and DETR exercises. The original lecture PDF is not included. The [coverage audit](CURRICULUM_AUDIT.md) is in Korean and identifies remaining gaps.

On the retrieval-augmented generation concept page, a toy corpus demonstrates TF-IDF, cosine ranking and evidence selection, including ties and an unknown query. It copies the selected passage; it does not run a language model or generate a RAG answer.

The TF-IDF exercise shows counts, document frequencies, smoothed IDF and L2 normalization for three training documents. The detection page lets you move a prediction box and compare intersection, union, IoU and a threshold. The latter compares box geometry only and does not calculate AP.

Before publication, `python scripts/audit_publication.py <publication_directory>` screens for indexed, byte-identical upstream assets and summarizes findings by project and review reason; add `--all` for the complete match list. The screen covers only selected assets and does not establish redistribution rights, even if there are no matches. See [LICENSES.md](LICENSES.md).

When the original GAN Lab is opened separately on a small screen, its article and diagrams fit the viewport. The interactive visualization remains wide: swipe it horizontally, or focus the lab region and use the arrow keys. The embedded lab in the integrated course keeps its existing horizontal controls.

The word embeddings page walks through a Skip-gram dot product, a loss with an optional negative sample, gradients and simultaneous vector updates. This is a toy example using one pair and a chosen negative sample, not training Word2Vec on a full corpus.

When a concept has a directly related calculation, its link opens that exercise and moves keyboard focus to its heading. Other concepts offer a general link back to a unit.

The metrics exercise changes TP, FP, FN and TN to calculate precision, recall and accuracy. The K-means exercise changes two centers and shows one assignment and update on four fixed one-dimensional points. Neither exercise trains a model on a real dataset.

The linear-models concept page includes logistic regression training on four synthetic examples. It connects linear scores, positive-class probabilities, binary cross-entropy and gradients to repeated simultaneous weight and bias updates. Two separate examples show evaluation behavior, but this tiny set cannot establish generalization.

The batch-normalization exercise uses three training samples with one feature. It calculates training output from batch statistics, applies repeated updates to running statistics, and evaluates a separate sample with the saved statistics. PyTorch updates running variance with an unbiased estimate; the example does not train weights.

On the same concept page, the dropout exercise compares training-time scaling, mask probability and evaluation output for a selected drop probability and hypothetical mask. It also calculates an activation’s expected value; it does not draw masks randomly.

The PCA exercise uses four centered two-dimensional points. Change the axis angle to calculate one point's one-dimensional projection and two-dimensional reconstruction, and compare retained variance and reconstruction error for all four points. You select the axis manually; this is not automatic PCA fitting.

The decision-tree concept page lets you adjust a split across six training samples and compare parent and child Gini impurity, weighted averages, candidate thresholds, and predictions for a new input. It splits only the root; predictions use your chosen threshold rather than automatically switching to the best candidate. Empty children are invalid, and tied predictions choose A.

Model Atlas is a bilingual web course for studying CNN → RNN → Diffusion → Transformer → GAN Lab in sequence. It introduces common learning principles and explains where formulas apply, what they do, and what their results mean through small numerical examples.

Open **In this unit** near the top of each chapter to jump to concepts, formulas, each calculation, review questions and the original lab. Selecting an item moves keyboard focus to the heading without changing the chapter URL. The original lab loads only when you open it.

The **foundations** exercise uses one input–target pair to repeatedly calculate a forward pass, squared loss, gradients via the chain rule, a weight update, and the resulting loss. Reveal the four calculations with the previous and next buttons; a separate button actually updates the weight. An update preview does not change the weight. Try different learning rates, including one large enough to increase the loss. A separate evaluation input and target show the evaluation loss for each weight without resetting training history. The evaluation example is not used for updates, and a single evaluation example cannot establish generalization performance.

In the one-example training exercise, open **What if bias is trained too?** to add a separate bias to the current input and weight. It previews both gradients at the same old parameters and a simultaneous update. At zero input, bias can still reduce a remaining error. This preview does not change the actual update history above.

A separate mini-batch exercise previews one epoch over three examples in a fixed order. Change the batch size, initial weight, learning rate and second target, then follow each example's loss, the mean gradient and each batch update. A partial final batch uses its actual example count; whole-dataset losses compare the initial and final weights applied consistently to every example. This preview does not change weights in other exercises.

A separate data-splitting exercise compares training and validation mean squared errors for three fixed candidates, then reveals the test loss for the selected candidate. It is a tiny hypothetical example with no actual training; choosing again using the same test score invalidates its independent evaluation.

The foundation math guide explains matrix dimensions and multiplication, subscripts, expectations, and partial derivatives. A worked example maps two inputs to two outputs and connects matrix multiplication to the later RNN and Transformer lessons.

The **CNN** exercise applies a shared 2×2 filter at four locations of a 3×3 input to produce a ReLU feature map. Change the center input, filter strength and bias, then compare the results. You can calculate the loss against an example target map, sum the contributions from all four locations, and update the shared filter strength once. A typical CNN learns each filter element separately. A separate classification path starts again from the original feature map, then calculates global average pooling, fixed two-class scores, softmax, cross-entropy and a shared-filter update. Training against the preceding target map is not a required step in CNN classification. A separate exercise applies two 1×1 filters to the three RGB channels at one position to calculate two output channels.

The padding and stride exercise adds zeros to both sides of a one-dimensional input, sums each complete window and checks output length with the floor formula. It also shows indices in no window and configurations where the filter is too large. These sliders do not change the original CNN model.

ReLU is not differentiable at zero, so this exercise chooses a zero gradient there. It treats values within floating-point cancellation error of zero as zero and treats machine-error-scale differences as ties in max pooling.

The max-pooling exercise selects a maximum from the current convolution feature map or a separate adjustable example and routes an assumed incoming gradient. At a tie, the toy chooses the first position in row-major order; other implementations may handle ties differently. It does not use the preceding weight-update preview or train the original CNN.

The original CNN article also distinguishes output-channel filters from weights shared across spatial positions and explains how their gradient contributions are summed during learning in both languages. It distinguishes the effect of kernel size, padding and stride on output size from their effect on accuracy. A two-class numerical example shows flattening followed by the dense output layer's logits and softmax probabilities; its weights are illustrative, not the original model's values.

In the original CNN diagram, use Tab to reach a layer, Up or Down to choose a feature map or class, and Enter or Space to open it. Choose an input channel for convolution or the softmax symbol in the output layer. Activate the selected layer again to return to the overview. In detail panels, use Tab and Enter or Space to jump to the article, close the panel, or play and pause the animation. In convolution, ReLU and max-pooling, enter a row and column below the output or use the arrow keys to select a calculation position. Jumping moves focus to the article heading.

In the softmax detail, choose a class from the menu to highlight its actual logit value, formula term and network circle. Arrow keys change the class; the highlight clears when the menu loses focus. During the display animation, the chosen number appears immediately and its circle is highlighted as soon as it is created.

The CNN overview labels input, convolution, ReLU, max pooling and output in Korean when that language is selected. Detailed view shows intermediate tensor dimensions as height, width and channels; the output dimension is the class count. Hover over a layer name to see the original model identifier and its role in either language.

Smooth Scroll 15.2.1, used by the CNN detail panels to move to the article, is included locally. Its source and notices are recorded in the [CNN external resource inventory](third-party-licenses/cnn-external-resources.md).

The original Transformer temperature and sampling sliders have Korean and English accessible names and visible keyboard focus. An exact-value temperature selector stays synchronized with the slider. Their current displayed values are also included in the accessibility description. The tested Chrome accessibility tree exposes the temperature slider’s internal step number as its value instead of `aria-valuetext`; actual screen-reader behavior still needs testing.

In the original Transformer lab, focus the embedding title and press Enter or Space to expand or collapse it. Keyboard activation of the token or position explanation moves focus to the card; closing the card collapses the detail and returns focus to the embedding title.

The original Transformer attention matrix also has a keyboard-focusable button to expand or collapse its calculation with Enter or Space. It exposes the current expanded state, and clicking the matrix still works. Actual screen readers and mobile devices have not yet been tested.

In the Diffusion refiner detail, the previous representation is the preceding saved image for the same prompt, seed and guidance as the displayed result. Both update together when a setting is selected or previewed, including while playback is paused. Saved display steps may differ from the scheduler timesteps passed to the model.

The small noise image in the refiner detail is a fixed illustration, not the selected step's prediction. A note below the diagram also describes the scheduler's role in updating the representation using predicted noise.

Buttons below the original Transformer diagram open the Q·K·V, attention output, MLP expansion and compression, and output logits matrix calculations. Use Tab to reach a button and Enter or Space to open it; Escape or the close button returns focus to the opener. On narrow screens, scroll horizontally to reach the diagram and buttons.

In the original Transformer example menu, Korean mode adds display-only meanings for the five English prompts. Selecting an example still supplies the original prompt and cached data; the ellipses mark unfinished text to be continued.

The original CNN lab loads a local TensorFlow.js 1.0.0 file identical to its previous CDN file. Its provenance and dependency notices are documented in the [TensorFlow.js bundle inventory](third-party-licenses/cnn-tfjs-bundle.md). Other external resources and the original model and image rights require separate review.

The original CNN ReLU article compares consecutive affine transformations with an example containing ReLU and notes that max pooling is also nonlinear.

The original CNN pooling article explains its 2×2 window, stride 2 and valid padding, including odd-sized input boundaries. Pooling loses some spatial information and does not guarantee prevention of overfitting.

The original CNN hyperparameter diagram uses only complete filter windows even when the stride does not divide evenly, and shows the floor formula for output size. While a numeric input is outside its permitted range, the diagram retains its last valid settings.

The **RNN** exercise calculates a three-step forward pass and lets you switch between a final-state loss and the sum of losses at all steps, then unfolds backpropagation through time one step at a time. The all-step illustration uses the same target at every step; real tasks may have different targets. In this scalar example, the contributions to the shared recurrent weight are added for one update. A separate gradient-flow exercise changes the initial state and shared weight and shows the state and local derivative for up to 20 time steps. Its cumulative derivative measures the influence of the initial state on the current state, not the complete loss gradient with respect to the weight.

The RNN **Train repeatedly on sequences** exercise learns to predict the first input while ignoring a final distractor. It averages loss across four training sequences and repeatedly updates the shared scalar cell and output head with backpropagation through time. Four held-out sequences show evaluation losses and predictions; this small fixed example does not establish generalization.

The sequence-training exercise can apply a global L2 gradient norm limit to the five averaged parameter gradients before each actual update. Compare the original gradient, scaling factor and applied gradient; clipping does not recover vanished gradients.

**Learn to predict the next token** reads two tokens and predicts a third that equals the first. It converts the recurrent state into two logits and softmax probabilities, then repeatedly trains on four examples using cross-entropy and backpropagation through time. This independent artificial example fixes the A logit at zero; it is not natural-language training or a generalization evaluation.

A separate RNN output-layer exercise transforms the final hidden state of three inputs with a weight and bias to predict one number. It traces squared loss back through the output layer and shared recurrent weight, then updates all three parameters simultaneously and recalculates the loss. This independent, simplified example illustrates regression; its output is not a probability.

The **LSTM** exercise lets you set gate inputs and follow the forget, input and output gates, candidate, cell state and hidden state. Its five-step derivative covers only the direct path with gates and candidate held fixed; it is not the full derivative of an actual LSTM.

The GRU exercise calculates reset and update gates, the candidate and the next hidden state for one time step, and compares GRU with LSTM. It is an independent scalar example with directly specified gate inputs and input/recurrent candidate terms, using the PyTorch GRUCell convention.

The **Diffusion** exercise adds noise to a training example, computes a prediction error and updates a scalar weight in a simplified prediction formula. A separate sampling calculation combines user-supplied conditional and unconditional predictions with a guidance scale, estimates the clean value and takes two deterministic DDIM reverse steps, with a separately supplied prediction for the second step. It does not train a real model or generate an image. The original lab uses preset English prompts and precomputed images; the Korean explanations do not change the input or images. Its token diagram is a conceptual whitespace split and may differ from actual CLIP tokenization.

The latent-space exercise uses Stable Diffusion v1 to connect image and latent dimensions, the encoder sample’s 0.18215 scaling, training noise, idealized clean-latent estimation, and the VAE decoder input for one coordinate. It does not run the encoder, UNet, or decoder or produce pixels. The original visualization also distinguishes VAE decoding from a simple resize.

The Diffusion beginner route continues from guidance through CLIP pretraining and cross-attention before opening the original lab. The original text representation shows saved values and does not share the toy vectors in these calculations.

A separate cross-attention exercise computes scores for one image query and two text keys, softmax weights, and a weighted sum of the text values. The vectors are illustrative; the weighted sum is an intermediate result before subsequent U-Net computations.

The CLIP exercise normalizes two hypothetical image–text pairs and computes their similarity matrix, bidirectional softmax and symmetric loss. A simplified update of one text-vector component illustrates the gradient. It distinguishes whole-text features used in pretraining from token-level hidden states used for generation. It does not train CLIP or share values with the other exercises.

The original Diffusion guidance formula panel shows a numerical example for one noise-prediction component that follows the selected scale. Its two prediction values are hypothetical, not the displayed image's actual model predictions.

In the original Diffusion text and image representation details, the close and i controls support keyboard use. Activating i from the keyboard moves focus to the related article heading. Focus the previous-step image and the weaken label to reveal notes about display steps, the scheduler and noise updates. Changing the prompt by keyboard keeps an open text detail visible.

The condition-dropout exercise changes the drop probability and selection value to show how one training example updates two weights in a toy model. The same updated model produces conditioned and unconditioned noise predictions that are combined with guidance. The condition indicators 0 and 1 are illustrative, not actual text embeddings. This previews one update; it does not train a real model or share state with the preceding exercise.

The Transformer chapter first adds token and learned position embeddings component by component for two toy tokens. Swap their order to compare the representations. The assumed two-dimensional values are separate from GPT-2 and the following attention exercise.

The original Transformer attention-head output popover explains the matrix indices with a two-token weighted-sum example. The example numbers are illustrative.

The five original Transformer embedding, Q/K/V, attention, MLP and next-token probability screenshots are replaced by bilingual numerical tables. These step-by-step toy examples cover vector operations, causal masking, the MLP residual addition and top-k probabilities; their values are illustrative, not GPT-2 weights. The replaced original images remain in the checkout and build and require separate redistribution review.

The Transformer unit's original-lab section links to an article-only reader that fits small screens without downloading the model or tokenizer. Focus a wide table or formula and use the arrow keys to scroll it. The reader also links back to the interactive lab.

The original Transformer article explains the attention output projection, first residual addition, normalization before the MLP and second residual addition. After the last block, a final layer normalization precedes the output projection; this implementation predicts the next token from the final position during inference.

The original lab's explanation cards also show normalization before Q/K/V, the inference-time MLP and residual sequence, and normalization before the final output. They explain learned layer-normalization scale and shift, and training versus inference dropout; the GELU and dropout numbers are illustrative examples.

The original Transformer attention-head popover multiplies the current model's attention matrix by eight illustrative value components to calculate its output colors. The value and output matrices are not the actual GPT-2 matrices.

In both block exercises, changing the layer-normalization scale γ and shift β updates the normalized values and subsequent calculations. For clarity each selected value is shared by both features and both normalization layers. Actual GPT-2 learns separate values for each feature and layer, and the attention output in the first exercise is supplied rather than computed.

The **Transformer** exercise projects three input representations into queries, keys and values, then calculates one query's dot-product scores, an optional causal mask, softmax and a weighted sum of value vectors. The 3×3 identity input is a toy example; sliders change two elements of the query projection matrix. A two-token output head then demonstrates next-token probabilities, cross-entropy and one output-weight update. A separate training path starts again with the original output head, propagates the loss through the weighted sum, attention softmax and scores to the query projection, and recalculates after updating that row. A separate block exercise applies layer normalization, an assumed attention output, a residual connection, a normalized MLP and a second residual to one two-dimensional token vector. The assumed attention is not passed automatically from the previous exercise, and the toy MLP offers the tanh approximation of GELU and ReLU for comparison. The approximation can differ slightly from the original lab’s default PyTorch GELU. The original lab uses illustrative colors in some matrix popovers; these are labeled separately from real model values. Its GPT-2 output projection is shown without a bias.

The multi-head example reuses the query and mask of the first attention head above and calculates a second head with fixed projections. It shows concatenation followed by the output projection step by step. The values are illustrative and are not automatically passed to the subsequent block exercise.

A connected block example normalizes two two-dimensional positions and follows two one-dimensional heads, output projection, the first residual, a normalized MLP and the second residual. The second input and activation share the controls of the immediately preceding block exercise. It does not use that exercise’s assumed attention output or the separate multi-head example’s weights; all values are illustrative rather than GPT-2 values.

A separate four-token example walks through temperature-scaled softmax, top-k or top-p filtering, renormalization and selection. A choice-value slider illustrates random sampling; the example does not use the actual model's generation.

The attention exercise explains how access to a future input can leak a target during teacher forcing. Its toy input X is an identity matrix, so its future position does not actually contain the target token. The beginner route continues to the next-token exercise to compare input and target alignment.

Another example contrasts teacher-forced training on target tokens with generation that appends the token actually selected. Adjusting the target B probability in the illustrative table rescales the other probabilities and changes the mean cross-entropy, sequence probability and perplexity over three positions including EOS. You can also choose the second generated token to compare the resulting conditional probabilities. The table does not contain GPT-2 values and the exercise does not train weights.

GAN Lab’s demonstration chapters support keyboard navigation. They seek the embedded player when it is ready and otherwise open the corresponding YouTube timestamp. The English video requires an internet connection.

In **GAN Lab**, you can draw a real-data distribution using a mouse or touch. The drawing coordinates account for canvas resizing. Displaying a pretrained model does not update its checkpoint weights. The step button opens a menu for updating the generator, discriminator or both. The iteration count is not an epoch over a fixed dataset. Pausing normal playback refreshes the visualization without another training update; slow playback pauses and resumes the current step. Resetting or changing modes during a slow iteration cancels the remaining steps but does not undo completed updates. The count includes started iterations and can therefore include a canceled iteration.

In GAN Lab, use the mouse or keyboard to toggle the real and fake samples, discriminator classifications, generator manifold and discriminator input gradients in the layered view. The descriptions and graph checkboxes share the same display state.

The **GAN** numerical exercise uses one real and one fake scalar to calculate the discriminator and generator losses, gradients and alternating updates. From the same updated discriminator and starting generator weight, it also compares log and squared generator losses, gradients and separate updates. This toy example is separate from training in the original GAN Lab. The original lab includes bilingual explanations of its implemented losses and its grid-based KL and JS evaluation metrics. Loss and noise choices also have Korean labels while preserving their internal values. The grid metrics are approximations using finite samples and smoothing.

A separate two-type example lets you remove a generated type and calculate exact JS divergence. An imagined discriminator gives every fake the same score, providing a counterexample to judging diversity from generator loss alone. This example does not train a neural network and differs from GAN Lab's grid metrics.

GAN Lab's pink arrows show the discriminator input gradient ∇ₓD(x) at fake sample positions. They are not generator weight gradients or exact sample movements. The guide explains the relationship to generator loss with a numerical example. In normal playback, arrows are recomputed at new sample positions after a generator update.

GAN Lab offers one- and two-dimensional input noise while its generator outputs 2D points. Its guide explains the corresponding manifold views and includes a toy numerical example of a 1D-to-2D mapping; the example is not the lab's actual neural network output.

If an original lab entry page returns HTTP 404 or 410, the course displays a setup command and retry button. The check only covers the entry page, not models or other assets. It does not diagnose other server or network errors.

The RNN walkthrough includes a separate preview that sums each time step’s contribution to the shared input weight, recurrent weight and bias, updates all three simultaneously, and recalculates states and the selected loss. The preview does not change the original exercise.

A separate clean project copy on the same Windows computer was restored and built from scratch, then passed the full Chrome suite, including GAN training and real Transformer token generation. A different computer and actual hosting have not been tested.

## Current status: in development

Each unit’s review questions explain the selected answer. Choices remain while the page is open, even when changing units or languages, and reset on reload.

The integrated course and four original labs are available. Chrome automation has checked Korean and English switching, calculations and quizzes, and key interactions in all four labs. The full browser test also checks GAN training and Transformer next-token generation. Major controls in all four labs, the CNN, Diffusion and Transformer articles, and GAN Lab's core guide have Korean translations. CNN also has translated convolution and output-layer diagram annotations. Transformer has translated explanatory cards and selected matrix and probability popovers; Diffusion has some translated detail views. Other original explanations remain in English. The Diffusion article’s top button supports keyboard activation and moves focus to the original header. In the Diffusion lab, use Tab to reach the playback and previous/next display-step buttons and Enter or Space to activate them. The display-step slider also supports keyboard input. Open the prompt, seed and guidance menus with Enter or Space, select an option, or press Escape to close them. Use Enter or Space on a highlighted prompt phrase to open comparison; the return and trajectory zoom controls also work with a keyboard. The comparison guide explains how to read the UMAP trajectory and the limits of projected distances. Course expansion and full translation are ongoing.

The Diffusion text-encoder explanation distinguishes CLIP image-text pretraining from text conditioning passed to the UNet during generation. It uses original dog and flower illustrations with bilingual captions. The word splits and vector numbers are illustrative, not actual tokenization or measured CLIP outputs.

In the original Transformer lab's QKV, MLP and output matrix popovers, keyboard focus opens each help explanation and Escape closes it. Each help button has a Korean or English accessible name, and long explanations wrap.

In the original Diffusion lab, use Enter or Space to open the text representation and CLIP encoder details. Escape closes the innermost open detail first and returns keyboard focus to the previous control. Text details are unavailable in prompt comparison mode.

Each original-lab guide connects the toy calculation to the corresponding operation in the visualization and explains which values and training state the examples do not share, in Korean and English.

The CNN checkout contains a font marked for private, non-commercial use. The modified interface does not use it, but it must be excluded when publicly distributing the original `public` directory. The Diffusion checkout also contains seven SVGs marked Font Awesome Pro. The modified lab does not use them, but they must be excluded when publishing the original directory. See [LICENSES.md](LICENSES.md) for details and unresolved asset rights.

GAN Lab shows its loading text and static article in the selected language before model initialization. The `lang` URL parameter takes precedence over the saved preference.

GAN Lab uses synthetic distributions for its preset real samples; users can draw a distribution as well. The course guides use the actual control names for the selected language. GAN Lab initially loads a pretrained model. Turning that option off or choosing another distribution creates a fresh model with the current settings without requesting a checkpoint. If the initial checkpoint cannot be loaded, the lab displays a message and starts from scratch. This behavior does not establish redistribution rights for the original weights.

The GAN Lab page replaces the paper thumbnail, GitHub mark and five article icons with text, and uses four original selector diagrams and five original article diagrams. The article points and changes are hypothetical, not model outputs or a guarantee of convergence. The 16 original images remain in the checkout; exclude them from deployment unless their terms have been confirmed. Recreate the diagrams with `python scripts/build_gan_distribution_icons.py` and `python scripts/build_gan_article_diagrams.py`; use `--check` to verify them. Other GAN assets and models also need separate review; the [figure inventory](third-party-licenses/ganlab-figures-and-images.md) records the references and limits of the check.

After preparing a publication directory, run `python scripts/audit_publication.py <publication_directory>` to compare its files with 128 selected upstream byte fingerprints, the exact numeric-order concatenation of the 63 Transformer model chunks, and 37,955 Diffusion asset paths. The selected files include the two replaced CLIP photos and the replaced Transformer embedding, Q/K/V, attention, MLP and next-token probability screenshots. The Diffusion index contains 28,370 distinct Git blobs and two CRLF JSON variants for Windows checkouts. It finds identical files even when renamed, displays up to 100 matches and reports the total. Exit code 1 means matches were found; 2 means an index is invalid or missing, paths could not be read, or links were skipped. The script checks each index's content against a stored hash. It does not comprehensively inspect modified files, archive contents, other Diffusion assets, other reassemblies or transformed Transformer weights, or external dependencies, so no matches do not establish redistribution rights. With upstream checkouts present, `python scripts/build_asset_fingerprints.py --check` and `python scripts/build_diffusion_fingerprints.py --check` verify the indexes against pinned Git objects.

On 2026-10-27 the local CNN `public`, Diffusion checkout, Transformer `build`, and GAN `demo` directories totaled about 1.30 GB, excluding hidden files. This includes unused files, but copying the directories as-is exceeds the [GitHub Pages 1 GB published-site limit](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). Select the files for any actual deployment and recheck their size and rights.

## Download and run locally

### Start an existing Windows checkout

Double-click **`START_MODEL_ATLAS.bat`** in the project folder. It starts a local server on an available port and opens the course in the default browser. Keep the command window open while studying; closing it stops the server. If the browser does not open automatically, use the `http://127.0.0.1:port/` address printed in that window. Python 3 is required.

Opening `index.html` directly can cause the browser to block its module scripts. Use the launcher or the local server command below instead. The port can change each time the server starts.

The four `upstream` checkouts are excluded from Git to avoid large and nested repositories. In a fresh copy, install Git, Python 3.10 or later, Node.js and Corepack, then run the following command to restore the pinned revisions, apply the integration patches, install dependencies and build the labs. Model and example files make the download large. The script never forcibly resets an existing checkout. A failed initial Git fetch or checkout is cleaned up so the same command can be retried after fixing the error. A forced termination can leave a temporary directory. If an older incomplete checkout has no HEAD, inspect its contents before retrying; the script will not delete or reset it. Restoration and building were tested in empty temporary directories on Windows and Ubuntu 22.04 WSL on the same computer. Ubuntu used Node 22.20.0 and Corepack 0.34.0; the first Corepack download timed out and required a retry. A separate computer has not been tested.

```powershell
python scripts/bootstrap.py --build
```

On Ubuntu or other systems using `python3` rather than `python`:

```sh
python3 scripts/bootstrap.py --build
python3 scripts/serve.py
```

The full browser suite passed against the Ubuntu-built files served by WSL and opened in Windows Chrome, including GAN training and Transformer token generation. This did not test a browser running on Linux or a separate computer.

If sources are already present, `python scripts/bootstrap.py --check` checks the pinned revisions and patches. It does not validate running applications or all dependency licenses.

Alternatively, run this command from the project directory. If the browser does not open, use the address printed in the command window:

```powershell
python scripts/serve.py
```

If the CNN build is missing, install Node.js and npm, then run:

```powershell
cd upstream/cnn-explainer
npm install
npm run build
```

The Transformer build defaults to the server root above. For a planned deployment under a path such as GitHub Pages `/repository-name/`, set `$env:MODEL_ATLAS_BASE_PATH = "/repository-name"` in PowerShell before building. Use path segments composed of letters, digits and `._~-`, with no trailing slash. The four labs and Transformer token generation were tested under `/model-atlas-test/` on a local server. Actual GitHub Pages hosting, size limits and asset rights still need separate verification. The root `.nojekyll` allows GitHub Pages to include Transformer’s `_app` files. GAN Lab was built in `upstream/ganlab` using `corepack yarn install --non-interactive --ignore-scripts --ignore-engines`, then `node node_modules/browserify/bin/cmd.js demo/ganlab.ts -p '[tsify' -p 'tsconfig-dev.json]' -o demo/bundle.js`. Its older dependencies need `--ignore-engines` with current Node versions.

Changing language or chapters may reload an open original lab and reset its state. The original labs assume a wide screen; on a small screen, scroll the lab area horizontally or use its movement buttons. Some original interactions may require a mouse. The labs may require an internet connection for external CDN resources and model files. Diffusion uses precomputed examples and does not generate new arbitrary prompts. The CNN and Diffusion D3 visualization libraries are pinned and included locally in `vendor/`; other external resources are separate. Include `vendor/` when serving or deploying the labs.

The original CNN lab also loads Bulma 0.8.0 locally, byte-identical to its former CDN stylesheet. Run `python scripts/cnn_bulma_asset.py` to check the stylesheet and MIT license copy. Other external resources remain separate.

GAN Lab also loads dialog-polyfill 0.4.9, Material Design Lite 1.3.0 and the Chart.js 2.4.0 bundle from `vendor/ganlab/`. With those CDNs blocked, its Korean and English controls, training and chart updates were tested at the root and under a local project path. Fonts and other resources can still require internet access. Run `python scripts/gan_vendor_assets.py` to verify these local files and their license copies.

Transformer's ONNX Runtime uses WASM included in its build instead of the previous CDN override. In the tested Chrome configuration, a local WASM response and actual token generation succeeded at the root and under a local project prefix with the old runtime CDN blocked. Internet access for the tokenizer and redistribution terms for models and WASM are separate concerns. See the [runtime and asset inventory](third-party-licenses/transformer-resources.md).

A skip link at the beginning of the page supports keyboard navigation. In the original Transformer lab, Enter or Space opens the GELU, dropout, layer normalization and residual connection explanations; closing the card returns focus to the selected diagram. The explanation card's previous and next buttons and progress slider also support keyboard operation. Choosing a chapter moves focus to its content. This applies to the integrated course navigation and does not mean that every original lab interaction is keyboard-accessible.

## Credits and licenses

See [LICENSES.md](LICENSES.md), the [license copies and inventories](third-party-licenses/), and each original project's README. Include `.gitignore`, `.gitattributes`, `scripts/`, `patches/`, `vendor/` and `third-party-licenses/` when sharing the project through Git. Do not treat the current work as a cleared deployment package: source-code licenses do not independently establish rights for every model, image, font, external resource or bundled dependency.

## Development checks

The commands listed in the [Korean README](README.md#개발-확인) include source restoration checks, numerical tests, license inventory checks and browser tests. The browser tests default to Chrome on Windows. On another system, install Playwright Chromium with `npx playwright install chromium` or set `CHROME_PATH` to a Chrome executable. `python scripts/test_project_path.py` builds in an isolated temporary directory and runs the full browser test under a project prefix; it requires free space for a copy of the Transformer model. The full browser test runs the local Transformer model in the browser and needs internet access for the tokenizer and external resources, as well as sufficient memory and time. Automated tests do not cover every browser, accessibility requirement or deployment environment.

To test an existing local server, set `$env:MODEL_ATLAS_TEST_URL = 'http://127.0.0.1:8765'` in PowerShell before `npm run test:browser:full`, then clear it with `Remove-Item Env:MODEL_ATLAS_TEST_URL`. Only local HTTP addresses with an explicit port are accepted.
