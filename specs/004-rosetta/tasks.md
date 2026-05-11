# Tasks: Rosetta — Local LLM Memory Aids

**Branch**: `004-rosetta` | **Date**: 2026-05-11  
**Input**: Design documents from `/specs/004-rosetta/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/rosetta.yaml ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (operates on different files, no dependency on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup

**Purpose**: Establish environment configuration so the backend can locate the local Ollama service.

- [x] T001 Add `OLLAMA_BASE_URL` and `OLLAMA_MODEL` env vars to `backend/.env.example` with defaults (`http://localhost:11434` and `llama3`)

**Checkpoint**: Environment variables documented — developers can configure their local Ollama instance.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared building blocks — the dataclass, Pydantic schemas, and frontend service wrapper that every user story phase builds on.

**⚠️ CRITICAL**: No user story phase can begin until T002–T004 are complete.

- [x] T002 Create `MemoryAid` dataclass and `OllamaUnavailableError` exception in `backend/src/services/ollama_service.py`
- [x] T003 [P] Add `RosettaRequest` and `RosettaResponse` Pydantic models to `backend/src/schemas.py`
- [x] T004 [P] Create `rosettaService` Axios wrapper with `generate(wordId, force)` calling `POST /api/v1/rosetta/generate` in `frontend/src/services/rosetta.js`

**Checkpoint**: Data contracts defined on both backend and frontend — stories can be implemented independently from here.

---

## Phase 3: User Story 2 — Navigate to the Rosetta Tab (Priority: P1)

**Goal**: The Rosetta tab appears in the navigation bar before Statistics, and clicking it renders a page shell so the feature is discoverable and visually present before backend wiring is complete.

**Independent Test**: Load the app at `http://localhost:5173` — a "Rosetta" tab must be visible as the 5th tab (before Statistics), and clicking it must render the Rosetta page without error.

- [x] T005 [P] [US2] Create `Rosetta.jsx` page shell with a word dropdown placeholder and empty sentence area in `frontend/src/pages/Rosetta.jsx`
- [x] T006 [US2] Add `{ id: 'rosetta', label: 'Rosetta' }` to `TABS` array before `statistics`, import `Rosetta`, and add `case 'rosetta'` to `renderPage` in `frontend/src/components/Navigation.jsx`

**Checkpoint**: Rosetta tab is visible in correct position and renders the page shell — US2 fully testable independently.

---

## Phase 4: User Story 1 — Generate Memory Sentences for a Word (Priority: P1) 🎯 MVP

**Goal**: A user can select any vocabulary word on the Rosetta page, trigger generation, and see exactly three distinct mnemonic sentences produced by the local Ollama LLM. Results are cached so repeat visits return instantly.

**Independent Test**: Select a word → click Generate → three sentences appear each containing the German word. Select the same word again → sentences return without an LLM call (instant response, `cached: true`).

- [x] T007 [US1] Implement `generate_memory_aid()` and `_call_ollama()` with `httpx.AsyncClient`, numbered-list prompt, response parser, and module-level `_cache: dict[int, MemoryAid]` in `backend/src/services/ollama_service.py`
- [x] T008 [US1] Implement `POST /api/v1/rosetta/generate` FastAPI router with word DB lookup (404 on missing), service call, and response serialisation in `backend/src/api/rosetta.py`
- [x] T009 [US1] Import and register `rosetta_router` in `backend/src/main.py`
- [x] T010 [US1] Wire `vocabularyService.getAllWords()` on mount, word selector state, `rosettaService.generate()` on submit, and three sentence card display to `Rosetta.jsx` in `frontend/src/pages/Rosetta.jsx`

**Checkpoint**: Full generation pipeline works end-to-end — US1 and US2 both fully functional and independently testable.

---

## Phase 5: User Story 3 — Handle LLM Unavailability Gracefully (Priority: P2)

**Goal**: When Ollama is not running, the user sees a clear actionable error message rather than a crash or blank screen. A loading spinner is visible while generation is in progress.

**Independent Test**: Stop Ollama (`pkill ollama`) → click Generate → error message appears with instructions to start Ollama. Restart Ollama → click Generate again → succeeds without page refresh.

- [x] T011 [P] [US3] Catch `httpx.ConnectError` and `httpx.TimeoutException` in `_call_ollama()` and raise `OllamaUnavailableError`; map it to HTTP 503 with message `"Local AI service unavailable. Please ensure Ollama is running."` in `backend/src/api/rosetta.py`
- [x] T012 [P] [US3] Add loading spinner (shown while `loading` state is true) and error alert (shown when `error` state is non-null, with retry button) to `frontend/src/pages/Rosetta.jsx`
- [x] T013 [US3] Add empty vocabulary guard — if word list is empty on mount, display `"No words available. Add words in the Vocabulary tab."` in `frontend/src/pages/Rosetta.jsx`

