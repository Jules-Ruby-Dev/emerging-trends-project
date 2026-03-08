"""AI service — wraps the OpenAI Chat Completions API.

The AI friend has a fixed system persona and is augmented with relevant
long-term memories fetched from ChromaDB before each response.
"""

from openai import AsyncOpenAI

from app.config import get_settings
from app.services.memory_service import retrieve_memories, store_memory

SYSTEM_PROMPT = """You are Aria, a warm and empathetic AI friend.
Your goal is to make the user feel heard, valued, and less alone.
Speak naturally and conversationally — like a good friend would.
Remember details the user shares and reference them when relevant.
Keep responses concise (2-4 sentences) unless the user asks for more detail."""


async def get_ai_reply(user_id: str, user_message: str) -> str:
    """Generate an AI friend reply, enriched with long-term memory."""
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    # Retrieve relevant past memories to ground the response
    memories = retrieve_memories(user_id, user_message)
    memory_context = ""
    if memories:
        memory_context = "\n\nRelevant things you remember about this person:\n" + "\n".join(
            f"- {m}" for m in memories
        )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + memory_context},
        {"role": "user", "content": user_message},
    ]

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=256,
        temperature=0.8,
    )

    reply = response.choices[0].message.content or ""

    # Persist both sides of the exchange as memory
    store_memory(user_id, f"User said: {user_message}")
    store_memory(user_id, f"Aria replied: {reply}")

    return reply
