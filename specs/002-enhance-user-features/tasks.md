# Tasks: Enhance User-Friendliness and Core Features

**Input**: Design documents from `/specs/002-enhance-user-features/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Feature Branch**: `002-enhance-user-features`  
**Scope**: 3 prioritized P1 user stories spanning backend (Python/FastAPI) and frontend (React)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- File paths: Backend paths use `backend/`, frontend paths use `frontend/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Establish project structure and tooling

- [ ] T001 Create Alembic migration directory structure in backend/ with version tracking
- [ ] T002 [P] Setup database migration script template for example_sentence column addition in backend/alembic/versions/
- [ ] T003 [P] Verify pytest configuration in backend/pyproject.toml includes test discovery for tests/ directory
- [ ] T004 [P] Verify frontend build and test tooling in frontend/package.json (vite, vitest available)
- [ ] T005 [P] Create colors utility file structure at frontend/src/services/colors.js (placeholder)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure all user stories depend on - **MUST COMPLETE BEFORE USER STORY WORK**

### Database & ORM Layer

- [ ] T006 Create and run Alembic migration to add `example_sentence VARCHAR(500)` column to vocabulary table in backend/alembic/versions/add_example_sentence.py
- [ ] T007 Create and run Alembic migration to create quiz_sessions table in backend/alembic/versions/create_quiz_sessions.py
- [ ] T008 Update Vocabulary ORM model in backend/src/models/models.py with `example_sentence: Mapped[Optional[str]]` field
- [ ] T009 Create QuizSession ORM model in backend/src/models/models.py with user_id, vocabulary_ids, answers_json, score, total_questions, duration_seconds fields

### Backend Services Foundation

- [ ] T010 Update vocabulary service in backend/src/services/vocabulary.py to handle example_sentence parameter in create/update functions
- [ ] T011 Create quiz service in backend/src/services/quiz.py with base quiz generation logic and distractor selection algorithm
- [ ] T012 Add validation logic in quiz service: require minimum 4 vocabulary entries to generate quiz (backend/src/services/quiz.py)

### API Schemas & Responses

- [ ] T013 Create response schema in backend/src/schemas_extended.py for Vocabulary with example_sentence field
- [ ] T014 Create response schema in backend/src/schemas_extended.py for QuizSession with score, total_questions, duration_seconds
- [ ] T015 [P] Create QuizQuestion schema in backend/src/schemas.py with id, vocabulary_id, question, options, correct_answer_index fields

### Frontend Foundation

- [ ] T016 Create centralized colors utility in frontend/src/services/colors.js exporting color constants (PRIMARY, SECONDARY, SUCCESS, ERROR, NEUTRAL, BACKGROUND, TEXT)
- [ ] T017 Create navigation state management structure in frontend/src/pages/Dashboard.jsx to support multiple tabs (Vocabulary, Words, Quiz, Flashcards)

**✅ CHECKPOINT: Foundation complete - User story implementation can begin**

---

## Phase 3: User Story 1 - Add Example Sentences to Vocabulary (Priority: P1) 🎯 MVP

**Goal**: Users can create and edit vocabulary entries with example sentences for better learning context

**Independent Test**: Create a vocabulary entry with all three fields (word, meaning, example), verify saving, then edit the example sentence and confirm changes persist

### Backend Implementation for US1

- [ ] T018 [P] [US1] Add example_sentence field to POST vocabulary request schema in backend/src/schemas.py (VocabularyCreate)
- [ ] T019 [P] [US1] Add example_sentence field to PUT vocabulary response schema in backend/src/schemas.py (VocabularyUpdate)
- [ ] T020 [US1] Update POST /api/words endpoint in backend/src/api/words.py to accept and persist example_sentence (calls vocabulary service create)
- [ ] T021 [US1] Update PUT /api/words/{id} endpoint in backend/src/api/words.py to update example_sentence field
- [ ] T022 [US1] Update GET /api/words endpoint response in backend/src/api/words.py to include example_sentence in vocabulary list
- [ ] T023 [US1] Update GET /api/words/{id} endpoint response in backend/src/api/words.py to include example_sentence in single entry response
- [ ] T024 [P] [US1] Add character validation in backend/src/services/vocabulary.py (max 500 chars for example_sentence)
- [ ] T025 [US1] Write integration test for vocabulary CRUD with example_sentence in backend/tests/integration/test_words.py

