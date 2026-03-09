"""Chat route — send a message to the AI friend and receive a reply."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_reply
from app.services.auth_service import get_user_from_token

router = APIRouter(prefix="/chat", tags=["chat"])
bearer_scheme = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    user = get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )
    return str(user.id)


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
) -> ChatResponse:
    session_id = body.session_id or str(uuid.uuid4())
    reply = await get_ai_reply(user_id=user_id, user_message=body.message)
    return ChatResponse(reply=reply, session_id=session_id)
