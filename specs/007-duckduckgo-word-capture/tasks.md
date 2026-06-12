# Tasks: DuckDuckGo Word Capture Extension

**Input**: Design documents from `/specs/007-duckduckgo-word-capture/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/browser-extension-api.md, quickstart.md

**Tests**: Tests are required for this feature because the repository constitution mandates automated coverage for user-facing and core logic changes.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the extension workspace and baseline project files needed before shared backend and extension infrastructure can be added.

- [ ] T001 Create the extension package manifest and npm metadata in `extension/manifest.json` and `extension/package.json`
- [ ] T002 [P] Create the extension build configuration in `extension/vite.config.js`
- [ ] T003 [P] Create the extension test bootstrap in `extension/tests/setup.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared backend and extension infrastructure that all user stories depend on.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [ ] T004 Configure extension-aware backend settings in `backend/src/config.py`
- [ ] T005 [P] Add extension CORS allowlist wiring in `backend/src/main.py`
- [ ] T006 [P] Add shared extension request and response schemas in `backend/src/schemas.py`
- [ ] T007 [P] Create the backend translation service interface in `backend/src/services/translation.py`
- [ ] T008 [P] Create the extension API router scaffold in `backend/src/api/extension.py`
- [ ] T009 Wire the extension router into application startup in `backend/src/main.py`
- [ ] T010 [P] Create the extension HTTP client wrapper in `extension/src/services/api.js`
- [ ] T011 [P] Create the extension popup bootstrap entry in `extension/src/popup/main.jsx`

**Checkpoint**: Backend configuration, router wiring, and extension scaffolding are ready for story work.

---

## Phase 3: User Story 1 - Capture Highlighted German Words (Priority: P1) 🎯 MVP

**Goal**: Let the learner highlight a word on a German webpage and see the captured selection in the extension with clear validation feedback.

**Independent Test**: Load a supported page, highlight a word, open the extension, and verify that the popup shows the normalized selection or a validation message when nothing usable is selected.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add selection normalization tests in `extension/tests/unit/selection-utils.test.js`
- [ ] T013 [P] [US1] Add popup capture-state tests in `extension/tests/unit/popup-capture.test.jsx`

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement selection extraction and normalization helpers in `extension/src/content/selection.js`
- [ ] T015 [P] [US1] Implement background-to-popup selection messaging in `extension/src/background/index.js`
- [ ] T016 [US1] Build the popup capture and validation flow in `extension/src/popup/App.jsx`
- [ ] T017 [US1] Add popup capture and validation styles in `extension/src/popup/styles.css`
- [ ] T018 [US1] Register content script, popup, and required permissions in `extension/manifest.json`

**Checkpoint**: User Story 1 is functional when a selected word can be surfaced in the extension UI with usable validation errors.

---

## Phase 4: User Story 2 - Translate And Save To Vocabulary (Priority: P2)

**Goal**: Translate a captured German word through the backend and save it into the existing vocabulary store with duplicate and failure handling.

**Independent Test**: Highlight a valid word, trigger translate-and-save, and verify that the word is persisted in the vocabulary API or that a duplicate/translation error is returned cleanly.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add extension API contract tests in `backend/tests/contract/test_extension_api.py`
- [ ] T020 [P] [US2] Add translate-and-save integration tests in `backend/tests/integration/test_extension_import.py`
- [ ] T021 [P] [US2] Add popup import workflow tests in `extension/tests/unit/popup-import.test.jsx`

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement the translation provider client and error mapping in `backend/src/services/translation.py`
- [ ] T023 [US2] Implement the `/api/v1/extension/translate` and `/api/v1/extension/import` handlers in `backend/src/api/extension.py`
- [ ] T024 [US2] Extend duplicate handling and extension-specific error responses in `backend/src/services/vocabulary.py`
- [ ] T025 [US2] Finalize extension request and response schema fields in `backend/src/schemas.py`
- [ ] T026 [US2] Implement translate-and-save client calls in `extension/src/services/api.js`
- [ ] T027 [US2] Wire translate, save, duplicate, and retry actions in `extension/src/popup/App.jsx`