### Frontend Implementation for US1

- [ ] T026 [P] [US1] Create example_sentence input field in VocabularyForm component (frontend/src/components/VocabularyForm.jsx) with max 500 char counter
- [ ] T027 [P] [US1] Update VocabularyForm submission to send example_sentence in POST/PUT request to backend API (frontend/src/components/VocabularyForm.jsx)
- [ ] T028 [US1] Update vocabularyService.js to include example_sentence in createVocabulary() call (frontend/src/services/vocabularyService.js)
- [ ] T029 [US1] Update vocabularyService.js to include example_sentence in updateVocabulary() call (frontend/src/services/vocabularyService.js)
- [ ] T030 [P] [US1] Apply colors from colors.js to VocabularyForm inputs and labels (frontend/src/components/VocabularyForm.jsx)
- [ ] T031 [US1] Write unit test for VocabularyForm component rendering example sentence field (frontend/tests/unit/components/VocabularyForm.test.js)
- [ ] T032 [US1] Write integration test for full vocabulary creation flow with example sentence (frontend/tests/e2e/vocabulary-workflow.test.js)

**✅ CHECKPOINT: User Story 1 complete - Example sentences fully functional**

---

## Phase 4: User Story 2 - Reorganize Vocabulary Management (Priority: P1)

**Goal**: Move vocabulary list from Vocabulary tab to dedicated Words tab for better UX and reduced clutter

**Independent Test**: Navigate to Words tab, see vocabulary list, verify form accessible separately in Vocabulary tab, edit and delete entries from Words tab

### Frontend Implementation for US2

- [ ] T033 [P] [US2] Create VocabularyManager component in frontend/src/components/VocabularyManager.jsx to display vocabulary list with pagination (20 items per page)
- [ ] T034 [P] [US2] Add list features to VocabularyManager: display german_word, english_meaning, example_sentence; action buttons for View/Edit/Delete (frontend/src/components/VocabularyManager.jsx)
- [ ] T035 [US2] Add search/filter functionality to VocabularyManager to filter by german_word or english_meaning (frontend/src/components/VocabularyManager.jsx)
- [ ] T036 [US2] Create WordsTab page component in frontend/src/pages/WordsTab.jsx importing VocabularyManager
- [ ] T037 [US2] Update Dashboard.jsx navigation in frontend/src/pages/Dashboard.jsx to include Words tab between Vocabulary and Quiz tabs
- [ ] T038 [US2] Route Words tab navigation to WordsTab component (frontend/src/pages/Dashboard.jsx)
- [ ] T039 [US2] Remove vocabulary list display from VocabularyTab in frontend/src/pages/VocabularyTab.jsx (keep only form)
- [ ] T040 [US2] Add "Create New Word" button in WordsTab that redirects to Vocabulary tab (frontend/src/pages/WordsTab.jsx)
- [ ] T041 [P] [US2] Apply colors from colors.js to VocabularyManager list items and action buttons (frontend/src/components/VocabularyManager.jsx)
- [ ] T042 [US2] Write unit test for VocabularyManager rendering vocabulary list (frontend/tests/unit/components/VocabularyManager.test.js)
- [ ] T043 [US2] Write integration test for Words tab workflow (browse, edit, delete) (frontend/tests/e2e/vocabulary-workflow.test.js)

**✅ CHECKPOINT: User Story 2 complete - Dedicated vocabulary management UI functional**

---

## Phase 5: User Story 3 - Multiple Choice Quiz (Priority: P1)

**Goal**: Users can take structured multiple-choice quizzes with immediate feedback and score tracking

**Independent Test**: Generate quiz, answer 5 questions by selecting from 4 options, receive immediate feedback, see final score

### Backend Implementation for US3

