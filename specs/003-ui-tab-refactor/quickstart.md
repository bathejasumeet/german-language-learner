# Quickstart: UI Refactor Dev Guide

**Feature**: 003-ui-tab-refactor  
**Date**: 2026-05-10

## Prerequisites

- Docker running (`docker-compose up -d`)
- Node.js 18+

## Start Frontend Dev Server

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## File Map — What to Edit

| Tab           | Page component              | Sub-components                             | CSS                                                     |
| ------------- | --------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Vocabulary    | `pages/Vocabulary.jsx`      | `components/Words/WordForm.jsx`            | `pages/Vocabulary.css`, `components/Words/WordForm.css` |
| Words         | `pages/WordsTab.jsx`        | `components/Words/WordList.jsx`            | `components/Words/WordList.css`                         |
| Flashcards    | —                           | `components/Flashcards/FlashcardStudy.jsx` | `components/Flashcards/FlashcardStudy.css`              |
| Quiz          | —                           | `components/Quiz/QuizComponent.jsx`        | `components/Quiz/QuizComponent.css`                     |
| Statistics    | —                           | `components/Quiz/Statistics.jsx`           | `components/Quiz/Statistics.css`                        |
| Nav / Shell   | `components/Navigation.jsx` | —                                          | `components/Navigation.css`                             |
| Global tokens | —                           | —                                          | `index.css` (CSS variables), `App.css` (layout reset)   |

## Key Rules for This Refactor

1. **No inline styles** — All styling via CSS classes only
2. **No cross-tab navigation props** — Remove `onNavigateToWords` / `onNavigateToVocab`; each tab is self-contained
3. **No emoji in tab labels** — Plain text: Vocabulary, Words, Flashcards, Quiz, Statistics
4. **Flashcards auto-loads** — Remove the word-selection step; load all words on mount
5. **CSS variables** — Use tokens defined in `index.css` for all colours/spacing

## CSS Custom Properties (in `index.css`)

```css
:root {
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
}
```

## Run Tests

```bash
cd frontend
npm test
# or for Vitest watch mode:
npx vitest
```

## API Endpoints Used (no changes)

| Feature        | Method | Path                         |
| -------------- | ------ | ---------------------------- |
| List words     | GET    | `/api/v1/words/`             |
| Create word    | POST   | `/api/v1/words/`             |
| Update word    | PUT    | `/api/v1/words/{id}`         |
| Delete word    | DELETE | `/api/v1/words/{id}`         |
| Get flashcards | GET    | `/api/v1/flashcards/`        |
| Start quiz     | POST   | `/api/v1/quiz/`              |
| Submit quiz    | POST   | `/api/v1/quiz/{id}/submit`   |
| Statistics     | GET    | `/api/v1/quiz/stats/overall` |
