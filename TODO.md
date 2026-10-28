# Model Atlas — implementation

- [ ] Explain mathematical signs and operators at their actual formula steps, add a bilingual gradient-direction experiment with exact loss checks, validate the course and publication contents, and upload the reviewed source to a new public ch040602/model-atlas repository.

- [x] Move CNN/RNN/Transformer's existing connected-calculation lists into a sticky right rail with its own scroll region, without duplicate IDs. Show Diffusion's five and GAN's two independent live exercise groups using the exact rendered steps and current values, with keyboard links back to each exercise. Bound the history above the lesson on narrower screens and retain full-window formula navigation and inputs. Remove the square brand mark from course, library, credits and reader. Reproduced Escape reopening an underlying operator after the narrower layout hid a concept card; suppress stationary-pointer reopening until intentional pointer movement or activation. Reviewed state ownership, source/group separation, escaped headings, unique IDs/result attributes, scroll boundaries and native keyboard access. Passed calculation-rail, formula-workspace, formula-browser, architecture, unit-navigation, learning-order/sidebar, concepts, numerical formula and smoke checks. Verified real wheel and Home-key scrolling without moving the lesson, all five models, all 82 formula operations, 256 numerical cases, Korean/English, 390/1024/1440px and root/prefix hosting. Inspected desktop/mobile screenshots and the real server at port 63551; confirmed live next-step synchronization in all seven Diffusion/GAN exercise groups. Physical devices and screen readers were not tested.

- [x] Finalize lessons as guide, concepts and symbols, architecture and connected formulas, calculation exercises, original lab and review. Put mathematical prerequisites first, splitting before single-example/mini-batch training, and CLIP/cross-attention before condition dropout and guidance. Add three persistent sidebar formula starts that preserve adjusted model inputs, including inputs changed in the standalone reader; move library starts ahead of its long concept list. Remove top bars from course, library, credits and reader and move brand/language controls into the sidebar. Reviewed shared link escaping, scoped layout, deep-link whitelist, focus, state retention and single lazy original frames. Passed learning-order/sidebar, unit-navigation, beginner-route, architecture, concepts, credits, formula-workspace, typesetting, formula-browser, numerical formula and smoke checks and bootstrap pin checks. Verified all 82 operations, 256 numerical cases, 492 typeset presentations, Korean/English, 390px/1440px, root/prefix, keyboard, standalone restart and actual original-article links. Inspected desktop/mobile renders and confirmed the real server at port 63551 with no page errors or horizontal overflow. Physical devices and screen readers were not tested.

- [x] Refine the course, concept library, credits and standalone reader using the Meta DESIGN.md reference recorded in DESIGN.md. Place synchronized explanations and symbol roles on the left, equations and growing calculations on the right; stack them on narrow screens. Add 25 bilingual concept cards with definitions, typeset formulas and examples, accessible by actual math hover, keyboard focus and touch, including original-article reference cards. Keep popovers above clipped math, allow pointer entry, pinning, Escape and outside dismissal, and preserve accessible MathML. Correct an invisible KaTeX depth strut intercepting denominator hover. Reviewed scoped styles, popup lifecycle, escaping, unchanged calculations and state-preserving links. Passed workspace, formula, typesetting, formula-browser, architecture, unit-navigation, beginner-route, concepts, credits and smoke tests and bootstrap pin checks. Coverage includes 256 numerical cases, 492 typeset presentations, all 82 operations, Korean/English, 390px/1440px, root/prefix, emulated touch and actual original articles. Inspected desktop/mobile layouts and help cards; verified all six chapters, concepts and credits on the live server. Physical devices and screen readers were not tested.

- [x] Typeset all 82 CNN/RNN/Transformer journey operations, architecture details, substitutions, carried results, expanded histories, summaries, standalone pages and original-article reference cards with local KaTeX 0.16.22. Author symbolic fractions explicitly; display stacked numerators/denominators, roots, indices, sum limits and matrices. Preserve numerical calculations, clarify parentheses around negative powers/products, and confine wide equations to horizontal scrolling. Preserve software/font notices. Reviewed fraction boundaries, forward/backward notation, escaping, disabled trusted commands, scoped styles and unchanged vendor assets. Verified 492 bilingual/default/negative/zero/activation presentations with strict TeX, visible numerator/rule/denominator geometry and root placement, local fonts with remote requests blocked, 390px/1440px and root/prefix layouts. Checked all 82 rendered result numbers/signs, controls, keyboard, state-preserving full-window pages and actual original-article panels. Passed numerical formula, formula browser, typesetting, architecture, unit-navigation and smoke tests and bootstrap pin checks. Inspected desktop/mobile journeys, full summaries and the real original reference panel; confirmed the live server's main Transformer page. Physical devices and screen readers were not tested.

- [x] Expand CNN (20 operations), RNN (21) and Transformer (41) into continuous numerical formula journeys with symbol roles, actual dependency links, substitutions, results, purposes, growing equation histories and full-window state-preserving reading. Include convolution versus averaging, RNN state propagation/BPTT, attention scaling and a separate dimension comparison, and final Transformer normalization and vocabulary head. Link to matching original article paragraphs with a read-along formula/result panel; stabilize asynchronous article anchors until reader interaction. Verified 256 independent numerical cases, gradients by finite differences away from nondifferentiable points, every operation, keyboard focus, shared controls, full-window reload/language/input preservation, original anchors and narrow-screen reference cards in ko/en at 390px/1440px and root/prefix paths. Inspected desktop/mobile journeys, full-window reading and actual original reference panels; checked all three journeys on the live Python server. Passed smoke, formula, formula-browser, architecture, unit-navigation, beginner-route, sequence-parameter and Transformer-block tests, the full original-lab browser suite including actual GPT-2 token generation and failure/retry behavior, Transformer build, bootstrap pin checks and all four patch restorations. These remain illustrative models; the Transformer journey expands the forward pass and target loss, not its full numerical backward pass. Physical devices and screen readers were not tested.

- [x] Add visible CNN, unfolded RNN and Transformer architecture diagrams with selectable steps, corresponding formulas and worked values linked to the existing exercises. Display feature-map dimensions and values, shared recurrent states and weights, and Transformer residual paths. Place the existing original CNN/Transformer lab inside the architecture section without duplicating its frame. Verified numerical results and bidirectional controls, every diagram step, keyboard focus, original rendering and horizontal controls, Korean/English, 390px/1440px and root/project-prefix paths. Inspected rendered diagrams and actual original CNN/Transformer screenshots. Passed smoke, unit-navigation, beginner-route, architecture, early-stopping, RNN parameter-preview, Transformer-block and the full browser suite, including original GPT-2 token generation and failure/retry behavior. Confirmed all three diagrams on the live Python server. Physical devices and screen readers were not tested.

- [x] Fix the blank startup experience for direct HTML opening and occupied local ports. Reproduced Chrome's file-module block and an empty response on port 8765, added a Windows launcher and loopback server using an available port, and left startup help visible if scripts fail. Checked two simultaneous launches, the launcher's browser address using an intercepted browser command, direct-file and blocked-script help, and the real bilingual course in Chrome. The full browser suite passed against the new Python server, including all four upstream labs, GAN training and Transformer token generation. The automatic launch was intercepted in the test; an actual desktop browser launch was not checked.

- [x] Connect the Diffusion beginner route through CLIP pretraining and cross-attention to the original visualization, distinguishing independent toy vectors from saved original data. Checked the route, calculations, keyboard focus and both languages at 390px and 1440px under root and a local prefix; passed CLIP gradient and browser, Diffusion calculation and original article, and smoke regressions. The route test substitutes the original iframe; actual devices and screen readers were not tested.

