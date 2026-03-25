"""Session and history service — manages chat session persistence.

Stores chat session metadata and provides retrieval of conversation history.
Currently uses ChromaDB for storage with fallback to in-memory cache.
"""

import json
import uuid
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, asdict
from collections import defaultdict

from app.db.chroma import get_chroma_client


@dataclass
class ChatSession:
    """Represents a single chat session."""
    session_id: str
    user_id: str
    created_at: str
    updated_at: str
    title: str
    messages: list[dict]  # List of {role, content, timestamp}
    preview: str = ""  # First user message or summary


SESSION_COLLECTION_PREFIX = "aifriend_sessions_"
IN_MEMORY_SESSIONS: dict[str, list[ChatSession]] = defaultdict(list)


def _collection_name(user_id: str) -> str:
    """Get ChromaDB collection name for user sessions."""
    safe = user_id.replace("-", "_")[:50]
    return f"{SESSION_COLLECTION_PREFIX}{safe}"


def create_session(user_id: str) -> str:
    """Create a new chat session. Returns the session ID."""
    session_id = str(uuid.uuid4())
    return session_id


def store_session_message(
    user_id: str,
    session_id: str,
    role: str,
    content: str,
) -> None:
    """Store a single message in a session."""
    timestamp = datetime.now().isoformat()
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(
            name=_collection_name(user_id),
            metadata={"hnsw:space": "ip"}  # IP distance for embeddings
        )
        
        collection.add(
            documents=[content],
            metadatas=[{
                "session_id": session_id,
                "role": role,
                "timestamp": timestamp,
                "user_id": user_id,
            }],
            ids=[f"{session_id}_{timestamp}"],
        )
    except Exception as e:
        # ChromaDB unavailable, fall back to in-memory
        print(f"Warning: Could not store to ChromaDB: {e}")
        if user_id not in IN_MEMORY_SESSIONS:
            IN_MEMORY_SESSIONS[user_id] = []
        
        # Store in memory as fallback
        session = next(
            (s for s in IN_MEMORY_SESSIONS[user_id] if s.session_id == session_id),
            None
        )
        if not session:
            session = ChatSession(
                session_id=session_id,
                user_id=user_id,
                created_at=timestamp,
                updated_at=timestamp,
                title="Conversation",
                messages=[],
                preview=""
            )
            IN_MEMORY_SESSIONS[user_id].append(session)
        
        session.messages.append({
            "role": role,
            "content": content,
            "timestamp": timestamp,
        })
        session.updated_at = timestamp
        if not session.preview and role == "user":
            session.preview = content[:100]
            session.title = session.preview[:50]


def get_session_history(
    user_id: str,
    session_id: str,
    limit: int = 100,
) -> list[dict]:
    """Retrieve all messages in a session."""
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(
            name=_collection_name(user_id)
        )
        
        # Query all messages for this session
        results = collection.get(
            where={"session_id": session_id},
            limit=limit,
        )
        
        if not results or not results.get("metadatas"):
            return []
        
        # Reconstruct messages from ChromaDB results
        messages = []
        for i, doc in enumerate(results.get("documents", [])):
            metadata = results.get("metadatas", [{}])[i]
            messages.append({
                "role": metadata.get("role", "assistant"),
                "content": doc,
                "timestamp": metadata.get("timestamp", ""),
            })
        
        return sorted(messages, key=lambda m: m.get("timestamp", ""))
    except RuntimeError:
        # ChromaDB unavailable
        return []


def get_user_sessions(user_id: str, limit: int = 50) -> list[ChatSession]:
    """Get all sessions for a user."""
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(
            name=_collection_name(user_id)
        )
        
        # Get all documents — collection is already per-user, no where filter needed
        results = collection.get()
        
        if not results or not results.get("ids"):
            print(f"[DEBUG] No messages found for user {user_id}")
            return IN_MEMORY_SESSIONS.get(user_id, [])
        
        print(f"[DEBUG] Found {len(results.get('ids', []))} messages for user {user_id}")
        
        # Group messages by session_id
        sessions_map: dict[str, list] = defaultdict(list)
        for i, doc_id in enumerate(results.get("ids", [])):
            try:
                doc = results.get("documents", [""])[i] if i < len(results.get("documents", [])) else ""
                metadata = results.get("metadatas", [{}])[i] if i < len(results.get("metadatas", [])) else {}
                session_id = metadata.get("session_id")
                if session_id and doc:
                    sessions_map[session_id].append({
                        "role": metadata.get("role", "user"),
                        "content": doc,
                        "timestamp": metadata.get("timestamp", ""),
                    })
            except Exception as e:
                print(f"[DEBUG] Error processing message {i}: {e}")
                continue
        
        if not sessions_map:
            print(f"[DEBUG] No sessions found for user {user_id} after grouping (map is empty)")
            return IN_MEMORY_SESSIONS.get(user_id, [])
        
        print(f"[DEBUG] Grouped into {len(sessions_map)} sessions")
        
        # Create ChatSession objects
        sessions = []
        for session_id, messages in sessions_map.items():
            if messages:
                sorted_messages = sorted(messages, key=lambda m: m.get("timestamp", ""))
                preview = next(
                    (m["content"][:100] for m in sorted_messages if m["role"] == "user"),
                    "No preview"
                )
                title = preview[:50] + "..." if len(preview) > 50 else preview
                
                session = ChatSession(
                    session_id=session_id,
                    user_id=user_id,
                    created_at=sorted_messages[0].get("timestamp", ""),
                    updated_at=sorted_messages[-1].get("timestamp", ""),
                    title=title,
                    messages=sorted_messages,
                    preview=preview,
                )
                sessions.append(session)
                print(f"[DEBUG] Created session {session_id} with {len(sorted_messages)} messages")
        
        # Sort by most recent first
        sessions.sort(key=lambda s: s.updated_at, reverse=True)
        print(f"[DEBUG] Returning {len(sessions)} sessions (limited to {limit})")
        return sessions[:limit]
    except Exception as e:
        print(f"[DEBUG] Error retrieving sessions: {e}")
        import traceback
        traceback.print_exc()
        # ChromaDB unavailable, fall back to in-memory
        return IN_MEMORY_SESSIONS.get(user_id, [])


def delete_session(user_id: str, session_id: str) -> bool:
    """Delete a session and all its messages."""
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(
            name=_collection_name(user_id)
        )
        
        # Delete all documents with this session_id
        results = collection.get(
            where={"session_id": session_id},
            limit=1000,
        )
        
        if results and results.get("ids"):
            collection.delete(ids=results["ids"])
        
        return True
    except RuntimeError:
        return False
