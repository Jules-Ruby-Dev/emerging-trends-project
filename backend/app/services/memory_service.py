"""Long-term memory service backed by ChromaDB.

Each user has their own ChromaDB collection.  Relevant past messages are
retrieved by semantic similarity and injected into the LLM prompt so the AI
friend "remembers" past conversations.
"""

import uuid
from typing import Optional

from app.db.chroma import get_chroma_client

COLLECTION_PREFIX = "aifriend_memory_"
MAX_RESULTS = 5


def _collection_name(user_id: str) -> str:
    # ChromaDB collection names must be 3-63 chars, alphanumeric + underscores/hyphens.
    safe = user_id.replace("-", "_")[:50]
    return f"{COLLECTION_PREFIX}{safe}"


def store_memory(user_id: str, content: str, metadata: Optional[dict] = None) -> None:
    """Persist a message/fact into the user's memory collection."""
    try:
        client = get_chroma_client()
    except RuntimeError:
        return
    collection = client.get_or_create_collection(name=_collection_name(user_id))
    # ChromaDB requires non-empty metadata dict
    meta = metadata or {"source": "memory"}
    collection.add(
        documents=[content],
        metadatas=[metadata or {"source": "chat"}],
        # metadatas=[metadata or {}],
        ids=[str(uuid.uuid4())],
    )


def retrieve_memories(user_id: str, query: str, n_results: int = MAX_RESULTS) -> list[str]:
    """Return the most semantically relevant past memories for a given query."""
    try:
        client = get_chroma_client()
    except RuntimeError:
        return []
    collection = client.get_or_create_collection(name=_collection_name(user_id))

    count = collection.count()
    if count == 0:
        return []

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, count),
    )
    return results.get("documents", [[]])[0]


def delete_memories(user_id: str) -> None:
    """Remove all memories for a user (e.g. on account deletion)."""
    try:
        client = get_chroma_client()
    except RuntimeError:
        return
    try:
        client.delete_collection(name=_collection_name(user_id))
    except Exception:
        pass