- [x] Clarify target leakage in teacher forcing and distinguish it from the identity-matrix toy inputs; connect the Transformer beginner route to input/target alignment and generation. Compared all 3,362 slider and mask combinations, output, loss and gradients with PyTorch autograd; checked masked/unmasked displays, bilingual keyboard route and navigation at 390px and 1440px under root and local prefix, finite differences, token sequence and smoke regressions. Physical devices and screen readers were not tested.

- [x] Correct CNN ReLU cancellation at zero and max-pooling tie handling at floating-point error scale; explain the zero-gradient convention and tolerance in both languages. Compared all 9,261 slider combinations against integer arithmetic for pre-activations, both loss gradients, maxima and selected position; checked nonzero and distinct cases, bilingual browser behavior at 390px and 1440px with root and local prefix, convolution/pooling, beginner-route and smoke regressions. Physical devices and screen readers were not tested.

- [x] Run the full integrated Chrome workflow with the real upstream labs. CNN and Diffusion iframes, GAN training and pretrained model, Transformer model token generation, Korean and English formulas, mobile width and simulated tokenizer/model failure recovery passed. Pinned source checks and all four patch restorations passed. Corrected the test log to call the GAN counter an iteration rather than an epoch; syntax checked that text-only change after the run. This does not establish asset redistribution rights or coverage of every device and screen reader.

- [x] Clarify how beginner-route learners open the original labs. Checked the four lab headings stay closed until activated and open or close with keyboard after route navigation in Korean and English, at 390px and 1440px under root and a project prefix; passed unit-navigation and smoke regressions. The focused route test substitutes lab pages, so it does not verify the original applications or model downloads; physical devices and screen readers were not tested.

- [x] Connect the RNN sequence and output-layer exercises in the page and beginner route. Verified route and unit navigation with keyboard in both languages at mobile and desktop widths, root and project prefix where supported; passed numerical gradient, output interaction and smoke checks. Corrected a stale early-stopping entry in the unit-navigation test. Actual devices and screen readers were not tested.

- [x] Add a bilingual in-site credits and license page naming original projects and authors, summarizing MIT and Apache 2.0 conditions, and linking the original notices and asset inventories. Verified the course and concept links, keyboard language switch and persistence, linked local files, root and project-prefix paths, and 390px and 1440px layouts in both languages; passed course and concept regressions and inspected a mobile rendering. The page records unresolved asset rights, not redistribution clearance; physical devices and screen readers were not tested.

- [x] Align the original Diffusion article's Korean and English explanations of latent refinement, classifier-free guidance and scheduler updates with the CompVis DDIM implementation. Checked the article in both languages at 390px and 1440px under root and a local prefix, the four real guidance controls and example, translation and smoke regressions, bootstrap and all four patch restorations. The visualizer selects saved results; physical devices and screen readers were not tested.

- [x] Clarify that GAN background colors represent discriminator scores rather than ground truth, and give the graph-layer checkboxes bilingual accessible names. Checked keyboard toggles, synchronized display layers and labels in both languages at 390px and 1440px under root and a local project prefix; passed translation, distribution keyboard, bootstrap and four-patch restoration checks. Actual screen readers and physical devices were not tested.

- [x] Add a bilingual ROC threshold exercise showing classifications, confusion counts, ROC coordinates, precision and AUC with tied scores. Compared all 21 thresholds and the complete curve with scikit-learn, including a tie and undefined precision; checked keyboard, language-state retention, search, root and local prefix at mobile and desktop widths, concept and smoke regressions, and inspected a mobile rendering. The fixed synthetic scores do not evaluate a classifier; physical devices and screen readers were not tested.

- [x] Explain the Diffusion text-vector diagram's saved values and unverified word alignment, and handle failed or stale data requests. Checked all 13 selectable prompts for valid saved entries; verified loaded numbers and keyboard prompt changes in both languages at mobile and desktop widths, plus embedded views. Tested missing data, HTTP failure, recovery and a late failed request in English; passed Diffusion regressions, smoke, bootstrap and all four patch restorations. Actual screen readers and physical devices were not tested.

- [x] Add a bilingual neural style-transfer concept and interactive feature-space calculation, connecting content and Gram-matrix style losses to an update and the official PyTorch tutorial and source. Compared 374 cases and gradients against PyTorch autograd; checked spatial-swap invariance, zero step, keyboard, language-state retention, search, root and project-prefix paths, mobile and desktop layout, extended concept navigation, concept and smoke regressions. Inspected a mobile rendering. The toy updates abstract features, not image pixels; the external tutorial was linked but not run, and real devices and screen readers were not tested.

- [x] Correct GAN Lab's displayed hidden-layer counts to match the actual generator and discriminator, while preserving pretrained checkpoint configuration. Fixed the overlapping noise-control hit area and checked layer buttons, bounds, noise selection and checkpoint restoration against actual weight arrays in both languages at 390px and 1440px. Passed GAN loss, responsive, translation, missing-checkpoint, smoke, bootstrap and all four patch-restoration tests. Physical devices and screen readers were not tested.

- [x] Distinguish the Diffusion refiner's fixed noise illustration from the selected step's prediction in Korean and English, and explain the scheduler's role below the diagram. Verified the static image and note across prompt and step changes, opening and closing, standalone 390px and desktop, both embedded languages, rendered desktop screenshots, previous-latent, guidance, comparison, article, translation, smoke, bootstrap and all four patch restorations. Real devices and screen readers were not tested.

- [x] Keep the Diffusion refiner's previous and current latent images synchronized through prompt, seed, guidance and display-step changes, including previews. Reproduced the paused keyboard-prompt mismatch, then checked Korean and English, steps 1, 30 and 50, keyboard selections, simulated previews and a pointer preview, plus guidance, comparison, translation, smoke, bootstrap and all four patch restorations. Tests use the saved example images rather than running a diffusion model.

- [x] Add Korean and English keyboard entry to five Transformer matrix calculation panels. Verified focus, Escape, nested help, panel switching, pointer controls and close-button visibility at 390px and 1440px, plus existing attention-path, attention-toggle, translation and smoke regressions, build, bootstrap and all four patch restorations. Model shards were blocked in focused browser tests; actual devices and screen readers were not tested.

- [x] Align GAN Lab discriminator loss display and chart with its training objective and preserve zero values. Compared both loss modes with instrumented actual optimizer calls in Korean and English at mobile and desktop widths, including zero and single-model steps; checked loss formulas, translation, metrics, slow-training regression, smoke and all four patch restorations. Bar lengths retain their original scaling; real devices and screen readers were not tested.

- [x] Add a bilingual Bernoulli naive Bayes walkthrough using word presence and absence, class priors, smoothing and normalized scores. Compared all 16 configurations with exact rational arithmetic and the smoothed cases with scikit-learn; verified keyboard, language-state retention, search, mobile and desktop widths, local project prefix, concept and smoke regressions. The eight toy messages do not evaluate generalization; actual screen readers and devices were not tested.

- [x] Identify illustrative Transformer vector colors in bilingual tooltips. Verified all six tooltip locations and their dimensions in desktop Chrome with model shards blocked, built the app, and passed translation, smoke, bootstrap and all four patch restoration checks. Hover-only tooltips were not tested with screen readers or physical devices.

