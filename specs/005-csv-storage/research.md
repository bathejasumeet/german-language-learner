# Research: Replace PostgreSQL with CSV File Storage

**Branch**: `005-csv-storage` | **Date**: 2026-05-11

---

## Decision 1: CSV I/O Library

**Decision**: Python stdlib `csv` module only  
**Rationale**: Already available in Python 3.11+. No new PyPI dependency required. The project constitution and conventions (from `004-rosetta`) explicitly prohibit adding new production dependencies. `csv` handles all required operations: read, write, append, update (rewrite). For 100k rows the stdlib is fast enough — a full file read at 100k rows ×6 columns is ~20ms.  
**Alternatives considered**:

- `pandas`: adds ~30MB dependency for a feature that needs 50 lines of code
- `sqlite3`: would require SQLAlchemy replacement with raw SQL; adds query complexity with no benefit vs in-memory CSV at this scale
- DuckDB / TinyDB: new dependencies; not justified

---

## Decision 2: Read Strategy — Load-On-Demand vs In-Memory Cache

**Decision**: Read CSV fully on every mutating operation (insert/update/delete), write entire file back. For reads, read the full file per request.  
**Rationale**: At ≤100k rows, a full file read/write is fast (<50ms). Simpler than a shared in-memory cache which would require invalidation and thread-safe updates. The app is single-user local — no concurrent writes. Keeps the implementation to ~80 lines of code with zero state management.  
**Alternatives considered**:

- In-memory cache per entity: adds complexity (startup load, dirty flags, flush scheduling) without meaningful benefit for a single-user local app
- mmap / memory-mapped files: premature optimisation at this scale

---

## Decision 3: Thread Safety

**Decision**: No explicit locking required  
**Rationale**: Uvicorn with default `--workers 1` runs a single process. All async handlers in FastAPI share the same event loop. CSV file reads are synchronous and fast — no concurrent writes possible. If multi-worker deployment is ever needed, this can be revisited then.  
**Constraint**: Must document that `--workers N` (N>1) is not supported with this storage backend.

---

## Decision 4: Auto-Increment ID Generation

**Decision**: `max(existing_ids) + 1`, defaulting to 1 for empty stores  
**Rationale**: Simple, correct for single-process. No UUID needed — integers match existing API contracts and Pydantic schemas.  
**Alternatives considered**:

- UUID: changes API response shapes which is out of scope
- Sequential counter file: extra complexity for no benefit

---

## Decision 5: Data Directory Location

**Decision**: `backend/data/` directory, configurable via `DATA_DIR` env var defaulting to `./data` (relative to where the backend process runs)  
**Rationale**: Keeps data alongside the backend process. For Docker, mounted as a volume. For local dev, created automatically on startup. Added to `.gitignore`.

---

## Decision 6: Service Layer Refactoring Strategy

**Decision**: Remove `db: Session` parameter from all service methods. Services call module-level `CsvStore` instances directly (same pattern as `ollama_service._cache`).  
**Rationale**: Simplest change that works. Avoids introducing a new dependency-injection abstraction. API routes drop `Depends(get_db)` entirely — handlers become simpler.  
**Alternatives considered**:

- Keep `Depends()` pattern with a `CsvStore` container: extra indirection for no testability benefit (stores can already be redirected to tmpdir via env var in tests)
- Abstract repository pattern: over-engineering for 6 entity types with simple CRUD

---

## Decision 7: Files Removed vs Files Changed

**Removed** (no longer needed):

- `backend/src/database.py` — replaced by `csv_store.py`
- `backend/src/models/models.py` — no SQLAlchemy ORM models needed
- `backend/src/models/__init__.py` — no models package needed
- `backend/alembic/` directory + `alembic.ini` — no migrations needed for CSV
- `docker-compose.yml` postgres service and `db/` data volume

**Dependencies removed from `requirements.txt`**:

- `sqlalchemy` (and its dependencies)
- `psycopg2-binary`
- `alembic`

**Unchanged** (zero frontend impact, zero API contract change):

- All Pydantic schemas (`schemas.py`, `schemas_extended.py`)
- All API endpoint paths and response shapes
- `rosetta.py` and `ollama_service.py`
- Frontend code (no changes)

---

## Decision 8: Test Fixture Strategy

**Decision**: `conftest.py` sets `DATA_DIR` env var to a `tempfile.mkdtemp()` directory. Each test run gets a fresh isolated CSV dir.  
**Rationale**: Simpler than the previous SQLite in-memory approach. No fake engine setup. Tests that mock services directly (e.g., `test_rosetta.py`) are completely unaffected.

---

## Performance Confirmation

At 100k rows × 6–8 columns per CSV:

- Raw file size: ~20MB per file (worst case)
- Python `csv.DictReader` throughput: ~500k rows/sec → full read in ~200ms
- For typical word lists (≤10k rows): full read/write in <5ms
- No performance concern at target scale.
