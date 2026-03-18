"""AI personality service backed by a dedicated ChromaDB collection."""

from typing import Any

from app.db.chroma import get_chroma_client

PERSONALITY_COLLECTION = "aifriend_personalities"

DEFAULT_PERSONALITIES = [
    {
        "id": "aria",
        "name": "Aria",
        "description": "Warm and empathetic AI friend.",
        "system_prompt": (
            "You are Aria, a warm and empathetic AI friend. "
            "Your goal is to make the user feel heard, valued, and less alone. "
            "Speak naturally and conversationally like a good friend would. "
            "Keep responses concise (2-4 sentences) unless the user asks for more detail."
        ),
    },
    {
        "id": "coach",
        "name": "Coach",
        "description": "Motivational and action-oriented accountability partner.",
        "system_prompt": (
            "You are Coach, a supportive accountability partner. "
            "Help the user set practical goals and encourage consistent progress. "
            "Be upbeat, direct, and constructive. "
            "Keep responses concise and include one actionable next step when useful."
        ),
    },
    {
        "id": "reflective",
        "name": "Reflective",
        "description": "Calm, thoughtful conversational companion.",
        "system_prompt": (
            "You are Reflective, a calm and thoughtful AI companion. "
            "Ask gentle clarifying questions and help the user reflect on emotions and choices. "
            "Stay supportive and non-judgmental. "
            "Keep responses concise unless more depth is requested."
        ),
    },
]


def _as_personality(item_id: str, metadata: dict[str, Any], document: str) -> dict[str, str]:
    return {
        "id": item_id,
        "name": str(metadata.get("name") or item_id),
        "description": str(metadata.get("description") or ""),
        "system_prompt": document,
    }


def _seed_default_personalities(collection: Any) -> None:
    existing = set(collection.get(include=[]).get("ids", []))
    missing = [p for p in DEFAULT_PERSONALITIES if p["id"] not in existing]
    if not missing:
        return

    collection.add(
        ids=[p["id"] for p in missing],
        documents=[p["system_prompt"] for p in missing],
        metadatas=[
            {
                "name": p["name"],
                "description": p["description"],
            }
            for p in missing
        ],
    )


def _get_collection() -> Any:
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=PERSONALITY_COLLECTION)
    _seed_default_personalities(collection)
    return collection


def list_personalities() -> list[dict[str, str]]:
    """Return all known personalities from ChromaDB, with default fallback."""
    try:
        collection = _get_collection()
        payload = collection.get(include=["documents", "metadatas"])
        ids = payload.get("ids", [])
        docs = payload.get("documents", [])
        metas = payload.get("metadatas", [])
        personalities = [
            _as_personality(item_id, metas[idx] or {}, docs[idx] or "")
            for idx, item_id in enumerate(ids)
        ]
        return sorted(personalities, key=lambda p: p["name"].lower())
    except RuntimeError:
        return DEFAULT_PERSONALITIES


def get_personality(personality_id: str | None) -> dict[str, str]:
    """Return a requested personality, defaulting to Aria if unavailable."""
    fallback = DEFAULT_PERSONALITIES[0]
    if not personality_id:
        return fallback

    try:
        collection = _get_collection()
        result = collection.get(ids=[personality_id], include=["documents", "metadatas"])
        ids = result.get("ids", [])
        docs = result.get("documents", [])
        metas = result.get("metadatas", [])
        if ids:
            return _as_personality(ids[0], (metas[0] or {}), docs[0] or "")
        return fallback
    except RuntimeError:
        for item in DEFAULT_PERSONALITIES:
            if item["id"] == personality_id:
                return item
        return fallback
