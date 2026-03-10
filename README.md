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

## Testing AR on your phone

Use this checklist to test the WebXR AR flow on a real device.

> Start this section after completing **3a. Run locally** above.

### Prerequisites
- Android phone with Chrome (WebXR AR support is strongest here)
- Phone and computer on the same Wi-Fi network
- Backend running locally (`./start-backend.sh`)

### 1. Start frontend for LAN access

From `frontend/`, run:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open on your phone:

```text
http://<YOUR_COMPUTER_LAN_IP>:5173
```

How to find your LAN IP:
- Windows (PowerShell): run `ipconfig` and look for `IPv4 Address` under your active Wi-Fi adapter
- macOS: run `ipconfig getifaddr en0` (or check System Settings → Network → Wi-Fi)
- Linux: run `hostname -I` and use the local network IP (often starts with `192.168.x.x` or `10.x.x.x`)

### 2. Use HTTPS if AR session does not start

Many mobile browsers require a secure context for immersive WebXR AR.
If AR does not start on LAN HTTP, expose your local frontend with a tunnel:

```bash
npx localtunnel --port 5173
```

Open the generated `https://...` URL on your phone.

### 3. Allow required permissions
- Camera permission must be allowed in Chrome
- If prompted, allow motion/sensor access

### 4. Quick troubleshooting
- Verify backend health at `http://localhost:8000/health` on your computer
- Keep frontend and backend running in separate terminals while testing
- If chat fails on phone, do not switch between `localhost`, LAN IP, and tunnel URL in the same session
- If AR still fails, update Chrome and confirm ARCore support on the device

### 5. Common errors and fixes

| Symptom | Likely cause | Fix |
|--------|---------------|-----|
| Page loads on laptop, but not on phone | Vite dev server not exposed on LAN | Start frontend with `npm run dev -- --host 0.0.0.0 --port 5173` |
| "Sorry, I couldn't connect right now" in chat | Backend not running or URL/origin mismatch during session | Ensure `./start-backend.sh` is running and keep using one origin (LAN IP or tunnel) |
| AR button appears but AR session does not start | Browser/device requires secure context for WebXR AR | Use tunnel HTTPS URL from `npx localtunnel --port 5173` |
| Camera does not open | Camera permission blocked | Re-enable site camera permission in Chrome settings and reload |
| Black screen or no AR placement | Device/browser capability issue | Update Chrome, confirm ARCore support, test on another Android phone |

### 6. Copy-paste command runbook

Run these in order using separate terminals from the project root.

**Terminal 1 — backend**

```bash
./start-backend.sh
```

**Terminal 2 — frontend on LAN**

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

**Terminal 3 — optional HTTPS tunnel for mobile WebXR**

```bash
cd frontend
npx localtunnel --port 5173
```

Then on your phone:
- Start with `http://<YOUR_COMPUTER_LAN_IP>:5173`
- If AR does not start, use the `https://...` URL printed by LocalTunnel

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

