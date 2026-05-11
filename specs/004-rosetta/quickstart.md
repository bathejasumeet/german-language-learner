# Quickstart: Rosetta — Local LLM Memory Aids

**Feature**: [spec.md](spec.md)
**Date**: 2026-05-11

---

## Prerequisites

1. **Ollama installed and running** on the development machine:

   ```bash
   # Install Ollama (macOS)
   brew install ollama

   # Start the Ollama server
   ollama serve

   # Pull a model (llama3 is the default)
   ollama pull llama3
   ```

2. **Existing dev environment running** — backend (FastAPI) and frontend (Vite) must be up:

   ```bash
   # Backend
   cd backend && uvicorn src.main:app --reload --port 8000

   # Frontend
   cd frontend && npm run dev
   ```

---

## Environment Variables

Add to `backend/.env` (create if it does not exist):

```dotenv
# Ollama integration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

No frontend env changes are needed; Rosetta calls the existing `VITE_API_URL` backend.

---

## New Files

### Backend

| File                                     | Purpose                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `backend/src/api/rosetta.py`             | FastAPI router with `POST /api/v1/rosetta/generate`     |
| `backend/src/services/ollama_service.py` | Ollama HTTP client, prompt builder, cache, parser       |
| `backend/src/schemas.py`                 | Add `RosettaRequest`, `RosettaResponse` Pydantic models |

### Frontend

| File                               | Purpose                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| `frontend/src/pages/Rosetta.jsx`   | Rosetta page component (word selector + sentence display) |
| `frontend/src/services/rosetta.js` | Axios service wrapper for the generate endpoint           |

### Modified Files

| File                                     | Change                                                |
| ---------------------------------------- | ----------------------------------------------------- |
| `backend/src/main.py`                    | Register `rosetta_router`                             |
| `frontend/src/components/Navigation.jsx` | Add `rosetta` tab before `statistics` in `TABS` array |

---

## Manual Smoke Test (after implementation)

1. Open the app at `http://localhost:5173`
2. Click the **Rosetta** tab (should be 5th, before Statistics)
3. Select any word from the dropdown
4. Click **Generate Memory Aids**
5. Verify three distinct sentences appear, each containing the German word
6. Click the same word again — response should be instant (cached)
7. Click **Regenerate** — new sentences should appear

### Failure scenarios to test

| Scenario           | How to trigger                   | Expected UI                                     |
| ------------------ | -------------------------------- | ----------------------------------------------- |
| Ollama not running | `pkill ollama` before generating | Error message with instructions to start Ollama |
| Empty vocabulary   | Use a fresh DB with no words     | "No words available" empty state                |
| Slow model         | Use a large model                | Spinner visible throughout                      |

---

## Running Tests

```bash
# Backend unit tests
cd backend && pytest tests/unit/test_rosetta.py -v

# Backend integration tests (requires running Ollama + DB)
cd backend && pytest tests/integration/test_rosetta.py -v

# Frontend component tests
cd frontend && npm test -- --reporter=verbose
```

---

## API Quick Reference

```bash
# Generate sentences (curl)
curl -X POST http://localhost:8000/api/v1/rosetta/generate \
  -H "Content-Type: application/json" \
  -d '{"word_id": 1, "force": false}'

# Force regeneration
curl -X POST http://localhost:8000/api/v1/rosetta/generate \
  -H "Content-Type: application/json" \
  -d '{"word_id": 1, "force": true}'
```
