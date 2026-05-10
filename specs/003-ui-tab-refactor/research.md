# Research: Minimalist Tab-Based UI Refactor

**Feature**: 003-ui-tab-refactor  
**Date**: 2026-05-10  
**Status**: Complete — all unknowns resolved

---

## Finding 1: Existing Tab Navigation Structure

**Decision**: Retain the current `Navigation.jsx` component as the top-level tab controller using `useState('vocabulary')`.

**Rationale**: The five-tab switching logic already works correctly via state-based conditional rendering. The problem is purely visual/styling, not structural. Keeping the same controller avoids unnecessary rewrites and regression risk.

**Alternatives considered**: React Router — rejected because there are no deep-link requirements and it would add bundle weight with no user-facing benefit.

---

## Finding 2: Component Architecture

**Decision**: Keep the existing `pages/` and `components/` split. Tab-level views live in `pages/`. Reusable sub-components live in `components/`.

**Rationale**: The split already matches standard React conventions and the spec requires no architectural change — only visual simplification.

**Existing files and their refactor scope**:

| File                                                              | Change Required                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `components/Navigation.jsx` / `Navigation.css`                    | Strip emoji icons from tab labels; simplify tab bar CSS to minimal underline/highlight style       |
| `pages/Vocabulary.jsx` / `Vocabulary.css`                         | Remove inline styles; remove the "go to Words" prompt box; WordForm stays                          |
| `pages/WordsTab.jsx`                                              | Remove inline styles; clean up list actions                                                        |
| `components/Words/WordForm.jsx` / `WordForm.css`                  | Minimal styling pass — currently mostly clean                                                      |
| `components/Words/WordList.jsx` / `WordList.css`                  | Clean list layout, no card decoration                                                              |
| `components/Flashcards/FlashcardStudy.jsx` / `FlashcardStudy.css` | Simplify: auto-load all words, skip word-selection step; single card display with flip + next/prev |
| `components/Quiz/QuizComponent.jsx` / `QuizComponent.css`         | Minimal layout for start screen and question display                                               |
| `components/Quiz/Statistics.jsx` / `Statistics.css`               | Keep stat cards but simplify styling                                                               |
| `App.css` / `index.css`                                           | Define CSS custom properties for consistent colours, spacing, and typography                       |

---

## Finding 3: Styling Strategy

**Decision**: Vanilla CSS with custom properties (no external CSS library).

**Rationale**: The project already uses plain CSS. Adding a library (Tailwind, Chakra, etc.) would be over-engineering for a minimalist goal. A small set of CSS variables is sufficient.

**Variables to define (in `index.css`)**:

```css
--color-bg: #ffffff;
--color-surface: #f7f7f8;
--color-border: #e2e2e7;
--color-text: #111111;
--color-text-muted: #6b6b80;
--color-primary: #2563eb;
--color-primary-hover: #1d4ed8;
--color-danger: #dc2626;
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--radius: 4px;
--font-sans: system-ui, sans-serif;
```

---

## Finding 4: Flashcard UX Simplification

**Decision**: Remove the word-selection pre-step in `FlashcardStudy.jsx`. Auto-load all vocabulary words on mount and go directly to the card view.

**Rationale**: The spec says "minimalistic and user friendly" — requiring the user to manually select words before studying is unnecessary friction. Showing all words in sequence is the simplest correct behaviour.

**Alternatives considered**: Keep selection step — rejected; adds UI complexity with no clear value for this scope.

---

## Finding 5: No Backend Changes Required

**Decision**: All changes are frontend-only. No API, schema, or model changes needed.

**Rationale**: All five existing API endpoints (`/api/v1/words/`, `/api/v1/flashcards/`, `/api/v1/quiz/`, `/api/v1/quiz/stats/overall`) already return the data required by each tab. The service files (`vocabulary.js`, `quiz.js`) remain unchanged.

---

## Finding 6: No New Dependencies Required

**Decision**: No npm packages to add.

**Rationale**: React 19, Vite, and Axios already cover all requirements. The spec explicitly asks for no fancy features.

---

## Finding 7: Testing Strategy

**Decision**: Existing unit tests in `frontend/tests/` should be updated to reflect simplified component structures (removed props, removed state). No new test framework needed.

**Files to update**: `flashcards.test.js`, `quiz.test.js`, `words.test.js`.
