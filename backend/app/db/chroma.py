"""ChromaDB client initialisation."""

from functools import lru_cache
from typing import Any

from app.config import get_settings


@lru_cache
def get_chroma_client() -> Any:
    settings = get_settings()

    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings
    except ImportError as exc:
        raise RuntimeError(
            "ChromaDB is not installed. Install backend requirements before using memory features."
        ) from exc

    if settings.chroma_mode == "remote":
        client = chromadb.HttpClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
        )
    else:
        client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )

    return client
