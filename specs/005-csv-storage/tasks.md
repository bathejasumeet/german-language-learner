# Tasks: Replace PostgreSQL with CSV File Storage

**Branch**: `005-csv-storage` | **Date**: 2026-05-11  
**Input**: Design documents from `/specs/005-csv-storage/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (operates on different files, no dependency on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup

**Purpose**: Prepare the repository — add `.gitignore` entry, add `DATA_DIR` env var docs, update `requirements.txt`, and create the `backend/data/` directory placeholder.

- [x] T001 Add `backend/data/` to `backend/.gitignore` (create file if missing) and add `DATA_DIR=./data` to `backend/.env.example`
- [x] T002 [P] Remove `sqlalchemy==...`, `psycopg2-binary==...`, and `alembic==...` lines from `backend/requirements.txt`

**Checkpoint**: Repository is clean — no DB dependency declarations remain, data dir is gitignored.

---

## Phase 2: Foundational — CsvStore

**Purpose**: Implement the `CsvStore` class and module-level singletons. This is the **only blocking prerequisite** — every user story depends on it.

**⚠️ CRITICAL**: No service or API task can begin until T003 is complete.

- [x] T003 Create `backend/src/csv_store.py` with:
  - `CsvStore.__init__(path, columns, int_fields=(), float_fields=())` — creates file with header row if not present
  - `CsvStore.all() -> list[dict]` — full file read via `csv.DictReader`
  - `CsvStore.get(id: int) -> dict | None` — linear search by `id`
  - `CsvStore.where(**kwargs) -> list[dict]` — filter by equality on any fields
  - `CsvStore.insert(data: dict) -> dict` — auto-assign `id = max(existing_ids, default=0) + 1`, append row, return inserted dict
  - `CsvStore.update(id: int, **kwargs) -> dict | None` — rewrite entire file with updated row
  - `CsvStore.delete(id: int) -> bool` — rewrite entire file without the row
  - `CsvStore.count() -> int`
  - `_init_stores(data_dir: Path)` module-level function that (re)assigns all six singletons — needed for test fixtures
  - Module-level singletons: `words_store`, `flashcards_store`, `progress_store`, `quizzes_store`, `quiz_sessions_store`, `users_store` with correct column lists and type coercion fields per `data-model.md`
  - `DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))` resolved at import time; `DATA_DIR.mkdir(parents=True, exist_ok=True)` called in `_init_stores`

**Checkpoint**: `CsvStore` can be imported and used standalone — all six stores created correctly.

---

## Phase 3: User Story 1 — Run Without Docker or Postgres (Priority: P1)

**Goal**: The backend starts with `uvicorn src.main:app` and no Postgres or Docker. CSV files are created automatically on first run.

**Independent Test**: With no Postgres running and no DB env vars set: `uvicorn src.main:app --reload` → `curl http://localhost:8000/health` returns `{"status":"ok"}` and `curl http://localhost:8000/api/v1/words/` returns `[]`.

- [x] T004 [US1] Rewrite `backend/src/config.py` — remove all `POSTGRES_*` settings and the `DATABASE_URL` property; add `DATA_DIR: str = os.getenv("DATA_DIR", "./data")`
- [x] T005 [US1] Rewrite `backend/src/main.py` — remove all SQLAlchemy/model imports (`engine`, `Base`, `Word`, `Flashcard`, etc.) and the `@app.on_event("startup")` table-creation block; add startup that calls `csv_store._init_stores(Path(settings.DATA_DIR))`; keep all router registrations and CORS unchanged
- [x] T006 [P] [US1] Delete `backend/src/database.py` (entire file — no longer needed)
- [x] T007 [P] [US1] Delete `backend/src/models/models.py`, `backend/src/models/__init__.py`, and the `backend/src/models/` directory
- [x] T008 [P] [US1] Delete `backend/alembic.ini` and the entire `backend/alembic/` directory

**Checkpoint**: Server starts without Postgres. `GET /health` returns 200. CSV files are created in `backend/data/` on startup.

---

## Phase 4: User Story 2 — CRUD Operations Persist Correctly (Priority: P1)

**Goal**: All vocabulary, flashcard, quiz, and progress API endpoints read/write CSV files. Data survives a server restart.

**Independent Test**: `POST /api/v1/words/ {"german_word":"Haus","meaning":"house"}` → restart uvicorn → `GET /api/v1/words/` returns `[{"id":1,"german_word":"Haus",...}]`.

- [x] T009 [US2] Rewrite `backend/src/services/vocabulary.py` — remove `db: Session` param from all methods; replace all SQLAlchemy queries with `words_store` calls:
  - `create_word(german_word, meaning, example_sentence=None)` → duplicate check via `words_store.where(german_word=…)` (case-insensitive); insert via `words_store.insert`
  - `get_word(word_id)` → `words_store.get(word_id)`
  - `get_all_words(skip=0, limit=100)` → `words_store.all()[skip:skip+limit]`
  - `update_word(word_id, ...)` → `words_store.update(word_id, ...)`
  - `delete_word(word_id)` → `words_store.delete(word_id)`
