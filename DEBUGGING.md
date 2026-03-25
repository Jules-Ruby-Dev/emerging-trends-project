# Chatbot Debugging Guide

## Issues Fixed ✅

### 1. **Avatar Not Visible**

- **Problem**: Excessive padding (`py-32`) on input area was pushing it down and covering the 3D avatar
- **Fix**: Changed `py-32` to `py-4` in HomePage.tsx
- **Status**: ✅ FIXED

### 2. **Message Sending Race Condition**

- **Problem**: HomePage was calling `onSendMessage(messageInput)` then immediately clearing input before async send completed
- **Problem**: App.tsx `handleSendMessage` was reading from state that might have been cleared
- **Fix**: Updated `handleSendMessage` to accept message text as parameter instead of reading state
- **Status**: ✅ FIXED

### 3. **Better Error Logging**

- **Problem**: No visibility into why chat wasn't working
- **Fix**: Added detailed console logging to:
  - App.tsx: Logs message sending flow and errors
  - api.ts: Logs API requests/responses
  - Shows error messages in chat UI
- **Status**: ✅ ADDED

---

## System Status ✅

### Infrastructure

- ✅ **Ollama**: Running with `gemma3:12b` model on `localhost:11434`
- ✅ **Backend**: Docker container running on `localhost:8000`
- ✅ **ChromaDB**: Docker container running on `localhost:8001`
- ✅ **Frontend**: Docker container running on `localhost:5173`
- ✅ **Health check**: Backend responding to requests

### Configuration

- ✅ `DEV_MODE=true`: Dev auth enabled (no Supabase needed)
- ✅ `OLLAMA_MODEL=gemma3:12b`: Correct model installed
- ✅ `OLLAMA_BASE_URL=http://host.docker.internal:11434`: Correct Docker networking

---

## Testing the Chatbot

### Step 1: Verify Frontend is Updated

1. Open browser console (F12)
2. Send a message in the chat
3. **Look for console logs**:
   - `Sending message: [your text]`
   - `Calling sendMessage API...`
   - `API response: {...}`

### Step 2: Check Backend Logs

```powershell
docker logs -f emerging-trends-project-backend-1
```

Look for:

- `POST /chat` request
- Any error messages about Ollama connection

### Step 3: Test Ollama Connection

```powershell
$headers = @{ "Authorization" = "Bearer test"; "Content-Type" = "application/json" }
$body = '{"message":"Hello","session_id":null}'
Invoke-WebRequest -Uri "http://localhost:8000/chat" `
  -Method POST -Headers $headers -Body $body -UseBasicParsing
```

---

## Next Steps

1. **Hard Reload Frontend**
   - Press `Ctrl+Shift+R` in browser to clear cache
   - Check console for any errors

2. **Try Sending a Message**
   - Watch console logs
   - Check if error appears or if reply comes back

3. **If Still Not Working**
   - Share console error messages
   - Check Docker logs: `docker logs emerging-trends-project-backend-1`
   - Verify Ollama: `ollama list`

---

## Common Issues & Solutions

### "Unable to reach Ollama at..."

- Ollama not running: `ollama serve`
- Wrong URL: Check OLLAMA_BASE_URL env var
- Model not installed: `ollama pull gemma:3.2b`

### "Invalid or expired token"

- DEV_MODE not set to true in backend/.env
- Auth route not properly authenticated
- Token not being passed to chat endpoint

### "Empty response from Ollama"

- Model might be unloaded from memory
- Ollama might be hanging: Restart it
- Check Ollama logs

---

## Files Modified

1. **frontend/src/pages/HomePage.tsx**
   - Fixed avatar visibility (padding issue)

2. **frontend/src/App.tsx**
   - Fixed race condition in `handleSendMessage`
   - Added detailed logging
   - Added error messages to UI

3. **frontend/src/api.ts**
   - Added detailed logging for API calls
   - Better error messages

---

## Quick Restart

```powershell
cd "c:\Louie\SAIT SD\ITP302-C Emerging Trends\emerging-trends-project"

# Hard refresh frontend
docker exec emerging-trends-project-frontend-1 npm run dev

# Or restart everything
docker compose down
docker compose up --build
```
