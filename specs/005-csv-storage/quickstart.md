# Quickstart: Running Without Docker or PostgreSQL

**Branch**: `005-csv-storage` | **Date**: 2026-05-11

---

## Prerequisites

- Python 3.11+
- Node.js 18+ / npm
- Ollama (optional — only needed for the Rosetta tab)

No Docker. No PostgreSQL. No database credentials.

---

## Backend

```bash
cd backend

# Create virtual environment (first time only)
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (data/ dir is created automatically)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The server creates `backend/data/` on first run and initialises all CSV files with headers. No `.env` file is required unless you want to override defaults.

---

## Frontend

```bash
cd frontend
npm install       # first time only
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Optional: Docker (backend only, no Postgres)

```bash
docker compose up backend
```

CSV data is persisted via a volume mount at `./backend/data`.

---

## Configuration (optional)

Create `backend/.env` to override defaults:

```dotenv
# Storage
DATA_DIR=./data          # Path to CSV data directory (default: ./data)

# Ollama (Rosetta tab only)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## Seeding Data

To pre-populate words, create `backend/data/words.csv`:

```csv
id,german_word,meaning,example_sentence,created_at,times_practiced,accuracy
1,Haus,house,Das Haus ist groß.,2026-01-01T00:00:00,0,0.0
2,Hund,dog,,2026-01-01T00:00:00,0,0.0
```

Or use the API:

```bash
curl -X POST http://localhost:8000/api/v1/words/ \
  -H "Content-Type: application/json" \
  -d '{"german_word": "Haus", "meaning": "house"}'
```

---

## Running Tests

```bash
cd backend
python3 -m pytest tests/unit/ -v
```

Tests use a temporary directory — no data files are created or modified.

---

## Data Location

| Mode      | CSV files location                      |
| --------- | --------------------------------------- |
| Local dev | `backend/data/*.csv`                    |
| Docker    | `./backend/data/*.csv` (volume mounted) |
| Tests     | Temporary directory (auto-cleaned)      |

The `backend/data/` directory is in `.gitignore` — your vocabulary data is local and not committed.
