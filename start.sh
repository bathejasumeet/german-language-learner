#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- backend ---
cd "$REPO_ROOT/backend"

if [[ ! -d .venv ]]; then
  echo "Creating Python venv..."
  python3 -m venv .venv
fi
source .venv/bin/activate

echo "Installing backend dependencies..."
pip install -q -r requirements.txt

mkdir -p data

echo "Starting backend on http://localhost:8000 ..."
DATA_DIR=./data uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# --- frontend ---
cd "$REPO_ROOT/frontend"

if [[ ! -d node_modules ]]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

# --- cleanup on Ctrl-C ---
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

echo ""
echo "Both services running. Press Ctrl-C to stop."
wait