- [ ] T044 [P] [US3] Implement quiz generation algorithm in backend/src/services/quiz.py: select N random vocabulary entries (1 as correct answer + 3 as distractors)
- [ ] T045 [P] [US3] Implement distractor selection in backend/src/services/quiz.py to shuffle answer options and track correct_answer_index
- [ ] T046 [US3] Implement duplicate detection in quiz generation: ensure 4 unique vocabulary entries per question (backend/src/services/quiz.py)
- [ ] T047 [US3] Create POST /api/quiz/generate endpoint in backend/src/api/quiz.py (NEW FILE) accepting count parameter (1-20 range)
- [ ] T048 [US3] Create POST /api/quiz/submit endpoint in backend/src/api/quiz.py accepting quiz_id, question_id, selected_option_index and returning is_correct + feedback
- [ ] T049 [US3] Create POST /api/quiz/complete endpoint in backend/src/api/quiz.py to finalize quiz, calculate score, persist to quiz_sessions table
- [ ] T050 [US3] Create GET /api/quiz/history endpoint in backend/src/api/quiz.py returning paginated quiz history with stats
- [ ] T051 [P] [US3] Add input validation in backend/src/api/quiz.py for count range (1-20) and answer option index (0-3)
- [ ] T052 [US3] Add error handling in backend/src/api/quiz.py for insufficient vocabulary (<4 entries) with 409 Conflict response
- [ ] T053 [US3] Write integration test for quiz generation in backend/tests/integration/test_quiz.py
- [ ] T054 [US3] Write integration test for quiz answer submission and scoring in backend/tests/integration/test_quiz.py
- [ ] T055 [US3] Write contract test for quiz API response schemas in backend/tests/contract/test_quiz_api.py

### Frontend Implementation for US3

- [ ] T056 [P] [US3] Create AnswerOptions component in frontend/src/components/AnswerOptions.jsx to render 4 multiple-choice buttons (A, B, C, D)
- [ ] T057 [P] [US3] Add button states to AnswerOptions: default, selected, correct (green), incorrect (red) (frontend/src/components/AnswerOptions.jsx)
- [ ] T058 [US3] Update QuizQuestion component in frontend/src/components/QuizQuestion.jsx to display question text and call AnswerOptions for answer display
- [ ] T059 [US3] Implement answer selection and immediate feedback in QuizQuestion: disable buttons after selection, show correct answer highlight (frontend/src/components/QuizQuestion.jsx)
- [ ] T060 [P] [US3] Add "Next" button to QuizQuestion component to proceed to next question (frontend/src/components/QuizQuestion.jsx)
- [ ] T061 [US3] Update QuizTab in frontend/src/pages/QuizTab.jsx to call quizService.generateQuiz() and manage quiz state
- [ ] T062 [US3] Implement quiz flow in QuizTab: display current question progress (X of Y), handle answer submission, show final score screen (frontend/src/pages/QuizTab.jsx)
- [ ] T063 [P] [US3] Create quizService in frontend/src/services/quizService.js with generateQuiz(), submitAnswer(), completeQuiz(), getQuizHistory() functions
- [ ] T064 [US3] Update quizService to handle quiz_id tracking across questions (frontend/src/services/quizService.js)
- [ ] T065 [P] [US3] Apply colors from colors.js to AnswerOptions buttons and feedback states (green for correct, red for incorrect) (frontend/src/components/AnswerOptions.jsx)
- [ ] T066 [US3] Apply colors from colors.js to QuizTab progress indicator and final score display (frontend/src/pages/QuizTab.jsx)
- [ ] T067 [US3] Write unit test for AnswerOptions component rendering 4 buttons (frontend/tests/unit/components/AnswerOptions.test.js)
- [ ] T068 [US3] Write unit test for QuizQuestion component showing feedback (frontend/tests/unit/components/QuizQuestion.test.js)
- [ ] T069 [US3] Write integration test for full quiz flow: generate → answer → score (frontend/tests/e2e/quiz-workflow.test.js)

**✅ CHECKPOINT: User Story 3 complete - Multiple choice quizzes fully functional**

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, testing, and documentation

### Performance & Optimization

- [ ] T070 [P] Add pagination to GET /api/words endpoint in backend/src/api/words.py to handle <1s response for 500+ entries
- [ ] T071 [P] Implement server-side pagination in frontend VocabularyManager to load 20 items per page with lazy loading
- [ ] T072 [P] Memoize React components to prevent unnecessary re-renders (VocabularyForm, QuizQuestion, AnswerOptions) using React.memo()
- [ ] T073 Optimize quiz generation query in backend/src/services/quiz.py to use efficient random sampling for large vocabulary sets

