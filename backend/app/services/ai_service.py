"""AI service — wraps the Ollama chat API.

The AI friend has a configurable system persona and is augmented with relevant
long-term memories fetched from ChromaDB before each response.
"""

import httpx

from app.config import get_settings
from app.services.memory_service import retrieve_memories, store_memory
from app.prompts import get_system_prompt, format_memory_context


async def get_ai_reply(
    user_id: str,
    user_message: str,
    personality_id: str | None = None
) -> str:
    """Generate an AI friend reply, enriched with long-term memory."""
    settings = get_settings()

    # Get system prompt for the personality
    system_prompt = get_system_prompt(personality_id)

    # Retrieve relevant past memories to ground the response
    memories = retrieve_memories(user_id, user_message)
    memory_context = format_memory_context(memories)

    messages = [
        {"role": "system", "content": system_prompt + memory_context},
        {"role": "user", "content": user_message},
    ]

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.resolved_ollama_base_url}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": 0.8},
                },
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise RuntimeError(
            f"Unable to reach Ollama at {settings.resolved_ollama_base_url}. "
            "Make sure Ollama is running and the model is available."
        ) from exc

    data = response.json()
    reply = (data.get("message") or {}).get("content", "").strip()
    if not reply:
        raise RuntimeError("Ollama returned an empty response.")

    # Persist both sides of the exchange as memory
    store_memory(user_id, f"User said: {user_message}")
    store_memory(user_id, f"Aria replied: {reply}")

    return reply
