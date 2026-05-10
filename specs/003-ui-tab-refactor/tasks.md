# Tasks: Minimalist Tab-Based UI

**Input**: Design documents from `specs/003-ui-tab-refactor/`
**Feature Branch**: `ui-tab-refactor`
**Date**: 2026-05-10

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US6)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish CSS design tokens that all component rewrites will depend on

- [X] T001 Add CSS custom property tokens to `frontend/src/index.css` — define `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-hover`, `--color-danger`, `--spacing-xs/sm/md/lg/xl`, `--radius`, `--font-sans`
- [X] T002 [P] Apply minimal body and layout reset in `frontend/src/App.css` — remove any decorative styles; keep only box-sizing, margin resets, and font-family via `var(--font-sans)`

**Checkpoint**: CSS tokens available — all component refactors can now reference them

---

## Phase 2: User Story 1 — Tab Navigation (Priority: P1)

**Goal**: Clean, emoji-free tab bar with a clear active underline — the navigation shell all other tabs render inside

**Independent Test**: Click each of the 5 tabs in sequence; verify only that tab's content is visible, the active tab shows an underline (not background fill), and no emoji appears in any label

- [X] T003 [US1] Refactor `frontend/src/components/Navigation.jsx` — remove emoji from all five tab labels (`📚`, `📖`, `🃏`, `✅`, `📊`); remove `onNavigateToWords` and `onNavigateToVocab` callback props from all `renderPage()` cases
- [X] T004 [P] [US1] Rewrite `frontend/src/components/Navigation.css` — minimal horizontal flex tab bar with `var(--color-border)` bottom border; active tab uses 2px `var(--color-primary)` underline only (no background colour change); plain hover text colour shift
- [X] T022 [P] [US1] Add `@media (max-width: 480px)` breakpoint to `frontend/src/components/Navigation.css` — tab bar wraps to two rows at narrow viewports; verify no horizontal scroll at 320px width (addresses SC-007)

**Checkpoint**: Tab navigation clean — all 5 tabs accessible with no clutter; responsive at 320px

---

## Phase 3: User Story 2 — Add Words to Vocabulary (Priority: P1)

**Goal**: Vocabulary tab shows only the word-entry form — no cross-tab prompts or inline styles

**Independent Test**: Open Vocabulary tab; fill in German word + meaning; click "Add Word"; form clears; submit with empty fields and see validation errors

- [X] T005 [US2] Remove cross-tab prompt block ("go to Words" box and "View All Words →" button) and all inline `style={{}}` props from `frontend/src/pages/Vocabulary.jsx`; update `frontend/src/pages/Vocabulary.css` with clean page wrapper layout using CSS tokens
- [X] T006 [P] [US2] Replace all inline `style={{}}` props in `frontend/src/components/Words/WordForm.jsx` with CSS class references
- [X] T007 [P] [US2] Rewrite `frontend/src/components/Words/WordForm.css` — minimal stacked label/input form layout using CSS token spacing and colours; clear required-field error state
- [X] T021 [US2] Verify/implement required-field validation logic in `frontend/src/components/Words/WordForm.jsx` — empty German Word or Meaning fields must prevent submission and render an inline error message below the field (addresses FR-009)

**Checkpoint**: Vocabulary tab fully self-contained — form works with validation, no cross-tab navigation elements remain

---

## Phase 4: User Story 3 — Browse and Manage Words (Priority: P1)

**Goal**: Words tab displays all vocabulary in a plain list with accessible edit and delete actions

**Independent Test**: Open Words tab; all words display in a list; click edit on a word to enter edit mode; click delete and confirm removal

- [X] T008 [US3] Remove `onNavigateToVocab` prop usage from `frontend/src/pages/WordsTab.jsx`; remove any inline styles; keep only the WordList render
- [X] T009 [P] [US3] Simplify `frontend/src/components/Words/WordList.jsx` — plain list rows; edit/delete actions visible per row without card decoration or shadow effects
- [X] T010 [P] [US3] Update `frontend/src/components/Words/WordList.css` — minimal list row layout using CSS tokens; clear row separator via `var(--color-border)`; edit/delete button styling using `var(--color-primary)` and `var(--color-danger)`

**Checkpoint**: Words tab independently functional — browse, edit, delete all work without cross-tab dependencies

---

## Phase 5: User Story 4 — Study with Flashcards (Priority: P2)

