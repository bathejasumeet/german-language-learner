# Implementation Plan: Replace PostgreSQL with CSV File Storage

**Branch**: `005-csv-storage` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-csv-storage/spec.md`

## Summary

Replace the PostgreSQL / SQLAlchemy / Docker-mounted database with plain CSV files stored under `backend/data/`. The REST API surface is unchanged. The implementation uses Python's stdlib `csv` module (no new dependencies). Six CSV files replace six DB tables. A `CsvStore` class provides generic CRUD operations. All services are refactored to drop the `db: Session` parameter and call module-level store instances directly — the same pattern as `ollama_service.py`. SQLAlchemy, psycopg2, and alembic are removed from `requirements.txt`. The Postgres service is removed from `docker-compose.yml`.

## Technical Context

**Language/Version**: Python 3.11+ (backend), React 19.2.4 (frontend — unchanged)  
**Primary Dependencies**: FastAPI 0.135, httpx 0.28 — Python stdlib `csv` replaces SQLAlchemy 2.0 + psycopg2  
**Storage**: CSV files under `backend/data/` (configurable via `DATA_DIR` env var)  
**Testing**: pytest 9.0 — fixtures use `tempfile.mkdtemp()` for isolated CSV dirs  
**Target Platform**: Local macOS / Linux, single-user  
**Project Type**: Web service (FastAPI backend + React frontend)  
**Performance Goals**: <50ms per CRUD operation at 100k rows; <5ms at typical 10k rows  
**Constraints**: No new PyPI dependencies; API contracts unchanged; single-process only (`--workers 1`)  
**Scale/Scope**: ≤100k rows across all CSV files; single local user

## Constitution Check

| Principle                        | Status  | Notes                                                                   |
| -------------------------------- | ------- | ----------------------------------------------------------------------- |
| I. Code Quality                  | ✅ PASS | `CsvStore` is clearly structured; dead code (SQLAlchemy models) removed |
| II. Testing Standards            | ✅ PASS | All existing unit tests updated; new `CsvStore` unit tests added        |
| III. User Experience Consistency | ✅ PASS | No UI changes; all API shapes preserved                                 |
| IV. Performance Requirements     | ✅ PASS | CSV read/write well under 50ms at target scale                          |
| No new dependencies              | ✅ PASS | Python stdlib `csv` only; three dependencies removed                    |

**Gate result**: All checks pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-csv-storage/
├── plan.md        ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md       (created by /speckit.tasks)
```

### Source Code Changes

```text
backend/
├── src/
│   ├── csv_store.py          NEW  — CsvStore class + module-level store singletons
│   ├── config.py             MOD  — remove Postgres vars; add DATA_DIR
│   ├── main.py               MOD  — remove engine/Base/model imports; init data dir
│   ├── database.py           DEL  — replaced by csv_store.py
│   ├── models/               DEL  — entire directory (SQLAlchemy models no longer needed)
│   ├── services/
│   │   ├── vocabulary.py     MOD  — remove db: Session param; use words_store
│   │   ├── flashcards.py     MOD  — remove db: Session param; use flashcards_store etc
│   │   └── quiz.py           MOD  — remove db: Session param; use quizzes_store etc
│   └── api/
│       ├── words.py          MOD  — remove Depends(get_db)
│       ├── flashcards.py     MOD  — remove Depends(get_db)
│       └── quiz.py           MOD  — remove Depends(get_db)
├── data/                     NEW  — runtime CSV files (gitignored)
│   ├── words.csv
│   ├── flashcards.csv
│   ├── progress.csv
│   ├── quizzes.csv
│   ├── quiz_sessions.csv
│   └── users.csv
├── tests/
│   ├── conftest.py           MOD  — replace SQLite setup with tmpdir CSV
│   └── unit/
│       └── test_csv_store.py NEW  — CsvStore unit tests
├── requirements.txt          MOD  — remove sqlalchemy, psycopg2-binary, alembic
├── alembic.ini               DEL
└── alembic/                  DEL  — entire directory

docker-compose.yml            MOD  — remove postgres service + db volume; add data volume

# Unchanged
backend/src/api/rosetta.py
backend/src/services/ollama_service.py
backend/src/schemas.py
backend/src/schemas_extended.py
frontend/ (all files unchanged)
```