- [x] Correct the bilingual Transformer sampling card to explain the implemented top-k and top-p sequence and show a numeric renormalization example. Compared the example with the original top-p implementation, built the app, checked both card languages, keyboard focus and layout, exercised top-p controls, and passed translation, smoke and four-patch restoration checks. Card layout was checked in desktop Chrome; actual screen readers and mobile devices were not tested.

- [x] Make GAN Lab's distribution choices keyboard accessible with bilingual names and current selection state. Tested Tab, focus indication, Enter, Space, pointer selection, opening drawing and a scratch update in Chrome for both languages at 390px and 1440px under root and local project prefix; ran GAN asset/training, translation, smoke and all four patch restoration checks. Drawing still requires a pointer, and actual screen readers and devices were not tested.

- [x] Add a bilingual Vision Transformer patch-to-token walkthrough with an editable toy image, shared projection and positional embeddings. Checked all patches against independent matrix calculations, equal-patch positional differences, language state, keyboard, search, course navigation, mobile width and local project prefix; ran concept, extended concept, beginner route and smoke regressions. Updated a stale beginner route test to include the previously added early-stopping exercise. The example does not run an encoder or classify images; physical devices and screen readers were not tested.

- [x] Add a bilingual XOR MLP training exercise with full-batch backpropagation through both layers. Checked 13 parameter states, all gradients and simultaneous updates, and 500 steps against PyTorch float64; verified training, zero rate, limit, reset, keyboard, language, mobile, local project prefix, concept and prior XOR regressions. The starting weights are selected for the lesson and the four training points do not assess generalization.

- [x] Add a bilingual XOR walkthrough with selectable inputs and activation, stepwise calculations, and a linear-separability explanation. Verified all eight input/activation cases against independent formulas, search and concept navigation, language state, keyboard and table scrolling at mobile width, root and local project prefix, plus concept and smoke regressions. Fixed the concept regression's stale overfitting-exercise link expectation. The weights are hand-designed, not trained.

- [x] Add a bilingual early-stopping exercise using real toy gradient updates and validation checkpoints. Compared all patience settings with an independent analytic solution; verified keyboard, restore, language state, overfitting concept link, mobile-width and local project-prefix navigation, split and smoke tests, and the browser regression suite. The synthetic splits deliberately differ and do not establish generalization.

- [x] Make the original Transformer attention matrix expansion and collapse operable from a bilingual keyboard button. Verified expansion through all calculation stages, accessible state, focus and mouse interactions in Chrome at 390 and 1440 px in both languages, plus build, related regressions and restoration of all four patches. Model shards were blocked for the focused browser test; actual screen readers and mobile devices remain untested.

- [x] Add bilingual logistic-regression training with probability, cross-entropy, gradients and simultaneous updates. Checked 100 steps against PyTorch float64 and 15 parameter states with finite differences; exercised separate evaluation, zero learning rate, limit, keyboard, language, search, mobile and local project prefix. The synthetic evaluation cannot establish generalization.

- [x] Extend the Transformer next-token exercise with adjustable target probability, sequence likelihood and perplexity; connect the bilingual concept library. Checked 16 settings against PyTorch float64, Korean and English state, keyboard, concept search and links, mobile and project prefix, plus course regressions. This uses an illustrative table and does not train GPT-2.

- [x] Connect global L2 gradient clipping to the RNN sequence-training update and bilingual concept library. Checked 50 gradients, norms, clipped gradients and updates against PyTorch float64 (allowing its 1e-6 denominator epsilon), zero and threshold cases, keyboard, language and last-update state, concept links, mobile and project prefix, RNN regressions and unit navigation. This four-sequence toy does not establish training stability or generalization.

- [x] Replace CNN's externally loaded control icons with local symbols and fit the image dialog to small screens. Verified keyboard playback, close and image-dialog controls with external requests blocked, Korean and English at 390px and 1440px, root and local project prefix, existing translation, softmax and convolution regressions, and all four restored patches. System fonts can change symbol appearance; the wide network diagram still needs horizontal scrolling on small screens.

- [x] Replace CNN article's ReLU and softmax formulas with bilingual native MathML and remove the unpinned MathJax CDN request. Verified Chrome fraction rendering and accessible names with external requests blocked, Korean and English at 390px and 1440px, root and local project prefix, existing CNN translation and softmax controls, and all four restored patches. Actual screen readers and other browsers were not tested.

- [x] Add a bilingual interactive SGD, momentum and Adam comparison with repeated updates and bias correction on a shared toy loss. Compared 68 optimizer steps and accumulated states against PyTorch, including rate changes and zero rate; tested keyboard, language, reset, the 195-to-200 step boundary, mobile, and concept navigation. This deterministic toy does not demonstrate mini-batch noise.

- [x] Add a bilingual, repeatable toy RNN next-token classification exercise connecting recurrent states, softmax, cross-entropy and full-batch BPTT. Checked 13 parameter states and all gradients against PyTorch and finite differences, plus loss reduction, keyboard, Korean and English, state preservation, reset, update limit, mobile, smoke, navigation and existing RNN training. The four fixed synthetic examples are not natural language training or a generalization evaluation.

- [x] Add an interactive bilingual CAM calculation connecting two feature maps, global average pooling, signed spatial scores, class bias and logit for the lecture’s weak-localization topic. Compared 75 weight/bias cases with PyTorch pooling and linear layers, checked bias invariance, keyboard controls, Korean and English state, search and mobile, existing concept and course regressions, and rendered layout. This toy is not a real image or CNN run.

- [x] Correct the original Transformer calculation popovers to match GPT-2 pre-normalization, GELU, final normalization and 3,072-component MLP compression in both languages. Verified source model order and dimensions, production build, rendered formulas and keyboard help in Korean and English at desktop and mobile widths, attention and translation regressions, smoke checks and restoration of all four upstream patches. Diagram colors remain illustrative.

- [x] Add a bilingual repeatable RNN sequence-memory training exercise with four training and four held-out sequences, full-batch BPTT and explicit limitations. Verified finite differences, 10 losses and 50 gradients against PyTorch autograd, simultaneous updates, separate evaluation behavior, 0 learning rate, update limit, reset, bilingual state, keyboard, mobile, unit navigation and RNN regressions. This small fixed evaluation does not prove generalization.

- [x] Add bilingual, chapter-specific beginner routes connecting concepts, concrete experiments, original tools when present, and knowledge checks. Verified every destination and keyboard focus across all chapters and languages, 390px and desktop layouts, root and local project prefix, original-lab lazy loading, existing navigation and smoke tests; inspected mobile and desktop route screenshots.

- [x] Add a bilingual TF-IDF retrieval-to-context exercise with no-match and tie cases. Verified all IDFs and scores against scikit-learn and closed-form calculations, bilingual selection state, keyboard and 390px layout. It does not run a generator or implement a full RAG pipeline.

- [x] Make GAN Lab tutorial chapters keyboard-accessible timestamp links, seeking the embedded player when ready and following the link when unavailable or failing. Verified blocked and delayed players, simulated ready and error events, failed seeks, modified clicks, an intercepted external fallback, both languages and project paths, responsive article and GAN training, and all upstream patch restoration. Actual YouTube playback was not tested.

- [x] Make the original Diffusion article’s return-to-top control a native keyboard-accessible button and return focus to the header. Verified Enter, Space and pointer, focus indication, both languages, desktop and mobile standalone widths, embedded app, root and local project paths, existing comparison and translation behavior, and restoration of all four upstream patches.

