#!/usr/bin/env bash
# Run the FastAPI backend using the project virtual environment.
# Usage: ./start-backend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$SCRIPT_DIR/.venv/Scripts/python.exe"

if [[ ! -f "$PYTHON" ]]; then
  echo "Virtual environment not found. Create it first:"
  echo "  python -m venv .venv"
  echo "  .venv/Scripts/python.exe -m pip install -r backend/requirements.txt"
  exit 1
fi

cd "$SCRIPT_DIR/backend"
exec "$PYTHON" -m uvicorn app.main:app --reload
