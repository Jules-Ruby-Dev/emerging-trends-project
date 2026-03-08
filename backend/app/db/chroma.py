"""ChromaDB client initialisation."""

from functools import lru_cache
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import get_settings


@lru_cache
def get_chroma_client() -> chromadb.ClientAPI:
    settings = get_settings()

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
