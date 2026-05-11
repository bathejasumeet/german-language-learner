# Research: Rosetta — Local LLM Memory Aids

**Phase**: 0 (Pre-Design)
**Feature**: [spec.md](spec.md)
**Date**: 2026-05-11

---

## 1. Ollama HTTP API Integration

### Decision

Use the Ollama native HTTP API directly via `httpx` (async) from the FastAPI backend. Do **not** add the `ollama` Python SDK as a new dependency — the HTTP API is simple enough and keeps the stack lean per the "no new dependencies" constraint in the constitution.

### Rationale

Ollama exposes a well-documented REST API at `http://localhost:11434`. The `POST /api/generate` endpoint accepts a model name and prompt, and streams or returns a full response. Using `httpx.AsyncClient` (already part of Python stdlib via starlette under FastAPI) avoids a new PyPI dependency.

### Alternatives Considered

- **`ollama` Python SDK**: Clean interface but adds a new dependency. Rejected for now; can be swapped in later with minimal changes to the service layer.
- **`requests` (sync)**: Would block the FastAPI event loop. Rejected in favour of async `httpx`.

### Key API Facts

| Field             | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| Base URL          | `http://localhost:11434` (configurable via `OLLAMA_BASE_URL`) |
| Generate endpoint | `POST /api/generate`                                          |
| Request body      | `{"model": "<name>", "prompt": "<text>", "stream": false}`    |
| Response field    | `response` (string)                                           |
| Error signals     | HTTP 4xx/5xx; connection refused when Ollama is not running   |

---

## 2. Prompt Engineering for Memory-Aid Sentences

### Decision

Use a fixed, concise system prompt that instructs the model to return exactly three numbered sentences, each containing the German word and providing a memorable hook (story, imagery, or association). Parse the response by splitting on numbered list markers.

### Rationale

Structured prompts with explicit count instructions are reliable across small local models. Numbered output (`1.`, `2.`, `3.`) is trivial to parse without a schema enforcement library.

### Prompt Template

```
You are a German language teacher. Given a German word and its meaning, generate exactly 3 creative, memorable English sentences that help learners remember the German word "{word}" (meaning: "{meaning}"). Each sentence must include the German word. Number them 1, 2, 3. Be vivid and use memory techniques like rhyme, story, or imagery.
```

### Parsing Strategy

Split response text on `\n`, filter lines starting with `1.`, `2.`, `3.`, strip the prefix. If fewer than three lines are found, pad with a fallback message and log a warning.

---

## 3. In-Memory Cache Strategy

### Decision

Use a module-level Python `dict` keyed by `word_id` (integer) in the Ollama service. Cache stores a list of three sentences. Cache is invalidated by explicit regeneration request only (no TTL for v1).

### Rationale

No new infrastructure (Redis, DB table) needed. Satisfies SC-002 (sub-200ms repeat access). Acceptable for a single-developer local tool.

### Alternatives Considered

- **Redis**: Persistent and shareable across workers, but requires a new service. Out of scope for v1.
- **SQLAlchemy model**: Persistent across restarts, but adds a migration. Out of scope for v1 per spec assumption.

---

## 4. Frontend State Management for Rosetta

### Decision

Use React's built-in `useState` and `useEffect` within the `Rosetta` page component. No global state library needed. The selected word and generated sentences are local component state. The in-memory cache lives in the backend; the frontend re-requests on word change unless response is fast.

### Rationale

All other pages in the codebase use local state. Consistency with existing patterns (constitution: UX Consistency).

---

## 5. Error Handling and LLM Unavailability

### Decision

The backend returns HTTP 503 with a structured JSON error body when Ollama is unreachable. The frontend maps 503 to a user-readable message: _"The local AI service is not running. Please start Ollama and try again."_

### Rationale

Distinct HTTP status code allows frontend to give specific guidance without parsing error messages. 503 is semantically correct (service temporarily unavailable).

---

## 6. Configuration

### Decision

Introduce two new environment variables read via `python-dotenv` (already in stack):

| Variable          | Default                  | Purpose           |
| ----------------- | ------------------------ | ----------------- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama host       |
| `OLLAMA_MODEL`    | `llama3`                 | Model name to use |

Frontend requires no new env vars; it calls the existing backend URL.

---

## All NEEDS CLARIFICATION Items: Resolved

| Item                      | Resolution                                                   |
| ------------------------- | ------------------------------------------------------------ |
| Ollama integration method | Direct HTTP via `httpx.AsyncClient`                          |
| Model selection           | Configurable via `OLLAMA_MODEL` env var, default `llama3`    |
| Sentence parsing          | Numbered list regex split                                    |
| Cache scope               | In-memory dict, per backend process lifetime                 |
| Error HTTP code           | 503 Service Unavailable                                      |
| New dependency constraint | Only `httpx` — already a transitive dep of FastAPI/starlette |
