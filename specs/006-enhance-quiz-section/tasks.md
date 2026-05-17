# Tasks: Enhance Quiz Section

**Input**: Design documents from `/specs/006-enhance-quiz-section/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story (P1 → P2 → P3) so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1 = minimum-word guard · US2 = four-option quiz · US3 = results review

---

## Phase 1: Setup

**Purpose**: No new files or dependencies needed — all changes are in-place edits of existing modules. This phase confirms the working environment.

- [X] T001 Verify backend tests pass baseline in `backend/tests/` (`cd backend && pytest tests/ -q`)
- [X] T002 [P] Verify frontend tests pass baseline in `frontend/tests/` (`cd frontend && npm test -- --run`)

---

## Phase 2: Foundational (Backend Constant Change)

**Purpose**: Raise `MINIMUM_VOCABULARY_COUNT` from `4` to `10` in the backend service. This is the single shared prerequisite that all user-story work (and all existing generate-endpoint callers) depends on.

**⚠️ CRITICAL**: Must be merged before Phase 3 so the frontend receives the correct 409 error payload.

- [X] T003 In `backend/src/services/quiz.py` change `MINIMUM_VOCABULARY_COUNT = 4` to `MINIMUM_VOCABULARY_COUNT = 10`
- [X] T004 In `backend/src/services/quiz.py` update the `generate_quiz` error message string to read `"Insufficient vocabulary. Need at least 10 vocabulary entries to generate quiz. Current: {vocab_count}"` (so it matches the contracts/api.md spec)
- [X] T005 In `backend/src/api/quiz.py` update the `validate_quiz_prerequisites` 409 error detail to read `f"Insufficient vocabulary. Need at least 10 entries to generate quiz. Current: {vocab_count}"`

**Checkpoint**: Backend constant updated — frontend guard and quiz flow can now be implemented.

---

## Phase 3: User Story 1 — Minimum Word Count Guard (Priority: P1) 🎯 MVP

**Goal**: Replace the frozen/stuck state with a clear, friendly error message when the learner has fewer than 10 words.

**Independent Test**: Navigate to Quiz tab with 0–9 words → error message appears immediately showing current count and required count (10). Navigate with ≥10 words → no error, quiz start screen shown.

- [X] T006 [US1] In `frontend/src/components/Quiz/QuizComponent.jsx`, add a `wordCount` state variable initialised to `0`; in `fetchWords`, after `setWords(response.data.slice(0, 100))` also call `setWordCount(response.data.length)`
- [X] T007 [US1] In `frontend/src/components/Quiz/QuizComponent.jsx`, replace the `startQuiz` guard `if (words.length === 0)` with `if (words.length < 10)` and set the error to `\`You need at least 10 words to take a quiz. You currently have ${words.length}.\``
- [X] T008 [US1] In `frontend/src/components/Quiz/QuizComponent.jsx`, in the `quizState === 'start'` render block, add an inline guard above the start form: when `!loading && words.length < 10`, render a `<div className="quiz-error" role="alert">` displaying `You need at least 10 words to start a quiz. You currently have {words.length}. Please add more words first.` and do not render the start form or Start button
- [X] T009 [US1] In `frontend/tests/quiz.test.jsx`, add a test `'shows error when fewer than 10 words'` that mocks `vocabularyService.getAllWords` to return 7 words, renders `<QuizComponent />`, and asserts the error message text is visible and no Start Quiz button is rendered
- [X] T010 [US1] In `frontend/tests/quiz.test.jsx`, add a test `'shows start screen when 10 or more words available'` that mocks `vocabularyService.getAllWords` to return 10 words and asserts the Start Quiz button is rendered with no error message

---

## Phase 4: User Story 2 — Multiple-Choice Four-Option Quiz (Priority: P2)

**Goal**: Wire the existing `/api/v1/quiz/generate` endpoint into the quiz flow so that each question shows the German word and exactly four shuffled answer options. The learner can select one option per question, advancing to the next without any correctness feedback.

