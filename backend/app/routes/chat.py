"""Chat route — send a message to the AI friend and receive a reply."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_reply
from app.services.auth_service import get_user_from_token
from app.services.session_service import store_session_message

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
    try:
        # Chris Part
        # # Store user message
        # store_session_message(user_id, session_id, "user", body.message)
        
        # # Get AI reply with selected personality
        # reply = await get_ai_reply(
        #     user_id=user_id,
        #     user_message=body.message,
        #     personality_id=body.personality_id
        # )
        
        # # Store AI reply
        # store_session_message(user_id, session_id, "aria", reply)

        reply, resolved_personality_id = await get_ai_reply(
            user_id=user_id,
            user_message=body.message,
            personality_id=body.personality_id,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        personality_id=resolved_personality_id,
    )