- [x] Review PDF vision pages 99–158 at topic level and add bilingual pose and tracking, 3D novel-view synthesis, and visual question answering concepts with illustrative calculations and primary references. Verified extended-path sequence, search, bilingual pages and mobile widths, concept navigation, smoke tests, and upstream checkout checks. Fine details of slide diagrams and actual model runs remain outside this review.

- [x] Connect the GAN two-mode example to the original 30×30 grid smoothing and non-normalized JS calculation. Compared KL and JS with the actual evaluator at all 21 slider values, independently checked the 900-cell normalization relationship, and verified bilingual keyboard interaction, responsive layout, original article, guide regressions and patch restoration. Values use assumed proportions, not live model samples.

- [x] Make CNN tutorial chapters keyboard accessible in both languages and provide timestamp links if the embedded YouTube player is not ready or fails. Tested blocked, delayed, ready, player-error and failed-seek paths with a simulated player, a real fallback popup request intercepted before the network, modified clicks, both languages and project paths, and restoration of all upstream patches. Actual external video playback was not tested.

- [x] Explain in the original CNN convolution detail that its displayed values are one input-channel contribution; the preactivation sums all channels and the output-channel bias. Checked the actual convolution functions with two channels and nonzero bias, Korean and English keyboard navigation for two channels at root and project prefix, rendered detail layout, existing guide and scroll regressions, and restoration of all upstream patches.

- [x] Add a bilingual adversarial-example concept and step-by-step FGSM numerical exercise. Verified input gradients with finite differences and PyTorch autograd, budget and threshold including the tie, loss and predictions, both languages, keyboard, search, navigation, mobile layout and concept regressions. The exercise is a two-input toy classifier; other PDF image details remain to be checked.

- [x] Make the original GAN Lab article readable on small screens while keeping its wide interactive visualization scrollable and functional. Verified Korean and English at 390px and 1440px, figure sizing, keyboard scrolling, an actual generator weight update, integrated links, existing GAN regressions and restoration of all upstream patches. One navigation run had a transient scroll-position assertion failure; an immediate rerun passed.

- [x] Improve publication fingerprint reporting with project/reason summaries and an optional complete list, and add the derived CRLF fingerprint of CNN's nn_10.json. Verified mixed assets beyond the 100-match display limit, overlapping associations, incomplete scans, both Git and Windows bytes, pinned-manifest reconstruction, and actual CNN and Transformer build scans. This is not a full rights audit; one symlink test was unavailable on this Windows account and the junction test passed.

- [x] Add a bilingual Skip-gram negative-sampling walkthrough showing scores, loss, gradients and simultaneous vector updates. Checked 32 cases against finite differences and PyTorch autograd, repeated interactive updates, zero learning rate, both languages, navigation state, keyboard, mobile layout and concept regression. This is a single-pair example, not full-corpus Word2Vec training.

- [x] Compare PDF topics with the current curriculum and add a bilingual language and vision learning path, TF-IDF and IoU exercises, and links to external labs. Checked calculations against scikit-learn and independent geometry, bilingual navigation and mobile layouts, existing course regressions, and external lab access. Image-only slide details are only partially reviewed; remaining coverage limits are recorded in CURRICULUM_AUDIT.md.

- [x] Add a bilingual decision-tree split and prediction lab with Gini impurity and threshold comparison; checked every candidate and prediction against independent arithmetic, a best split against scikit-learn, empty and tied cases, sidebar search, bilingual state, keyboard, mobile layout and existing concept and smoke tests. This illustrates only the first split.

- [x] Validate first-time restoration and builds in a separate clean project copy on the same Windows computer; all four pinned checkouts and patches restored, build and root npm ci succeeded, full Chrome browser suite covered actual Transformer generation and GAN training, and bootstrap check and the RNN parameter test passed. A different machine and deployed hosting remain untested.

- [x] Extend the RNN training walkthrough with an independent preview of simultaneous input-weight, recurrent-weight and bias updates; checked 324 cases against independent numerical gradients, both loss modes, zero rate, simultaneous forward recomputation, bilingual keyboard interaction, mobile layout, navigation and smoke tests.

- [x] Diagnose missing original lab entry pages and provide bilingual setup and retry guidance without blocking normal embeds; verified all four labs, 404/410, successful and inconclusive retries, network and unsupported HEAD behavior, lazy loading, both languages, project-prefix hosting and mobile layout. This checks entry pages only.

- [x] Add a bilingual dropout example showing a selected mask, probability, training scaling, expectation and evaluation behavior; verified all eight masks at four probabilities, 400 sampled PyTorch outputs, evaluation identity, bilingual state, keyboard interaction, mobile display and concept navigation.

- [x] Add a bilingual batch-normalization exercise showing training-batch statistics, running-statistic updates and evaluation without updates; verified six sequential PyTorch comparisons, independent arithmetic, bilingual state preservation, keyboard controls, mobile display, concept navigation and smoke tests.

- [x] Extend both Transformer block walkthroughs with adjustable layer-normalization scale and shift; checked 135 cases against PyTorch, 95 connected-block cases against an independent reference, and bilingual language-state preservation, keyboard controls, mobile layout, navigation and smoke tests.

- [x] Add a bilingual interactive PCA projection and reconstruction exercise connecting a selected axis to retained variance and error. Verified 37 angles against an independent closed-form expression, first component and variance against NumPy eigendecomposition, orthogonal error conservation, bilingual keyboard interaction, mobile layout and navigation regression.

- [x] Connect nine concept pages to their directly related worked exercises; give other topics a general unit link without implying a dedicated model lab. Verified all links in both languages, keyboard focus, browser return, invalid and cross-unit targets, unrelated query preservation, project-prefix hosting, mobile viewport, unit navigation, deployment checks and smoke tests.

- [x] Map all 29 machine-learning and 46 deep-learning question IDs in the pinned ai-tech-interview answers to 28 bilingual concept pages; connect the sidebar, related units and two illustrative exercises. Verified the source inventory against the pinned files, attribution, metrics and K-means arithmetic including edge cases, both languages, search, history, mobile width, unit navigation, smoke tests and the existing browser regression. Some classical models are explained without an executable training lab.

## RNN sequence and learning walkthrough

- [x] Add a connected two-position Transformer block calculation from pre-normalization through two attention heads, output projection, residuals and MLP; verified 50 independent numerical cases, actual source order, shared and independent controls, both languages, mobile keyboard navigation and full browser regression. The examples are illustrative and do not train GPT-2.

- [x] Connect the Transformer single-head calculation to a bilingual multi-head concatenation and output-projection walkthrough; independently checked 16 input/mask states, both languages, keyboard controls, mobile navigation and appearance, and the browser regression suite. Head 2 and the output matrix are illustrative; the following block exercise is independent.

- [x] Replace the remaining Transformer MLP and next-token screenshots with bilingual, calculated examples and add both originals to the publication audit; verified original model alignment, independent arithmetic, both languages, mobile keyboard scrolling, production build, renamed-asset audit and patch restoration. Original PNGs remain in the static build and require rights review.

- [x] Add a responsive Transformer article reader linked from the course; verified both languages at 390px, keyboard-scrollable equations and tables, no model/tokenizer requests, return to the lab, production build and patch restoration. The original visualization itself remains wide.

- [x] Replace the Transformer attention screenshot with a bilingual two-token causal attention calculation and add the original to the asset audit; verified arithmetic, both languages, keyboard scrolling, build, renamed-asset detection and restoration. The original PNG remains in the static build.

