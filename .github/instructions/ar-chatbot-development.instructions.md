---
description: "Use when building backend services, frontend components, or modifying AI personality features in the AR chatbot. Covers service architecture, component patterns, schema design, Ollama integration, error handling, and testing."
applyTo: ["backend/**/*", "frontend/src/**", "tests/**"]
---

# AR Chatbot Development Guidelines

This project is a full-stack AR chatbot with selectable personalities powered by FastAPI (backend), React/Vite (frontend), Chroma vector database, and Ollama for local LLM inference.

## Backend Architecture (FastAPI + Python)

### Service-Oriented Pattern

Structure all business logic in the **services/** layer, never in routes. Routes are thin controllers that handle HTTP concerns only.

```python
# ✅ GOOD: Logic in service
# services/chat_service.py
def process_message(message: str, session_id: str) -> ChatResponse:
    # Business logic here
    pass

# routes/chat.py
@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, user_id: str = Depends(get_current_user_id)):
    return await process_message(body.message, body.session_id)

# ❌ AVOID: Logic in route
@router.post("/chat")
async def chat(body: ChatRequest):
    ai_reply = await ollama_request(...)  # Don't do this in routes
    return {...}
```

### Pydantic Schema Design

1. **Use Field() for validation**: Always specify constraints (`min_length`, `max_length`, `pattern`) at the schema level
2. **Optional fields for optional data**: Use `Optional[str] = None` for genuinely optional fields
3. **Keep schemas focused**: One schema per domain concept (ChatRequest, ChatResponse, PersonalityInfo, etc.)

```python
# ✅ GOOD
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    personality_id: Optional[str] = None

# ❌ AVOID: Vague or missing constraints
class ChatRequest(BaseModel):
    message: str  # No length validation
    session_id: str = ""  # Not truly optional
```

### Dependency Injection (FastAPI Depends)

Use `Depends()` for:
- **Auth verification** (extracting user from token)
- **Service initialization** (injecting AI service, database client)
- **Validation** (cross-field checks, business rule validation)

```python
# ✅ GOOD
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    user = get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return str(user.id)

@router.post("/chat")
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    ai_service: AIService = Depends(get_ai_service),
):
    # user_id and ai_service are injected
    pass
```

### Error Handling & HTTP Status Codes

- **401**: Invalid/expired auth token → `HTTPException(status_code=401, detail="...")`
- **400**: Validation failure (handled by Pydantic) → let Pydantic raise automatically
- **500**: Unexpected errors → log and return generic "Internal server error"
- **Custom errors**: Create `HTTPException` with appropriate `status_code` and descriptive `detail`

```python
from fastapi import HTTPException, status

if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
    )

if personality_id not in available_personalities:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Personality {personality_id} not found.",
    )
```

### Ollama Integration (Local LLM)

- **Service isolation**: All Ollama calls go through `app/services/ai_service.py`
- **Endpoint resolution**: Base URL is `localhost` outside Docker, `host.docker.internal` inside Docker (handled by config)
- **No hardcoded URLs**: Use `settings.ollama_base_url` from config
- **Graceful degradation**: Catch Ollama connection errors and return user-friendly messages, not stack traces

```python
# ✅ GOOD: Abstracted and configurable
from app.config import get_settings

async def get_ai_reply(prompt: str) -> str:
    settings = get_settings()
    try:
        response = await ollama_request(
            url=f"{settings.ollama_base_url}/api/generate",
            model="llama2",
            prompt=prompt,
        )
        return response["response"]
    except ConnectionError:
        raise HTTPException(
            status_code=500,
            detail="AI service unavailable. Please try again later.",
        )
```

### Vector Database (Chroma)

- **Lazy load**: Import chromadb inside functions to avoid startup failures for tests
- **Collections**: Use descriptive names: `aifriend_personalities`, `chat_history_<session_id>`, etc.
- **Schema consistency**: Ensure metadata keys match across all vectors in a collection

## Frontend Architecture (React + TypeScript + Vite)

### Component Organization

- **Pages** (`src/pages/`): Top-level route components (HomePage, LoginPage, PretendFriendPage, etc.)
- **Components** (`src/components/`):
  - `ui/`: Base, reusable UI elements (Button, Input, Card)
  - `generated/`: Auto-exported from Figma (do not edit manually)
  - Root: Larger, feature-specific components (Navigation, InfoPopup, etc.)
- **Utilities** (`src/lib/`): Helper functions (validators, formatters)
- **API** (`src/api.ts`): Centralized HTTP/WebSocket communication

### Naming Conventions

- **Components**: PascalCase files → `HomePage.tsx`, `Navigation.tsx`
- **Utilities/API**: camelCase files → `api.ts`, `auth.ts`, `utils.ts`
- **Types**: Define in `src/types.ts` as a single source of truth

```typescript
// ✅ GOOD: Component with clear props
interface HomePageProps {
  selectedPersonality: string;
  onPersonalityChange: (id: string) => void;
}

function HomePage({ selectedPersonality, onPersonalityChange }: HomePageProps) {
  return <div>...</div>;
}

// ✅ GOOD: Centralized types
// src/types.ts
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
```

### Styling with Tailwind

- Use utility classes directly in JSX (not CSS files unless necessary)
- For complex pseudo-states, extract to components or use Tailwind plugins
- Reference design tokens from `src/components/generated/designTokens.json` for colors, spacing, etc.

```typescript
// ✅ GOOD
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">
  Send
</button>

// ✅ GOOD: Complex interactive state
function Button({ isLoading, ...props }) {
  return (
    <button
      disabled={isLoading}
      className={isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}
      {...props}
    >
      {isLoading ? "Loading..." : "Submit"}
    </button>
  );
}
```

### API Communication (REST + WebSocket)

- **REST**: Default for simple one-off requests (auth, get history)
- **WebSocket**: For chat messages (real-time bidirectional, handles fallback to REST)
- **Tokens**: Always include bearer token in Authorization header
- **Error handling**: Catch network errors and display user-friendly messages

```typescript
// ✅ GOOD: Centralized API calls
// src/api.ts
export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  return response.json();
}

// ✅ GOOD: Use in components
function ChatComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (msg: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const reply = await sendMessage(msg);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
}
```

### AR & WebXR Integration

- Check for secure context and WebXR API availability before attempting AR session
- Return diagnostic reasons (secure context, API presence, session support, session start failure) to improve mobile compatibility debugging
- Use HTTPS tunnel (e.g., localtunnel, ngrok) for testing WebXR on mobile devices via LAN
- Implement automatic fallback from WebXR to standard chat experience

## AI Personality Features

### Adding a New Personality

1. **Define personality schema**: Add to Pydantic schemas in `backend/app/models/schemas.py`
2. **Store in Chroma**: Use collection `aifriend_personalities` with metadata (name, description, system prompt)
3. **Expose via API**: Add routes `/personalities` (list) and `/personalities/{id}` (get)
4. **Use in chat**: Accept optional `personality_id` in ChatRequest, inject personality system prompt into LLM call
5. **Frontend support**: Store in `selectedPersonality` state, include in chat requests

```python
# ✅ GOOD: Personality service pattern
class PersonalityInfo(BaseModel):
    id: str
    name: str
    description: str
    system_prompt: str

async def get_personality(personality_id: str) -> PersonalityInfo:
    # Query Chroma collection
    pass

async def chat_with_personality(
    message: str,
    personality_id: Optional[str],
) -> str:
    if personality_id:
        personality = await get_personality(personality_id)
        system_prompt = personality.system_prompt
    else:
        system_prompt = default_system_prompt
    
    return await get_ai_reply(message, system_prompt=system_prompt)
```

## Testing Patterns

### Backend Tests

- **Location**: `backend/tests/test_routes.py`, `backend/tests/test_services.py`
- **Test execution**: `python -m pytest backend/tests -v` using the project's venv
- **Dependencies**: ChromaDB lazy-loads, so tests don't fail due to missing chromadb
- **Mocking external services**: Mock Ollama calls to avoid test flakiness; use fixtures for auth tokens

```python
# ✅ GOOD
import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_chat_route_returns_response():
    with patch("app.services.ai_service.get_ai_reply") as mock_ai:
        mock_ai.return_value = "AI response"
        response = await client.post(
            "/chat",
            json={"message": "Hello", "session_id": "test-session"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        assert response.status_code == 200
        assert response.json()["reply"] == "AI response"
```

### Running Tests

```bash
# Activate venv first
source .venv/Scripts/activate  # Windows: .venv\Scripts\activate
python -m pytest backend/tests -v
```

## Configuration & Environment

- **Settings**: Defined in `backend/app/config.py` using Pydantic Settings
- **Env vars**: Load from `.env` file or environment
- **Production checks**: Use `settings.app_env` to conditionally enable FastAPI docs (`/docs`, `/redoc` disabled in production)

```python
# ✅ GOOD: Centralized config
class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins_list: List[str] = ["http://localhost:5173"]
    ollama_base_url: str = "localhost"
    
    class Config:
        env_file = ".env"
```

## Quick Reference Checklist

- [ ] Business logic → services (never in routes)
- [ ] Schemas → Pydantic with Field validation
- [ ] Error handling → HTTPException with appropriate status codes
- [ ] Components → PascalCase, props typed with interfaces
- [ ] API calls → Centralized in api.ts, token in Authorization header
- [ ] Personality features → Via Chroma + optional personality_id in ChatRequest
- [ ] Tests → Mock external services (Ollama), use pytest fixtures for auth
- [ ] Config → Environment-driven via Pydantic Settings

---

**Questions? Check the README.md, QUICKSTART.md, or HOWTORUN.md for setup and deployment guidance.**