**Independent Test**: With ≥10 words, start a quiz — each question shows 4 options; selecting any option activates a "Next" button without green/red colouring; clicking Next moves to the next question; after the final question the results screen is shown.

- [X] T011 [US2] In `frontend/src/services/quizService.js`, verify `generateQuiz` calls `GET /api/v1/quiz/generate?count=<n>` (no change needed if already correct per contracts/api.md — read and confirm only)
- [X] T012 [US2] In `frontend/src/components/Quiz/QuizComponent.jsx`, add state variables: `questions` (array, default `[]`), `quizId` (string, default `null`), `userAnswers` (array, default `[]`)
- [X] T013 [US2] In `frontend/src/components/Quiz/QuizComponent.jsx`, replace the `startQuiz` function body: import `quizService` from `../../services/quizService`; call `quizService.generateQuiz(totalQuestions)`; on success store `response.data.quiz_id` in `quizId`, `response.data.questions` in `questions`, reset `currentQuestion` to `0`, `userAnswers` to `[]`, `score` to `0`, and transition `quizState` to `'quiz'`; on error (including 409) set `error` to `'Failed to start quiz. Please ensure you have at least 10 words.'`
- [X] T014 [US2] In `frontend/src/components/Quiz/QuizComponent.jsx`, rewrite the `quizState === 'quiz'` render block to use `questions[currentQuestion]` (a full question object from the API) instead of deriving options from `words[]`; pass the question object as a `question` prop to `<QuizQuestion />`
- [X] T015 [US2] In `frontend/src/components/Quiz/QuizComponent.jsx`, update the `handleAnswer` function signature to `handleAnswer(selectedOptionIndex)` which receives the integer index chosen by the learner; compute `isCorrect = selectedOptionIndex === questions[currentQuestion].correct_answer_index`; push `{ question: questions[currentQuestion], selectedOptionIndex, isCorrect }` onto `userAnswers`; if not last question increment `currentQuestion`; if last question call `quizService.completeQuiz(...)` (fire-and-forget) then transition to `'results'`
- [X] T016 [US2] In `frontend/src/components/Quiz/QuizQuestion.jsx`, rename the internal `showFeedback` state to `hasSelected`; set it to `true` on `handleSelectAnswer`; keep it as the gate for showing the Next button but **do not** pass it to `<AnswerOptions>` as a feedback-reveal prop during the quiz
- [X] T017 [US2] In `frontend/src/components/Quiz/QuizQuestion.jsx`, update `onAnswerSelected` call to pass only `selectedOptionIndex` (integer) — `onAnswerSelected(index)` — instead of the full object; update the prop type usage in parent accordingly
- [X] T018 [US2] In `frontend/src/components/Quiz/AnswerOptions.jsx`, add a `reviewMode` boolean prop (default `false`); in `getButtonStyle`, only apply the green/red colouring when `reviewMode === true`; during normal quiz (`reviewMode === false`) a selected option shows the highlight blue only, not green or red
- [X] T019 [US2] In `frontend/tests/quiz.test.jsx`, add a test `'renders four options per question'` that mocks `quizService.generateQuiz` to return a quiz with one question having `options: ['Cat','Dog','House','Tree']`; renders `<QuizComponent />`; starts the quiz; asserts all four option texts are visible
- [X] T020 [US2] In `frontend/tests/quiz.test.jsx`, add a test `'no green/red feedback shown during quiz after selecting option'` that selects an option and asserts the correct-answer colour class / inline style is NOT applied to any option button

---

## Phase 5: User Story 3 — End-of-Quiz Results Review (Priority: P3)

**Goal**: After the last question is answered, show a per-question review screen: German word, learner's answer, correct answer, and a visual correct/incorrect indicator. Provide buttons to restart or go to the words list.

**Independent Test**: Complete all questions → results screen shows every question with the German word, selected meaning, correct meaning, and a green/red indicator. Score summary is visible. "Take Another Quiz" and optional "Go to Words" buttons are present.