- [x] Replace the Transformer Q/K/V screenshot with a bilingual worked projection example and add the original to the publication fingerprint audit; verified arithmetic, both languages, production build, renamed-asset audit and patch restoration. The original PNG remains in the static build.

- [x] Replace the Transformer embedding screenshot with an original bilingual numerical example, and add the unused original to the publication fingerprint audit; verified displayed arithmetic, both languages, production rendering, build, patch restoration and renamed-asset audit. The old PNG remains in the static build.

- [x] Align Korean lab-guide control names with the actual Diffusion, Transformer and GAN interfaces and distinguish GAN synthetic presets; verified rendered control names, integrated guide text, both languages, mobile navigation and GAN training.

- [x] Compare GAN Lab’s log and squared generator losses with the same toy discriminator, including gradients and separate updates; verified original model losses, finite-difference gradients, bilingual keyboard controls, mobile rendering, unit navigation and smoke.

- [x] Add a bilingual numerical guidance-scale example that follows original Diffusion controls; verified all four scale values, keyboard and dropdown synchronization, both layouts, smoke, full browser regression and patch restoration. Updated the outdated Transformer browser assertion to match the corrected attention diagram.

- [x] Make the Transformer attention-head diagram a consistent illustrative calculation and label model attention versus illustrative values and outputs; verified all displayed matrix products in both languages, rendered layouts, production build, smoke and patch restoration.

- [x] Make first-time source restoration retryable after fetch or checkout failure without touching existing checkouts; verified simulated failures and retry, incomplete and concurrently created checkout preservation, pinned GAN Lab restore from a local Git source, and all four patches.

- [x] Add a bilingual, stepwise scalar GRU calculation and comparison with LSTM; verified 80 cases against PyTorch GRUCell, keyboard and language switching, mobile layout, unit navigation, smoke and browser regression.

- [x] Provide a bilingual exact-value temperature selector synchronized with the original slider; verified keyboard interaction, Chrome accessible selected value, preset probability calculation, desktop layout, production build and patch restoration. Screen-reader behavior and live generation with the selector have not been separately tested.

- [x] Give Transformer temperature and sampling sliders bilingual accessible names, value descriptions and visible keyboard focus; verified real keyboard controls, Chrome accessibility descriptions, production build and patch restoration. Chrome exposes the temperature index as its value; screen-reader behavior remains untested.

- [x] Add an independent bilingual weight-and-bias gradient preview linked to the existing training example; verified finite-difference gradients, simultaneous updates, zero input, history independence, keyboard and language controls, mobile, smoke, navigation and the full browser regression suite.

- [x] Add a bilingual worked example for training, validation, model selection, and final test evaluation; verified independent losses, selection freeze, language and chapter navigation, mobile, repaired smoke harness, and the full browser regression suite.

- [x] Explain the upstream MIT and Apache 2.0 permissions and redistribution conditions in both languages, identify major asset-specific unknowns, and distinguish the project's own licensing status; verified the local and authoritative license texts, source inventories, links and root files.

- [x] Explain the five Transformer article screenshots in Korean and English, with descriptive alternative text and their relationship to the live model; verified both languages, guide screenshots, image loading, production build and patch restoration.

- [x] Connect a numeric RNN output layer to loss and time backpropagation in both languages; verified finite-difference gradients, simultaneous-update preview, language and chapter navigation, mobile layout, and browser regression.

- [x] Make the original CNN Softmax logit-to-formula comparison usable with keyboard controls in both languages; verified real values and network highlights, early selection during animation, hover restoration, focus cleanup, source patch restoration and browser regression.

- [x] Replace five GAN article figures with original schematic diagrams and bilingual alternative text and captions; verified visual rendering, both languages, root and project-prefix loading, original GAN training and controls, generated files, source patch restoration and asset inventory.

- [x] Add a bilingual numerical CLIP contrastive-learning walkthrough and connect its pooled training features to Stable Diffusion's token representations; independently checked symmetric loss and finite-difference gradients across all slider settings, both languages, navigation, keyboard and mobile, and the browser regression suite.

- [x] Include the replaced Diffusion CLIP photos in the publication fingerprint audit and detect damaged fingerprint indexes before scanning; verified renamed files, changed bytes, index corruption and both indexes against pinned Git objects.

- [x] Replace the two unverified CLIP illustration photos with original diagrams and localize their captions; verified both languages, layout, keyboard access, absence of photo requests, full browser regression and patch restoration.

- [x] Align the bilingual Transformer explanation cards with the actual pre-normalization, residual, GELU, output and dropout computation; checked numeric examples, both rendered languages, card navigation and focus, build and upstream patch restoration.

- [x] Add GELU to the bilingual Transformer block walkthrough with a selectable ReLU comparison; compared its tanh approximation with independently calculated exact-GELU values, verified both languages and selections, desktop and mobile layout, smoke and the browser suite.

- [x] Make GAN Lab train from scratch without fetching checkpoints, recover visibly from missing manifests or wrong-length weights, and ignore stale checkpoint responses; verified both languages and root/project paths, actual training, preserved configuration, changes during delayed loads, existing checkpoint loading and patch restoration.

- [x] Replace GAN Lab's four unverified selector images with generated distribution diagrams and its five article icons with text; verified original selectors, training and chart updates in both languages at root and under a project prefix, and updated rights records and patch restoration.

- [x] Explain the Transformer attention-head output formula and its indices in Korean and English, with an explicitly hypothetical weighted-sum example; verify the displayed popover, computation, build and patch restoration.

- [x] Set GAN Lab language and loading text before model initialization; verify query and stored preferences with initialization blocked, and confirm the full lab still works in both languages.

- [x] Correct the original CNN article’s nonlinearity claim in both languages, with a worked affine versus ReLU example and max-pooling caveat; verify rendered text, math, build and patch restoration.

- [x] Add bilingual in-unit navigation for concepts, math basics, worked examples, each lab, quizzes and original resources; verify all chapters, keyboard focus, chapter URL, language, lazy loading and mobile.

- [x] Add an integrated bilingual padding and stride walkthrough that shows padded inputs, each window, output values and the floor formula; verify all 270 settings, non-divisible and invalid configurations, language controls and mobile layout.

- [x] Add answer-specific Korean and English quiz feedback with per-page-visit selections; verify both languages, all chapters, keyboard operation, navigation, reload and mobile layout.

- [x] Pin CNN's Smooth Scroll distribution locally and retain source and license notices. Verify article jumps in both languages with the old CDN blocked at root and a project prefix, byte-preserving Windows checkout, full browser suite and patch restoration.

- [x] Align the original Transformer article's MLP residual path and final output normalization with the local model; verify both languages, model sequence, browser suite and patch restoration. Correct the Diffusion browser test's stale assumption about the prompt selected by its preceding pointer interaction.

- [x] Make Diffusion detail close and article links keyboard-operable, expose scheduler notes on focus, and keep the text diagram open when a prompt changes; verify Korean and English, pointer behavior and patch restoration.

- [x] Extend publication fingerprints to 37,955 pinned Diffusion asset paths and two CRLF JSON variants. Rebuilt the index from Git objects, checked renamed and modified files, invalid indexes and output limits, and scanned all 37,955 actual checkout assets; exact bytes still do not establish rights.

- [x] Add a bilingual mini-batch and epoch walkthrough with partial final batches, sequential updates and dataset loss at shared weights; verified analytical gradients against finite differences, all batch sizes, language and control changes, and mobile layout.

