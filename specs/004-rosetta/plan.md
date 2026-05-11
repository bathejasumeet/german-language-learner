# Implementation Plan: Rosetta — Local LLM Memory Aids

**Branch**: `004-rosetta` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/004-rosetta/spec.md`

## Summary

Add a **Rosetta** tab to the German Language Learner app (positioned before Statistics) that uses a locally-running Ollama LLM to generate three unique mnemonic sentences per German vocabulary word. The backend exposes a new endpoint (`POST /api/v1/rosetta/generate`) that communicates with the Ollama HTTP API, caches results in memory per word, and returns structured JSON. The frontend adds a new page component with a word selector, loading state, error handling, and a regenerate action.

No new database schema or dependencies are required beyond `httpx` (already a transitive dependency of FastAPI).

---

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript ES2022 / React 19.2.4 (frontend)  
**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitihe (new, e**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (test + Testing L**Primary Dependencies**: FastAPI 0.135, SQLAlchemy 2.0, httpx (transitive vi**Primary Dependencies**: FastAPI 0.135, SQLAlchem*Storage**Primary Dependencies**: FastAPI 0.1ns in v1

---

## Constitution Check

### I. Code Quality (NON-NEGOTIABLE) ✅
- New files follow the established module structure (`backend/src- New files follosrc/services/`, `frontend/src/pages/`, `frontend/src/services/`).
- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (bac- Linting: `ruff`/`flake8` (boncise a- Linting: `rufith exis- Linting: `ruff`/`flake8` (bac- Lintin etc.).

### IV. Performance Requirements ✅
- In-memory cache eliminates redundant LLM calls (SC-002: < 200ms on cache hit).
- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Async HTTP client (`h- Asyn� NEW: Ollama client, cache, prompt builder
│   ├── schemas.py              ← MODIFIED: add RosettaRequest, RosettaResponse
│   └── main.py                 ← MODIFIED: register rosetta_router
└── tests/
    ├── unit/
    │   └── test_rosetta.py     ← NEW: unit tests (mocked Ollama)
    └── integration/
        └── test_rosetta_integration.py  ← NEW: integration tests (real Ollama)

frontend/
├── src/
│   ├── components/
│   │   └── Navigation.jsx      ← MODIFIED: add rosetta tab before statistics
│   ├── pages/
│   │   └── Rosetta.jsx         ← NEW: Rosetta page component
│   └── services/
│       └── rosetta.js          ← NEW: Axios service wrapper
└── tests/
    └── unit/
        └── rosetta.test.jsx    ← NEW: Vitest component tests
```

---

## Phase 0: Research Summary

All unknowns resolved — see [research.md](research.md).

| Decision | Outcome |
|----------|---------|
| Ollama integration | Direct HTTP via `httpx.AsyncClient`, `POST /api/generate` |
| Model selection | `OLLAMA_MODEL` env var, default `llama3` |
| Prompt engineering | Fixed template with numbered output (| Prompt engineac| Prompt engineerile| Prompt engineering | Fixed template with numbered output (| Prompt enginHT| Prompt engineering | Fa u| Prompt engineering | Fixed template with numbered output (| Prompt engineac| Promp entr| Pro

----------ase 1: D----------ase 1: D-------ode----------ase 1: D----------ase 1: D-------ode----------ase 1: D----------ase 1: D------Py----------ase  (in-memo----------ase 1: D----------ase 1: D-------ode----------ase 1: D--------t`----------ase 1: D-- Memor----------ase 1: D----------ase 1: D-------ode----------ase 1: D----

##############ct �##############ct ett##############ct �##############ct ett##############ct �#########
  - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?: bool }  - Request:],   - Request: `{ word_}`  - Request: `{ word_d   - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?:ns  - Request: `{ word_id: int, force?: bool }  - Request: `{t(Ba  - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?: bool }  - Request:],   - Request: `{ word_}`  - Request: `{ word_d   - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?:ns  - Request: `{ word_id: int, force?: bool }  - Request: `{t(= {  - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?: bool }  - Request:],   - Request: `{ word_}`  - Request: `{ word_d   - Request: `{ word_id: int, force?: bool }  - Request: `{ word_id: int, force?:ns  - Request: `{ word_id: int, force?: bool }  - Request: `{t(Ba  - Request: `{ word_id: int,_call_ollama(german_word, meaning) -> list[str]:
    # httpx.AsyncClient POST to OLLAMA_BASE_URL/api/generate
    # Parse numbered lines from response["response"]
    # Raise OllamaUnavailableError on connection error → 503
```

### Frontend Rosetta Page (`frontend/src/pages/Rosetta.jsx`)
```
State: { words, selectedWordId, sentences, loading, error, cached }

On mount: fetch all words via vocabularyService.getAllWords()
On word select: call rosettaService.generate(wordId)
On regenerate: call rosettaService.generate(wordId, force=true)

UI:
  - Word selector (dropdown)
  - Generate / Regenerate button
  - Loading spinner (while loading)
  - Error alert (when error)
  - Sentence cards (3 × sentence display)
  - "From cache" badge (when cached)
```

### Frontend Service (`frontend/src/services/rosetta.js`)
```javascript
export const rosettaService = {
  generate: (wordId, force = false) =>
    api.post('/api/v1/rosetta/generate', { word_id: wordId, force }),
};
```

### Navigation Update (`frontend/src/components/Navigation.jsx`)
Insert before `{ id: 'statistics', label: 'Statistics' }`:
```javascript
{ id: 'rosetta{ id: 'rosetta{ id: 'rosetta{ id: 'rosetta{ id: 'rour{ id: 'rosetta{ id: 'rosetta{ id: 'rosetta{ id: 'rosetta{ iking

No No No No No No No No No No No No No No No No No No No No Noed.

-------------------------------------------------------------------ent------------------------------------------------------