- [X] T021 [P] [US3] In `frontend/src/components/Quiz/QuizComponent.jsx`, replace the `quizState === 'results'` render block with a full review screen: show a score header (`score / totalQuestions` and `percentage%`); map `userAnswers` array into a per-question card showing `question.german_word`, `question.options[selectedOptionIndex]` (learner's choice), `question.options[question.correct_answer_index]` (correct answer), and a green ✓ or red ✗ indicator based on `isCorrect`
- [X] T022 [P] [US3] In `frontend/src/components/Quiz/QuizComponent.jsx` results render block, add a `className` or inline style using `colors.SUCCESS` / `colors.ERROR` from `../../services/colors` to visually distinguish correct (green border/background) from incorrect (red border/background) question cards
- [X] T023 [US3] In `frontend/src/components/Quiz/QuizComponent.jsx` results render block, add a "Take Another Quiz" button (`onClick={() => { setQuizState('start'); setUserAnswers([]); setQuestions([]); }}`) and a "Go to Words" button if the parent page provides a navigation callback prop (add an optional `onNavigateToWords` prop; render the button only when the prop is provided)
- [X] T024 [US3] In `frontend/tests/quiz.test.jsx`, add a test `'results screen shows each question with german word, selected answer, and correct answer'` that pre-populates `userAnswers` state (via completing a mocked quiz flow) and asserts each question's German word, the learner's chosen option text, and the correct option text are all visible on the results screen
- [X] T025 [US3] In `frontend/tests/quiz.test.jsx`, add a test `'results screen shows correct count and Take Another Quiz button'` that asserts the score summary text and the Take Another Quiz button are rendered

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Backend test coverage for the constant change; final verification.

- [X] T026 [P] In `backend/tests/contract/test_quiz.py`, update any assertion that checks `MINIMUM_VOCABULARY_COUNT` or the 409 error message text to expect `10` (instead of `4`) and the new message string
- [X] T027 [P] In `backend/tests/integration/test_quiz.py`, update any fixture or assertion that seeds fewer than 10 words to seed exactly 10 so the generate endpoint succeeds; add a test that seeds 9 words and asserts `GET /api/v1/quiz/generate` returns HTTP 409
- [X] T028 Run `cd backend && pytest tests/ -q` and confirm all tests pass
- [X] T029 Run `cd frontend && npm test -- --run` and confirm all tests pass

---

## Dependencies (Story Completion Order)

```
T001, T002  (baseline)
     ↓
T003–T005  (backend constant — Phase 2, foundational)
     ↓
T006–T010  (US1: word-count guard — can ship as standalone MVP)
     ↓
T011–T020  (US2: four-option quiz — depends on US1 guard logic in QuizComponent)
     ↓
T021–T025  (US3: results review — depends on userAnswers accumulated in US2)
     ↓
T026–T029  (Polish: backend tests + final run)
```

US2 and US3 phases within the same phase can have their sub-tasks parallelised (different files).

---

## Parallel Execution Examples

**Phase 3 (US1)**: T009 and T010 (frontend tests) can be written in parallel with T006–T008 (component changes) because they target the same file but different functions — coordinate to avoid conflicts.

**Phase 4 (US2)**: T016 (`QuizQuestion.jsx`) and T018 (`AnswerOptions.jsx`) are fully independent — different files, no mutual dependency.

**Phase 5 (US3)**: T021 and T022 are both in `QuizComponent.jsx` results block — write together in one pass. T024 and T025 (tests) can be written simultaneously.

**Phase 6**: T026 and T027 are independent backend test files — fully parallel.

---

## Implementation Strategy

**MVP**: Complete Phases 1–3 (T001–T010). This alone eliminates the freezing bug and gives users a clear, actionable error state — deliverable without the new quiz format.

**Full feature**: Complete all phases T001–T029.

**Incremental delivery order**:

1. T003–T005: Backend constant (1 file change, immediately deployable)
2. T006–T010: US1 guard (3 component lines + 2 tests)
3. T011–T020: US2 quiz flow (5 component files + 2 tests)
4. T021–T025: US3 results review (1 component block + 2 tests)
5. T026–T029: Cleanup + final validation