- [x] Make CNN detail-panel controls keyboard-operable in both languages and release animation timers on close; verified play, pause, hover, article focus, close, timer cleanup, patch restoration, bootstrap and browser suite.

- [x] Fix Transformer textbook page-entry race: reproduced stale callback reopening a closed embedding, canceled superseded callbacks, and verified delayed close and rapid navigation in both languages, browser suite, normal and audit builds, notices and patch restoration.

- [x] Add keyboard-accessible row and column selection to CNN convolution, ReLU and pooling output matrices; verify the selected cell and paused animation in Korean and English.
- [x] Make CNN diagram detail views keyboard-accessible with one tab stop per layer, arrow-key map selection, safe focus return, hidden-node handling and cancellation of interrupted Softmax transitions; test both languages and pointer interactions.

- [x] Correct bilingual original CNN max-pooling explanation against model topology; verified both rendered articles, original pooling on 4×4 and 5×5 inputs, build, browser suite, dependency notices, bootstrap and patch restoration.

- [x] Add a bilingual max-pooling forward and gradient walkthrough linked to the convolution feature map; checked unique and tied maxima, finite differences, negative gradients, source and language switching, mobile width, smoke and browser suite.

- [x] Correct GAN Lab layer-description toggles for nested text and add bilingual keyboard and pressed-state support. Rebuilt GAN Lab; checked all five layers, description clicks, Enter and Space, checkbox change synchronization, both languages, smoke, browser and patch restoration.

- [x] Make the Transformer embedding expansion and explanation links usable by keyboard with bilingual names and safe focus return. Built the original app; verified Korean and English expansion, explanation focus and return, mouse controls, smoke, translation, browser and patch restoration suites.

- [x] Add a bilingual stepwise token and learned-position embedding example before Transformer attention. Checked the upstream GPT-2 embedding and dropout order, both token orders, language and stage controls, desktop and mobile layouts, and the smoke and browser suites.

- [x] Add Korean meanings for the five original Transformer presets without changing actual model inputs or generated tokens; verified both languages, all five cached examples, keyboard selection and desktop/mobile dropdown layout. Build, smoke, translation, patch restoration and browser suites passed.

- [x] Make CNN overview layer labels and their roles understandable in Korean and English; retain actual identifiers in tooltips and verify both modes, article link, dimensions, non-overlap, model inference and both languages. Built CNN and passed smoke, CNN translation, patch restoration and browser suites; inspected both Korean layouts.

- [x] Serve CNN Bulma 0.8.0 locally with the npm license; confirmed npm/CDN byte identity, preserved hashes across Git checkouts, verified styling and real CNN use in both languages with the CDN blocked at root and a full project-prefix build, and passed patch restoration.

- [x] Explain Stable Diffusion v1 latent shapes, scaling, denoising and VAE decoding with a bilingual numerical walkthrough; clarify original visualization labels and verify math and browser behavior. Reviewed scalar reconstruction, text-to-image scope and mobile screenshots; bilingual browser, math, smoke, patch restoration and bootstrap tests passed.

- [x] Serve CNN's existing TensorFlow.js 1.0.0 bundle locally; verify npm/CDN byte identity, retain source-map dependency notices, and exercise actual inference with the old CDN blocked at root and project subpaths. CNN translation/hash, patch restoration, bootstrap and browser suites passed.

- [x] Add a bilingual numerical example linking condition-dropout training to classifier-free guidance. Reviewed both branch gradients against finite differences, p=0/1 and u=p boundaries, both language controls, and mobile layouts; smoke, Diffusion math and browser suites passed.

- [x] Make Diffusion denoiser and guidance-formula details keyboard accessible, synchronize guidance choices and comparison state, and verify both languages and original mouse interactions.

- [x] Localize CNN sample and class labels and numeric hover feedback; make image selection and its dialog keyboard accessible and verify real inference and both language views.

- [x] Make Transformer matrix help explanations wrap and work with keyboard focus; give each a bilingual accessible name and verify both languages in the running lab.

- [x] Detect the exact concatenated Transformer model in publication scans; verify its fingerprint against pinned Git objects and test renamed and modified files.

- [x] Correct CNN hyperparameter output sizes for non-divisible strides; explain the floor and validate inputs and both language views.

- [x] Add a bilingual Transformer temperature and top-k/top-p numerical walkthrough, matching the original sampling order and verifying cutoff, renormalization and both layouts.

- [x] Add a bilingual interactive LSTM gate, cell-state and fixed-gate gradient example; verify its math and browser controls.

- [x] Fix the Diffusion CLIP detail's keyboard state and make its text-encoder path keyboard-operable in both languages; verify nested Escape, comparison and mouse behavior.

- [x] Add a bilingual stepwise Transformer example comparing teacher-forced next-token loss with autoregressive generation; validate both generation paths and browser behavior.

- [x] Extend the publication fingerprint audit to the 63 pinned Transformer model chunks; verify renamed matches and document that transformed and reassembled models remain outside its scope.

- [x] Clarify in both GAN Lab articles that a gray discriminator heatmap does not establish distribution matching; verify the counterexample and both rendered views.

- [x] Add a bilingual two-mode GAN distribution example showing missing modes, exact Jensen–Shannon divergence, and why a fixed discriminator score alone cannot establish diversity; check edge cases and browser controls.

- [x] Load Transformer ONNX Runtime from its matching local build instead of the CDN; verify real generation with the CDN blocked at the root and a project subpath, and update resource notices.

- [x] Explain classifier-free guidance's actual combination formula and scales 0 and 1 in both Diffusion lab languages; verify the rendered panel and existing slider.

- [x] Investigate the Transformer floating explanation card overlapping the article when scrolled, and ensure the article and card controls remain usable in both languages.

- [x] Align bilingual Transformer Q/K/V, causal attention and numerical explanations with GPT-2 block inputs and head dimensions; verify the formulas and both rendered articles.

- [x] Correct Transformer article explanations of dropout, layer normalization and residual order in both languages using the GPT-2 implementation; verify the numerical examples and both rendered articles.

- [x] Bundle the locked KaTeX CSS and fonts, retain their notices, and verify both languages with the CDN blocked at the root and a project subpath.

- [x] Correct the original CNN article's flatten → dense logits → softmax sequence in both languages with a worked example; verify it against the shipped model and browser output.

- [x] Correct the CNN article's filter-sharing and hyperparameter explanations in both languages; verify the built article and existing interactive controls.

- [x] Restore and build the course in a clean Ubuntu environment and verify the local apps through a browser; document the environment and limitations.

- [x] Explain Diffusion comparison trajectories and projection limits bilingually; verify the actual displayed points and saved-example discrepancy.

- [x] Make Diffusion prompt comparison and trajectory zoom accessible by keyboard in both languages, including after changing prompts; verify real interactions and focus.

- [x] Vendor GAN Lab's exact Chart.js CDN bundle with checked third-party notices and verify chart updates with its CDN blocked.

