# 🚀 Quick Start Guide - AI Friend AR

## Current Status

- ✅ Frontend dev server: http://localhost:5173/
- ✅ Pages and routing working
- ⏳ Backend NOT running (needs to be started)
- ⏳ Ollama running on system (verified)

## How to Start Everything

### Option 1: Using Docker Compose (Recommended)

```bash
cd emerging-trends-project
docker-compose up -d
```

This starts:

- Backend (FastAPI) on http://localhost:8000/
- ChromaDB on http://localhost:8001/
- Frontend continues on http://localhost:5173/

### Option 2: Starting Backend Manually (Python)

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing the App

1. **Open http://localhost:5173/** in browser
2. **Sign Up** with test credentials:
   - Email: test@example.com
   - Password: password123
3. **Home Page** features:
   - Full-screen AR canvas (Three.js)
   - Chat input at bottom
   - Real-time messages
4. **Navigation** (bottom icons):
   - 🏠 Home (AR + Chat)
   - 📚 History (conversation archive)
   - ⚙️ Settings (personality, logout)
   - ✨ Customize (avatar, voice)
5. **Send Message**:
   - Type → Press Enter or click Send
   - Backend calls Ollama (gemma3:12b)
   - Response appears as message bubble

## Troubleshooting

### Frontend Pages Not Rendering

- Open browser console (F12)
- Check for JavaScript errors
- Try hard refresh (Ctrl+Shift+R)

### Chat Message Fails

- Check backend is running
- Backend logs: `docker logs <container>`
- Verify Ollama: `ollama list` shows gemma3:12b
- Verify Ollama API: `curl http://localhost:11434/api/tags`

### Ollama No Response

- Verify model loaded: `ollama list`
- If not: `ollama pull gemma3:12b`
- Check if Ollama accessible from backend:
  - Local dev: http://localhost:11434
  - Docker: http://host.docker.internal:11434

## Architecture

```
Browser (React)
    ↓
http://localhost:5173
    ↓
[Vite Dev Server + HMR]
    ↓
API Proxy /api → http://localhost:8000
    ↓
FastAPI Backend
    ├─→ Ollama (gemma3:12b LLM)
    └─→ ChromaDB (vector memory)
```

## File Structure

```
frontend/
├── src/
│   ├── App.tsx (main router)
│   ├── pages/
│   │   ├── HomePage.tsx (AR + chat)
│   │   ├── HistoryPage.tsx (chat history)
│   │   ├── SettingsPage.tsx (settings)
│   │   └── PretendFriendPage.tsx (customization)
│   ├── components/
│   │   ├── Navigation.tsx (bottom nav)
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── input.tsx
│   └── ...
└── package.json (React, Tailwind, Three.js, etc)
```

## Next Steps

1. First: Get backend running (Docker or local)
2. Then: Test chat endpoint (send message → get response)
3. Then: Generate Figma components (MCP tools)
4. Then: Deploy infrastructure (Azure Container Apps)