### Testing & Quality

- [ ] T074 [P] Run full backend test suite: `cd backend && pytest` - ensure all tests pass
- [ ] T075 [P] Run full frontend test suite: `cd frontend && npm test` - ensure all tests pass
- [ ] T076 Run backend linting: `cd backend && ruff check .` and fix any issues
- [ ] T077 Run frontend linting: `cd frontend && npm run lint` and fix any issues
- [ ] T078 [P] Load test vocabulary list endpoint with 500+ entries to verify <1s response time
- [ ] T079 [P] Load test quiz generation endpoint to verify <500ms response time for 10 questions

### Documentation & Validation

- [ ] T080 Update backend README.md with new API endpoints documentation for /api/words and /api/quiz
- [ ] T081 Update frontend README.md with new component documentation (VocabularyManager, AnswerOptions)
- [ ] T082 Create changelog entry documenting new features (example sentences, Words tab, multiple-choice quiz)
- [ ] T083 Validate all color constants from colors.js are applied consistently across new components
- [ ] T084 Review quickstart.md against implementation: verify all developer tasks completed
- [ ] T085 Run full application end-to-end: create vocabulary → browse Words tab → take quiz → verify scoring

### Final Touches

- [ ] T086 [P] Code review checklist: ensure all new code follows project conventions (style, naming, structure)
- [ ] T087 [P] Update existing component tests if any breakage from navigation changes
- [ ] T088 Verify backward compatibility: ensure existing vocabulary entries display correctly with NULL example_sentence
- [ ] T089 Add error boundary for quiz if insufficient vocabulary case
- [ ] T090 Create user guide documentation for new features

---

## Dependencies & Execution Order

### Critical Path (Minimum to MVP)

1. **Phase 1**: Setup (T001-T005) - ~15 min
2. **Phase 2**: Foundational (T006-T017) - ~4 hours - **BLOCKS ALL USER STORIES**
3. **Phase 3**: User Story 1 (T018-T032) - ~6 hours
4. **Phase 4**: User Story 2 (T033-T043) - ~5 hours
5. **Phase 5**: User Story 3 (T044-T069) - ~8 hours
6. **Phase 6**: Polish & Testing (T070-T090) - ~3 hours

**Total MVP Time**: ~26 hours

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← GATE: blocks all stories
    ↓
Phase 3 (US1) ← Can run in parallel with US2 & US3
Phase 4 (US2) ← Can run in parallel with US1 & US3
Phase 5 (US3) ← Can run in parallel with US1 & US2
    ↓
Phase 6 (Polish) ← Depends on desired user stories complete
```

### Task Dependencies Within Phases

**Phase 2 Critical Sequence**:
- T006-T007 (migrations) must run before T008-T009 (ORM models)
- T008-T009 (ORM) must complete before T010-T012 (services use models)

**Phase 3 (US1)** - Can parallelize:
- T018-T019 (schemas) can run with T020-T025 (endpoints)
- T026-T030 (frontend components) can run with backend work
- T025 (backend test) and T031-T032 (frontend tests) only need previous tasks in their layer

**Phase 4 (US2)** - Mostly independent:
- T033-T035 (VocabularyManager) can run in parallel
- T036-T040 (navigation) depends on VocabularyManager ready
- Frontend changes are isolated

**Phase 5 (US3)** - Backend/Frontend can parallelize:
- T044-T055 (backend quiz) independent from T056-T069 (frontend quiz)

### Parallel Opportunities

**Immediate Parallels After Phase 2**:
```
Team Member A: Phase 3 (User Story 1)
Team Member B: Phase 4 (User Story 2)
Team Member C: Phase 5 (User Story 3)
(All 3 stories can be worked simultaneously after foundational is done)
```

**Within Each Phase - Tasks with [P] marker**:
- Phase 1: T002, T003, T004, T005 can run in parallel
- Phase 2: T010-T015, T016-T017 can run in parallel (different layers)
- Phase 3: T018-T019, T024, T026-T027, T030 can run in parallel
- Phase 5: T044-T046, T056-T057, T063 can run in parallel

**Example Parallel Execution**:
```bash
# After foundational complete
Task T020 (backend: update POST endpoint)
Task T021 (backend: update PUT endpoint)
Task T026 (frontend: create input field)
Task T027 (frontend: update form submission)
# All run in parallel - different files, no blocking dependencies
```

---

## Parallel Example: Full Team Release

### Week 1: Foundation
```
Monday: All hands - Phase 1 Setup (4 hours)
        Dev A: T001, Dev B: T002, Dev C: T003