- [x] Vendor GAN Lab's pinned dialog polyfill and Material Design Lite files with verified package integrity and notices; test the real controls with those CDNs blocked, including a project subpath.
- [x] Bring GAN Lab's English loss walkthrough in line with its Korean guide and clarify the unnormalized metric smoothing in both languages; check the actual implementation and both rendered views.
- [x] Add a bilingual numerical cross-attention walkthrough connecting text conditioning to Diffusion's denoiser; check calculations, controls and mobile layout.
- [x] Correct GAN Lab's 1D/2D noise and manifold explanations and iteration terminology in both languages; verify the actual 1D controls and visualization.
- [x] Distinguish CLIP contrastive pretraining from Stable Diffusion text conditioning, label the encoder diagram's numbers as illustrative, and verify both language panels.
- [x] Pin CNN's D3 v5 visualization dependency locally, retain notices for its bundled modules, and verify the original interactions with the D3 CDN blocked at the server root and a local project prefix.
- [x] Add a bilingual stepwise Transformer block example for layer normalization, attention residual, MLP and its residual; verify numerical edge cases and browser layout.
- [x] Add keyboard and bilingual accessible names to Diffusion's prompt, seed and guidance selection; verify selection, dismissal, visual focus, and original mouse behavior.
- [x] Make Diffusion's playback controls keyboard operable and give the buttons and display-step slider bilingual accessible names; verify play, pause, step and slider in both languages.
- [x] Add a bilingual numerical example of RGB input channels and multiple convolution output channels; verify both languages and mobile layout.
- [x] Add a reproducible publication-folder fingerprint audit for identified restricted and unverified upstream assets; check renamed copies and document what the audit cannot cover.
- [x] Clarify Diffusion's precomputed examples, display-step versus scheduler-timestep numbering, and the simplified noise-removal diagram in Korean and English; verify both lab views.
- [x] Correct Transformer prompt validation for empty input, whitespace, the 12-word boundary and a pending predicted token; verify Korean and English guidance and real generation.
- [x] Make Transformer explanation-card navigation usable with keyboard and bilingual accessible names; verify previous/next, progress, page selection, and card stability in the real lab.
- [x] Explain matrix dimensions, indices, partial derivatives and expectations with bilingual numerical examples; verify the new foundation material in both languages and at mobile width.
- [x] Translate the CNN convolution and output-layer diagram annotations into Korean, preserve English and verify the real interactions and layout.
- [x] Translate the shared GAN Lab implementation and developer-credit explanations into Korean while preserving author links, attribution, citation and English; verify the rendered language and links.
- [x] Connect the numerical walkthroughs to corresponding original-lab controls in Korean and English, including differences in data, parameters and training; verify both languages.
- [x] Audit GAN Lab figure and image references, replace the paper thumbnail and GitHub mark with text links, and verify attribution and both languages.
- [x] Repair the Diffusion guidance slider drag and verify all four values, the displayed selection and image paths in the browser.
- [x] Make the Transformer operation diagrams keyboard-operable and direct focus to the bilingual explanation card; verify each operation in Korean and English and restore the upstream patch.
- [x] Build Transformer in an isolated directory for a project subpath and test the integrated course and four labs from that subpath, including real model generation; preserve the normal root build.
- [x] Add an RNN per-step loss option alongside the final-state loss, show how direct and future gradients combine, and verify both modes numerically and in the bilingual browser.
- [x] Extend the Diffusion numerical walkthrough to a second deterministic reverse step with a separately supplied prediction; verify its equations and bilingual browser controls.
- [x] Clarify that GAN Lab arrows show the discriminator's input gradient, refresh them at updated sample positions, and verify them against numerical differences in a browser.
- [x] Localize the Transformer calculation-path hover guidance and verify the Korean and English messages and popover interactions in the browser.
- [x] Add a bilingual three-step scalar RNN exercise that reveals the forward pass, loss, backpropagation through time, and the effect of one weight update.
- [x] Add a bilingual RNN sensitivity exercise that unfolds up to 20 time steps, distinguishes the state-path derivative from the full weight gradient, and checks finite differences and mobile interaction.
- [x] Provide English setup, learning-exercise, limitations and attribution guidance alongside the Korean README; check commands and links against the current project.
- [x] Check analytic gradients against numerical differences and exercise the controls in Chrome, including a 390px viewport.
- [x] Add a bilingual CNN walkthrough showing a shared 2×2 filter at all four locations in a 3×3 input, including bias and ReLU.
- [x] Add a bilingual scalar Diffusion walkthrough connecting training noise and loss to an estimated clean value and one deterministic DDIM sampling step.
- [x] Add a bilingual Transformer attention walkthrough with vector dot products, an optional causal mask, softmax, and weighted value vectors.
- [x] Add a bilingual scalar GAN walkthrough of alternating discriminator and non-saturating generator updates, checking gradients numerically.
- [x] Translate remaining Diffusion article equations and comparison guidance plus selected text-encoder, denoising, and comparison-view explanations; verify both languages in the browser.
- [x] Translate the CNN educational article into Korean, preserving interactive hyperparameters, tutorial, attribution, and section links; verify Korean and English in the browser.
- [x] Translate CNN convolution, ReLU, pooling and Softmax detail panels and their input/output labels; exercise all four panels in Korean and ReLU in English.
- [x] Add a Korean Transformer article covering embeddings, attention, MLP, prediction, training and auxiliary layers; preserve anchors, original credits and English, and verify equations in Chrome.
- [x] Translate the GAN Lab guide and layer controls, explain its implemented losses numerically, and verify training and English in Chrome.
- [x] Identify the CNN header font restriction, replace its use with system fonts, and document the file that must be excluded from redistribution.
- [x] Compare ONNX Runtime 1.14 nested JavaScript source-map files with candidate package sources and retain available notices; record the unresolved guid-typescript attribution.
- [x] Compare the 1.23 ONNX prebundle against the audit build and retain its TensorFlow-derived source-map headers; record conflicting third-party guid-typescript attribution claims without treating them as verified.
- [x] Translate Transformer matrix and probability controls and auxiliary operation labels, distinguish illustrative matrix colors from model values, correct the GPT-2 output projection to omit bias, and cancel delayed animations on close.
- [x] Correct Transformer popover import casing for case-sensitive filesystems; inspect relative imports for further case-only mismatches.
- [x] Explain all fixed Diffusion prompt pairs in Korean without changing the model inputs or asset paths; verify selection and comparison and prevent the tooltip from intercepting clicks.
- [x] Add a labeled horizontal viewport and bilingual movement controls around each wide original lab; verify both ends at a 390px browser viewport and check for nested horizontal overflow.
- [x] Add a bilingual foundation exercise that repeats scalar gradient descent, displays the chain rule and actual loss history, and compares learning rates and zero input.
- [x] Reveal foundation forward, chain-rule, update-preview and evaluation calculations in four navigable stages; keep preview separate from actual updates and check both languages and mobile layout.
- [x] Compare CNN example JPEGs with the included training archive, record per-file hashes and matches, and document ImageNet's stated access conditions and unresolved model provenance.
- [x] Translate the Transformer attention stage labels and head controls; correct the output tooltip to follow the selected head, and verify switching heads and both languages in headless Chrome.
- [x] Clarify that Transformer blocks share a structure but learn separate weights, translate block navigation and Q/K/V labels, and verify both languages and label layout in Chrome.
- [x] Correct the attention softmax formula to normalize across keys for one query, explain causal masking and pre-dropout normalization in both languages, and compare the implemented attention weights with direct exponentiation.
- [x] Localize the course's keyboard navigation labels and iframe titles; move focus to a selected chapter, preserve the chapter URL when skipping to content, and verify both languages in Chrome.
- [x] Correct GAN Lab's destructive sample slicing and grid evaluation, retain zero-valued chart points, translate metric labels and configuration tooltips, and explain KL/JS with a bilingual numerical example. Verify grid cases and actual GAN training in Chrome.
- [x] Extend the bilingual CNN walkthrough from the four forward positions to a toy target loss and a shared-filter gradient update; check finite differences, the ReLU zero convention, and desktop/mobile browser interaction.
- [x] Add a separate class-label CNN path from global average pooling through softmax, cross-entropy and a shared-filter update; verify finite-difference gradients, bilingual controls and 390px layout.
- [x] Reveal RNN backpropagation one time step at a time, show numerical chain-rule terms and the sum for the shared weight, and add backward navigation; verify finite differences and bilingual desktop/mobile browser behavior.
- [x] Connect classifier-free guidance to the diffusion sampling walkthrough, show its separation from the training loss, and check scale 0, 1 and 2 plus bilingual browser controls.
- [x] Inventory the pinned Diffusion asset directories and external page references, and document the evidence and unresolved per-asset rights.
- [x] Connect the Transformer attention output to a two-token output head, cross-entropy and a toy weight update; explain the separate softmax distributions and causal-mask leakage, and verify the head gradient and bilingual browser behavior.
- [x] Backpropagate the same toy token loss through the attention weighted sum, Softmax and scores to the query projection; verify both query gradients numerically with and without masking and inspect bilingual desktop/mobile behavior.

