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

**On macOS / Linux:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**On Windows (PowerShell):**
```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
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

**Single command (backend + frontend)** — from the repo root:

```bash
./start-dev.sh
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Stop both with `Ctrl+C`

If frontend dependencies are not installed yet, this script will run `npm ci` automatically.

---

**Backend** — from the repo root:

**On macOS / Linux (bash):**
```bash
./start-backend.sh
```

> **Windows note:** The `.sh` script uses Unix line endings. If you cloned on Windows and see `/usr/bin/env: 'bash\r': No such file or directory`, fix it by running this once from a bash shell (Git Bash or WSL):
> ```bash
> sed -i 's/\r//' start-backend.sh
> ```
> Then run `./start-backend.sh` again.

**On Windows (PowerShell) — recommended alternative:**

First, create and populate the virtual environment (one-time setup):
```powershell
python -m venv .venv
.venv\Scripts\pip install -r backend\requirements.txt
```

Then start the backend:
```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

**Frontend** — in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

> **Tip — testing chat without Supabase:** With `DEV_MODE=true` in `backend/.env`, the `/auth/signin` endpoint returns a fake token. To get it, visit http://localhost:8000/docs, find the `/auth/signin` endpoint, click **Try it out**, and execute the request. Copy the token from the response, then use it as the `Authorization: Bearer <token>` header when calling `/chat`, or test directly in the Swagger UI.
>
> Note: visiting `/auth/signin` directly in a browser will return `{"detail": "Method Not Allowed"}` — this is expected, as it is a POST endpoint and browsers make GET requests when navigating to a URL.

---

### Known issue — ChromaDB empty metadata

If you see the following error when sending a chat message:

```
ValueError: Expected metadata to be a non-empty dict, got 0 metadata attributes
```

Open `backend/app/services/memory_service.py` and change line 30 from:

```python
metadatas=[metadata or {}],
```

to:

```python
metadatas=[metadata or {"source": "chat"}],
```

This is caused by a version of ChromaDB that no longer accepts empty metadata dicts.

---

## Testing AR on your phone

Use this checklist to test the WebXR AR flow on a real device.

> Start this section after completing **3a. Run locally** above.

### Prerequisites
- Android phone with Chrome (WebXR AR support is strongest here)
- Phone and computer on the same Wi-Fi network
- Backend running locally

### 1. Start frontend for LAN access

From `frontend/`, run:

```powershell
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open on your phone:

```
http://<YOUR_COMPUTER_LAN_IP>:5173
```

How to find your LAN IP:
- Windows (PowerShell): run `ipconfig` and look for `IPv4 Address` under your active Wi-Fi adapter
- macOS: run `ipconfig getifaddr en0` (or check System Settings → Network → Wi-Fi)
- Linux: run `hostname -I` and use the local network IP (often starts with `192.168.x.x` or `10.x.x.x`)

### 2. Use HTTPS if AR session does not start

Many mobile browsers require a secure context (HTTPS) for immersive WebXR AR. The recommended tunnel for this project is **ngrok**.

#### One-time ngrok setup (shared across the team)

1. One team member creates a free account at https://ngrok.com
2. After signing in, go to **Identity & Access → Authtokens** in the left sidebar
3. Copy your authtoken
4. Download the Windows ngrok binary from https://ngrok.com/download — extract the `.exe` somewhere convenient (e.g. your Downloads folder)
5. Open PowerShell, navigate to where you extracted `ngrok.exe`, and run:

```powershell
.\ngrok.exe config add-authtoken <your-authtoken>
```

This saves the token to your local ngrok config and only needs to be done once per machine.

> **Team note:** One free ngrok account only supports one active tunnel at a time. If two team members need tunnels simultaneously, each person should create their own free account.

> **Important:** Do not use `npx ngrok` — the npm wrapper package bundles an outdated ngrok binary that is no longer supported by free accounts.

#### Starting the tunnel

From the folder containing `ngrok.exe`, run:

```powershell
.\ngrok.exe http 5173
```

ngrok will display a `Forwarding` line like:

