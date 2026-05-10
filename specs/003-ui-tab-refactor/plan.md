# Implementation Plan: Minimalist Tab-Based UI

**Branch**: `ui-tab-refactor` | **Date**: 2026-05-10 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/003-ui-tab-refactor/spec.md`

## Summary

Refactor the existing React frontend to a clean, clutter-free five-tab UI (Vocabulary, Words, Flashcards, Quiz, Statistics) without adding new features. All changes are frontend-only. The backend API and service layer remain unchanged. The primary work is removing inline styles, simplifying overly complex component flows (especially the Flashcard word-selection step), standardising styling via CSS custom properties, and removing cross-tab navigation callbacks that violate tab isolation.

## Technical Context

**Language/Version**: React 19.2.4 + JavaScript (ES module), Node.js 18+  
**Primary Dependencies**: Vite 8, Axios 1.15 (no new dependencies)  
**Storage**: N/A — no DB changes; existing PostgreSQL via unchanged backend  
**Testing**: Vitest (existing test files in `frontend/tests/`)  
**Target Platform**: Browser (desktop-primary, 320px+ responsive)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Tab switch < 100ms; initial paint < 1s on localhost  
**Constraints**: No external CSS library; no new npm packages; no backend changes  
**Scale/Scope**: 5 tab views, ~10 component files, ~10 CSS files

## Constitution Check

| Principle                        | Status  | Notes                                                                                          |
| -------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| I. Code Quality                  | ✅ Pass | Inline styles removed; consistent CSS tokens introduced; no dead code left behind              |
| II. Testing Standards            | ✅ Pass | Existing test files updated to match simplified component APIs; no net loss of coverage        |
| III. User Experience Consistency | ✅ Pass | CSS variables enforce consistent spacing, colour, and typography across all tabs               |
| IV. Performance Requirements     | ✅ Pass | No new dependencies; no additional network requests; tab switching is synchronous state change |

**Gate result**: All principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-tab-refactor/
├── plan.md           ← this file
├── research.md       ← Phase 0 findings
├── data-model.md     ← UI state and API shape documentation
├── quickstart.md     ← Dev onboarding guide
├── spec.md           ← Feature specification
└── checklists/
    └── requirements.md
```

### Source Code

```text
frontend/
├── src/
│   ├── index.css                         ← Add CSS custom properties (tokens)
│   ├── App.css                           ← Minimal layout reset
│   ├── App.jsx                           ← Unchanged
│   ├── components/
│   │   ├── Navigation.jsx                ← Remove emoji; clean tab bar styles
│   │   ├── Navigation.css                ← Simplify to underline-based active state
│   │   ├── Flashcards/
│   │   │   ├── FlashcardStudy.jsx        ← Remove word-selection step; auto-load all words
│   │   │   └── FlashcardStudy.css        ← Clean card layout
│   │   ├── Quiz/
│   │   │   ├── QuizComponent.jsx         ← Minimal start/question/results layout
│   │   │   ├── QuizComponent.css         ← Simplify
│   │   │   ├── Statistics.jsx            ← Simplify stat card layout
│   │   │   └── Statistics.css            ← Clean stat cards
│   │   └── Words/
│   │       ├── WordForm.jsx              ← Remove any inline styles; use CSS class
│   │       ├── WordForm.css              ← Minimal form layout
│   │       ├── WordList.jsx              ← Clean list rows with edit/delete actions
│   │       └── WordList.css             ← Simple list styling
│   ├── pages/
│   │   ├── Vocabulary.jsx               ← Remove inline styles + cross-tab prompt
│   │   ├── Vocabulary.css               ← Simple page layout
│   │   ├── WordsTab.jsx                 ← Remove onNavigateToVocab prop usage
│   │   └── (QuizTab.jsx)                ← Not used by Navigation; verify/clean up
│   └── services/                        ← Unchanged
│       ├── vocabulary.js
│       └── quiz.js
└── tests/
    ├── flashcards.test.js               ← Update for simplified FlashcardStudy API
    ├── quiz.test.js                     ← Update for simplified QuizComponent API
    └── words.test.js                    ← Update for removed prop callbacks
```

