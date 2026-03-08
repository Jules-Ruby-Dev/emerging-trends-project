# AI Friend AR — Emerging Trends Project

An **AI companion in Augmented Reality** designed to help with the loneliness epidemic and assist people in building and maintaining social skills.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python · FastAPI |
| AI / LLM | OpenAI API (`gpt-4o-mini` by default) |
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
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone & configure

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your OpenAI key, Supabase URL/keys

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Supabase URL/anon key
```

### 2a. Run with Docker Compose

```bash
docker compose up --build
```

- Backend: http://localhost:8000  
- Frontend: http://localhost:5173  
- API docs: http://localhost:8000/docs

### 2b. Run locally (without Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 3. Run backend tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

---

## How it works

1. **Auth** — Users sign up / sign in via Supabase. The JWT is stored client-side by the Supabase JS client.
2. **Chat** — Each message is sent to `/chat` with the JWT in the `Authorization` header. The backend validates the token, fetches relevant memories from ChromaDB, and calls the OpenAI API to generate a reply.
3. **Memory** — Both sides of every conversation are embedded and stored in ChromaDB. On subsequent turns the most relevant past exchanges are retrieved and injected into the system prompt, giving Aria "long-term memory".
4. **AR** — The Three.js scene renders a simple 3-D avatar in the browser. On supported devices (Chrome on Android) the **Start AR** button triggers a WebXR `immersive-ar` session so the avatar appears overlaid on the real world.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss large changes.

