# AI Friend AR — Emerging Trends Project

An **AI companion in Augmented Reality** designed to help with the loneliness epidemic and assist people in building and maintaining social skills.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python · FastAPI |
| AI / LLM | Ollama (`llama3.2` by default) |
| Long-term memory | ChromaDB (vector database) |
| Auth | Supabase |
| Frontend | TypeScript · Vite · **Three.js + WebXR** |
| Containerisation | Docker · Docker Compose |

> **Alternative AR frameworks evaluated:** AR.js + A-Frame, Model Viewer (Google), Babylon.js.  
> Three.js was chosen for its ecosystem maturity and native WebXR support.

---

## Project structure

```
emerging-trends-project/
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── main.py        # App entry-point & CORS setup
│   │   ├── config.py      # Settings (pydantic-settings)
│   │   ├── models/        # Pydantic schemas
│   │   ├── routes/        # health · auth · chat
│   │   ├── services/      # ai_service · memory_service · auth_service
│   │   └── db/            # ChromaDB client
│   ├── tests/             # pytest test suite
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/              # Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.ts        # App entry-point
│   │   ├── ar-scene.ts    # Three.js + WebXR AR scene
│   │   ├── auth.ts        # Supabase auth helpers
│   │   ├── api.ts         # Backend API helpers
│   │   └── types.ts       # Shared TypeScript types
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
```

---

## Getting started

### Prerequisites
- Python 3.12+
- Node 20+
- Docker & Docker Compose (optional)
- [Ollama](https://ollama.com) installed locally
- A [Supabase](https://supabase.com) project (optional — see Dev mode below)

---

### 1. Configure environment files

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Key settings in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | _(auto)_ | Leave blank — defaults to `http://localhost:11434` locally or `http://host.docker.internal:11434` in Docker |
| `OLLAMA_MODEL` | `llama3.2` | Any model you have pulled in Ollama |
| `DEV_MODE` | `true` | Set to `true` to skip Supabase auth (any token accepted). Set to `false` when you have Supabase configured. |
| `SUPABASE_URL` | _(empty)_ | Only needed when `DEV_MODE=false` |
| `SUPABASE_ANON_KEY` | _(empty)_ | Only needed when `DEV_MODE=false` |
| `SUPABASE_SERVICE_ROLE_KEY` | _(empty)_ | Only needed when `DEV_MODE=false` |

---

### 2. Pull the Ollama model

Install Ollama from https://ollama.com/download, then in **PowerShell** or **Command Prompt**:

```powershell
ollama pull llama3.2
```

Ollama runs as a background service automatically after install. If you ever see a "port already in use" error when trying to start it, it is already running — no action needed.

---

### 3a. Run locally (recommended for development)

**Backend** — from the repo root:

```bash
./start-backend.sh
```

Or manually on Windows (PowerShell / CMD):

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

**Frontend** — in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

> **Tip — testing chat without Supabase:** With `DEV_MODE=true` in `backend/.env`, the `/auth/signin` endpoint returns a fake token. Use that token as the `Authorization: Bearer <token>` header when calling `/chat`, or test directly in the Swagger UI at `/docs`.

---

### 3b. Run with Docker Compose

```bash
docker compose up --build
```

Ollama must be running on the host machine. The backend container will reach it at `http://host.docker.internal:11434` automatically.

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

---

### 4. Run backend tests

```bash
./start-backend.sh --help > /dev/null  # ensure venv exists first
../.venv/Scripts/python.exe -m pytest backend/tests -v
```

---

## How it works

1. **Auth** — Users sign up / sign in via Supabase. The JWT is stored client-side by the Supabase JS client.
2. **Chat** — Each message is sent to `/chat` with the JWT in the `Authorization` header. The backend validates the token, fetches relevant memories from ChromaDB, and calls the local Ollama API to generate a reply.
3. **Memory** — Both sides of every conversation are embedded and stored in ChromaDB. On subsequent turns the most relevant past exchanges are retrieved and injected into the system prompt, giving Aria "long-term memory".
4. **AR** — The Three.js scene renders a simple 3-D avatar in the browser. On supported devices (Chrome on Android) the **Start AR** button triggers a WebXR `immersive-ar` session so the avatar appears overlaid on the real world.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss large changes.