**Checkpoint**: All three error/edge-case states (Ollama down, slow response, empty vocabulary) are handled — US3 fully testable.

---

## Phase 6: User Story 4 — Regenerate Sentences (Priority: P3)

**Goal**: A user with existing cached sentences can request fresh alternatives. The Regenerate button bypasses the cache and updates it with the new result.

**Independent Test**: Generate sentences for a word → click Regenerate → at least one of the three sentences changes. The new set is then returned from cache on the next plain Generate call.

- [x] T014 [P] [US4] Ensure `force=True` parameter bypasses `_cache` lookup and overwrites cache entry after generation in `backend/src/services/ollama_service.py`
- [x] T015 [US4] Add "Regenerate" button (visible only when sentences are already displayed) that calls `rosettaService.generate(wordId, force=true)` in `frontend/src/pages/Rosetta.jsx`

**Checkpoint**: Regeneration works; cache is updated with fresh sentences — US4 fully testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Test coverage (required by constitution), integration test scaffold, and any final linting/formatting pass.

- [x] T016 [P] Write unit tests for `ollama_service.py` — mock `httpx.AsyncClient`, test cache hit/miss, test parser with 3 sentences, test parser padding when fewer than 3 lines returned, test `OllamaUnavailableError` on connection error in `backend/tests/unit/test_rosetta.py`
- [x] T017 [P] Write unit tests for `rosetta.py` router — mock `ollama_service`, test 200 response shape, test 404 on missing word, test 503 on `OllamaUnavailableError` in `backend/tests/unit/test_rosetta.py`
- [x] T018 [P] Write Vitest component tests for `Rosetta.jsx` — word selector renders, generate button triggers service, loading spinner shown, error alert shown on 503, three sentence cards rendered on success, cached badge shown when `cached=true` in `frontend/tests/unit/rosetta.test.jsx`
- [x] T019 Create integration test skeleton gated on `OLLAMA_AVAILABLE=1` env var — test full round-trip for one real word and assert three non-empty sentences returned in `backend/tests/integration/test_rosetta_integration.py`

**Checkpoint**: All tests pass (`pytest backend/tests/unit/test_rosetta.py` and `npm test` in frontend) — feature ready for review.

---

## Dependency Graph

```
T001
  └── T002 → T007 → T008 → T009
      T003 → T008
      T004 → T010

T005 → T006              (US2 — independent of backend)

T007 + T008 + T009
  └── T010               (frontend wired to live endpoint)

T010 → T011 (US3 backend error)
T010 → T012 (US3 frontend error UI)
T010 → T013 (US3 empty state)

T007 → T014 (US4 backend force)
T014 → T015 (US4 frontend regenerate button)

T007–T010 → T016, T017, T018, T019
```

**User story completion order**: US2 (T005–T006) can proceed in parallel with US1 backend (T007–T009). US1 frontend (T010) and all US3/US4 work requires T007–T009 complete.

---

## Parallel Execution Opportunities

| Parallel Pair                              | Tasks                               |
| ------------------------------------------ | ----------------------------------- |
| Backend schemas + frontend service         | T003 and T004 (both read-only deps) |
| Rosetta page shell + backend schemas       | T005 and T003                       |
| Backend service + navigation update        | T007 and T006                       |
| Backend error handling + frontend error UI | T011 and T012                       |
| All unit test files                        | T016, T017, T018                    |

---

## Implementation Strategy

**Suggested MVP scope (US2 + US1 only)**:  
Complete T001 → T002 → T003/T004 (parallel) → T005 (parallel with T003) → T006 → T007 → T008 → T009 → T010.  
Result: Rosetta tab visible, full LLM generation and caching working end-to-end.

**Full feature**: Add T011–T015 for error handling and regeneration.  
**Done**: Add T016–T019 for test coverage.

---

## Summary

| Metric                          | Value |
| ------------------------------- | ----- |
| Total tasks                     | 19    |
| Phase 1 (Setup)                 | 1     |
| Phase 2 (Foundational)          | 3     |
| Phase 3 (US2 — Navigation)      | 2     |
| Phase 4 (US1 — Generation, MVP) | 4     |
| Phase 5 (US3 — Error Handling)  | 3     |
| Phase 6 (US4 — Regenerate)      | 2     |
| Phase 7 (Polish + Tests)        | 4     |
| Parallelisable tasks            | 10    |
| New files                       | 6     |
| Modified files                  | 3     |
| DB migrations                   | 0     |
