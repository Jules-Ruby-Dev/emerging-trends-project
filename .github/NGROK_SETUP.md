# 🔐 HTTPS Tunnel Setup with ngrok

This guide walks you through setting up an HTTPS tunnel for testing AR on your phone. Many mobile browsers require HTTPS for WebXR AR to work.

---

## Why Do I Need HTTPS?

- **Mobile AR requires secure context**: iOS Safari and Android Chrome require HTTPS for WebXR immersive-ar sessions
- **LAN HTTP isn't enough**: Even `http://192.168.x.x` won't work for AR on mobile
- **ngrok solution**: Creates a stable HTTPS tunnel from your computer to the internet

---

## Quick Start (3 Steps)

### Step 1: Create a Free ngrok Account

1. Go to **https://ngrok.com** and sign up
2. Verify your email
3. Log in to the dashboard

---

### Step 2: Download and Configure ngrok

1. Download ngrok from **https://ngrok.com/download** (Windows version)
2. Extract the `.zip` file to a convenient location (e.g., `C:\ngrok\`)
3. Open PowerShell, navigate to that folder, and run:
   ```powershell
   .\ngrok.exe config add-authtoken <your-authtoken>
   ```
   (Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken)

✅ **This only needs to be done once per machine.**

---

### Step 3: Set Your ngrok Domain in Frontend Environment

When you start ngrok, it will give you a URL like:
```
https://abc123-xyz789.ngrok-free.app
```

1. Open or create `frontend/.env` (if you don't have one, copy from `.env.example`)
2. Add or update this line with **just the domain** (no `https://`):
   ```
   VITE_NGROK_HOST=abc123-xyz789.ngrok-free.app
   ```
3. Save the file

> **Note**: When you restart ngrok, you get a new subdomain. Just update `VITE_NGROK_HOST` in your `.env` file and Vite will automatically whitelist it.

---

## Running Everything

### Terminal 1: Frontend Dev Server
```powershell
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### Terminal 2: ngrok Tunnel
```powershell
cd C:\ngrok  # or wherever you extracted ngrok
.\ngrok.exe http 5173
```

Watch the ngrok output for:
```
Forwarding   https://abc123-xyz789.ngrok-free.app -> http://localhost:5173
```

### Terminal 3: Backend (Optional)
```powershell
docker compose up
```
or
```powershell
cd backend
python -m uvicorn app.main:app --reload
```

---

## Testing on Your Phone

1. On your phone, open Chrome and visit: `https://abc123-xyz789.ngrok-free.app`
2. You may see an ngrok interstitial page — click **"Visit Site"** to proceed
3. Allow camera and sensor permissions when prompted
4. Sign up / login (any credentials work in dev mode)
5. Test AR mode! 🎉

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Blocked request. This host is not allowed` | Update `VITE_NGROK_HOST` in `frontend/.env` and restart dev server |
| Tunnel already running | Close old ngrok window: `taskkill /IM ngrok.exe /F` |
| AR doesn't start | Ensure `VITE_NGROK_HOST` is set and using HTTPS URL |
| Page loads but no backend | Start backend in separate terminal |
| New ngrok subdomain after restart | Update `VITE_NGROK_HOST` and restart frontend dev server |

---

## Summary Checklist

- [ ] Created free ngrok account
- [ ] Downloaded and configured ngrok with auth token
- [ ] Set `VITE_NGROK_HOST` in `frontend/.env`
- [ ] Started frontend: `npm run dev -- --host 0.0.0.0`
- [ ] Started ngrok: `ngrok http 5173`
- [ ] Updated `VITE_NGROK_HOST` with the new subdomain
- [ ] Tested on phone — AR works! ✅
