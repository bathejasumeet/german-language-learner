# german-language-learner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-13

## Active Technologies
- React 19.2.4 + JavaScript (ES module), Node.js 18+ + Vite 8, Axios 1.15 (no new dependencies) (ui-tab-refactor)
- N/A — no DB changes; existing PostgreSQL via unchanged backend (ui-tab-refactor)
- Python 3.11+ (backend), JavaScript ES2022 / React 19.2.4 (frontend) + FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.1ns in v1 (004-rosetta)
- Python 3.11+ (backend), React 19.2.4 (frontend — unchanged) + FastAPI 0.135, httpx 0.28 — Python stdlib `csv` replaces SQLAlchemy 2.0 + psycopg2 (005-csv-storage)
- CSV files under `backend/data/` (configurable via `DATA_DIR` env var) (005-csv-storage)

- Python 3.11+ (backend), React 19.2.4 (frontend) + FastAPI (backend), React + Vite (frontend), SQLAlchemy, axios, psycopg2 (002-enhance-user-features)

## Project Structure

```text
src/
tests/
```

## Commands

cd src && pytest && ruff check .

## Code Style

Python 3.11+ (backend), React 19.2.4 (frontend): Follow standard conventions

## Recent Changes
- 006-enhance-quiz-section: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 005-csv-storage: Added Python 3.11+ (backend), React 19.2.4 (frontend — unchanged) + FastAPI 0.135, httpx 0.28 — Python stdlib `csv` replaces SQLAlchemy 2.0 + psycopg2
- 004-rosetta: Added Python 3.11+ (backend), JavaScript ES2022 / React 19.2.4 (frontend) + FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.1ns in v1


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