Tuesday-Wednesday: All hands on Phase 2 (Foundational)
        Critical path: T006→T007→T008→T009 (sequential)
        T010-T012 can wait for models
        T013-T017 parallel with database work
Thursday: Phase 2 complete, ready for user stories
```

### Week 2: User Stories (Parallel)
```
Dev A: Phase 3 (US1 - Example Sentences) - 6 hours
Dev B: Phase 4 (US2 - Vocabulary Organization) - 5 hours  
Dev C: Phase 5 (US3 - Multiple Choice Quiz) - 8 hours
(All in parallel, daily standups on blockers)
```

### Week 3: Testing & Polish
```
Monday-Wednesday: Phase 6 (Polish & Testing)
        T070-T079: Performance optimization
        T074-T079: Test execution and linting
        Parallel test runs: T074 + T075 + T076 + T077
Thursday-Friday: Bug fixes, final review, deployment prep
```

---

## Implementation Strategy

### MVP-First Approach (Recommended)

1. **Complete Phase 1 & 2** (foundational) - ~5 hours
2. **Complete Phase 3** (User Story 1) - ~6 hours
3. **STOP & VALIDATE** - Test example sentences feature end-to-end
4. **Demo/Deploy Phase 3** if acceptable
5. **Continue Phase 4** (User Story 2)
6. **Continue Phase 5** (User Story 3)
7. **Polish Phase 6**

**Benefit**: Deployable MVP after 11 hours; each subsequent story adds incremental value

### Sequential by Story (If Single Developer)

1. Phase 1 (Setup) - 15 min
2. Phase 2 (Foundational) - 4 hours
3. Phase 3 (US1) - 6 hours ← Deploy after here
4. Phase 4 (US2) - 5 hours ← Deploy after here
5. Phase 5 (US3) - 8 hours ← Deploy after here
6. Phase 6 (Polish) - 3 hours

Total: ~26 hours for complete feature

### Quick Start Commands

```bash
# Backend setup & test
cd backend
alembic upgrade head          # Run migrations (Phase 2: T006-T007)
pytest                        # Run tests (Phase 6: T074)

# Frontend setup & test
cd frontend
npm install                   # (Phase 1: T004)
npm test                      # Run tests (Phase 6: T075)
npm run lint                  # Lint check (Phase 6: T077)

# Full integration test
cd ..
docker-compose up -d          # Start services
# Run E2E tests after all phases
```

---

## Notes & Best Practices

- **[P] = Parallelizable**: Different files, no data dependencies between tasks
- **[Story] = Traceability**: Track which user story each task belongs to
- **Test First**: Write/review test tasks before implementation (T025, T031, etc.)
- **Commit Frequency**: After each task or logical group (e.g., after T020-T023)
- **Stop Points**: Checkpoint markers show where features are independently testable
- **Blockers**: If stuck, focus on dependencies (models before services, services before endpoints)
- **Quality Gates**: T074-T079 (testing) must pass before Phase 6 complete

## Success Criteria Validation (From spec.md)

After completing all tasks, validate:

- [ ] **SC-001**: Can create vocabulary with example in <30 seconds (T026-T032)
- [ ] **SC-002**: Vocabulary list loads <1s for 500 entries (T070-T072)
- [ ] **SC-003**: 95% of quiz questions have 4 distinct options (T044-T046, T053-T055)
- [ ] **SC-004**: Can complete 10-question quiz in <3 minutes (T061-T069)
- [ ] **SC-005**: Quiz feedback displays <500ms (T048-T049, backend optimization)
- [ ] **SC-006**: UI consistent with colors.js (T016, T030, T041, T065-T066)
- [ ] **SC-007**: All features working end-to-end (T085)
