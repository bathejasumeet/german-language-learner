# Feature Specification: Replace PostgreSQL with CSV File Storage

**Feature Branch**: `005-csv-storage`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "switch out postgres for csv stored locally. I don't like docker mounted postgres. As is it is not data that requires encryption and anyways it will be not more than 100000 rows"

## Summary

Replace the PostgreSQL / SQLAlchemy / Docker-mounted database with plain CSV files stored on the local filesystem. The REST API surface is unchanged — all existing endpoints continue to work identically. Only the storage layer is replaced.

**Motivation**: The app is a personal language-learning tool. Data is non-sensitive, volume is bounded (≤100k rows across all entities), and running a Dockerised Postgres server adds friction with no benefit at this scale.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Run the app without Docker or Postgres (Priority: P1)

A developer (or user) starts the backend with `uvicorn src.main:app` and the frontend with `npm run dev`. No Docker, no Postgres, no `.env` database credentials required.

**Why this priority**: Eliminates the entire friction point. This is the core goal.

**Independent Test**: Stop all Docker containers. Delete `.env` database vars. Run `uvicorn src.main:app --reload` from `backend/`. The server starts, `/health` returns `{"status":"ok"}`, and the words endpoint returns `[]` (empty, freshly initialised CSV files).

**Acceptance Scenarios**:

1. **Given** no Postgres running, **When** `uvicorn src.main:app` is executed, **Then** the server starts without error and creates `backend/data/*.csv` files if they do not exist.
2. **Given** a `backend/data/words.csv` file with existing words, **When** the server starts, **Then** those words are returned by `GET /api/v1/words/`.
3. **Given** a `GET /health` request, **When** no database is running, **Then** `{"status":"ok"}` is returned.

---

### User Story 2 - All CRUD operations persist correctly to CSV (Priority: P1)

All existing vocabulary, flashcard, quiz, and progress operations read from and write to CSV files, with data surviving a server restart.

**Why this priority**: Without correct persistence the app is non-functional.

**Independent Test**: `POST /api/v1/words/` with a new word → restart server → `GET /api/v1/words/` returns that word. Repeat for flashcards and quizzes.

**Acceptance Scenarios**:

1. **Given** an empty `words.csv`, **When** `POST /api/v1/words/` is called, **Then** the new word is appended and returned with an auto-incremented `id`.
2. **Given** a word in `words.csv`, **When** `DELETE /api/v1/words/{id}` is called, **Then** the row is removed and `GET /api/v1/words/{id}` returns 404.
3. **Given** a word in `words.csv`, **When** `PUT /api/v1/words/{id}` is called, **Then** the row is updated in-place and the server returns the updated word.
4. **Given** data written to CSV, **When** the server is restarted, **Then** all previously written data is still accessible via the API.

---

### User Story 3 - docker-compose no longer needs a Postgres service (Priority: P2)

The `docker-compose.yml` is updated to remove the `postgres` service and all related volume mounts. Running `docker compose up` starts only the backend (and frontend if applicable).

**Why this priority**: Secondary quality-of-life — removes the misleading Postgres dependency from the compose file.

**Independent Test**: `docker compose config` shows no `postgres` service. `docker compose up backend` starts successfully without a Postgres container.

**Acceptance Scenarios**:

1. **Given** the updated `docker-compose.yml`, **When** `docker compose up backend`, **Then** the backend starts and CSV data dir is mounted as a volume.
2. **Given** no Postgres env vars in `.env`, **When** the backend container starts, **Then** no database-connection errors appear in logs.

---

### User Story 4 - Existing tests continue to pass (Priority: P2)

All backend unit and integration tests pass after the storage swap. Test fixtures use a temporary CSV data directory rather than an in-memory SQLite DB.

**Why this priority**: Confidence that the migration didn't break anything.

**Independent Test**: `pytest backend/tests/unit/` passes with no database running.

**Acceptance Scenarios**:

1. **Given** the refactored backend, **When** `pytest tests/unit/` is run, **Then** all tests pass.
2. **Given** no SQLAlchemy or psycopg2 installed, **When** the backend starts, **Then** no import errors occur.

---

## Out of Scope

- Encryption of CSV files
- Concurrent multi-user write safety (single local user, single process)
- Migration tooling to export existing Postgres data (manual CSV copy if needed)
- Changing any REST API endpoint paths or response shapes