**Goal**: Flashcards tab auto-loads all vocabulary and goes directly to the study card — no word-selection step

**Independent Test**: Open Flashcards tab; a German word is immediately visible on a card; click/tap to flip and see meaning; click next to advance; previous button works

- [X] T011 [US4] Refactor `frontend/src/components/Flashcards/FlashcardStudy.jsx` — remove `studyMode: 'select'` state, word checkbox list, and "Generate Flashcards" button; call `vocabularyService.getAllWords()` on mount and render the card view directly with `words` array; handle empty state with "No words yet — add some in the Vocabulary tab" message
- [X] T012 [P] [US4] Rewrite `frontend/src/components/Flashcards/FlashcardStudy.css` — single centred card with front/back toggle via class swap; prev/next button row beneath card; all spacing via CSS tokens; no gradients or shadows

**Checkpoint**: Flashcards tab independently usable — auto-loads, flips, navigates

---

## Phase 6: User Story 5 — Take Quizzes (Priority: P2)

**Goal**: Quiz tab has a clean start screen, focused question display, and a simple score summary

**Independent Test**: Click "Start Quiz"; first question and 4 answer options display; select answer and advance; complete quiz and see score

- [X] T013 [US5] Simplify `frontend/src/components/Quiz/QuizComponent.jsx` — remove excess wrapper elements; start screen: title + question-count input + start button only; question screen: question text + `<QuizQuestion>` + `<AnswerOptions>`; results screen: score fraction + percentage + restart button only
- [X] T014 [P] [US5] Rewrite `frontend/src/components/Quiz/QuizComponent.css` — minimal stacked layout for each quiz state (start/question/results); all colours and spacing via CSS tokens; no decorative borders or shadows

**Checkpoint**: Quiz tab independently functional — full start-to-results flow works

---

## Phase 7: User Story 6 — View Learning Statistics (Priority: P3)

**Goal**: Statistics tab shows 5 key metrics in a clean grid with an empty state when no data exists

**Independent Test**: Open Statistics tab with data — see total words, total quizzes, average score, total reviews, overall accuracy; open with no data — see "No statistics yet" placeholder

- [X] T015 [US6] Simplify `frontend/src/components/Quiz/Statistics.jsx` — ensure empty state renders "No statistics available yet — complete a quiz to see your progress"; keep the 5 stat cards; remove any extra UI elements
- [X] T016 [P] [US6] Update `frontend/src/components/Quiz/Statistics.css` — 2-column responsive stat card grid using CSS tokens; plain card with `var(--color-surface)` background and `var(--color-border)` border; no gradients or box shadows

**Checkpoint**: All 6 user stories independently functional — full app usable end-to-end

---

## Phase 8: Tests (Constitution II Compliance)

**Purpose**: Ensure all refactored user-facing components have unit test coverage (Constitution Principle II — MUST)

- [X] T023 [P] [US1] Add unit test in `frontend/tests/` for `Navigation` — assert 5 tab buttons render, clicking a tab updates active state, no emoji characters in any label text
- [X] T024 [P] [US2] Add unit test for `WordForm` — assert form renders 3 fields, submit with empty required fields shows error messages, successful submit clears the form
- [X] T025 [P] [US3] Add unit test for `WordList` — assert words render as list items, each row contains edit and delete buttons
- [X] T026 [P] [US4] Add unit test for `FlashcardStudy` — assert `getAllWords` is called on mount, card displays `german_word` by default, clicking card toggles to `meaning`, next/prev buttons change the active index
- [X] T027 [P] [US5] Add unit test for `QuizComponent` — assert start screen renders with "Start Quiz" button, quiz state transitions to question view after start, results screen shows score after final answer
- [X] T028 [P] [US6] Add unit test for `Statistics` — assert 5 stat cards render when API returns data, empty state message renders when stats are null

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Dead code removal and existing test alignment