**Structure Decision**: Web application (Option 2 from template). Frontend-only refactor within existing `frontend/src/` layout. No new files introduced unless a component is split for clarity.

## Design Decisions

### 1. CSS Custom Properties in `index.css`

All colour, spacing, radius, and font tokens are declared as CSS variables at `:root` level. Individual component CSS files reference these tokens instead of hardcoded values. This is the only architectural addition; it's additive-only and does not break existing styles.

```
--color-bg, --color-surface, --color-border
--color-text, --color-text-muted
--color-primary, --color-primary-hover, --color-danger
--spacing-xs/sm/md/lg/xl
--radius, --font-sans
```

### 2. Tab Navigation Styling

The current `Navigation.jsx` `<ul>` with `role="menubar"` is kept for accessibility. CSS is simplified to:

- Tab bar: plain horizontal flex row, no box shadow, `var(--color-border)` bottom border
- Active tab: `var(--color-primary)` bottom border (2px underline), no background colour change
- Hover: subtle text colour change only

### 3. Flashcard Flow Simplification

Current flow: load words → user selects subset → generate flashcards → study  
New flow: load words on mount → go directly to study with all words (using `words` array directly, no flashcard generation API call needed)

This removes the `studyMode: 'select'` state, the checkbox list, and the "Generate Flashcards" button. The word data shape (`{ german_word, meaning }`) is already available from the vocabulary API.

### 4. Removed Cross-Tab Navigation Props

`Vocabulary.jsx` currently accepts `onNavigateToWords` from Navigation and shows a "View All Words →" prompt box. This is removed. Each tab is self-contained — users navigate via the tab bar only.

Similarly `WordsTab.jsx` accepts `onNavigateToVocab` — removed.

`Navigation.jsx` no longer passes these callbacks.

### 5. Vocabulary Tab Layout

After removing the cross-tab prompt box, the Vocabulary tab becomes: page heading → `<WordForm>` only. Clean and purposeful. The "Add New Word" form heading is kept inside `WordForm` for context.

## Implementation Order

Execute in this sequence to allow incremental testing at each step:

1. **CSS tokens** — Add variables to `index.css`; verify existing UI is unaffected
2. **Navigation** — Strip emoji, simplify tab bar CSS; verify all five tabs still render
3. **Vocabulary tab** — Remove inline styles + cross-tab prompt; update Navigation to not pass `onNavigateToWords`
4. **Words tab** — Remove `onNavigateToVocab` prop; clean list styling
5. **WordForm** — Replace any remaining inline styles with CSS classes
6. **WordList** — Clean list row layout (edit/delete actions visible but minimal)
7. **FlashcardStudy** — Remove selection step, auto-load words, direct to study view
8. **QuizComponent** — Minimal layout pass (start screen, question display, results)
9. **Statistics** — Simplify stat card grid styling
10. **Tests** — Update test files to match simplified component props/states
11. **Cleanup** — Verify `QuizTab.jsx` in `pages/` (currently unused); remove if dead code

## Phase 0 Summary

All unknowns resolved. See [research.md](research.md) for full findings. Key decisions:

- Retain Navigation.jsx tab switching model (no React Router)
- Vanilla CSS only (no new library)
- Flashcards auto-load (no selection step)
- No backend changes at all

## Phase 1 Summary

See [data-model.md](data-model.md) for UI state shapes and API response types.  
See [quickstart.md](quickstart.md) for development workflow.  
No external API contracts required (all API is internal, backend already ships it).

## Out of Scope

- Dark mode or theme switching
- Animations or transitions
- React Router or URL-based navigation
- New quiz question types
- User authentication UI
- Mobile-specific layout (responsive at 320px+ but not mobile-first)
- Any backend change
- Unsaved form changes warning (mid-entry navigation guard) — no `beforeunload` event or dirty-state tracking required
