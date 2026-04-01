#!/usr/bin/env bash
# Run backend and frontend together for local development.
# Usage: ./start-dev.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_SCRIPT="$SCRIPT_DIR/start-backend.sh"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

if [[ ! -f "$BACKEND_SCRIPT" ]]; then
  echo "Missing backend launcher: $BACKEND_SCRIPT"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the frontend. Install Node.js 20+ first."
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm ci)
fi

backend_pid=""
frontend_pid=""

cleanup() {
  if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" >/dev/null 2>&1; then
    kill "$frontend_pid" >/dev/null 2>&1 || true
  fi
  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" >/dev/null 2>&1; then
    kill "$backend_pid" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:8000 ..."
"$BACKEND_SCRIPT" &
backend_pid=$!

echo "Starting frontend on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev) &
frontend_pid=$!

wait -n "$backend_pid" "$frontend_pid"