**Checkpoint**: User Story 2 is functional when the extension can save a translated word to the existing vocabulary store and report duplicates or provider failures without partial persistence.

---

## Phase 5: User Story 3 - Review Import Status And Source Context (Priority: P3)

**Goal**: Show a trustworthy post-import summary with translation result and source page context so the learner can confirm what was saved.

**Independent Test**: Import a word and verify that the extension confirmation view displays the saved word, translated meaning, and source URL or page title, while failed imports can be retried from the same popup state.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add popup success-state tests with source context in `extension/tests/unit/popup-success.test.jsx`
- [ ] T029 [P] [US3] Add source-metadata integration tests in `backend/tests/integration/test_extension_source_metadata.py`

### Implementation for User Story 3

- [ ] T030 [P] [US3] Add transient import-state persistence in `extension/src/services/storage.js`
- [ ] T031 [P] [US3] Capture and propagate page title and URL metadata in `extension/src/background/index.js`
- [ ] T032 [US3] Return source metadata and display-ready status messages in `backend/src/api/extension.py`
- [ ] T033 [US3] Render confirmation, duplicate, and retry review states in `extension/src/popup/App.jsx`
- [ ] T034 [US3] Add confirmation and review styling in `extension/src/popup/styles.css`

**Checkpoint**: All user stories are functional when successful and failed imports both return a clear review state with source context.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and end-to-end verification across the completed feature.

- [ ] T035 [P] Document extension setup and local installation in `extension/README.md`
- [ ] T036 [P] Document backend translation and extension-origin configuration in `backend/README.md`
- [ ] T037 Run the quickstart verification flow and update any corrected steps in `specs/007-duckduckgo-word-capture/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the popup/capture shell from User Story 1.
- **User Story 3 (Phase 5)**: Depends on User Story 2 because it extends the import response and review UI.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1**: First deliverable and MVP slice.
- **US2**: Builds on US1 capture flow plus shared backend infrastructure.
- **US3**: Builds on US2 import results and source metadata flow.

### Within Each User Story

- Automated tests should be written first and fail before implementation.
- Backend services and schemas should be completed before endpoint logic that depends on them.
- Extension services should be completed before popup integration that depends on them.
- Each story should be validated independently before moving to the next priority.

### Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`.
- `T005` through `T008`, `T010`, and `T011` can run in parallel after `T004`.
- `T012` and `T013` can run in parallel for US1, followed by `T014` and `T015` in parallel.
- `T019`, `T020`, and `T021` can run in parallel for US2.
- `T022` and `T026` can run in parallel once the US2 tests are in place.
- `T028` and `T029` can run in parallel for US3, followed by `T030` and `T031` in parallel.
- `T035` and `T036` can run in parallel during polish.

---

## Parallel Example: User Story 2

```bash
# Backend test work in parallel
Task: "Add extension API contract tests in backend/tests/contract/test_extension_api.py"
Task: "Add translate-and-save integration tests in backend/tests/integration/test_extension_import.py"

# Backend and extension implementation in parallel after schemas exist
Task: "Implement the translation provider client and error mapping in backend/src/services/translation.py"
Task: "Implement translate-and-save client calls in extension/src/services/api.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for User Story 1.
3. Validate word capture and selection feedback in the extension popup.
4. Demo the capture-only workflow before adding backend import logic.

### Incremental Delivery

1. Finish Setup and Foundational work.
2. Deliver US1 as the capture MVP.
3. Deliver US2 for translate-and-save persistence.
4. Deliver US3 for trustworthy confirmation and retry flows.
5. Finish polish tasks and run the quickstart verification.

### Parallel Team Strategy

1. One developer can own backend foundation tasks while another owns extension scaffolding.
2. After Phase 2, extension capture work and backend test authoring can proceed concurrently.
3. During US2, backend translation work and extension client wiring can proceed in parallel.

---

## Notes

- All tasks use the required checklist format with sequential IDs.
- `[P]` markers are only applied where file ownership and dependencies allow concurrent work.
- User story tasks include `[US1]`, `[US2]`, or `[US3]` labels for traceability.
- The suggested MVP scope is Phase 3 only after Setup and Foundational work are complete.
