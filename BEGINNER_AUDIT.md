# Beginner learning audit

Audience: a high-school student who can do arithmetic, but has not studied machine learning, vectors or calculus. This is an editorial and functional audit, not evidence of a learner study.

## Practice answers and interview rehearsal (2026-10-29)

- `learning-checks.js` adds worked solutions and causal explanations for all 47 concept examples, plus sample explanations, a specific follow-up question/answer and a self-assessment rubric for those concepts and all six units. Insufficient information and open-ended model selection are identified explicitly instead of inventing a unique numerical answer.
- `practice-answers.js` covers all 48 module-based labs and the two inline metrics/K-means labs. Each has a task, answer or expected observation, and a completion criterion. The six main calculators point to their live stepwise results; four original-lab sections explain how to compare cursor values and controlled changes. Fixed hand checks are labeled separately from current control values. The six introductory experiments explicitly label their live calculated answers.
- Correctness review covered gradient sign versus parameter direction, overshooting, convolution versus averaging, attention weights versus token probabilities, GRU gate convention, exact toy denoising versus generation, diversity versus GAN loss, train/test leakage, and retrieval versus generation. RAG practice answers describe the actual top-one selection, tie rule and out-of-vocabulary fallback; hit@2 remains a separate concept example.
- Primary documentation cross-checks: [PyTorch GRU convention](https://docs.pytorch.org/docs/stable/generated/torch.nn.GRU.html), [PCA principal axes](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html), and [time-aware cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html#cross-validation-of-time-series-data). Existing concept and lab references remain in place.
- `node tests/test_learning_checks.mjs`: passed. Independently checks numerical examples against lab engines, discovers lab headings from source, requires all 50 guides to render, and opens every concept/unit answer in KO/EN at 390/1440px under root and `/course` hosting. Checks keyboard disclosure, live updates, no page overflow, math rendering, unique interview IDs, direct section focus and lazy original loading. Inspected mobile and desktop answer/interview screenshots.
- Regression checks passed: `tests/smoke.mjs`, `tests/test_unit_navigation.mjs`, `tests/test_concepts.mjs`, `tests/test_extended_concepts.mjs`, `tests/test_first_steps.mjs`, and `tests/test_calculation_rail.mjs`. The rail test includes real independent scrolling at 390/1024/1440px. Publication audit: 12 tests, one environment-dependent skip.
- Review: output text is escaped, native details preserve keyboard operation, no new dependencies or upstream/model changes, and bounded content registries follow the existing static rendering architecture. This checks authored content and functionality, not measured comprehension or interview success.

## Acceptance checks

- Introduce the task, input and desired output before the model vocabulary.
- Explain each new symbol in words and with a small numerical example before relying on it.
- Show what changes, what stays fixed, the resulting calculation, and why that result follows.
- Connect each introductory example to the existing full calculation and original lab; mark toy examples explicitly.
- Give a prediction question and an explanation of the answer, including common misconceptions.
- Keep Korean and English, keyboard access, narrow screens, and the independently scrolling calculation rail working.
- Make the practice target explicit; distinguish a numerical answer, an observed relationship and an open-ended outcome.
- Offer a worked answer and an interview follow-up without implying that reading them establishes understanding.

## Audit findings and follow-up

- [x] Foundations: technical terms appear before their meaning; derivative rules arrive before a difference quotient. Add a concrete first prediction and build the prerequisite sequence from arithmetic.
- [x] CNN: explain pixel/channel/filter before convolution, and distinguish a learned weighted sum from an arithmetic mean.
- [x] RNN: explain a carried numerical state before recurrence and show why order changes the result.
- [x] Diffusion: explain the deliberately added random number, known training target, square-root coefficients and inverse arithmetic before denoising notation.
- [x] Transformer: explain token/vector, score versus mixing weight, normalization and the square-root scale before the full attention formula.
- [x] GAN: explain two separately changing functions and the direction passed through the fixed discriminator; a high score is not proof of quality.
- [x] Advanced derivations and original cursor help: give nearby definitions for their prerequisite vocabulary and verify links return to the course from nested upstream paths.
- [x] Review the 47 concept-library entries: add a concrete situation, a causal explanation and prerequisite help before the existing definition; link back to the related model introduction.

Verification evidence is recorded below after implementation and browser inspection. No checklist item is complete merely because a heading or glossary entry exists.

## Core-path evidence (2026-10-28)

- `first-steps.js`: six contextual introductions, 24 steps, six controlled numerical experiments and six prediction questions. Inputs and fixed values are explicit; onward links reach the full calculations.
- `math-help.js`: 16 prerequisite lessons, available within all six introductions and 19 derivation topics, including original cursor cards. Derivatives start with a finite change ratio; root/variance, exp/log and matrix notation have numerical examples.
- `node tests/test_first_steps.mjs`: independent numerical checks plus all six chapters in Korean/English, keyboard, state retention, onward links, 390/1440px and root/project-prefix hosting. Passed. Inspected generated mobile Transformer and desktop foundation screenshots; split long introductory equations into separate lines.
- `node tests/test_beginner_routes.mjs` and `node tests/test_unit_navigation.mjs`: passed, including the new intro and math-help destinations.
- `node tests/test_formula_details.mjs`: passed, including 20,181 independent loss/gradient cases and all model detail entry points.
- `node tests/test_original_cursor.mjs`: passed for four real originals, two languages, two viewport widths and two hosting prefixes; also the embedded CNN. Expanded prerequisite text stays within the viewport, and original controls remain functional.
- `node tests/smoke.mjs`: passed. No new dependencies, no changes to original model weights or upstream code.

## Concept-library evidence (2026-10-28)

- `concept-first-steps.js`: all 47 existing entries have a bilingual concrete case and an explanation of why the result or method follows. Sixteen entries include typeset numerical equations. No existing definition, lab, PDF curriculum mapping or source link was removed.
- Reviewed numerical examples and distinctions: classification accuracy versus recall; support/confidence/lift; squared-weight penalties; K-means centers; gradient norm clipping; noise prediction versus image recovery; attention mixing versus next-token probability; discriminator score versus sample quality.
- Clarified the reduced GAN formula: with no discriminator bias, D(0) stays 0.5. The example demonstrates a generator update, not full discriminator training.
- `node tests/test_concept_first.mjs`: passed for all 47 entries in Korean/English at 390/1440px and root/project-prefix hosting, including keyboard disclosure and actually following an introductory-section link.
- `node tests/test_concepts.mjs` and `node tests/test_extended_concepts.mjs`: passed for the existing interactive library, including PCA, TF-IDF, IoU, language/state retention and mobile layout. The latter test server now serves the local math vendor directory; it waits for the lesson rather than the loading placeholder.
- The concept page now explicitly loads local KaTeX and math styles. Inspected mobile metric and desktop scene-reconstruction screenshots after that correction.
- `node tests/test_calculation_rail.mjs`: passed for five models, independent scrolling, live calculation groups, language/state and 390/1024/1440px at both hosting paths.
- Checked foundational research descriptions against the [attention paper](https://arxiv.org/html/1706.03762v7), [BERT](https://arxiv.org/abs/1810.04805), [BART](https://arxiv.org/abs/1910.13461), [NeRF](https://arxiv.org/abs/2003.08934) and [CAM](https://arxiv.org/abs/1512.04150). Existing reference links remain available in the course.

- `node tests/browser.mjs --full`: passed across the learning path and real originals, including CNN controls, GAN training, Transformer token generation, local math fonts and failure/retry behavior.
- `python -X utf8 tests/test_publication_audit.py`: passed (12 tests, one environment-specific skip).

These checks establish beginner-oriented content coverage, numerical consistency and interface behavior. They are not measured comprehension results from actual students.
