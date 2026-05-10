# Data Model: Minimalist Tab-Based UI Refactor

**Feature**: 003-ui-tab-refactor  
**Date**: 2026-05-10  
**Note**: This is a frontend-only refactor. No new database entities or schema changes. This document captures the UI data shapes that flow between the API and components.

---

## UI State Model

### Tab Navigation

| State variable | Type     | Values                                                                      | Owner            |
| -------------- | -------- | --------------------------------------------------------------------------- | ---------------- |
| `currentPage`  | `string` | `'vocabulary'` \| `'words'` \| `'flashcards'` \| `'quiz'` \| `'statistics'` | `Navigation.jsx` |

---

## API Response Shapes (consumed by UI, unchanged)

### Word

```js
{
  id: number,
  german_word: string,
  meaning: string,
  example_sentence: string | null,
  created_at: string,         // ISO datetime
  times_practiced: number,
  accuracy: number            // 0–100 percentage
}
```

**Consumed by**: Vocabulary tab (create), Words tab (list/edit/delete), Flashcards tab (auto-loaded for study)

### Flashcard

```js
{
  id: number,
  word_id: number,
  created_at: string,
  last_studied: string | null,
  word: Word                  // nested Word object
}
```

**Consumed by**: Flashcards tab

### Quiz

```js
{
  id: number,
  created_at: string,
  total_questions: number,
  correct_answers: number,
  score: number               // 0–100 percentage
}
```

**Consumed by**: Quiz tab

### Statistics

```js
{
  total_words: number,
  total_quizzes: number,
  average_quiz_score: number, // percentage
  total_reviews: number,
  overall_accuracy: number    // percentage
}
```

**Consumed by**: Statistics tab

---

## Component Props Interface

### `<Navigation />`

No props. Top-level controller, manages `currentPage` state internally.

### `<Vocabulary />`

| Prop     | Type | Description                                                |
| -------- | ---- | ---------------------------------------------------------- |
| _(none)_ | —    | Standalone; removed `onNavigateToWords` cross-tab callback |

### `<WordsTab />`

| Prop     | Type | Description                                                |
| -------- | ---- | ---------------------------------------------------------- |
| _(none)_ | —    | Standalone; removed `onNavigateToVocab` cross-tab callback |

### `<FlashcardStudy />`

No props. Loads all words internally on mount. No word-selection step.

### `<QuizComponent />`

No props. Manages quiz state internally.

### `<Statistics />`

No props. Fetches stats on mount.

---

## Entities Removed / Simplified

| Old pattern                                                   | Replacement                         |
| ------------------------------------------------------------- | ----------------------------------- |
| Inline `style={{}}` props throughout `Vocabulary.jsx`         | CSS class via `vocabulary.css`      |
| `onNavigateToWords` / `onNavigateToVocab` cross-tab callbacks | Removed; Navigation handles routing |
| FlashcardStudy word-selection pre-step                        | Removed; auto-load all words        |
| Emoji tab labels (`📚 Vocabulary`)                            | Plain text labels                   |