- [x] T010 [P] [US2] Rewrite `backend/src/services/flashcards.py` — remove `db: Session` param; replace all SQLAlchemy queries with `flashcards_store` and `words_store` calls (generate, get_all, get, mark_known via `words_store.update`, delete)
- [x] T011 [P] [US2] Rewrite `backend/src/services/quiz.py` — remove `db: Session` param; replace all SQLAlchemy queries with `quizzes_store`, `progress_store`, and `words_store` calls (create_quiz, submit_quiz_result, get_quiz, get_all_quizzes, record_word_progress, get_word_progress, get_user_statistics)
- [x] T012 [US2] Rewrite `backend/src/api/words.py` — remove `from sqlalchemy.orm import Session`, `from src.database import get_db`, and all `db: Session = Depends(get_db)` parameters; update all `VocabularyService.*` calls to drop the `db` argument
- [x] T013 [P] [US2] Rewrite `backend/src/api/flashcards.py` — remove SQLAlchemy/get_db imports and `db` params; update all `FlashcardService.*` and `QuizService.*` calls to drop the `db` argument
- [x] T014 [P] [US2] Rewrite `backend/src/api/quiz.py` — remove SQLAlchemy/get_db imports and `db` params; update all `QuizService.*` calls to drop the `db` argument; also update any remaining `db.query(QuizSession)` direct queries to use `quiz_sessions_store`

**Checkpoint**: All CRUD operations work end-to-end. Restart the server — all previously written data is still accessible.

---

## Phase 5: User Story 3 — Remove Postgres from docker-compose (Priority: P2)

**Goal**: `docker-compose.yml` has no Postgres service. `docker compose up backend` works with only a CSV volume mount.

**Independent Test**: `docker compose config` output shows no `postgres` service. `docker compose up backend` starts cleanly.

- [x] T015 [US3] Rewrite `docker-compose.yml` — remove the `postgres` service block entirely; remove `depends_on: postgres` from the backend service; replace Postgres env vars with `DATA_DIR: /app/data` and Ollama vars; add `volumes: - ./backend/data:/app/data`; remove the `./db` volume reference

**Checkpoint**: `docker compose up backend` starts the server with no DB container.

---

## Phase 6: User Story 4 — Tests Pass Without a Database (Priority: P2)

**Goal**: All unit tests pass. The test fixture uses a temporary CSV directory instead of SQLite.

**Independent Test**: `cd backend && python3 -m pytest tests/unit/ -v` — all tests pass with no Postgres or SQLite.

- [x] T016 [US4] Rewrite `backend/tests/conftest.py` — remove SQLite engine setup and `Base.metadata.create_all`; add a `csv_data_dir` autouse fixture that sets `DATA_DIR` env var to `str(tmp_path)` and calls `csv_store._init_stores(tmp_path)`; keep the `client` fixture using `TestClient(app)`
- [x] T017 [P] [US4] Create `backend/tests/unit/test_csv_store.py` with unit tests for `CsvStore`:
  - `test_insert_assigns_sequential_ids` — two inserts produce ids 1 and 2
  - `test_get_returns_none_for_missing` — `get(999)` returns `None`
  - `test_all_returns_all_rows` — insert 3 rows; `all()` returns 3
  - `test_update_modifies_field` — insert then update a field; `get` reflects change
  - `test_delete_removes_row` — insert then delete; `get` returns None, `count()` = 0
  - `test_where_filters_correctly` — insert 2 rows; `where(meaning="house")` returns only matching row
  - `test_type_coercion_int_and_float` — inserted int/float fields read back as correct Python types
  - `test_persistence_across_instances` — write via one CsvStore instance; read via new instance pointed at same file
- [x] T018 [P] [US4] Update `backend/tests/unit/test_rosetta.py` — remove any `db` / SQLAlchemy fixture references; ensure `mock_word` fixture returns a plain `dict` with `id`, `german_word`, `meaning` keys (matching what the CSV-backed `VocabularyService.get_word` returns); verify all 11 tests still pass

**Checkpoint**: `pytest tests/unit/ -v` — all tests pass. No Postgres, no SQLite.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup — add `backend/data/` to `.gitignore`, verify no stale imports, confirm `requirements.txt` is clean.

- [x] T019 [P] Add `data/` to `backend/.gitignore` (if not already present from T001); verify no remaining imports of `sqlalchemy`, `psycopg2`, `alembic`, or `src.database` / `src.models` anywhere in `backend/src/` using grep; fix any stragglers
- [x] T020 [P] Run `python3 -m pytest tests/unit/ -v` and confirm all tests pass; run `python3 -c "from src.main import app; print('OK')"` from `backend/` to confirm the app imports cleanly without Postgres

**Checkpoint**: Clean import, all tests green. Feature complete.

---

## Dependency Graph

```
T001 (setup)
T002 (setup — parallel with T001)
  └── T003 (CsvStore — FOUNDATIONAL BLOCKER)
        ├── T004 → T005 → T006/T007/T008  (US1 — server starts)
        ├── T009 → T010/T011              (US2 — services)
        │     └── T012 → T013/T014        (US2 — API routes)
        ├── T015                           (US3 — compose, parallel with US2)
        └── T016 → T017/T018              (US4 — tests)
              └── T019 → T020             (Polish)
```

## Parallel Execution Opportunities Per Story

**US1** (after T003): T006, T007, T008 can run in parallel (all deletions, independent files)  
**US2** (after T009): T010, T011 can run in parallel (different service files)  
**US2** (after T012): T013, T014 can run in parallel (different API files)  
**US3**: T015 can run in parallel with all US2 tasks (different file: docker-compose.yml)  
**US4** (after T016): T017, T018 can run in parallel (different test files)  
**Polish**: T019, T020 can run in parallel

## Implementation Strategy

**MVP scope** (just US1 + US2 = T001–T014): Server runs, all CRUD works, no Postgres.  
**Full feature** adds US3 (T015) and US4 (T016–T018) for Docker cleanup and test coverage.  
**Recommended order**: T001 → T002 → T003 → T004 → T005 → [T006, T007, T008 parallel] → T009 → [T010, T011 parallel] → T012 → [T013, T014 parallel] → T015 → T016 → [T017, T018 parallel] → T019 → T020

**Total tasks**: 20  
**MVP tasks** (US1 + US2): 14  
**Polish/test tasks**: 6