- [X] T017 [P] Verify `frontend/src/pages/QuizTab.jsx` is not imported anywhere; delete the file if unused (it is not referenced in `Navigation.jsx`)
- [X] T018 [P] Update `frontend/tests/words.test.js` — remove assertions on `onNavigateToVocab` and `onNavigateToWords` props that no longer exist on `WordsTab` and `Vocabulary` components
- [X] T019 [P] Update `frontend/tests/flashcards.test.js` — remove assertions on word-selection state (`studyMode`, `selectedWords`, `handleWordSelection`); add assertions for auto-load behaviour on mount
- [X] T020 [P] Update `frontend/tests/quiz.test.js` — verify assertions still match the simplified `QuizComponent` start/question/results layout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1 Navigation)**: Depends on Phase 1 completion (needs CSS tokens)
- **Phase 3–7 (US2–US6)**: Each depends on Phase 2 completion (Navigation must not pass removed props before components remove them)
- **Phase 8 (Tests)**: Can start per-story as each user story phase completes; all 6 test tasks are independent
- **Phase 9 (Polish)**: Depends on all user story phases and Phase 8 complete

### User Story Dependencies

- **US1 (P1)**: Depends on Setup only — no other story dependency
- **US2 (P1)**: Depends on US1 (Navigation must be refactored first)
- **US3 (P1)**: Depends on US1; can run in parallel with US2
- **US4 (P2)**: Depends on US1; independent of US2/US3
- **US5 (P2)**: Depends on US1; independent of US2/US3/US4
- **US6 (P3)**: Depends on US1; independent of all other stories

### Within Each Phase

- Tasks marked `[P]` within the same phase can execute in parallel
- CSS file changes (`[P]`) are always independent of JSX changes in the same phase

### Parallel Opportunities Within Phases

- **Phase 1**: T001 ∥ T002
- **Phase 2**: T003 ∥ T004 ∥ T022 (all different files)
- **Phase 3**: T005 → done, then T006 ∥ T007 in parallel; or all three in parallel (different files)
- **Phase 4**: T008 → then T009 ∥ T010 in parallel
- **Phase 5**: T011 ∥ T012 (different files)
- **Phase 6**: T013 ∥ T014 (different files)
- **Phase 7**: T015 ∥ T016 (different files)
- **Phase 2**: T003 ∥ T004 ∥ T022 (all different files)
- **Phase 8**: T023 ∥ T024 ∥ T025 ∥ T026 ∥ T027 ∥ T028 (all independent)
- **Phase 9**: T017 ∥ T018 ∥ T019 ∥ T020 (all independent)

---

## Parallel Example: User Story 4 (Flashcards)

```
After Phase 2 completes:

[T011] FlashcardStudy.jsx refactor
[T012] FlashcardStudy.css rewrite   ← runs in parallel with T011
         ↓
Both complete → Flashcards tab independently testable
```

---

## Implementation Strategy

### MVP Scope (deliver value fastest)

Implement **Phase 1 + Phase 2 + Phase 3** first:

- CSS tokens established
- Tab navigation cleaned up (no emoji, no cross-tab props)
- Vocabulary form working in clean layout

This gives a fully usable Vocabulary tab with correct navigation — the most-used daily workflow.

### Incremental Delivery

- **Sprint 1** (MVP): Phases 1–3 → clean Vocabulary + navigation
- **Sprint 2**: Phases 4 (Words tab) — complete word management
- **Sprint 3**: Phases 5–6 (Flashcards + Quiz) — study features
- **Sprint 4**: Phase 7 (Statistics) + Phase 8 (tests) + Phase 9 (cleanup)

---

## Summary

| Phase          | User Story | Tasks           | Priority | Parallelisable  |
| -------------- | ---------- | --------------- | -------- | --------------- |
| 1 — Setup      | —          | T001–T002       | —        | Yes (T001∥T002) |
| 2 — Navigation | US1        | T003–T004, T022 | P1       | Yes (all ∥)     |
| 3 — Vocabulary | US2        | T005–T007, T021 | P1       | Partial         |
| 4 — Words      | US3        | T008–T010       | P1       | Partial         |
| 5 — Flashcards | US4        | T011–T012       | P2       | Yes (T011∥T012) |
| 6 — Quiz       | US5        | T013–T014       | P2       | Yes (T013∥T014) |
| 7 — Statistics | US6        | T015–T016       | P3       | Yes (T015∥T016) |
| 8 — Tests      | US1–US6    | T023–T028       | —        | Yes (all ∥)     |
| 9 — Polish     | —          | T017–T020       | —        | Yes (all ∥)     |

**Total tasks**: 28  
**Total user stories covered**: 6  
**Suggested MVP**: Phases 1–3 (9 tasks, US1 + US2 complete with tests)
