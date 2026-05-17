# Implementation Plan: Enhance Quiz Section

**Branch**: `006-enhance-quiz-section` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/006-enhance-quiz-section/spec.md`

## Summary

Fix the quiz section so it shows a clear error when fewer than 10 words are available (instead of freezing), and replace the current flow with a proper four-option multiple-choice quiz where correctness is only revealed at the end via a per-question results review screen.

The backend already has a working `/api/v1/quiz/generate` endpoint that generates randomised four-option questions with shuffled answer positions. The changes are mostly frontend-side (QuizComponent, QuizQuestion, AnswerOptions) plus raising the backend `MINIMUM_VOCABULARY_COUNT` constant from 4 to 10.

## Technical Context

**Language/Version**: Python 3.11 (backend), JavaScript ES2022 / React 19.2.4 (frontend)  
**Primary Dependencies**: FastAPI 0.135, CSV file store (no new dependencies); React 19, Vite 8, Axios 1.15  
**Storage**: CSV files under `backend/data/` (no schema changes)  
**Testing**: pytest (backend), Vitest + React Testing Library (frontend)  
**Target Platform**: Local web app — browser (desktop-first)  
**Project Type**: Web application (FastAPI backend + React frontend)  
**Performance Goals**: Quiz generation < 200 ms; results screen renders immediately (no extra network call)  
**Constraints**: No new npm/pip dependencies; no new API endpoints; existing CSV data model unchanged  
**Scale/Scope**: Single-user app; quiz sessions up to 20 questions

## Constitution Check

_GATE: Checked before Phase 0 research and re-verified after Phase 1 design._

| Principle                        | Status | Notes                                                                                                  |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| I. Code Quality                  | PASS   | All changes are in existing modules; no dead code added                                                |
| II. Testing Standards            | PASS   | Backend unit test updated; frontend tests updated with meaningful assertions                           |
| III. User Experience Consistency | PASS   | Error state, quiz flow, and results screen follow existing design patterns (CSS classes, color tokens) |
| IV. Performance Requirements     | PASS   | No additional network round-trips; quiz data held client-side for results review                       |

No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/006-enhance-quiz-section/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── api.md           ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── services/
│   │   └── quiz.py          ← MINIMUM_VOCABULARY_COUNT 4 → 10; updated error message
│   └── api/
│       └── quiz.py          ← No changes (endpoint already correct)
└── tests/
    └── unit/
        └── test_quiz_service.py   ← Update constant test

frontend/
├── src/
│   └── components/
│       └── Quiz/
│           ├── QuizComponent.jsx   ← Word-count guard; generateQuiz(); deferred feedback; results review
│           ├── QuizQuestion.jsx    ← Remove immediate feedback; hasSelected flag
│           └── AnswerOptions.jsx   ← Remove green/red during quiz; add review-mode prop
└── tests/
    └── quiz.test.jsx               ← Updated tests for new flow
```

**Structure Decision**: Web application layout (Option 2). Both backend and frontend sub-projects are affected. No new files; all changes are in-place edits of existing modules.