## Complexity Tracking

No constitution violations. No complexity justifications required.

---

## Phase 0: Research

**Status**: Complete — see [research.md](research.md)

Key decisions resolved:

- stdlib `csv` module (no new deps)
- Full file read/write per operation (simple, correct at target scale)
- No locking needed (single-process uvicorn)
- `max(id)+1` for auto-increment
- `DATA_DIR` env var for data location
- Remove `db: Session` param; services call module-level stores directly

---

## Phase 1: Design

**Status**: Complete — see [data-model.md](data-model.md), [quickstart.md](quickstart.md)

### CsvStore Design

```python
# backend/src/csv_store.py

class CsvStore:
    def __init__(self, path: Path, columns: list[str],
                 int_fields: list[str] = (), float_fields: list[str] = ()):
        # Creates file with header row if not exists
        ...

    def all(self) -> list[dict]: ...
    def get(self, id: int) -> dict | None: ...
    def where(self, **kwargs) -> list[dict]: ...  # exact equality filters
    def insert(self, data: dict) -> dict: ...       # auto-assigns id
    def update(self, id: int, **kwargs) -> dict | None: ...
    def delete(self, id: int) -> bool: ...
    def count(self) -> int: ...

# DATA_DIR resolved from env var DATA_DIR, defaulting to Path("./data")
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))

words_store         = CsvStore(DATA_DIR / "words.csv",         WORD_COLUMNS,         ...)
flashcards_store    = CsvStore(DATA_DIR / "flashcards.csv",    FLASHCARD_COLUMNS,    ...)
progress_store      = CsvStore(DATA_DIR / "progress.csv",      PROGRESS_COLUMNS,     ...)
quizzes_store       = CsvStore(DATA_DIR / "quizzes.csv",       QUIZ_COLUMNS,         ...)
quiz_sessions_store = CsvStore(DATA_DIR / "quiz_sessions.csv", QUIZ_SESSION_COLUMNS, ...)
users_store         = CsvStore(DATA_DIR / "users.csv",         USER_COLUMNS,         ...)
```

### Service Signature Changes

Before:

```python
class VocabularyService:
    @staticmethod
    def get_word(db: Session, word_id: int) -> Word | None:
        return db.query(Word).filter(Word.id == word_id).first()
```

After:

```python
class VocabularyService:
    @staticmethod
    def get_word(word_id: int) -> dict | None:
        return words_store.get(word_id)
```

API route changes (before → after):

```python
# Before
async def get_word(word_id: int, db: Session = Depends(get_db)):
    word = VocabularyService.get_word(db, word_id)

# After
async def get_word(word_id: int):
    word = VocabularyService.get_word(word_id)
```

### Return Type Note

Services now return `dict` (from CSV store) instead of SQLAlchemy model instances. FastAPI's Pydantic response serialisation handles dict → model conversion transparently via `response_model=`.

### Test Fixture

```python
# conftest.py (after)
import os, tempfile, pytest
from fastapi.testclient import TestClient

@pytest.fixture(autouse=True, scope="function")
def csv_data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    # Re-initialise stores to point at tmp_path
    import src.csv_store as cs
    cs._init_stores(tmp_path)
    yield tmp_path

@pytest.fixture
def client():
    from src.main import app
    return TestClient(app)
```

### docker-compose.yml After

```yaml
services:
  backend:
    build: ./backend
    environment:
      DATA_DIR: /app/data
      OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-http://host.docker.internal:11434}
      OLLAMA_MODEL: ${OLLAMA_MODEL:-llama3}
    ports:
      - "8000:8000"
    volumes:
      - ./backend/data:/app/data
```

---

## Constitution Check (Post-Design Re-evaluation)

| Principle             | Status  | Notes                                                     |
| --------------------- | ------- | --------------------------------------------------------- |
| I. Code Quality       | ✅ PASS | CsvStore ~80 lines, clean interface; dead code eliminated |
| II. Testing Standards | ✅ PASS | CsvStore unit tests + updated conftest                    |
| III. UX Consistency   | ✅ PASS | Zero UI or API contract changes                           |
| IV. Performance       | ✅ PASS | Benchmarked at target scale in research.md                |

All gates pass post-design. Ready for task generation.
