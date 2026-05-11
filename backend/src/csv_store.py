"""
csv_store.py — generic CSV-backed persistence layer.

Replaces SQLAlchemy + PostgreSQL. Uses Python stdlib `csv` only.
Single-process, no locking, full-file read/write per mutation.
"""
import csv
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Column definitions
# ---------------------------------------------------------------------------

WORD_COLUMNS = [
    "id", "german_word", "meaning", "example_sentence",
    "created_at", "times_practiced", "accuracy",
]

FLASHCARD_COLUMNS = ["id", "word_id", "created_at", "last_studied"]

PROGRESS_COLUMNS = [
    "id", "word_id", "times_reviewed", "correct_answers",
    "incorrect_answers", "last_reviewed",
]

QUIZ_COLUMNS = ["id", "created_at", "total_questions", "correct_answers", "score"]

QUIZ_SESSION_COLUMNS = [
    "id", "user_id", "vocabulary_ids", "answers_json",
    "score", "total_questions", "duration_seconds", "created_at",
]

USER_COLUMNS = ["id", "username", "email", "created_at"]

# ---------------------------------------------------------------------------
# CsvStore
# ---------------------------------------------------------------------------


class CsvStore:
    """Generic CSV-backed store for a single entity type.

    All values are stored as strings; type coercion is applied on read via
    the ``int_fields`` and ``float_fields`` constructor arguments.
    """

    def __init__(
        self,
        path: Path,
        columns: list[str],
        int_fields: tuple[str, ...] = (),
        float_fields: tuple[str, ...] = (),
    ) -> None:
        self._path = path
        self._columns = columns
        self._int_fields = set(int_fields)
        self._float_fields = set(float_fields)
        self._ensure_file()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _ensure_file(self) -> None:
        """Create CSV file with header row if it doesn't exist."""
        if not self._path.exists():
            self._path.parent.mkdir(parents=True, exist_ok=True)
            with self._path.open("w", newline="", encoding="utf-8") as fh:
                writer = csv.DictWriter(fh, fieldnames=self._columns)
                writer.writeheader()

    def _read_all_raw(self) -> list[dict[str, str]]:
        """Return all rows as raw string dicts (no coercion)."""
        with self._path.open("r", newline="", encoding="utf-8") as fh:
            return list(csv.DictReader(fh))

    def _write_all(self, rows: list[dict]) -> None:
        """Overwrite the CSV with a new set of rows."""
        with self._path.open("w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=self._columns, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)

    def _coerce(self, row: dict[str, str]) -> dict[str, Any]:
        """Apply type coercion to a row dict."""
        result: dict[str, Any] = {}
        for key, value in row.items():
            if key in self._int_fields:
                result[key] = int(value) if value not in ("", None) else None
            elif key in self._float_fields:
                result[key] = float(value) if value not in ("", None) else None
            else:
                result[key] = value
        return result

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def all(self) -> list[dict]:
        """Return all rows as list of dicts (with type coercion applied)."""
        return [self._coerce(r) for r in self._read_all_raw()]

    def get(self, id: int) -> dict | None:
        """Return first row matching id, or None."""
        for row in self._read_all_raw():
            if row.get("id") == str(id):
                return self._coerce(row)
        return None

    def where(self, **kwargs) -> list[dict]:
        """Return all rows where all kwargs match (string equality on raw values)."""
        results = []
        for row in self._read_all_raw():
            if all(row.get(k) == str(v) for k, v in kwargs.items()):
                results.append(self._coerce(row))
        return results

    def insert(self, data: dict) -> dict:
        """Append a new row.  Auto-assigns ``id``.  Returns the inserted row."""
        rows = self._read_all_raw()
        existing_ids = [int(r["id"]) for r in rows if r.get("id")]
        new_id = max(existing_ids, default=0) + 1
        row = {col: "" for col in self._columns}
        row.update({k: str(v) if v is not None else "" for k, v in data.items()})
        row["id"] = str(new_id)
        rows.append(row)
        self._write_all(rows)
        return self._coerce(row)

    def update(self, id: int, **kwargs) -> dict | None:
        """Update fields of row with given id. Returns updated row or None."""
        rows = self._read_all_raw()
        found = None
        for row in rows:
            if row.get("id") == str(id):
                for k, v in kwargs.items():
                    row[k] = str(v) if v is not None else ""
                found = row
                break
        if found is None:
            return None
        self._write_all(rows)
        return self._coerce(found)

    def delete(self, id: int) -> bool:
        """Remove row with given id. Returns True if found and removed."""
        rows = self._read_all_raw()
        new_rows = [r for r in rows if r.get("id") != str(id)]
        if len(new_rows) == len(rows):
            return False
        self._write_all(new_rows)
        return True

    def count(self) -> int:
        """Return row count."""
        return len(self._read_all_raw())


# ---------------------------------------------------------------------------
# Module-level DATA_DIR and singleton initialisation
# ---------------------------------------------------------------------------

DATA_DIR: Path = Path(os.getenv("DATA_DIR", "./data"))

# Module-level singletons — populated by _init_stores()
words_store: CsvStore
flashcards_store: CsvStore
progress_store: CsvStore
quizzes_store: CsvStore
quiz_sessions_store: CsvStore
users_store: CsvStore


def _init_stores(data_dir: Path) -> None:
    """(Re)initialise all module-level store singletons.

    Call this from ``main.py`` startup and from test fixtures (with a
    ``tmp_path`` directory) to get clean, isolated stores per test.
    """
    global DATA_DIR  # noqa: PLW0603
    global words_store, flashcards_store, progress_store
    global quizzes_store, quiz_sessions_store, users_store

    DATA_DIR = data_dir
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    words_store = CsvStore(
        DATA_DIR / "words.csv",
        WORD_COLUMNS,
        int_fields=("id", "times_practiced"),
        float_fields=("accuracy",),
    )
    flashcards_store = CsvStore(
        DATA_DIR / "flashcards.csv",
        FLASHCARD_COLUMNS,
        int_fields=("id", "word_id"),
    )
    progress_store = CsvStore(
        DATA_DIR / "progress.csv",
        PROGRESS_COLUMNS,
        int_fields=("id", "word_id", "times_reviewed", "correct_answers", "incorrect_answers"),
    )
    quizzes_store = CsvStore(
        DATA_DIR / "quizzes.csv",
        QUIZ_COLUMNS,
        int_fields=("id", "total_questions", "correct_answers"),
        float_fields=("score",),
    )
    quiz_sessions_store = CsvStore(
        DATA_DIR / "quiz_sessions.csv",
        QUIZ_SESSION_COLUMNS,
        int_fields=("id", "user_id", "score", "total_questions", "duration_seconds"),
    )
    users_store = CsvStore(
        DATA_DIR / "users.csv",
        USER_COLUMNS,
        int_fields=("id",),
    )


# Initialise with default DATA_DIR on import (production path).
# Tests call _init_stores(tmp_path) to override.
_init_stores(DATA_DIR)
