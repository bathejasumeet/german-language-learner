# Research: Enhance Quiz Section

**Feature**: 006-enhance-quiz-section  
**Date**: 2026-05-13  
**Status**: Complete — no NEEDS CLARIFICATION items remain

---

## R-001: Minimum Word Count — Current vs. Required

**Decision**: Raise `MINIMUM_VOCABULARY_COUNT` in `QuizService` from `4` to `10`.  
**Rationale**: The spec mandates that quizzes require at least 10 words. The backend constant already centralises this guard; only its value and the error message text need updating. The `/api/v1/quiz/generate` endpoint already propagates the HTTP 409 from this constant, so no route changes are needed.  
**Alternatives considered**: Enforcing the limit only in the frontend — rejected because the backend must be the authoritative source of truth.

---

## R-002: Quiz Generation — Which Endpoint and Service File to Use

**Decision**: The `QuizComponent` must be updated to call `quizService.generateQuiz()` from `frontend/src/services/quizService.js` (which targets `/api/v1/quiz/generate`) rather than `quizService.createQuiz()` from `frontend/src/services/quiz.js` (which targets the older `/api/v1/quiz/` endpoint).  
**Rationale**: `POST /api/v1/quiz/` creates a bare quiz record without question data. `GET /api/v1/quiz/generate` (already implemented in `backend/src/api/quiz.py`) returns a full `{ quiz_id, total_questions, questions[] }` payload with `options` and `correct_answer_index` for every question — exactly what the four-option UI needs. All quiz logic (random question order, random option order, distractor selection) is already correct in the backend service and requires no changes.  
**Alternatives considered**: Generating questions entirely client-side — rejected because the backend already has the complete, tested generation logic and avoids code duplication.

---

## R-003: Deferred Feedback — Component Architecture Impact

**Decision**: Remove the `showFeedback` / immediate-reveal behaviour from `QuizQuestion.jsx` and `AnswerOptions.jsx`. Answers are stored in component state within `QuizComponent` during the quiz phase; correctness is only surfaced on the results screen.  
**Rationale**: The spec explicitly requires no immediate right/wrong indication. The "Next" button must be enabled as soon as any option is selected, but option colouring must not change to green/red until the results screen.  
**Alternatives considered**: Keeping `showFeedback` and just removing the colour change — rejected because the same `showFeedback` flag also gates the "Next" button with a tooltip-style disabled state; a clean boolean `hasSelected` is simpler and avoids leaving dead props.

---

## R-004: Results Review Screen

**Decision**: Replace the existing minimal results card (`QuizComponent` results state) with a full per-question review list. The `QuizComponent` already accumulates answers in `answers[]` state — this array must be extended to store `{ questionIndex, selectedOptionIndex, correctOptionIndex, germanWord, selectedMeaning, correctMeaning }` per question so the results screen can render them without any additional API calls.  
**Rationale**: No new backend endpoint is required; all data is available client-side after the quiz completes. The `completeQuiz` API call (`/api/v1/quiz/complete`) should still fire for persistence but is not needed for the results display.  
**Alternatives considered**: Fetching question data from the backend on the results screen — rejected because it adds latency and a network dependency for purely read-back data already held in memory.

---

## R-005: Test Updates

**Decision**: Update the backend unit test for `MINIMUM_VOCABULARY_COUNT` and the frontend `quiz.test.jsx` to cover: (a) the < 10 word error state, (b) no immediate feedback during quiz, (c) per-question detail on the results screen.  
**Rationale**: Constitution principle II mandates tests for all user-facing logic. The existing tests have placeholder `expect(true).toBe(true)` stubs that must be replaced with meaningful assertions.  
**Alternatives considered**: Skipping test updates — rejected per constitution.