- [x] Give CNN research links localized accessible names and hide decorative pointer icons from screen readers; verify both languages in the real app.
- [ ] Integrate and verify all four upstream tools locally, including their licenses and redistributed dependencies.
- [x] Inventory GAN Browserify bundle packages and retain their shipped notices; record observed HTML imports and GPT-2 provenance with explicit limits.
- [x] Inventory CNN JavaScript bundle dependencies using its source map and record separate HTML resource references, including the restricted local font.
- [x] Inventory Transformer audit-build JS source-map packages and retain ONNX Runtime notices; document GSAP terms, observed WASM fingerprint, model chunks and tokenizer-file comparisons.
- [x] Show bilingual Transformer tokenizer and model load failures with retry; verify preset examples remain usable after model failure and confirm real token generation.
- [x] Distinguish the Diffusion tokenizer diagram from actual CLIP tokenization, explain the 77-position limit including special tokens, and verify Korean and English in the browser.
- [x] Identify seven Diffusion SVGs marked Font Awesome Pro, replace used controller icons and the kit arrow, remove upstream analytics, and document excluded originals; verify controls and patch restoration.
- [x] Bundle D3 7.9.0 locally for Diffusion, record license texts for its 34 included packages, verify reproducible output and exercise the lab with the upstream D3 CDN blocked.
- [x] Add a separate evaluation example to the foundation training exercise, compare training and evaluation losses, and verify that changing the evaluation example preserves the training history in both languages and at a mobile viewport.
- [x] Translate GAN Lab loss and noise options without changing their internal values, and preserve the chosen loss when the model is recreated; verify both loss formulas and actual training after changing noise.
- [x] Extend the Diffusion walkthrough with a single-example scalar prediction-weight update; check the gradient by finite differences and clarify that sampling uses separately supplied predictions. Verify bilingual and mobile display.
- [x] Extend the Transformer walkthrough to calculate Q, K and V from input representations and projection matrices, connecting adjustable query weights to attention scores; verify numerical, bilingual and mobile behavior.
- [x] Prevent a normal GAN pause from training again, refresh its visualization without a loss point, and reject stale animation frames. Check immediate slow pause and resume.
- [x] Cancel suspended slow GAN iterations on reset or mode changes; verify full and partial updates, immediate resume, and pretrained visualization in the browser.
- [x] Preserve checkpoint weights while rendering a pretrained GAN, correct iteration and step-menu guidance, and compare model weights after each step type in the browser.
- [x] Fix embedded GAN drawing coordinates and add pointer input, localized empty-drawing alerts, and browser checks for resizing, emulated touch, release, and training.
- [x] Inventory GAN Lab synthetic runtime distributions and four pretrained checkpoint pairs, verify pinned Git blobs and tensor byte lengths, and record unresolved checkpoint provenance.
- [x] Remove CNN's unversioned external recommendation overlay and pin Transformer tokenizer requests to the audited Xenova commit; preserve remaining asset-rights questions.
- [x] Translate the Transformer embedding diagram labels and distinguish random vector stripes from available attention and probability results in both languages; inspect both rendered diagrams and test the original controls.
- [x] Calculate Transformer Top-p over the full vocabulary, keep an off-list sample visible and correctly highlighted, explain the displayed subset and cutoff in both languages, and preserve small nonzero probabilities. Test 50,257 logits, cutoff inclusion, both languages, browser interactions and popup bounds.
- [ ] Trace remaining CNN and Transformer prebundled dependencies and compiled WASM, guid-typescript attribution, upstream assets, CDN resources, and exact rights/provenance for Transformer model and tokenizer artifacts.
- [ ] Complete bilingual beginner lessons and interactive worked formulas for fundamentals, CNN, RNN, diffusion, transformer and GAN.
- [ ] Verify every chapter, language, numerical example, navigation, responsive layout, and local upstream tool in a browser; document limitations and startup.

## Checkpoint — 2026-10-27

- Four upstream projects are pinned; their license texts and integration patches are retained. `python scripts/bootstrap.py --check` verifies revisions and patches. `--build` completed in the working checkout and in fresh temporary Windows and Ubuntu 22.04 WSL checkouts on the same computer, including fresh dependency installation. Ubuntu used Node 22.20.0 and Corepack 0.34.0; its first Corepack download timed out and the build succeeded after retry. The full browser suite passed against the Ubuntu-built files served through WSL, using Windows Chrome, including GAN training and Transformer token generation. A separate computer has not been tested.
- CNN and Transformer production builds and a GAN browserify bundle were generated. Diffusion is a static app. Chrome tests exercised all four embedded apps, including GAN training and Transformer token generation. A local `/model-atlas-test/` project-path simulation passed the full browser test, including all 63 Transformer model chunks and generation; actual hosting remains untested.
- Each chapter has at least three bilingual worked explanations and two quiz questions, alongside its stepwise numerical exercise. All six chapters also have longer interactive walkthroughs; the foundation walkthrough repeats an update on one training example and records training and separately evaluated losses. The foundation chapter introduces nine math prerequisites and a worked matrix example. Four originals have bilingual usage guides. Each original has Korean translations for selected controls, CNN has a translated article, Diffusion has translated article text and selected detailed explanations, Transformer has 20 Korean textbook cards, a Korean article and selected Korean matrix and probability popovers, and GAN Lab has a Korean core guide with the actual implemented losses and translated layer descriptions. Some original descriptions and visualization labels still remain English.
- `node tests/smoke.mjs` exercises a DOM stub and calculations. `python tests/test_patches.py` checks that the patches reproduce the modified tracked files; `python tests/test_bootstrap.py` checks safe restoration using a small local repository. `node tests/test_deployment.mjs` checks prefix configuration, while `python scripts/test_project_path.py` builds in an isolated directory and exercises the local project path. `node tests/test_diffusion_translation.mjs` checks language selection and selected source-generated article output; `node tests/test_cnn_translation.mjs` checks CNN language selection and built labels; corresponding Transformer and GAN tests check language selection and built controls. The unit checks alone do not prove real-browser execution, layout, accessibility, or upstream app functionality.
- Headless Chrome provides visual and interactive inspection. Coverage is limited to the tested paths. A 390px browser viewport was tested with mouse-driven controls, not a physical touchscreen; some original interactions require a mouse. Full translation of original apps, comprehensive dependency and asset licensing, and testing on a different machine remain open; a clean separate copy on this Windows computer was restored and exercised successfully.
