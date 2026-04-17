"""FastAPI application entry-point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import health, auth, chat, personality, history, personalities

settings = get_settings()

app = FastAPI(
    title="AI Friend AR — Backend",
    description="FastAPI backend powering the AI friend experience in AR.",
    version="0.1.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url="/redoc" if settings.app_env != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    # In dev mode, allow all origins so mobile devices on the local network
    # can reach the backend without needing to hardcode a specific LAN IP.
    # In production, lock this down to the exact frontend origin.
    allow_origins=["*"] if settings.dev_mode else settings.cors_origins_list,
    allow_credentials=False,  # credentials=True is incompatible with allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(personality.router)
app.include_router(history.router)
app.include_router(personalities.router)
# 0[]'p-'