# Beginner learning audit

Audience: a high-school student who can do arithmetic, but has not studied machine learning, vectors or calculus. This is an editorial and functional audit, not evidence of a learner study.

## Acceptance checks

- Introduce the task, input and desired output before the model vocabulary.
- Explain each new symbol in words and with a small numerical example before relying on it.
- Show what changes, what stays fixed, the resulting calculation, and why that result follows.
- Connect each introductory example to the existing full calculation and original lab; mark toy examples explicitly.
- Give a prediction question and an explanation of the answer, including common misconceptions.
- Keep Korean and English, keyboard access, narrow screens, and the independently scrolling calculation rail working.

## Audit findings and follow-up

- [x] Foundations: technical terms appear before their meaning; derivative rules arrive before a difference quotient. Add a concrete first prediction and build the prerequisite sequence from arithmetic.
- [x] CNN: explain pixel/channel/filter before convolution, and distinguish a learned weighted sum from an arithmetic mean.
- [x] RNN: explain a carried numerical state before recurrence and show why order changes the result.
- [x] Diffusion: explain the deliberately added random number, known training target, square-root coefficients and inverse arithmetic before denoising notation.
- [x] Transformer: explain token/vector, score versus mixing weight, normalization and the square-root scale before the full attention formula.
- [x] GAN: explain two separately changing functions and the direction passed through the fixed discriminator; a high score is not proof of quality.
- [x] Advanced derivations and original cursor help: give nearby definitions for their prerequisite vocabulary and verify links return to the course from nested upstream paths.
- [ ] Review the remaining extended concepts for unexplained prerequisite jumps after the six core paths are improved.

Verification evidence will be added after implementation and browser inspection. No checklist item is complete merely because a heading or glossary entry exists.

## Core-path evidence (2026-10-28)

- `first-steps.js`: six contextual introductions, 24 steps, six controlled numerical experiments and six prediction questions. Inputs and fixed values are explicit; onward links reach the full calculations.
- `math-help.js`: 16 prerequisite lessons, available within all six introductions and 19 derivation topics, including original cursor cards. Derivatives start with a finite change ratio; root/variance, exp/log and matrix notation have numerical examples.
- `node tests/test_first_steps.mjs`: independent numerical checks plus all six chapters in Korean/English, keyboard, state retention, onward links, 390/1440px and root/project-prefix hosting. Passed. Inspected generated mobile Transformer and desktop foundation screenshots; split long introductory equations into separate lines.
- `node tests/test_beginner_routes.mjs` and `node tests/test_unit_navigation.mjs`: passed, including the new intro and math-help destinations.
- `node tests/test_formula_details.mjs`: passed, including 20,181 independent loss/gradient cases and all model detail entry points.
- `node tests/test_original_cursor.mjs`: passed for four real originals, two languages, two viewport widths and two hosting prefixes; also the embedded CNN. Expanded prerequisite text stays within the viewport, and original controls remain functional.
- `node tests/smoke.mjs`: passed. No new dependencies, no changes to original model weights or upstream code.

The extended concept library audit remains in progress. These checks establish content coverage and behavior, not measured comprehension by actual students.
