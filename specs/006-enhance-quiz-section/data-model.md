# Data Model: Enhance Quiz Section

**Feature**: 006-enhance-quiz-section  
**Date**: 2026-05-13

No new persistent entities are introduced. This feature enhances existing quiz behaviour without schema changes.

---

## Existing Entities Used

### Word (read-only in this feature)

Stored in `backend/data/words.csv` via `csv_store.words_store`.

| Field       | Type | Notes                                   |
| ----------- | ---- | --------------------------------------- |
| id          | int  | Auto-assigned                           |
| german_word | str  | Prompt shown in quiz question           |
| meaning     | str  | Correct answer + source for distractors |

### QuizSession (write — via `POST /api/v1/quiz/complete`)

Stored in `backend/data/quiz_sessions.csv` via `csv_store.quiz_sessions_store`.

| Field            | Type         | Notes                                 |
| ---------------- | ------------ | ------------------------------------- |
| id               | int          | Auto-assigned                         |
| user_id          | int          | Hardcoded to `1` (no auth)            |
| vocabulary_ids   | JSON str     | IDs of words used as question prompts |
| score            | int          | Number of correct answers             |
| total_questions  | int          | Total questions in session            |
| answers_json     | JSON str     | Per-question answer details           |
| duration_seconds | int?         | Optional elapsed time                 |
| created_at       | ISO datetime | Session timestamp                     |

---

## In-Memory / Client-Side State (frontend only, not persisted)

### QuizQuestion (runtime, from `GET /api/v1/quiz/generate` response)

| Field                | Type  | Notes                     |
| -------------------- | ----- | ------------------------- |
| id                   | str   | e.g. `"q_1"`              |
| vocabulary_id        | int   | Word ID                   |
| question             | str   | Display text              |
| german_word          | str   | Displayed prominently     |
| english_meaning      | str   | Correct answer text       |
| options              | str[] | 4 shuffled option strings |
| correct_answer_index | int   | 0-3                       |

### UserAnswer (accumulated in `QuizComponent` state during quiz)

| Field               | Type         | Notes                                          |
| ------------------- | ------------ | ---------------------------------------------- |
| questionIndex       | int          | 0-based position in session                    |
| question            | QuizQuestion | Full question data                             |
| selectedOptionIndex | int          | Learner's pick (0-3)                           |
| isCorrect           | bool         | `selectedOptionIndex === correct_answer_index` |

This `UserAnswer[]` array is the sole data source for the end-of-quiz results review screen.

---

## Constant Change

| Location                       | Constant                   | Old Value | New Value |
| ------------------------------ | -------------------------- | --------- | --------- |
| `backend/src/services/quiz.py` | `MINIMUM_VOCABULARY_COUNT` | `4`       | `10`      |
