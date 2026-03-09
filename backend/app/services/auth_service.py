"""Supabase authentication helpers."""

from supabase import create_client, Client
from app.config import get_settings


def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase_admin_client() -> Client:
    """Service-role client — use only for server-side operations."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def sign_up(email: str, password: str) -> dict:
    client = get_supabase_client()
    response = client.auth.sign_up({"email": email, "password": password})
    return response


def sign_in(email: str, password: str) -> dict:
    client = get_supabase_client()
    response = client.auth.sign_in_with_password({"email": email, "password": password})
    return response


def get_user_from_token(access_token: str) -> dict | None:
    """Validate a JWT and return the user payload, or None if invalid."""
    client = get_supabase_admin_client()
    try:
        response = client.auth.get_user(access_token)
        return response.user
    except Exception:
        return None