```
Forwarding   https://xxxx-xxxx.ngrok-free.app -> http://localhost:5173
```

Open that `https://...` URL on your phone in Chrome.

#### Allow the ngrok domain in Vite

The first time you use a new ngrok URL, Vite will block it with:

```
Blocked request. This host is not allowed.
```

Open `frontend/vite.config.ts` and add your ngrok domain to `allowedHosts`:

```ts
server: {
  port: 5173,
  allowedHosts: ["xxxx-xxxx.ngrok-free.app"],
  ...
}
```

Save the file — Vite will hot-reload automatically. Your ngrok subdomain stays the same as long as you keep the tunnel running, but will change next time you restart ngrok.

### 3. Allow required permissions
- Camera permission must be allowed in Chrome when prompted
- If prompted, allow motion/sensor access

### 4. Quick troubleshooting
- Verify backend health at `http://localhost:8000/health` on your computer
- Keep frontend and backend running in separate terminals while testing
- If chat fails on phone, do not switch between `localhost`, LAN IP, and tunnel URL in the same session
- If AR still fails, update Chrome and confirm ARCore support on the device
- Point your camera at a well-lit, textured surface (floor or table) and move the phone slowly — ARCore needs to map the environment before placing the avatar

### 5. Common errors and fixes

| Symptom | Likely cause | Fix |
|--------|---------------|-----|
| Page loads on laptop, but not on phone | Vite dev server not exposed on LAN | Start frontend with `npm run dev -- --host 0.0.0.0 --port 5173` |
| `{"detail": "Method Not Allowed"}` on `/auth/signin` | Visiting a POST endpoint in a browser | Use the Swagger UI at `/docs` instead |
| `ValueError: Expected metadata to be a non-empty dict` | ChromaDB version incompatibility | See **Known issue — ChromaDB empty metadata** above |
| `Blocked request. This host is not allowed` on phone | ngrok domain not whitelisted in Vite | Add the domain to `allowedHosts` in `vite.config.ts` |
| `authentication failed: your ngrok-agent version is too old` | Using `npx ngrok` instead of the real ngrok CLI | Download ngrok directly from https://ngrok.com/download |
| `The endpoint is already online` error in ngrok | A tunnel is already running | Run `taskkill /IM ngrok.exe /F` in PowerShell, then retry |
| "Sorry, I couldn't connect right now" in chat | Backend not running or URL/origin mismatch | Ensure backend is running and keep using one origin (LAN IP or tunnel) throughout the session |
| AR button appears but AR session does not start | Browser/device requires secure context for WebXR AR | Use the ngrok HTTPS tunnel URL |
| Camera does not open | Camera permission blocked | Re-enable site camera permission in Chrome settings and reload |
| Avatar appears but background is black | AR passthrough not rendering | Ensure `ar-scene.ts` has `setClearColor(0x000000, 0)` and `"local"` in `requiredFeatures` — see AR scene setup note below |
| Black screen with no avatar | Device/browser capability issue | Update Chrome, confirm ARCore support, test on another Android device |

### 6. AR scene setup note

If the AR session starts but the camera passthrough is black, verify that `frontend/src/ar-scene.ts` has the following:

In the constructor, after creating the renderer:
```ts
this.renderer.setClearColor(0x000000, 0);
```

In the `startAR` method:
```ts
const session = await navigator.xr.requestSession("immersive-ar", {
  requiredFeatures: ["hit-test", "local"],
  optionalFeatures: ["dom-overlay", "camera-access"],
});
this.renderer.xr.setReferenceSpaceType("local");
await this.renderer.xr.setSession(session);
```

### 7. Copy-paste command runbook

Run these in order using separate terminals from the project root.

**Terminal 1 — backend (Windows)**

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

**Terminal 2 — frontend on LAN**

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

**Terminal 3 — HTTPS tunnel for mobile WebXR**

```powershell
cd C:\path\to\ngrok
.\ngrok.exe http 5173
```

Then on your phone, open the `https://...` URL printed by ngrok in Chrome.

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

```powershell
..\.venv\Scripts\python.exe -m pytest backend\tests -v
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