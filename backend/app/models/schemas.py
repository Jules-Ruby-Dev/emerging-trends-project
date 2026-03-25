"""Pydantic request / response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    personality_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


# ── Memory ────────────────────────────────────────────────────────────────────

class MemoryEntry(BaseModel):
    user_id: str
    content: str
    metadata: dict = {}
