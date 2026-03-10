"""Application configuration loaded from environment variables."""

import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Ollama
    ollama_base_url: str = ""
    ollama_model: str = "llama3.2"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # ChromaDB
    chroma_mode: str = "local"          # "local" | "remote"
    chroma_persist_dir: str = "./chroma_data"
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    # App
    app_env: str = "development"
    dev_mode: bool = False  # Skip Supabase auth — for local dev without credentials
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def resolved_ollama_base_url(self) -> str:
        if self.ollama_base_url:
            return self.ollama_base_url.rstrip("/")

        if os.path.exists("/.dockerenv"):
            return "http://host.docker.internal:11434"

        return "http://localhost:11434"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
