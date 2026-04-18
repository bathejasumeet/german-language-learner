---
description: "Task list for German Language Learning App"
---

# Tasks: German Language Learning App

**Input**: Design documents from `/specs/001-german-language-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend/ and frontend/ project structure per implementation plan
- [x] T002 Initialize Python FastAPI backend in backend/ with Docker support
- [x] T003 Initialize React frontend in frontend/
- [x] T004 [P] Add .env.example files for backend and frontend
- [x] T005 [P] Add README.md files for backend and frontend
- [x] T006 [P] Configure linting and formatting (black, isort, flake8 for backend; eslint, prettier for frontend)
- [x] T007 [P] Add .gitignore and Dockerfile for backend, docker-compose.yml at repo root
- [x] T008 [P] Setup db/ directory for PostgreSQL Docker volume (mountable, committable)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T009 Setup PostgreSQL database via Docker Compose, mount db/ for persistence
- [x] T010 [P] Configure backend database connection using environment variables
- [x] T011 [P] Implement backend database models for Word, Flashcard, Quiz, Progress in backend/src/models/
- [x] T012 [P] Setup SQLAlchemy and Alembic for migrations in backend/
- [x] T013 [P] Implement backend API routing and error handling in backend/src/api/
- [x] T014 [P] Setup environment variable management for backend and frontend
- [x] T015 [P] Add initial test scaffolding: pytest for backend, Jest for frontend
- [x] T016 [P] Add LLM-based test generation script (Ollama compatible) in backend/tests/llm/
- [x] T017 [P] Add LLM-based test generation script (Ollama compatible) in frontend/tests/llm/

---

## Phase 3: User Story 1 - Add and Manage Vocabulary (Priority: P1) 🎯 MVP

**Goal**: Users can add, edit, delete, and view German words and meanings
**Independent Test**: Add/edit/delete a word and verify in database and UI

### Tests for User Story 1

- [x] T018 [P] [US1] LLM-generated contract tests for add/edit/delete word API in backend/tests/contract/test_words.py
- [x] T019 [P] [US1] LLM-generated integration tests for vocabulary CRUD in backend/tests/integration/test_words.py
- [x] T020 [P] [US1] LLM-generated frontend tests for vocabulary UI in frontend/tests/words.test.js

### Implementation for User Story 1

- [x] T021 [P] [US1] Implement Word model in backend/src/models/word.py
- [x] T022 [P] [US1] Implement CRUD API endpoints for words in backend/src/api/words.py
- [x] T023 [P] [US1] Implement vocabulary service logic in backend/src/services/vocabulary.py
- [x] T024 [P] [US1] Implement React components for vocabulary list and word form in frontend/src/components/Words/
- [x] T025 [P] [US1] Implement Redux or context state for vocabulary in frontend/src/services/vocabulary.js
- [x] T026 [US1] Add validation and error handling for word input (backend and frontend)
- [x] T027 [US1] Add logging for vocabulary operations in backend/src/services/vocabulary.py

---

## Phase 4: User Story 2 - Create and Use Flashcards (Priority: P2)

**Goal**: Users can generate and study flashcards from their vocabulary
**Independent Test**: Generate flashcards and use them in a study session

### Tests for User Story 2

- [x] T028 [P] [US2] LLM-generated contract tests for flashcard API in backend/tests/contract/test_flashcards.py
- [x] T029 [P] [US2] LLM-generated integration tests for flashcard study flow in backend/tests/integration/test_flashcards.py
- [x] T030 [P] [US2] LLM-generated frontend tests for flashcard UI in frontend/tests/flashcards.test.js

### Implementation for User Story 2

- [x] T031 [P] [US2] Implement Flashcard model in backend/src/models/flashcard.py
- [x] T032 [P] [US2] Implement flashcard API endpoints in backend/src/api/flashcards.py
- [x] T033 [P] [US2] Implement flashcard service logic in backend/src/services/flashcards.py
- [x] T034 [P] [US2] Implement React components for flashcard study in frontend/src/components/Flashcards/
- [x] T035 [P] [US2] Implement state management for flashcards in frontend/src/services/flashcards.js
- [x] T036 [US2] Add validation and error handling for flashcard study (backend and frontend)
- [x] T037 [US2] Add logging for flashcard operations in backend/src/services/flashcards.py

---

## Phase 5: User Story 3 - Track Progress and Test Knowledge (Priority: P3)

**Goal**: Users can track progress and take quizzes on practiced words
**Independent Test**: Complete a quiz and view progress stats

### Tests for User Story 3

- [x] T038 [P] [US3] LLM-generated contract tests for quiz/progress API in backend/tests/contract/test_quiz.py
- [x] T039 [P] [US3] LLM-generated integration tests for quiz and progress in backend/tests/integration/test_quiz.py
- [x] T040 [P] [US3] LLM-generated frontend tests for quiz/progress UI in frontend/tests/quiz.test.js

### Implementation for User Story 3

- [x] T041 [P] [US3] Implement Progress and Quiz models in backend/src/models/progress.py, backend/src/models/quiz.py
- [x] T042 [P] [US3] Implement quiz and progress API endpoints in backend/src/api/quiz.py
- [x] T043 [P] [US3] Implement quiz/progress service logic in backend/src/services/quiz.py
- [x] T044 [P] [US3] Implement React components for quiz and progress in frontend/src/components/Quiz/
- [x] T045 [P] [US3] Implement state management for quiz/progress in frontend/src/services/quiz.js
- [x] T046 [US3] Add validation and error handling for quiz/progress (backend and frontend)
- [x] T047 [US3] Add logging for quiz/progress operations in backend/src/services/quiz.py

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T048 [P] Add accessibility and UX consistency checks for frontend
- [x] T049 [P] Add performance profiling for backend and frontend
- [x] T050 [P] Add security review and dependency audit
- [x] T051 [P] Add end-to-end test scripts for full user flows (LLM-generated)
- [x] T052 [P] Update documentation and usage examples in backend/README.md and frontend/README.md
- [x] T053 [P] Review .env.example files and ensure all config is via env vars
- [x] T054 [P] Final code review and constitution compliance check

---

## Dependencies

- Phase 1 → Phase 2 → User Stories (Phases 3-5, in parallel after foundation)
- Each user story phase is independent and can be tested/delivered incrementally
- Polish phase can run in parallel with final user story completion

## Parallel Execution Examples

- T004, T005, T006, T007, T008 can run in parallel after T001-T003
- All [P] tasks within a phase can be parallelized if file paths do not overlap
- User story phases (3-5) can be developed/tested in parallel after foundation

## Implementation Strategy

- MVP: Complete Phase 1, Phase 2, and User Story 1 (P1)
- Incremental: Add flashcards (P2), then progress/tracking (P3)
- All tasks are independently testable and mapped to user stories
