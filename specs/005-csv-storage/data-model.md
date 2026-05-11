# Data Model: CSV File Schemas

**Branch**: `005-csv-storage` | **Date**: 2026-05-11

---

## Overview

Six CSV files replace the six PostgreSQL tables. Each file is stored under `DATA_DIR` (default: `backend/data/`). Files are auto-created with headers on first startup if they do not exist.

All values are stored as strings; type coercion is handled by `CsvStore` on read.

---

## `words.csv`

Replaces: `words` table

| Column             | Type              | Required | Default    | Notes                          |
| ------------------ | ----------------- | -------- | ---------- | ------------------------------ |
| `id`               | int               | yes      | auto       | Auto-increment                 |
| `german_word`      | str               | yes      | —          | Unique, case-insensitive check |
| `meaning`          | str               | yes      | —          |                                |
| `example_sentence` | str               | no       | `""`       | Max 500 chars                  |
| `created_at`       | ISO-8601 datetime | yes      | `utcnow()` |                                |
| `times_practiced`  | int               | yes      | `0`        |                                |
| `accuracy`         | float             | yes      | `0.0`      | 0–100 percentage               |

**Integrity**: `german_word` uniqueness enforced in `VocabularyService.create_word`.

---

## `flashcards.csv`

Replaces: `flashcards` table

| Column         | Type              | Required | Default    | Notes                                  |
| -------------- | ----------------- | -------- | ---------- | -------------------------------------- |
| `id`           | int               | yes      | auto       |                                        |
| `word_id`      | int               | yes      | —          | FK → `words.id` (validated in service) |
| `created_at`   | ISO-8601 datetime | yes      | `utcnow()` |                                        |
| `last_studied` | ISO-8601 datetime | no       | `""`       | Empty string = never studied           |

---

## `progress.csv`

Replaces: `progress` table

| Column              | Type              | Required | Default | Notes           |
| ------------------- | ----------------- | -------- | ------- | --------------- |
| `id`                | int               | yes      | auto    |                 |
| `word_id`           | int               | yes      | —       | FK → `words.id` |
| `times_reviewed`    | int               | yes      | `0`     |                 |
| `correct_answers`   | int               | yes      | `0`     |                 |
| `incorrect_answers` | int               | yes      | `0`     |                 |
| `last_reviewed`     | ISO-8601 datetime | no       | `""`    |                 |

---

## `quizzes.csv`

Replaces: `quizzes` table

| Column            | Type              | Required | Default    | Notes            |
| ----------------- | ----------------- | -------- | ---------- | ---------------- |
| `id`              | int               | yes      | auto       |                  |
| `created_at`      | ISO-8601 datetime | yes      | `utcnow()` |                  |
| `total_questions` | int               | yes      | —          |                  |
| `correct_answers` | int               | yes      | `0`        |                  |
| `score`           | float             | yes      | `0.0`      | Percentage 0–100 |

---

## `quiz_sessions.csv`

Replaces: `quiz_sessions` table

| Column             | Type              | Required | Default    | Notes                                  |
| ------------------ | ----------------- | -------- | ---------- | -------------------------------------- |
| `id`               | int               | yes      | auto       |                                        |
| `user_id`          | int               | yes      | —          | FK → `users.id`                        |
| `vocabulary_ids`   | str (JSON array)  | yes      | —          | Stored as JSON string e.g. `"[1,2,3]"` |
| `answers_json`     | str (JSON array)  | yes      | —          | Stored as JSON string                  |
| `score`            | int               | yes      | —          |                                        |
| `total_questions`  | int               | yes      | —          |                                        |
| `duration_seconds` | int               | no       | `""`       |                                        |
| `created_at`       | ISO-8601 datetime | yes      | `utcnow()` |                                        |

---

## `users.csv`

Replaces: `users` table

| Column       | Type              | Required | Default    | Notes  |
| ------------ | ----------------- | -------- | ---------- | ------ |
| `id`         | int               | yes      | auto       |        |
| `username`   | str               | yes      | —          | Unique |
| `email`      | str               | yes      | —          | Unique |
| `created_at` | ISO-8601 datetime | yes      | `utcnow()` |        |

---

## CsvStore Class Interface

Defined in `backend/src/csv_store.py`:

```python
class CsvStore:
    """Generic CSV-backed store for a single entity type."""

    def __init__(self, path: Path, columns: list[str]):
        """Creates the CSV file with headers if it does not exist."""

    def all(self) -> list[dict]:
        """Return all rows as list of dicts."""

    def get(self, id: int) -> dict | None:
        """Return first row matching id, or None."""

    def where(self, **kwargs) -> list[dict]:
        """Return all rows where all kwargs match (equality)."""

    def insert(self, data: dict) -> dict:
        """Append a new row. Auto-assigns id. Returns the inserted row."""

    def update(self, id: int, **kwargs) -> dict | None:
        """Update fields of row with given id. Returns updated row or None."""

    def delete(self, id: int) -> bool:
        """Remove row with given id. Returns True if found."""

    def count(self) -> int:
        """Return row count."""
```

**Module-level singletons** (also in `csv_store.py`):

```python
words_store      = CsvStore(DATA_DIR / "words.csv",         WORD_COLUMNS)
flashcards_store = CsvStore(DATA_DIR / "flashcards.csv",    FLASHCARD_COLUMNS)
progress_store   = CsvStore(DATA_DIR / "progress.csv",      PROGRESS_COLUMNS)
quizzes_store    = CsvStore(DATA_DIR / "quizzes.csv",        QUIZ_COLUMNS)
quiz_sessions_store = CsvStore(DATA_DIR / "quiz_sessions.csv", QUIZ_SESSION_COLUMNS)
users_store      = CsvStore(DATA_DIR / "users.csv",          USER_COLUMNS)
```

---

## Type Coercion Map

`CsvStore` applies these conversions on read:

| Column suffix / name pattern                                                                                              | Python type                                                 |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `id`, `word_id`, `user_id`, `*_id`, `total_*`, `correct_*`, `incorrect_*`, `times_*`, `duration_*`, `score` (int columns) | `int` (skip empty)                                          |
| `accuracy`, `score` (float columns)                                                                                       | `float`                                                     |
| `created_at`, `last_*`                                                                                                    | `str` (left as ISO string; Pydantic handles datetime parse) |
| `vocabulary_ids`, `answers_json`                                                                                          | `str` (raw JSON string; callers parse with `json.loads`)    |
| All others                                                                                                                | `str`                                                       |

Each `CsvStore` instance is constructed with explicit `int_fields` and `float_fields` lists to avoid ambiguity.
