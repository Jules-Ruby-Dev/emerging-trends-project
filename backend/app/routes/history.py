"""History route — retrieve and manage chat history."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging

from app.services.auth_service import get_user_from_token
from app.services.session_service import (
    get_user_sessions,
    get_session_history,
    delete_session,
    ChatSession,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["history"])
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


class HistoryMessageResponse(BaseModel):
    role: str
    content: str
    timestamp: str


class HistorySessionResponse(BaseModel):
    session_id: str
    title: str
    preview: str
    created_at: str
    updated_at: str
    message_count: int = 0


class HistoryDetailResponse(BaseModel):
    session_id: str
    title: str
    created_at: str
    updated_at: str
    messages: list[HistoryMessageResponse]


@router.get("/sessions", response_model=list[HistorySessionResponse])
async def get_history_sessions(
    user_id: str = Depends(get_current_user_id),
    limit: int = 50,
) -> list[HistorySessionResponse]:
    """Get all chat sessions for the current user."""
    logger.info(f"Getting history sessions for user_id={user_id}, limit={limit}")
    try:
        sessions = get_user_sessions(user_id, limit=limit)
        logger.info(f"Retrieved {len(sessions)} sessions for user {user_id}")
        
        response = [
            HistorySessionResponse(
                session_id=session.session_id,
                title=session.title,
                preview=session.preview,
                created_at=session.created_at,
                updated_at=session.updated_at,
                message_count=len(session.messages),
            )
            for session in sessions
        ]
        logger.info(f"Returning {len(response)} history session responses")
        return response
    except Exception as e:
        logger.error(f"Error retrieving sessions: {e}", exc_info=True)
        raise


@router.get("/{session_id}", response_model=HistoryDetailResponse)
async def get_session_detail(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> HistoryDetailResponse:
    """Get detailed history for a specific session."""
    messages = get_session_history(user_id, session_id)
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found",
        )
    
    # Find session title from sessions list
    sessions = get_user_sessions(user_id, limit=100)
    session_info = next(
        (s for s in sessions if s.session_id == session_id),
        None
    )
    
    title = session_info.title if session_info else "Untitled Chat"
    created_at = session_info.created_at if session_info else ""
    updated_at = session_info.updated_at if session_info else ""
    
    return HistoryDetailResponse(
        session_id=session_id,
        title=title,
        created_at=created_at,
        updated_at=updated_at,
        messages=[
            HistoryMessageResponse(
                role=m["role"],
                content=m["content"],
                timestamp=m.get("timestamp", ""),
            )
            for m in messages
        ],
    )


@router.delete("/{session_id}")
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, str]:
    """Delete a chat session."""
    success = delete_session(user_id, session_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session",
        )
    
    return {"message": "Session deleted successfully"}
